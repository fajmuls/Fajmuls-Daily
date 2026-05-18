import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqTovzK2RnLQr8oidUjzyzRD3FTGHgR0I",
  authDomain: "fajmuls-daily.firebaseapp.com",
  projectId: "fajmuls-daily",
  storageBucket: "fajmuls-daily.firebasestorage.app",
  messagingSenderId: "1058481681269",
  appId: "1:1058481681269:web:2587209851faf82837993c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const authProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

