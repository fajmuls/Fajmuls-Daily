import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { WorkoutNote } from '../../types';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Activity, Clock } from 'lucide-react';
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
    if (notesForDay.length > 0) {
      playClick();
      navigate(`/notes/workout/${notesForDay[0].id}`); // Opens the first note for simplification
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={handleCreate} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
          <Plus className="w-5 h-5" /> Catatan Olahraga
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
             
             return (
               <div 
                 key={date.toISOString()}
                 onClick={() => handleDayClick(date, notesForDay)}
                 className={cn(
                   "aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 relative",
                   !isCurrentMonth ? "opacity-30 border-transparent bg-stone-50" : "bg-white",
                   hasWorkout ? "border-amber-400 bg-amber-50 hover:bg-amber-100" : "border-stone-100 hover:border-stone-300"
                 )}
               >
                  <span className={cn("text-lg font-bold font-mono", hasWorkout ? "text-amber-700" : "text-stone-700")}>
                    {format(date, 'd')}
                  </span>
                  {hasWorkout && (
                    <div className="absolute bottom-2">
                       <Activity className="w-4 h-4 text-amber-500" />
                    </div>
                  )}
               </div>
             )
           })}
        </div>
      </div>

      {/* Ringkasan */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-sm">
        <h3 className="font-bold uppercase tracking-widest text-stone-400 text-xs mb-4">Ringkasan Total</h3>
        <div className="grid grid-cols-2 gap-6">
           <div className="bg-stone-800 rounded-2xl p-6">
              <Activity className="w-8 h-8 text-amber-400 mb-4" />
              <p className="text-3xl font-serif font-bold">{workoutNotes.length} Sesi</p>
              <p className="text-stone-400 text-sm mt-1">Total olahraga yang tercatat</p>
           </div>
           <div className="bg-stone-800 rounded-2xl p-6">
              <Clock className="w-8 h-8 text-blue-400 mb-4" />
              <p className="text-3xl font-serif font-bold">{workoutNotes.reduce((acc, curr) => acc + (curr.durationMins || 0), 0)} Menit</p>
              <p className="text-stone-400 text-sm mt-1">Total durasi olahraga</p>
           </div>
        </div>
      </div>
    </div>
  );
}
