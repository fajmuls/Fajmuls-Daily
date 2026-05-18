import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signInWithPopup, onAuthStateChanged, User, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, authProvider, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Loader2, Lock } from 'lucide-react';

const AuthContext = createContext<{ user: User | null; profile: any; logout: () => void }>({
  user: null,
  profile: null,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export function AuthWrapper({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force persistence to LOCAL to ensure session survives refreshes
    const setupPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.error("Persistence setup error", e);
      }
    };
    setupPersistence();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth State Changed:", currentUser?.uid || "No user");
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            const initialProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              lastLogin: Date.now(),
              createdAt: Date.now(),
            };
            await setDoc(userRef, initialProfile);
            setProfile(initialProfile);
          }
        } catch (e) {
          console.error("Error fetching/setting user profile", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginGoogle = async () => {
    try {
      setLoading(true);
      console.log("Starting Google Login for domain:", window.location.hostname);
      const result = await signInWithPopup(auth, authProvider);
      const loggedInUser = result.user;
      console.log("Login successful:", loggedInUser.uid);
      
      const userRef = doc(db, 'users', loggedInUser.uid);
      const profileData = {
        uid: loggedInUser.uid,
        displayName: loggedInUser.displayName,
        email: loggedInUser.email,
        photoURL: loggedInUser.photoURL,
        lastLogin: Date.now(),
      };
      await setDoc(userRef, profileData, { merge: true });
      setProfile(prev => ({ ...prev, ...profileData }));
      // setUser is implicitly called by onAuthStateChanged, but we can set it here too
      setUser(loggedInUser);
      setLoading(false);
      
    } catch (e: any) {
      console.error("Detailed Login Error:", e);
      setLoading(false);
      
      if (e.code === 'auth/popup-blocked') {
        alert('Pop-up login diblokir oleh browser. Silakan izinkan pop-up atau klik ikon "Open in new tab" (kotak dengan panah) di pojok kanan atas preview.');
      } else if (e.code === 'auth/cancelled-popup-request' || e.code === 'auth/popup-closed-by-user') {
        console.log("User closed login popup.");
      } else if (e.code === 'auth/unauthorized-domain' || (e.message && e.message.includes('unauthorized domain'))) {
        alert(`DOMAIN TIDAK DIOTORISASI!\n\nSalin domain ini: ${window.location.hostname}\n\nLalu buka Firebase Console -> Authentication -> Settings -> Authorized Domains dan TAMBAHKAN domain tersebut.`);
      } else if (e.code === 'auth/network-request-failed') {
        alert('Koneksi internet bermasalah atau terhalang VPN/AdBlocker.');
      } else {
        alert('Gagal login: ' + (e.message || 'Coba buka aplikasi di tab baru jika masih gagal.'));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl mx-auto mb-6 animate-pulse overflow-hidden">
             <img src="/Fajmuls-Daily/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://fajmuls.github.io/Fajmuls-Daily/logo.png'} />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Menyiapkan Pengalaman...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-blue/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-purple/10 blur-[120px] rounded-full" />

        <div className="glass-card p-10 md:p-14 rounded-[3rem] border border-white/10 shadow-2xl max-w-md w-full text-center space-y-8 relative z-10">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10 shadow-inner group transition-transform hover:scale-110 overflow-hidden">
             <img src="/Fajmuls-Daily/logo.png" alt="Logo" className="w-full h-full object-contain shadow-2xl" onError={(e) => e.currentTarget.src = 'https://fajmuls.github.io/Fajmuls-Daily/logo.png'} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tight">Fajmuls<span className="text-accent-blue">.</span></h1>
            <p className="text-slate-400 font-medium">Capture your daily life in a beautiful, personalized space.</p>
          </div>
          
          <div className="space-y-4 pt-4">
            <button
              onClick={handleLoginGoogle}
              id="login-button"
              className="w-full flex items-center justify-center gap-4 active-nav-bg text-white rounded-2xl py-5 font-black hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.6)] transition-all active:scale-[0.98] group"
            >
              <div className="bg-white p-1 rounded-lg">
                <GoogleIcon />
              </div>
              Lanjutkan dengan Google
            </button>
            
            <div className="flex items-center gap-3 py-2">
               <div className="h-px bg-white/10 flex-1" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Privacy Protected</span>
               <div className="h-px bg-white/10 flex-1" />
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
              Akses cepat • Tidak ada iklan • 100% Aman
            </p>
          </div>
        </div>
        
        <p className="mt-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Built for productivity & focus</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
