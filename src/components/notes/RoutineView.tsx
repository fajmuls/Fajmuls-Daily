import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getWeekOfMonth, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  CalendarRange, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check,
  ListTodo,
  TrendingUp,
  Award,
  Calendar as CalendarIcon,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../store';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';

export function RoutineView() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError } = useAudio();
  const { showConfirm, activities = [], completions = [], addActivity, deleteActivity, toggleCompletion } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newActivityName, setNewActivityName] = useState("");

  const handleAddActivity = () => {
    if (!newActivityName.trim()) return;
    playClick();
    addActivity({
      id: uuidv4(),
      name: newActivityName.trim(),
      createdAt: Date.now()
    });
    setNewActivityName("");
    playSuccess();
  };

  const handleDeleteActivity = (id: string) => {
    showConfirm("Yakin ingin menghapus kegiatan harian ini? Data penyelesaian juga akan terhapus.", () => {
      deleteActivity(id);
      playError();
    });
  };

  const handleToggleCompletion = (activityId: string, date: Date) => {
    playClick();
    const dateStr = format(date, 'yyyy-MM-dd');
    toggleCompletion(activityId, dateStr);
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
      if (weekIndex >= 0 && weekIndex < 6) {
        w[weekIndex].push(day);
      }
    });
    return w.filter(week => week.length > 0);
  }, [daysInMonth]);

  const activityStats = useMemo(() => {
    return activities.map((act: any) => {
      const monthCompletions = completions.filter((c: any) => {
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-2 max-w-7xl mx-auto">
      {/* Back & Title Header */}
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { playClick(); navigate('/notes'); }}
            className="p-3 bg-white hover:bg-stone-50 text-stone-700 rounded-2xl border-2 border-stone-900 shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-stone-900" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <CalendarRange className="w-5 h-5 text-rose-600" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">Kegiatan Harian</h1>
            </div>
            <p className="text-stone-500 text-sm mt-0.5">Lacak rutinitas, kebiasaan, & komitmen ibadah harian Anda.</p>
          </div>
        </div>
      </header>

      {/* Period Selector */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border-2 border-stone-900 shadow-brutal mb-4 max-w-md">
        <button onClick={() => { playClick(); setCurrentMonth(subMonths(currentMonth, 1)); }} className="p-2 hover:bg-stone-50 rounded-xl transition-all border border-stone-100 shadow-sm">
          <ChevronLeft className="w-5 h-5 text-stone-700" />
        </button>
        <div className="px-4 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 leading-none mb-1">Periode Bulan</p>
          <p className="font-bold text-base text-stone-900 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: id })}</p>
        </div>
        <button onClick={() => { playClick(); setCurrentMonth(addMonths(currentMonth, 1)); }} className="p-2 hover:bg-stone-50 rounded-xl transition-all border border-stone-100 shadow-sm">
          <ChevronRight className="w-5 h-5 text-stone-700" />
        </button>
      </div>

      {/* Input New Activity */}
      <section className="bg-white p-5 rounded-[2rem] border-2 border-stone-900 shadow-brutal">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <ListTodo className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
              placeholder="Tambah template kegiatan harian baru..."
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl pl-11 pr-4 py-3 focus:border-stone-950 outline-none text-sm font-bold transition-all text-stone-900"
            />
          </div>
          <button 
            onClick={handleAddActivity}
            className="px-6 py-3 flex items-center justify-center gap-2 bg-stone-900 text-white text-xs rounded-xl font-black uppercase tracking-widest shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </section>

      {/* Summary Stats Grid */}
      {activityStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activityStats.map((stat: any) => (
            <div key={stat.id} className="bg-white p-5 rounded-3xl border-2 border-stone-200 shadow-sm hover:border-stone-900 hover:shadow-brutal transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-rose-600 transition-colors truncate max-w-[80%]">{stat.name}</span>
                <TrendingUp className="w-4 h-4 text-stone-300 group-hover:text-rose-600 transition-colors" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-stone-900">{stat.count}</span>
                <span className="text-stone-400 font-bold mb-1 text-xs">/ {stat.totalDays} hari</span>
              </div>
              <div className="mt-3 w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.percentage}%` }}
                  className="bg-rose-500 h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Habit Grid Completion Tracker */}
      <div className="bg-white rounded-[2rem] border-2 border-stone-900 shadow-brutal overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b-2 border-stone-900 text-stone-800">
                <th className="p-4 text-left border-r-2 border-stone-900 min-w-[140px] text-xs font-black uppercase tracking-widest bg-stone-50" rowSpan={2}>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-rose-500" />
                    <span>Kegiatan</span>
                  </div>
                </th>
                {weeks.map((week, wIdx) => (
                  <th key={wIdx} className="px-2 py-2 text-center border-r-2 border-stone-200 bg-stone-100/40 text-[9px] font-black uppercase tracking-widest text-stone-400" colSpan={week.length}>
                     MG {wIdx + 1}
                  </th>
                ))}
                <th className="p-4 text-center min-w-[70px] bg-stone-950 text-white text-[9px] font-black uppercase tracking-widest" rowSpan={2}>
                  Aksi
                </th>
              </tr>
              <tr className="bg-white border-b-2 border-stone-900 text-stone-800">
                {daysInMonth.map((day, dIdx) => (
                  <th 
                    key={dIdx} 
                    className={cn(
                      "p-1 text-center text-[10px] font-black border-r border-stone-100 min-w-[22px]",
                      isSameDay(day, new Date()) ? "bg-stone-900 text-white border-none shrink-0" : ""
                    )}
                  >
                    <div>{format(day, 'd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth.length + 2} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                      <CalendarIcon className="w-8 h-8 opacity-30 text-rose-300" />
                      <p className="font-bold text-sm">Belum ada template kegiatan harian.</p>
                      <p className="text-xs text-stone-400">Tulis kegiatan harian Anda (seperti shalat tepat waktu, olahraga, minum air, dsb) di kotak input atas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activities.map((act: any) => (
                  <tr key={act.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                    <td className="p-3 border-r-2 border-stone-900 font-bold text-xs text-stone-800 bg-stone-50/40 truncate max-w-[150px]">
                      {act.name}
                    </td>
                    {daysInMonth.map((day, dIdx) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isCompleted = completions.some((c: any) => c.activityId === act.id && c.dateStr === dateStr);
                      return (
                        <td key={dIdx} className="p-1 text-center border-r border-stone-100">
                          <button 
                            onClick={() => handleToggleCompletion(act.id, day)}
                            className={cn(
                              "w-4 h-4 rounded border transition-all flex items-center justify-center mx-auto cursor-pointer focus:outline-none",
                              isCompleted 
                                ? "bg-stone-900 border-stone-900 text-white shadow-sm scale-110" 
                                : "bg-white border-stone-300 hover:border-stone-600 hover:scale-105"
                            )}
                          >
                             {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center border-l border-stone-900">
                      <button 
                        onClick={() => handleDeleteActivity(act.id)}
                        className="p-1 hover:bg-red-50 text-stone-300 hover:text-red-500 rounded-lg transition-all"
                        title="Hapus kegiatan harian"
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

      <p className="text-center text-stone-400 text-xs italic font-medium">
        * Klik kotak tanggal untuk menandai pengerjaan/sukses kegiatan Anda. Database disinkronisasi otomatis.
      </p>
    </div>
  );
}
