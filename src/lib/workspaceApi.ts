import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import firebaseConfig from "../../firebase-applet-config.json";
import { FinanceRecord, Note } from "../types";

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/calendar");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/tasks");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void,
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get access token from Firebase Auth");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Workspace Sync Logic

export async function createFinanceSpreadsheet(
  records: FinanceRecord[],
  token: string,
) {
  // 1. Create Spreadsheet
  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: `Fajmul Finance - ${new Date().toISOString().split("T")[0]}`,
      },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const spreadsheetId = data.spreadsheetId;

  // 2. Add Data
  const values = [
    ["Date", "Type", "Category", "Parent Category", "Amount", "Note"],
    ...records.map((r) => [
      new Date(r.createdAt).toISOString().split("T")[0],
      r.type,
      r.category,
      r.parentCategory || "",
      r.amount.toString(),
      r.note || "",
    ]),
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:F:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values,
      }),
    },
  );

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}

export async function createTasksFromNotes(notes: Note[], token: string) {
  // 1. Create a Task List
  const listRes = await fetch(
    "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `Fajmul Notes - ${new Date().toISOString().split("T")[0]}`,
      }),
    },
  );
  const listData = await listRes.json();
  const listId = listData.id;

  // 2. Add Tasks
  for (const note of notes) {
    let title = "Catatan";
    if (note.type === "normal") title = note.title || "Catatan Biasa";
    if (note.type === "ig") title = `IG: ${note.songTitle || "Catatan"}`;
    if (note.type === "workout") title = note.title || "Olahraga";
    if (note.type === "personal") title = `Data Pribadi`;

    let notesText = "";
    if (note.type === "normal" || note.type === "ig") {
      notesText = note.content;
    } else if (note.type === "personal") {
      notesText = note.extraNotes;
      if (note.personName)
        notesText = "Name: " + note.personName + "\n" + notesText;
    } else if (note.type === "workout") {
      notesText = `Durasi: ${note.durationMins} mnt`;
    }

    await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.slice(0, 50),
        notes: notesText,
      }),
    });
  }
}
