import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { Fardhu } from '../../types';

const FARDHU_ORDER: Fardhu[] = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya', 'Belum Diketahui'];

export function MissedPrayersView() {
  const navigate = useNavigate();
  const { missedPrayers, addMissedPrayer, togglePrayer, deleteMissedPrayer, deleteAllMissedPrayers, showConfirm } = useAppContext();
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

  const handleDeleteAll = () => {
    showConfirm("Hapus semua daftar qadha shalat?", () => {
      deleteAllMissedPrayers();
      playError();
    });
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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {missedPrayers.length > 0 && (
            <button onClick={handleDeleteAll} className="p-3 bg-red-50 text-red-600 rounded-full border border-red-200 hover:bg-red-100 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
            <Plus className="w-5 h-5" /> Tambah Qadha
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAddSubmit} className="bg-paper rounded-3xl p-6 border border-indigo-200 shadow-sm space-y-4 animate-in slide-in-from-top-4">
           <h3 className="font-bold text-lg text-indigo-900">Catat Hutang Shalat</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">Shalat Fardhu</label>
                 <select 
                   value={newPrayerType} 
                   onChange={e => setNewPrayerType(e.target.value as Fardhu)} 
                   className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                   {FARDHU_ORDER.map(f => <option key={f} value={f}>{f}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">Pilih Tanggal</label>
                 <input 
                   type="date" 
                   required
                   value={newDate} 
                   onChange={e => setNewDate(e.target.value)} 
                   className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                 />
              </div>
           </div>
           <button type="submit" className="w-full bg-indigo-600 text-white rounded-xl py-4 font-bold mt-2 hover:bg-indigo-700 transition-all">
             Simpan Ke Daftar
           </button>
        </form>
      )}

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
          {grouped.length === 0 ? (
             <div className="text-center py-10 text-stone-400 font-medium">Belum ada daftar qadha. Alhamdulillah!</div>
          ) : (
            grouped.map(group => (
              <div key={group.fardhu}>
                <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                  {group.fardhu}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.items.map(prayer => (
                    <div key={prayer.id} className="relative group">
                      <button
                        onClick={() => handleToggle(prayer.id, prayer.completed)}
                        className={cn(
                          "w-full text-left flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                          prayer.completed 
                            ? "bg-stone-50 border-stone-200 text-stone-400 opacity-70" 
                            : "bg-paper border-indigo-100 text-stone-900 hover:border-indigo-300 shadow-sm"
                        )}
                      >
                        <div>
                          <div className="text-xs text-stone-500 mb-1">{prayer.prayer}</div>
                          <div className={cn("font-bold text-lg", prayer.completed && "line-through")}>
                            {prayer.dateInfo}
                          </div>
                        </div>
                        {prayer.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-stone-300" />}
                      </button>
                      
                      <button 
                         onClick={(e) => { 
                            e.stopPropagation(); 
                            showConfirm("Hapus qadha ini?", () => { deleteMissedPrayer(prayer.id); playError(); });
                         }}
                         className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-stone-200 rounded-full flex items-center justify-center text-red-500 shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                      >
                         <Trash2 className="w-4 h-4" />
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
