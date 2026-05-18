import { useEffect, useState, ReactNode } from 'react';
import { signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, authProvider, githubProvider } from '../lib/firebase';
import { Loader2, LogIn, Lock, Github, SkipForward } from 'lucide-react';

const ADMIN_EMAIL = 'mrachmanfm@gmail.com';

export function AuthWrapper({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBypassed, setIsBypassed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginGoogle = async () => {
    try {
      await signInWithPopup(auth, authProvider);
    } catch (e) {
      console.error(e);
      alert('Gagal login dengan Google.');
    }
  };

  const handleLoginGithub = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (e) {
      console.error(e);
      alert('Gagal login dengan Github.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setIsBypassed(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-stone-900 animate-spin" />
      </div>
    );
  }

  // Jika bypass aktif, render children
  if (isBypassed) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="bg-paper p-10 rounded-3xl border border-stone-200 shadow-md max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-8 h-8 text-stone-700" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Akses Terkunci</h1>
          <p className="text-stone-500">Aplikasi ini bersifat pribadi. Silakan masuk sebagai Fajmul.</p>
          
          <div className="space-y-3 pt-4">
            <button
              onClick={handleLoginGoogle}
              className="w-full flex items-center justify-center gap-3 bg-stone-900 text-white rounded-xl py-4 font-bold hover:bg-stone-800 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Login dengan Google
            </button>
            <button
              onClick={handleLoginGithub}
              className="w-full flex items-center justify-center gap-3 bg-stone-100 text-stone-700 border border-stone-200 rounded-xl py-4 font-bold hover:bg-stone-200 transition-colors"
            >
              <Github className="w-5 h-5" />
              Login dengan GitHub
            </button>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button
              onClick={() => setIsBypassed(true)}
              className="text-stone-400 hover:text-stone-700 text-sm flex items-center justify-center gap-2 w-full font-medium"
            >
              <SkipForward className="w-4 h-4" /> Lewati (Akses Mode Beta)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cek apakah admin
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="bg-paper p-10 rounded-3xl border border-red-100 shadow-md max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Bukan Admin</h1>
          <p className="text-stone-500">
            Maaf, akun <b>{user.email || 'tanpa email'}</b> tidak memiliki akses ke aplikasi ini.
          </p>
          
          <div className="space-y-3">
             <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-stone-100 text-stone-700 rounded-xl py-4 font-bold hover:bg-stone-200 transition-colors"
            >
              Ganti Akun
            </button>
            <button
              onClick={() => setIsBypassed(true)}
              className="w-full flex items-center justify-center gap-3 bg-stone-50 text-stone-400 border border-stone-200 rounded-xl py-4 font-bold hover:bg-stone-100 transition-colors text-sm"
            >
              Lewati (Akses Mode Beta)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
