import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// The skill says I MUST include the firestoreDatabaseId in getFirestore
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); 
export const auth = getAuth(app);
export const authProvider = new GoogleAuthProvider();

// Test connection as mandated by skill
async function testConnection() {
  try {
    // Attempting to get a dummy doc to verify connection
    await getDocFromServer(doc(db, '_connection_test_', 'init'));
    console.log("Firebase connection established.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    } else {
       // Permisson denied is fine, it means we connected but rules blocked it
       console.log("Firebase connection tested (Rules might have blocked access, which is expected for test doc).");
    }
  }
}

testConnection();

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, authProvider);
        return result.user;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logout = async () => {
    await signOut(auth);
};
