import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon } from 'lucide-react';
import { createBeep } from '../hooks/useAudio';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Play sound immediately when component mounts
    const soundEnabled = localStorage.getItem('fajmus-sound-enabled') !== 'false';
    if (soundEnabled) {
      createBeep(440, 'sine', 0.1, 0.05);
      setTimeout(() => createBeep(554, 'sine', 0.1, 0.05), 100);
      setTimeout(() => createBeep(659, 'sine', 0.3, 0.1), 200);
    }
    
    // Hide splash screen after animation completes
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-stone-50 select-none"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
            className="w-24 h-24 bg-stone-900 rounded-3xl flex items-center justify-center shadow-2xl mb-8 relative"
          >
             <Hexagon className="w-12 h-12 text-white absolute" strokeWidth={2} />
             <Hexagon className="w-8 h-8 text-white absolute rotate-90" strokeWidth={3} />
          </motion.div>
          
          <div className="text-center overflow-hidden">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="font-serif text-3xl font-black text-stone-900 tracking-tight"
            >
               Jurnal Harmoni
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mt-2 text-stone-500 font-bold tracking-widest text-[10px] uppercase"
            >
              Finance & Routine Tracker
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
