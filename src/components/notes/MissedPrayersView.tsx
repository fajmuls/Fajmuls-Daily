import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { ArrowLeft, CheckCircle2, Circle, Plus } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { Fardhu } from '../../types';

const FARDHU_ORDER: Fardhu[] = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya', 'Belum Diketahui'];

export function MissedPrayersView() {
  const navigate = useNavigate();
  const { missedPrayers, addMissedPrayer, togglePrayer, deleteMissedPrayer } = useAppContext();
  const { playClick, playSuccess, playError } = useAudio();
  const [filter, setFilter] = useState<Fardhu | 'Semua'>('Semua');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [newPrayerType, setNewPrayerType] = useState<Fardhu>('Subuh');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;

    // Formatting date to readable Id format like "14 Okt 2023"
    const dateObj = new Date(newDate);
    const formattedDate = format(dateObj, 'd MMMM yyyy', { locale: localeId });

    addMissedPrayer({
      id: uuidv4(),
      prayer: newPrayerType,
      dateInfo: formattedDate,
      completed: false
    });

    playSuccess();
    setShowForm(false);
  };

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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="w-12 h-12 flex items-center justify-center glass-card rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-8 py-3 fab-gradient text-white rounded-2xl font-black shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98]">
          <Plus className="w-5 h-5" /> Barisan Qadha
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddSubmit} className="glass-card rounded-[2rem] p-8 border border-white/5 shadow-2xl space-y-6 animate-in slide-in-from-top-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Circle className="w-20 h-20" />
           </div>
           <h3 className="font-black text-xl text-white">Catat Hutang Shalat</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                 <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Shalat Fardhu</label>
                 <select 
                   value={newPrayerType} 
                   onChange={e => setNewPrayerType(e.target.value as Fardhu)} 
                   className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent-purple text-white font-bold appearance-none cursor-pointer"
                 >
                   {FARDHU_ORDER.map(f => <option key={f} value={f} className="bg-dashboard-bg">{f}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Pilih Tanggal</label>
                 <input 
                   type="date" 
                   required
                   value={newDate} 
                   onChange={e => setNewDate(e.target.value)} 
                   className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent-purple font-black text-white"
                 />
              </div>
           </div>
           <button type="submit" className="w-full bg-accent-purple text-white rounded-2xl py-5 font-black mt-2 hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.5)] transition-all active:scale-[0.98]">
             Simpan Ke Daftar
           </button>
        </form>
      )}

      <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Monitor Qadha</h1>
          <p className="text-slate-500 font-medium italic">"Maka shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman."</p>
          
          <div className="mt-8 p-8 bg-white/2 rounded-[2rem] flex justify-between items-center text-white border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <CheckCircle2 className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <span className="block text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-1">Progress Terkini</span>
              <span className="text-4xl font-black">{completedCount}<span className="text-xl opacity-30 mx-2">/</span>{totalCount}</span>
            </div>
            <div className="text-right relative z-10">
              <span className="block text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-1">Tersisa</span>
              <span className="text-4xl font-black text-accent-purple">{totalCount - completedCount}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none px-1">
          <button
            onClick={() => setFilter('Semua')}
            className={cn("px-6 py-3 rounded-2xl font-black whitespace-nowrap text-[10px] uppercase tracking-widest transition-all border", filter === 'Semua' ? "active-nav-bg text-white border-transparent shadow-lg" : "bg-white/2 text-slate-500 border-white/5 hover:bg-white/5")}
          >
            Semua
          </button>
          {FARDHU_ORDER.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("px-6 py-3 rounded-2xl font-black whitespace-nowrap text-[10px] uppercase tracking-widest transition-all border", filter === f ? "bg-accent-purple text-white border-transparent shadow-lg" : "bg-white/2 text-slate-500 border-white/5 hover:bg-white/5")}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {grouped.length === 0 ? (
             <div className="text-center py-20 text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Belum ada daftar qadha.</div>
          ) : (
            grouped.map(group => (
              <div key={group.fardhu} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-8 h-1 bg-accent-purple rounded-full"></span>
                    {group.fardhu}
                  </h2>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map(prayer => (
                    <div key={prayer.id} className="relative group">
                      <button
                        onClick={() => handleToggle(prayer.id, prayer.completed)}
                        className={cn(
                          "w-full text-left flex items-center justify-between p-6 rounded-[2rem] border transition-all relative overflow-hidden",
                          prayer.completed 
                            ? "bg-white/2 border-white/5 text-slate-700" 
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10 shadow-lg"
                        )}
                      >
                        <div className="relative z-10">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{prayer.prayer}</div>
                          <div className={cn("font-black text-xl tracking-tight", prayer.completed && "line-through opacity-20")}>
                            {prayer.dateInfo}
                          </div>
                        </div>
                        {prayer.completed ? <CheckCircle2 className="w-7 h-7 text-green-500/40" /> : <Circle className="w-7 h-7 text-white/10 group-hover:text-white/40" />}
                      </button>
                      
                      <button 
                         onClick={(e) => { 
                            e.stopPropagation(); 
                            if(window.confirm("Hapus qadha ini?")) { deleteMissedPrayer(prayer.id); playError(); } 
                         }}
                         className="absolute top-2 right-2 w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-red-500 shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 z-10"
                      >
                         <Plus className="w-5 h-5 rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
