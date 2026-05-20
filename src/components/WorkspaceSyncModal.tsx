import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  createFinanceSpreadsheet,
  createTasksFromNotes,
} from "../lib/workspaceApi";
import { useAppContext } from "../store";
import { User } from "firebase/auth";

export function WorkspaceSyncModal({
  isOpen,
  onClose,
  contextType,
}: {
  isOpen: boolean;
  onClose: () => void;
  contextType: "finance" | "notes";
}) {
  const { financeRecords, notes } = useAppContext();
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successLink, setSuccessLink] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSyncStatus("idle");
      setSuccessLink("");
      const unsubscribe = initAuth(
        (u, t) => {
          setNeedsAuth(false);
          setUser(u);
          setToken(t);
        },
        () => {
          setNeedsAuth(true);
          setUser(null);
          setToken(null);
        },
      );
      return () => unsubscribe();
    }
  }, [isOpen]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSync = async () => {
    if (!token) return;
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin mengekspor data ke akun Google (${user?.email})?`,
    );
    if (!isConfirmed) return;

    setSyncStatus("syncing");
    try {
      if (contextType === "finance") {
        const link = await createFinanceSpreadsheet(financeRecords, token);
        setSuccessLink(link);
      } else {
        await createTasksFromNotes(notes, token);
        setSuccessLink("https://tasks.google.com/");
      }
      setSyncStatus("success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Error occurred during sync");
      setSyncStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-paper w-full max-w-sm rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
        >
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold">
              Sinkronisasi Google
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-6 text-center">
            {needsAuth ? (
              <div className="space-y-4">
                <p className="text-stone-500 text-sm">
                  Hubungkan dengan Google Workspace untuk mengamankan data dan
                  melakukan sinkronisasi.
                </p>
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-stone-900 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingIn ? "Memproses..." : "Sign in with Google"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-stone-500 text-sm">
                  Terhubung sebagai{" "}
                  <span className="font-bold text-stone-900">
                    {user?.email}
                  </span>
                </p>
                {syncStatus === "idle" && (
                  <button
                    onClick={handleSync}
                    className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                  >
                    Ekspor Data (
                    {contextType === "finance" ? "Sheets" : "Tasks"}){" "}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
                {syncStatus === "syncing" && (
                  <p className="text-blue-500 font-bold animate-pulse">
                    Sedang menyinkronisasi...
                  </p>
                )}
                {syncStatus === "success" && (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <p className="text-emerald-600 font-bold">
                      Sinkronisasi Berhasil!
                    </p>
                    {successLink && (
                      <a
                        href={successLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-blue-600 text-sm hover:underline mt-2"
                      >
                        Buka Tautan Google
                      </a>
                    )}
                  </div>
                )}
                {syncStatus === "error" && (
                  <div className="space-y-2">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                    <p className="text-red-600 font-bold">
                      Gagal Menyinkronkan
                    </p>
                    <p className="text-stone-500 text-sm">{errorMessage}</p>
                    <button
                      onClick={() => setSyncStatus("idle")}
                      className="text-sm font-bold text-stone-900 underline mt-2"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
