import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useAppContext } from '../../store';
import { WorkoutNote } from '../../types';
import { ArrowLeft, Trash2, Save, Timer, Copy, Calendar } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

const WORKOUT_CATEGORIES = ['Angkat Beban', 'Gym', 'Lari', 'Olahraga Lain'];

export function WorkoutNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'workout') as WorkoutNote | undefined;

  const [title, setTitle] = useState('');
  const [routine, setRoutine] = useState('');
  const [durationMins, setDurationMins] = useState<number | ''>('');
  const [workoutCategory, setWorkoutCategory] = useState<string>('Gym');
  const [dateStr, setDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setRoutine(existingNote.routine);
      setDurationMins(existingNote.durationMins);
      setWorkoutCategory(existingNote.workoutCategory || 'Gym');
      setDateStr(format(existingNote.createdAt, 'yyyy-MM-dd'));
    }
  }, [existingNote]);

  const handleSave = () => {
    if (!title && !routine) return;
    
    const duration = Number(durationMins) || 0;
    const saveDate = new Date(dateStr).getTime() || Date.now();

    if (existingNote) {
      updateNote({
        ...existingNote,
        title,
        routine,
        durationMins: duration,
        workoutCategory,
        createdAt: saveDate
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'workout',
        createdAt: saveDate,
        updatedAt: Date.now(),
        title,
        routine,
        durationMins: duration,
        workoutCategory
      });
    }
    playSuccess();
    navigate('/notes/workout-list');
  };

  const handleDuplicate = () => {
     if (!existingNote) return;
     const newDate = new Date(dateStr).getTime() || Date.now();
     addNote({
        id: uuidv4(),
        type: 'workout',
        createdAt: newDate,
        updatedAt: Date.now(),
        title: `${existingNote.title} (Salinan)`,
        routine: existingNote.routine,
        durationMins: existingNote.durationMins,
        workoutCategory: existingNote.workoutCategory
     });
     playSuccess();
     navigate('/notes/workout-list');
  };

  const handleDelete = () => {
    if (existingNote) {
      const confirm = window.confirm("Apakah kamu ingin menghapus catatan olahraga ini?");
      if (confirm) {
         deleteNote(existingNote.id);
         playError();
         navigate('/notes/workout-list');
      }
    } else {
      navigate('/notes/workout-list');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes/workout-list'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {existingNote && (
            <>
               <button onClick={handleDuplicate} title="Salin Catatan Ini" className="p-3 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors">
                 <Copy className="w-5 h-5" />
               </button>
               <button onClick={handleDelete} className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                 <Trash2 className="w-5 h-5" />
               </button>
            </>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
            <Save className="w-5 h-5" /> Simpan
          </button>
        </div>
      </div>

      <div className="bg-paper rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6 flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 mb-2">
           <div className="flex-1">
              <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Pilih Tanggal</label>
              <div className="flex items-center gap-2 bg-stone-50 px-4 py-3 rounded-xl focus-within:ring-2 ring-orange-500">
                 <Calendar className="w-5 h-5 text-stone-400" />
                 <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="bg-transparent outline-none flex-1 font-mono font-medium text-stone-700" />
              </div>
           </div>
           <div className="flex-1">
              <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Kategori</label>
              <div className="flex flex-wrap gap-2">
                 {WORKOUT_CATEGORIES.map(cat => (
                    <button 
                       key={cat}
                       onClick={() => setWorkoutCategory(cat)}
                       className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors", workoutCategory === cat ? "bg-orange-100 text-orange-700 border border-orange-200" : "bg-stone-50 text-stone-500 border border-transparent hover:bg-stone-100")}
                    >
                       {cat}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul Olahraga (Cth: Dada & Trisep)"
          className="w-full text-4xl font-serif font-bold text-stone-900 outline-none placeholder:text-stone-300 bg-transparent mt-4"
        />

        <div className="flex items-center gap-4 bg-orange-50 text-orange-800 p-4 rounded-2xl w-max">
            <Timer className="w-6 h-6" />
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={durationMins} 
                onChange={(e) => setDurationMins(e.target.value === '' ? '' : Number(e.target.value))} 
                className="w-16 bg-transparent border-b border-orange-200 outline-none text-center font-bold font-mono text-xl focus:border-orange-500" 
                placeholder="0"
              />
              <span className="font-bold uppercase tracking-wider text-sm">Menit</span>
            </div>
        </div>
        
        <textarea
          value={routine}
          onChange={(e) => setRoutine(e.target.value)}
          placeholder="Tuliskan rutinitas, set, dan repetisimu di sini..."
          className="w-full flex-1 min-h-[300px] text-lg text-stone-700 outline-none placeholder:text-stone-300 bg-transparent resize-y mt-4"
        />
      </div>
    </div>
  );
}
