import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useAppContext } from '../../store';
import { PrayerNote } from '../../types';
import { ArrowLeft, Trash2, Save, CheckCircle2, Circle } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export function PrayerNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'prayer') as PrayerNote | undefined;

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [prayers, setPrayers] = useState({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false });

  useEffect(() => {
    if (existingNote) {
      setDate(existingNote.date);
      setPrayers(existingNote.prayers);
    }
  }, [existingNote]);

  const togglePrayer = (k: keyof typeof prayers) => {
    playClick();
    const nextState = { ...prayers, [k]: !prayers[k] };
    setPrayers(nextState);
    if (Object.values(nextState).every(v => v)) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleSave = () => {
    if (existingNote) {
      updateNote({
        ...existingNote,
        date,
        prayers,
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'prayer',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        date,
        prayers,
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

  const allCompleted = Object.values(prayers).every(v => v);

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
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

      <div className="bg-paper rounded-3xl p-8 border border-stone-200 shadow-sm space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Qadha Record</h1>
          <p className="text-stone-500">Track and make up your missed prayers.</p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Missed Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Prayers Made Up (Coded)</label>
          {PRAYERS.map(p => (
            <button
              key={p}
              onClick={() => togglePrayer(p)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-lg capitalize",
                prayers[p] 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-900" 
                  : "bg-transparent border-stone-100 text-stone-600 hover:border-stone-200"
              )}
            >
              {p}
              {prayers[p] ? <CheckCircle2 className="w-6 h-6 text-indigo-600" /> : <Circle className="w-6 h-6 text-stone-300" />}
            </button>
          ))}
        </div>

        {allCompleted && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center font-bold animate-in zoom-in duration-300">
            Mashallah! All prayers for this date are made up.
          </div>
        )}
      </div>
    </div>
  );
}
