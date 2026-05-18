import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useAppContext } from '../../store';
import { WorkoutNote, WorkoutDetail } from '../../types';
import { ArrowLeft, Trash2, Save, Timer, Copy, Calendar, Plus, Dumbbell, ChevronDown } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

const WORKOUT_CATEGORIES = ['Angkat Beban', 'Gym', 'Lari', 'Olahraga Lain'];

export function WorkoutNoteView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote, showConfirm } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'workout') as WorkoutNote | undefined;

  const [title, setTitle] = useState('');
  const [routine, setRoutine] = useState('');
  const [durationMins, setDurationMins] = useState<number | ''>('');
  const [workoutCategory, setWorkoutCategory] = useState<string>('Gym');
  const [dateStr, setDateStr] = useState<string>(searchParams.get('date') || format(new Date(), 'yyyy-MM-dd'));
  const [details, setDetails] = useState<WorkoutDetail[]>([]);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);

  const titleTemplates = useMemo(() => {
    const titles = new Set<string>();
    titles.add('Bahu & Kaki');
    titles.add('Dada & Trisep');
    titles.add('Punggung & Bisep');
    titles.add('Kardio & Perut');
    notes.filter(n => n.type === 'workout').forEach(n => {
       if ((n as WorkoutNote).title) titles.add((n as WorkoutNote).title);
    });
    return Array.from(titles);
  }, [notes]);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setRoutine(existingNote.routine);
      setDurationMins(existingNote.durationMins);
      setWorkoutCategory(existingNote.workoutCategory || 'Gym');
      setDateStr(format(existingNote.createdAt, 'yyyy-MM-dd'));
      setDetails(existingNote.details || []);
    }
  }, [existingNote]);

  const addDetail = () => {
     setDetails([...details, { id: uuidv4(), exercise: '', sets: 3, reps: 10, weight: '' }]);
  };

  const updateDetail = (index: number, field: keyof WorkoutDetail, value: any) => {
     const newDetails = [...details];
     newDetails[index] = { ...newDetails[index], [field]: value };
     setDetails(newDetails);
  };

  const deleteDetail = (index: number) => {
     setDetails(details.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title && details.length === 0) return;
    
    const duration = Number(durationMins) || 0;
    const saveDate = new Date(dateStr).getTime() || Date.now();

    if (existingNote) {
      updateNote({
        ...existingNote,
        title,
        routine,
        durationMins: duration,
        workoutCategory,
        createdAt: saveDate,
        details
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
        workoutCategory,
        details
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
      showConfirm("Apakah kamu ingin menghapus catatan olahraga ini?", () => {
         deleteNote(existingNote.id);
         playError();
         navigate('/notes/workout-list');
      });
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

        <div className="relative group">
           <input
             type="text"
             value={title}
             onFocus={() => setShowTitleDropdown(true)}
             onChange={(e) => { setTitle(e.target.value); setShowTitleDropdown(true); }}
             placeholder="Judul Olahraga (Cth: Dada & Trisep)"
             className="w-full text-4xl font-serif font-bold text-stone-900 outline-none placeholder:text-stone-300 bg-transparent mt-4 pr-10"
           />
           <button onClick={() => setShowTitleDropdown(!showTitleDropdown)} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone-300">
              <ChevronDown className={cn("w-6 h-6 transition-transform", showTitleDropdown ? "rotate-180" : "")} />
           </button>
           
           {showTitleDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-20 p-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                 {titleTemplates.filter(t => t.toLowerCase().includes(title.toLowerCase())).map((t, i) => (
                    <button 
                       key={i}
                       type="button"
                       onClick={() => { setTitle(t); setShowTitleDropdown(false); playClick(); }}
                       className="w-full text-left px-4 py-3 hover:bg-stone-50 rounded-xl font-medium text-stone-700 transition-colors"
                    >
                       {t}
                    </button>
                 ))}
                 {titleTemplates.filter(t => t.toLowerCase().includes(title.toLowerCase())).length === 0 && (
                    <div className="p-4 text-center text-sm text-stone-400">Tekan 'Simpan' untuk menambah template baru</div>
                 )}
              </div>
           )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
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
           
           <button onClick={addDetail} className="flex items-center gap-2 px-6 py-4 bg-paper border-2 border-dashed border-stone-200 rounded-2xl text-stone-500 font-bold hover:border-orange-300 hover:text-orange-600 transition-all">
              <Plus className="w-5 h-5" /> Tambah Gerakan
           </button>
        </div>

        {details.length > 0 && (
           <div className="space-y-4 pt-4">
              <h3 className="font-bold uppercase tracking-widest text-stone-400 text-xs pl-2">Detail Gerakan</h3>
              {details.map((detail, index) => (
                 <div key={detail.id} className="bg-stone-50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center group">
                    <div className="flex-1 w-full">
                       <input 
                          type="text" 
                          value={detail.exercise} 
                          onChange={(e) => updateDetail(index, 'exercise', e.target.value)}
                          placeholder="Nama Gerakan (Cth: Push Up)"
                          className="w-full bg-transparent border-b border-stone-200 outline-none font-bold text-stone-800 focus:border-stone-900 py-1"
                       />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                       <div className="bg-white border border-stone-200 rounded-xl px-3 py-2 flex items-center gap-2">
                          <input 
                             type="number" 
                             value={detail.sets} 
                             onChange={(e) => updateDetail(index, 'sets', Number(e.target.value))}
                             className="w-8 text-center bg-transparent outline-none font-mono font-bold"
                          />
                          <span className="text-[10px] uppercase font-bold text-stone-400">Sets</span>
                       </div>
                       
                       <div className="bg-white border border-stone-200 rounded-xl px-3 py-2 flex items-center gap-2">
                          <input 
                             type="number" 
                             value={detail.reps} 
                             onChange={(e) => updateDetail(index, 'reps', Number(e.target.value))}
                             className="w-8 text-center bg-transparent outline-none font-mono font-bold"
                          />
                          <span className="text-[10px] uppercase font-bold text-stone-400">Reps</span>
                       </div>

                       <div className="bg-white border border-stone-200 rounded-xl px-3 py-2 flex items-center gap-2">
                          <input 
                             type="text" 
                             value={detail.weight} 
                             onChange={(e) => updateDetail(index, 'weight', e.target.value)}
                             placeholder="-"
                             className="w-12 text-center bg-transparent outline-none font-mono font-bold"
                          />
                          <span className="text-[10px] uppercase font-bold text-stone-400">Kg/Lvl</span>
                       </div>

                       <button onClick={() => deleteDetail(index)} className="p-2 text-stone-300 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        )}
        
        <textarea
          value={routine}
          onChange={(e) => setRoutine(e.target.value)}
          placeholder="Catatan tambahan..."
          className="w-full flex-1 min-h-[150px] text-lg text-stone-700 outline-none placeholder:text-stone-300 bg-transparent resize-y mt-8"
        />
      </div>
    </div>
  );
}
