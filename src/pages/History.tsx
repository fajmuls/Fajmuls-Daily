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
  Calendar as CalendarIcon,
  MapIcon,
  MapPin,
  Car
} from 'lucide-react';
import { useAppContext } from '../store';
import { useAudio } from '../hooks/useAudio';
import { cn } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { TripTrackingMap } from '../components/dashboard/TripTrackingMap';

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

export function History() {
  const { playClick, playSuccess, playError } = useAudio();
  const { showConfirm, activities, completions, addActivity, deleteActivity, toggleCompletion, trips } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newActivityName, setNewActivityName] = useState("");
  const [activeTab, setActiveTab] = useState<'routine' | 'trips'>('routine');

  const [expandedTripMap, setExpandedTripMap] = useState<string | null>(null);

  const completedTrips = useMemo(() => trips.filter(t => t.status === 'completed'), [trips]);

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
            <h1 className="font-serif text-4xl font-bold text-stone-900 tracking-tight">Riwayat & Aktivitas</h1>
          </div>
          <p className="text-stone-500 font-medium">Lacak rutinitas dan perjalanan Anda.</p>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-2xl border-2 border-stone-900 shadow-brutal">
          <button 
            onClick={() => { setActiveTab('routine'); playClick(); }}
            className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'routine' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400")}
          >Rutinitas</button>
          <button 
            onClick={() => { setActiveTab('trips'); playClick(); }}
            className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'trips' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400")}
          >Perjalanan</button>
        </div>
      </header>

      {activeTab === 'routine' ? (
        <>
          <div className="flex items-center justify-between bg-paper p-2 rounded-2xl border-2 border-stone-900 shadow-brutal mb-8">
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
                      "p-1 text-center text-[8px] font-bold border-r border-stone-100 min-w-[20px]",
                      isSameDay(day, new Date()) ? "bg-stone-900 text-white border-none" : ""
                    )}
                  >
                    <div className="text-[10px] font-black">{format(day, 'd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth.length + 2} className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                      <CalendarIcon className="w-8 h-8 opacity-30" />
                      <p className="font-bold text-sm">Belum ada kegiatan.</p>
                      <p className="text-xs">Mulai dengan menambahkan template di atas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activities.map(act => (
                  <tr key={act.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors group/row">
                    <td className="p-2 border-r-2 border-stone-900 font-bold text-xs text-stone-800 bg-stone-50/30">
                      {act.name}
                    </td>
                    {daysInMonth.map((day, dIdx) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isCompleted = completions.some(c => c.activityId === act.id && c.dateStr === dateStr);
                      return (
                        <td key={dIdx} className="p-0.5 text-center border-r border-stone-50">
                          <button 
                            onClick={() => handleToggleCompletion(act.id, day)}
                            className={cn(
                              "w-3.5 h-3.5 rounded border border-stone-300 transition-all flex items-center justify-center mx-auto cursor-pointer",
                              isCompleted 
                                ? "bg-stone-900 border-stone-900 text-white shadow-sm" 
                                : "bg-white hover:border-stone-500"
                            )}
                          >
                             {isCompleted && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center border-l border-stone-900">
                      <button 
                        onClick={() => handleDeleteActivity(act.id)}
                        className="p-1 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
        </>
      ) : (
        <div className="space-y-6">
          {completedTrips.length === 0 ? (
            <div className="py-20 text-center bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-200">
              <Car className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-400 font-bold">Belum ada riwayat perjalanan.</p>
            </div>
          ) : (
            completedTrips.map(trip => (
              <div key={trip.id} className="flex flex-col gap-4">
               <div className="bg-white border-2 border-stone-900 rounded-[2.5rem] p-6 shadow-brutal flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 space-y-4">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-stone-900 text-white rounded-lg flex items-center justify-center">
                           <Car className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">Kendaraan</p>
                           <p className="text-xs font-bold text-stone-900">{trip.vehicle}</p>
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <MapPin className="w-3.5 h-3.5 text-stone-400" />
                           <p className="text-xs font-medium text-stone-600 truncate">{trip.origin.detail || trip.origin.city}</p>
                        </div>
                        <div className="w-px h-4 bg-stone-200 ml-1.5" />
                        <div className="flex items-center gap-2">
                           <MapPin className="w-3.5 h-3.5 text-red-500" />
                           <p className="text-xs font-medium text-stone-600 truncate">{trip.destination.detail || trip.destination.city}</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                     <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <p className="text-[7px] font-black uppercase tracking-widest text-stone-400 mb-1">Tanggal</p>
                        <p className="text-xs font-bold text-stone-900">{format(trip.startTime, 'd MMM yyyy')}</p>
                     </div>
                     <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <p className="text-[7px] font-black uppercase tracking-widest text-stone-400 mb-1">Waktu</p>
                        <p className="text-xs font-bold text-stone-900">{format(trip.startTime, 'HH:mm')} - {format(trip.endTime!, 'HH:mm')}</p>
                     </div>
                     <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <p className="text-[7px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Biaya</p>
                        <p className="text-xs font-bold text-stone-900">Rp {((trip.tollCost || 0) + (trip.fuelCost || 0)).toLocaleString('id-ID')}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                     <button 
                      onClick={() => { setExpandedTripMap(expandedTripMap === trip.id ? null : trip.id); playClick(); }}
                      className={cn(
                        "p-3 rounded-2xl border border-stone-100 transition-all",
                        expandedTripMap === trip.id ? "bg-stone-900 text-white" : "bg-stone-50 hover:bg-stone-900 hover:text-white"
                      )}
                     >
                        <MapIcon className="w-5 h-5" />
                     </button>
                  </div>
               </div>
               
               <AnimatePresence>
                 {expandedTripMap === trip.id && (
                   <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 400, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-stone-50 rounded-[2.5rem] border-2 border-stone-900 shadow-brutal"
                   >
                     <TripTrackingMap 
                      origin={trip.origin} 
                      destination={trip.destination} 
                      ongoing={false} 
                     />
                   </motion.div>
                 )}
               </AnimatePresence>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
