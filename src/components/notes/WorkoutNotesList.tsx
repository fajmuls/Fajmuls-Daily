import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { WorkoutNote } from '../../types';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Activity, Clock, Dumbbell } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

export function WorkoutNotesList() {
  const navigate = useNavigate();
  const { notes } = useAppContext();
  const { playClick } = useAudio();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const workoutNotes = notes.filter(n => n.type === 'workout') as WorkoutNote[];

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handleCreate = () => {
    playClick();
    navigate('/notes/workout');
  };

  const handleDayClick = (date: Date, notesForDay: WorkoutNote[]) => {
    playClick();
    if (notesForDay.length > 0) {
      navigate(`/notes/workout/${notesForDay[0].id}`);
    } else {
      navigate(`/notes/workout?date=${format(date, 'yyyy-MM-dd')}`);
    }
  };

  const weightliftingCount = workoutNotes.filter(n => n.workoutCategory === 'Angkat Beban').length;
  const gymCount = workoutNotes.filter(n => n.workoutCategory === 'Gym').length;
  const runningCount = workoutNotes.filter(n => n.workoutCategory === 'Lari').length;
  const otherCount = workoutNotes.length - weightliftingCount - gymCount - runningCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={handleCreate} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
          <Plus className="w-5 h-5" /> Catatan
        </button>
      </div>

      <header className="py-4 border-b border-stone-200">
         <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Kalender Olahraga</h1>
         <p className="text-stone-500 font-medium">Pantau aktivitas fisikmu secara visual.</p>
      </header>

      <div className="bg-paper rounded-3xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold uppercase tracking-widest text-stone-900">
             {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
           </h2>
           <div className="flex gap-2">
             <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
             </button>
             <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg">
                <ChevronRight className="w-5 h-5" />
             </button>
           </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">
           {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
             <div key={day} className="py-2">{day}</div>
           ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
           {daysInMonth.map(date => {
             const notesForDay = workoutNotes.filter(n => isSameDay(n.createdAt, date));
             const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
             const hasWorkout = notesForDay.length > 0;
             const isToday = isSameDay(date, new Date());
             
             return (
               <div 
                 key={date.toISOString()}
                 onClick={() => handleDayClick(date, notesForDay)}
                 className={cn(
                   "aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 relative",
                   !isCurrentMonth ? "opacity-30 border-transparent bg-stone-50" : (isToday ? "bg-stone-100" : "bg-white"),
                   hasWorkout ? "border-amber-400 bg-amber-50 hover:bg-amber-100" : (isToday ? "border-stone-300" : "border-stone-100 hover:border-stone-300")
                 )}
               >
                  <span className={cn("text-lg font-bold font-mono", hasWorkout ? "text-amber-700" : "text-stone-700")}>
                    {format(date, 'd')}
                  </span>
                  {hasWorkout && (
                    <div className="absolute bottom-1 w-full flex justify-center gap-1">
                      {notesForDay.map(n => (
                         <div key={n.id} className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      ))}
                    </div>
                  )}
               </div>
             )
           })}
        </div>
      </div>

      {/* Ringkasan */}
      <h3 className="font-bold uppercase tracking-widest text-stone-400 text-xs mb-2 pl-2">Ringkasan Riwayat</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl p-6 shadow-sm">
            <Activity className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-3xl font-serif font-bold">{weightliftingCount}</p>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mt-1">Angkat Beban</p>
         </div>
         <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl p-6 shadow-sm">
            <Dumbbell className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-3xl font-serif font-bold">{gymCount}</p>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mt-1">Gym</p>
         </div>
         <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl p-6 shadow-sm">
            <Activity className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-3xl font-serif font-bold">{runningCount}</p>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mt-1">Lari</p>
         </div>
         <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl p-6 shadow-sm">
            <Clock className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-3xl font-serif font-bold">{workoutNotes.reduce((acc, curr) => acc + (curr.durationMins || 0), 0)}</p>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mt-1">Total (Menit)</p>
         </div>
      </div>
    </div>
  );
}
