import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../store';
import { X, Trophy, Car, Wallet, FileText, CheckCircle2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { differenceInMinutes, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';

interface MonthlyWrappedProps {
  onClose: () => void;
}

export function MonthlyWrapped({ onClose }: MonthlyWrappedProps) {
  const { trips, financeRecords, notes } = useAppContext();
  const { playClick, playSuccess } = useAudio();
  const [step, setStep] = useState(0);

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const monthTrips = trips.filter(t => t.endTime && isWithinInterval(t.endTime, { start, end }));
  const totalTripMins = monthTrips.reduce((acc, t) => acc + differenceInMinutes(t.endTime!, t.startTime), 0);
  const totalTripHours = Math.floor(totalTripMins / 60);

  const monthFinances = financeRecords.filter(r => isWithinInterval(r.createdAt, { start, end }));
  const totalIncome = monthFinances.filter(r => r.type === 'income').reduce((acc, r) => acc + r.amount, 0);
  const totalExpense = monthFinances.filter(r => r.type === 'expense').reduce((acc, r) => acc + r.amount, 0);
  const netSavings = totalIncome - totalExpense;

  const monthNotes = notes.filter(n => isWithinInterval(n.createdAt, { start, end }));

  const steps = [
    {
      id: 'trips',
      icon: <Car className="w-16 h-16 text-teal-400 mx-auto mb-6" />,
      title: 'Di Jalan',
      content: `Bulan ini kamu menghabiskan ${totalTripHours} jam di jalan dalam ${monthTrips.length} perjalanan.`,
      bg: 'bg-teal-900',
    },
    {
      id: 'finance',
      icon: <Wallet className="w-16 h-16 text-emerald-400 mx-auto mb-6" />,
      title: 'Keuangan',
      content: netSavings > 0 
        ? `Kamu berhasil menabung Rp ${netSavings.toLocaleString('id-ID')} bulan ini!`
        : `Pengeluaran bulan ini mencapai Rp ${totalExpense.toLocaleString('id-ID')}. Lebih hemat bulan depan ya!`,
      bg: 'bg-emerald-900',
    },
    {
      id: 'notes',
      icon: <FileText className="w-16 h-16 text-amber-400 mx-auto mb-6" />,
      title: 'Jejak Pikiran',
      content: `Ada ${monthNotes.length} catatan/dokumen baru yang kamu tulis bulan ini.`,
      bg: 'bg-amber-900',
    },
    {
      id: 'summary',
      icon: <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />,
      title: 'Kerja Bagus!',
      content: 'Terus pertahankan konsistensimu di bulan berikutnya.',
      bg: 'bg-stone-900',
    }
  ];

  useEffect(() => {
    playSuccess();
  }, []);

  const nextStep = () => {
    playClick();
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      onClose();
    }
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div 
        className={`relative w-full max-w-sm aspect-[9/16] rounded-[3rem] ${current.bg} border-4 border-stone-800 shadow-2xl p-8 flex flex-col justify-center text-center animate-in slide-in-from-bottom-24 fade-in duration-700 cursor-pointer overflow-hidden group`}
        onClick={nextStep}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); playClick(); onClose(); }}
          className="absolute top-6 right-6 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bars */}
        <div className="absolute top-6 left-6 right-[4.5rem] flex gap-2 z-10">
          {steps.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-white transition-all duration-1000 ${i === step ? 'w-full scale-x-100 origin-left' : i < step ? 'w-full' : 'w-0'}`} 
              />
            </div>
          ))}
        </div>

        <div key={current.id} className="animate-in slide-in-from-right-8 fade-in duration-500 relative z-10">
           {current.icon}
           <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">{current.title}</h2>
           <p className="text-lg text-white/80 font-medium leading-relaxed">
             {current.content}
           </p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center text-white/40 text-xs font-bold uppercase tracking-widest animate-pulse">
           Ketuk untuk lanjut
        </div>
      </div>
    </div>
  );
}
