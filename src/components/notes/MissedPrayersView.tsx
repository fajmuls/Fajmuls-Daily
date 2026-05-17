import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../store';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { Fardhu } from '../../types';

const FARDHU_ORDER: Fardhu[] = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya', 'Belum Diketahui'];

export function MissedPrayersView() {
  const navigate = useNavigate();
  const { missedPrayers, togglePrayer } = useAppContext();
  const { playClick } = useAudio();
  const [filter, setFilter] = useState<Fardhu | 'Semua'>('Semua');

  const filteredPrayers = missedPrayers.filter(p => filter === 'Semua' || p.prayer === filter);

  // Group by Fardhu
  const grouped = FARDHU_ORDER.reduce((acc, fardhu) => {
    const items = filteredPrayers.filter(p => p.prayer === fardhu);
    if (items.length > 0) acc.push({ fardhu, items });
    return acc;
  }, [] as { fardhu: Fardhu, items: typeof missedPrayers }[]);

  const handleToggle = (id: string, isCurrentlyCompleted: boolean) => {
    playClick();
    togglePrayer(id);
    if (!isCurrentlyCompleted) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
  };

  const completedCount = missedPrayers.filter(p => p.completed).length;
  const totalCount = missedPrayers.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-paper rounded-3xl p-8 border border-stone-200 shadow-sm space-y-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Qadha Shalat</h1>
          <p className="text-stone-500">Daftar hutang shalat fardhu yang harus diganti.</p>
          
          <div className="mt-4 p-4 bg-indigo-50 rounded-2xl flex justify-between items-center text-indigo-900 border border-indigo-100">
            <div>
              <span className="block text-xs uppercase tracking-widest font-bold opacity-70">Progress</span>
              <span className="text-2xl font-bold">{completedCount} / {totalCount}</span>
            </div>
            <div className="text-right">
              <span className="block text-xs uppercase tracking-widest font-bold opacity-70">Tersisa</span>
              <span className="text-2xl font-bold">{totalCount - completedCount}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('Semua')}
            className={cn("px-4 py-2 rounded-full font-bold whitespace-nowrap text-sm transition-colors", filter === 'Semua' ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}
          >
            Semua
          </button>
          {FARDHU_ORDER.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("px-4 py-2 rounded-full font-bold whitespace-nowrap text-sm transition-colors", filter === f ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100")}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.fardhu}>
              <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                {group.fardhu}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map(prayer => (
                  <button
                    key={prayer.id}
                    onClick={() => handleToggle(prayer.id, prayer.completed)}
                    className={cn(
                      "text-left flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                      prayer.completed 
                        ? "bg-stone-50 border-stone-200 text-stone-400 opacity-70" 
                        : "bg-paper border-indigo-100 text-stone-900 hover:border-indigo-300 shadow-sm"
                    )}
                  >
                    <div>
                      <div className={cn("font-bold", prayer.completed && "line-through")}>
                        {prayer.dateInfo}
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{prayer.prayer}</div>
                    </div>
                    {prayer.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-stone-300" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
