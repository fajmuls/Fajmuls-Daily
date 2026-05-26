import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getWeekOfMonth, getDay, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  CalendarRange, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Check,
  ListTodo,
  TrendingUp,
  Award,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useAppContext } from '../store';
import { useAudio } from '../hooks/useAudio';
import { cn } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface RoutineActivity {
  id: string;
  name: string;
  createdAt: number;
}

interface RoutineCompletion {
  id: string;
  activityId: string;
  dateStr: string; // YYYY-MM-DD
}

export function Activities() {
  const { playClick, playSuccess, playError } = useAudio();
  const { showConfirm } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // States for activities (could be moved to store if persistence is needed across sessions)
  // For now, let's check if store has them. If not, we use local state or add to store.
  // The user prompt implies "filling manual", so we need persistence.
  // I'll check store.tsx later, but for now I'll use local state and mock it.
  // Optimization: Use localStorage for now if store doesn't support it.
  
  const [activities, setActivities] = useState<RoutineActivity[]>(() => {
    const saved = localStorage.getItem('fajmul_routine_activities');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Workout', createdAt: Date.now() },
      { id: '2', name: 'Baca Buku', createdAt: Date.now() }
    ];
  });

  const [completions, setCompletions] = useState<RoutineCompletion[]>(() => {
    const saved = localStorage.getItem('fajmul_routine_completions');
    return saved ? JSON.parse(saved) : [];
  });

  const [newActivityName, setNewActivityName] = useState("");

  const saveToLocal = (acts: RoutineActivity[], comps: RoutineCompletion[]) => {
    localStorage.setItem('fajmul_routine_activities', JSON.stringify(acts));
    localStorage.setItem('fajmul_routine_completions', JSON.stringify(comps));
  };

  const handleAddActivity = () => {
    if (!newActivityName.trim()) return;
    playClick();
    const newAct: RoutineActivity = {
      id: uuidv4(),
      name: newActivityName.trim(),
      createdAt: Date.now()
    };
    const updated = [...activities, newAct];
    setActivities(updated);
    saveToLocal(updated, completions);
    setNewActivityName("");
    playSuccess();
  };

  const handleDeleteActivity = (id: string) => {
    showConfirm("Yakin ingin menghapus kegiatan harian ini? Data penyelesaian juga akan terhapus.", () => {
      playError();
      const updated = activities.filter(a => a.id !== id);
      const updatedComps = completions.filter(c => c.activityId !== id);
      setActivities(updated);
      setCompletions(updatedComps);
      saveToLocal(updated, updatedComps);
    });
  };

  const toggleCompletion = (activityId: string, date: Date) => {
    playClick();
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingIndex = completions.findIndex(c => c.activityId === activityId && c.dateStr === dateStr);
    
    let updatedComps: RoutineCompletion[];
    if (existingIndex > -1) {
      updatedComps = completions.filter((_, i) => i !== existingIndex);
    } else {
      updatedComps = [...completions, { id: uuidv4(), activityId, dateStr }];
      playSuccess();
    }
    setCompletions(updatedComps);
    saveToLocal(activities, updatedComps);
  };

  // Calendar Helpers
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Group days by week
  const weeks = useMemo(() => {
    const w: Date[][] = [[], [], [], [], [], []];
    daysInMonth.forEach(day => {
      const weekIndex = getWeekOfMonth(day, { weekStartsOn: 1 }) - 1;
      w[weekIndex].push(day);
    });
    return w.filter(week => week.length > 0);
  }, [daysInMonth]);

  const activityStats = useMemo(() => {
    return activities.map(act => {
      const monthCompletions = completions.filter(c => {
        const cDate = new Date(c.dateStr);
        return c.activityId === act.id && 
               cDate.getMonth() === currentMonth.getMonth() && 
               cDate.getFullYear() === currentMonth.getFullYear();
      });
      return {
        ...act,
        count: monthCompletions.length,
        totalDays: daysInMonth.length,
        percentage: Math.round((monthCompletions.length / daysInMonth.length) * 100)
      };
    });
  }, [activities, completions, currentMonth, daysInMonth]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-rose-600 rounded-2xl shadow-brutal border-2 border-stone-900">
               <CalendarRange className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-stone-900 tracking-tight">Kegiatan Harian</h1>
          </div>
          <p className="text-stone-500 font-medium">Lacak rutinitas dan kebiasaan harian Anda setiap bulan.</p>
        </div>

        <div className="flex items-center justify-between w-full md:w-[400px] bg-paper p-2 rounded-2xl border-2 border-stone-900 shadow-brutal shrink-0">
          <button onClick={() => { playClick(); setCurrentMonth(subMonths(currentMonth, 1)); }} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 text-center min-w-[140px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 leading-none mb-1">Periode Bulan</p>
            <p className="font-bold text-lg text-stone-900 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: id })}</p>
          </div>
          <button onClick={() => { playClick(); setCurrentMonth(addMonths(currentMonth, 1)); }} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Activities Input */}
      <section className="bg-white p-6 rounded-[2.5rem] border-2 border-stone-900 shadow-brutal">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <ListTodo className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
              placeholder="Tambah template kegiatan harian..."
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl pl-12 pr-4 py-4 focus:border-stone-900 outline-none font-bold transition-all"
            />
          </div>
          <button 
            onClick={handleAddActivity}
            className="px-6 md:px-8 py-4 flex items-center justify-center gap-2 bg-stone-900 text-white text-sm rounded-2xl font-black uppercase tracking-widest shadow-brutal hover:-translate-y-1 transition-all active:translate-y-0 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah</span>
          </button>
        </div>
      </section>

      {/* Summary Stats */}
      {activityStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activityStats.map(stat => (
            <div key={stat.id} className="bg-paper p-5 rounded-3xl border-2 border-stone-200 shadow-sm hover:border-stone-900 hover:shadow-brutal transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-rose-600 transition-colors">{stat.name}</span>
                <TrendingUp className="w-4 h-4 text-stone-300 group-hover:text-rose-600 transition-colors" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-stone-900">{stat.count}</span>
                <span className="text-stone-400 font-bold mb-1.5 text-sm">/ {stat.totalDays} hari</span>
              </div>
              <div className="mt-3 w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.percentage}%` }}
                  className="bg-rose-600 h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid Tracker */}
      <div className="bg-white rounded-[2.5rem] border-2 border-stone-900 shadow-brutal overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b-2 border-stone-900">
                <th className="p-4 text-left border-r-2 border-stone-900 min-w-[120px]" rowSpan={2}>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-black uppercase tracking-tighter">Nama Kegiatan</span>
                  </div>
                </th>
                {weeks.map((week, wIdx) => (
                  <React.Fragment key={wIdx}>
                    <th className="px-2 py-4 text-center border-r-2 border-stone-200 bg-stone-100/50" colSpan={week.length}>
                       <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">MG {wIdx + 1}</span>
                    </th>
                  </React.Fragment>
                ))}
                <th className="p-6 text-center min-w-[80px] bg-stone-900 text-white" rowSpan={2}>
                  <span className="text-[10px] font-black uppercase tracking-widest">Aksi</span>
                </th>
              </tr>
              <tr className="bg-white border-b-2 border-stone-900">
                {daysInMonth.map((day, dIdx) => (
                  <th 
                    key={dIdx} 
                    className={cn(
                      "p-1.5 text-center text-[10px] font-bold border-r border-stone-100 min-w-[40px]",
                      isSameDay(day, new Date()) ? "bg-stone-900 text-white border-none" : ""
                    )}
                  >
                    <div className="text-sm font-black">{format(day, 'd')}</div>
                    <div className="text-[9px] opacity-90 uppercase tracking-widest mt-0.5">
                      {format(day, 'EEEEEE', { locale: id })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth.length + 2} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-stone-400">
                      <CalendarIcon className="w-12 h-12 opacity-30" />
                      <p className="font-bold text-lg">Belum ada kegiatan yang didaftarkan.</p>
                      <p className="text-sm">Mulai dengan menambahkan template kegiatan di atas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activities.map(act => (
                  <tr key={act.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors group/row">
                    <td className="p-3 border-r-2 border-stone-900 font-bold text-sm text-stone-800 bg-stone-50/30">
                      {act.name}
                    </td>
                    {daysInMonth.map((day, dIdx) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isCompleted = completions.some(c => c.activityId === act.id && c.dateStr === dateStr);
                      return (
                        <td key={dIdx} className="p-1 text-center border-r border-stone-50">
                          <button 
                            onClick={() => toggleCompletion(act.id, day)}
                            className={cn(
                              "w-4 h-4 rounded border-2 transition-all flex items-center justify-center mx-auto cursor-pointer",
                              isCompleted 
                                ? "bg-stone-900 border-stone-900 text-white shadow-sm" 
                                : "bg-white border-stone-200 hover:border-stone-400"
                            )}
                          >
                             {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-4 text-center border-l border-stone-900">
                      <button 
                        onClick={() => handleDeleteActivity(act.id)}
                        className="p-2.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="text-center text-stone-400 text-sm italic font-medium">
        * Klik pada kotak untuk menandai kegiatan yang telah selesai. Data disimpan secara otomatis.
      </p>
    </div>
  );
}
