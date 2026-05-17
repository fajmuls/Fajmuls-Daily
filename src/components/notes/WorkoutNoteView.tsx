import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../store';
import { WorkoutNote } from '../../types';
import { ArrowLeft, Trash2, Save, Timer } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function WorkoutNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'workout') as WorkoutNote | undefined;

  const [title, setTitle] = useState('');
  const [routine, setRoutine] = useState('');
  const [durationMins, setDurationMins] = useState<number | ''>('');

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setRoutine(existingNote.routine);
      setDurationMins(existingNote.durationMins);
    }
  }, [existingNote]);

  const handleSave = () => {
    if (!title && !routine) return;
    
    const duration = Number(durationMins) || 0;

    if (existingNote) {
      updateNote({
        ...existingNote,
        title,
        routine,
        durationMins: duration
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'workout',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title,
        routine,
        durationMins: duration
      });
    }
    playSuccess();
    navigate('/notes');
  };

  const handleDelete = () => {
    if (existingNote) {
      deleteNote(existingNote.id);
      playError();
    }
    navigate('/notes');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {existingNote && (
            <button onClick={handleDelete} className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
            <Save className="w-5 h-5" /> Save
          </button>
        </div>
      </div>

      <div className="bg-paper rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6 flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Workout Title (e.g., Upper Body)"
          className="w-full text-4xl font-serif font-bold text-stone-900 outline-none placeholder:text-stone-300 bg-transparent"
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
              <span className="font-bold uppercase tracking-wider text-sm">Minutes</span>
            </div>
        </div>
        
        <textarea
          value={routine}
          onChange={(e) => setRoutine(e.target.value)}
          placeholder="List your exercises, sets, and reps..."
          className="w-full flex-1 min-h-[300px] text-lg text-stone-700 outline-none placeholder:text-stone-300 bg-transparent resize-y mt-4"
        />
      </div>
    </div>
  );
}
