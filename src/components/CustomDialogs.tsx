import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useAppContext } from '../store';
import { cn } from '../lib/utils';
import { useAudio } from '../hooks/useAudio';

export function CustomDialogs() {
  const { confirmDialog, alertMessage, setAlert, closeConfirm } = useAppContext();
  const { playClick, playError, playSuccess } = useAudio();

  return (
    <>
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
          >
            <div className="bg-stone-900 shadow-2xl rounded-2xl p-4 flex items-center gap-4 border border-stone-800 pointer-events-auto max-w-md w-full">
              <div className="w-10 h-10 bg-accent-orange text-white rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold leading-tight">{alertMessage}</p>
              </div>
              <button 
                onClick={() => { playClick(); setAlert(null); }}
                className="p-2 hover:bg-stone-800 rounded-full text-stone-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { playClick(); closeConfirm(); }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-paper w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-stone-200"
            >
              <div className="p-8 text-center space-y-6">
                {confirmDialog?.isDestructive ? (
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-3xl flex items-center justify-center mx-auto -rotate-12 group-hover:rotate-0 transition-transform">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">Konfirmasi</h3>
                  <p className="text-stone-500 mt-2 font-medium leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => { playClick(); closeConfirm(); }}
                    className="py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      playSuccess();
                      confirmDialog.onConfirm();
                      closeConfirm();
                    }}
                    className={cn(
                      "py-4 text-white rounded-2xl font-bold shadow-lg transition-all",
                      confirmDialog?.isDestructive 
                        ? "bg-red-600 shadow-red-200 hover:bg-red-700" 
                        : "bg-teal-600 shadow-teal-200 hover:bg-teal-700"
                    )}
                  >
                    {confirmDialog?.confirmText || "Ya"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
