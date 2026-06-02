import React, { useState, useEffect } from 'react';
import { Lock, Delete, ArrowLeft } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { useNavigate } from 'react-router-dom';

interface PinLockProps {
  children: React.ReactNode;
}

export function PinLock({ children }: PinLockProps) {
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem('vault_unlocked') === 'true'
  );
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { playClick, playError, playSuccess } = useAudio();
  const navigate = useNavigate();

  const CORRECT_PIN = '1234'; // Default PIN

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === CORRECT_PIN) {
        playSuccess();
        setUnlocked(true);
        sessionStorage.setItem('vault_unlocked', 'true');
      } else {
        playError();
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 1000);
      }
    }
  }, [pin]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      playClick();
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      playClick();
      setPin(prev => prev.slice(0, -1));
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-stone-950 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
       <button 
         onClick={() => navigate(-1)} 
         className="absolute top-6 left-6 p-4 text-stone-400 hover:text-white transition-colors"
       >
         <ArrowLeft className="w-6 h-6" />
       </button>
       
       <div className="text-center mb-12">
          <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
             <Lock className="w-10 h-10 text-stone-300" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Vault Spesial</h2>
          <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">Masukkan PIN (1234)</p>
       </div>

       <div className="flex gap-4 mb-16">
         {[0, 1, 2, 3].map(i => (
           <div 
             key={i} 
             className={`w-4 h-4 rounded-full transition-all duration-300 ${
               pin.length > i ? 'bg-white scale-125' : 'bg-stone-700'
             } ${error ? 'bg-red-500 animate-pulse' : ''}`} 
           />
         ))}
       </div>

       <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-full aspect-square bg-stone-900 rounded-full flex items-center justify-center text-3xl font-bold text-white hover:bg-stone-800 active:bg-stone-700 transition-colors"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="w-full aspect-square bg-stone-900 rounded-full flex items-center justify-center text-3xl font-bold text-white hover:bg-stone-800 active:bg-stone-700 transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-full aspect-square rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-900 active:bg-stone-800 transition-colors"
          >
            <Delete className="w-8 h-8" />
          </button>
       </div>
    </div>
  );
}
