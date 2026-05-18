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
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes/workout-list'); }} className="w-12 h-12 flex items-center justify-center glass-card rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
          {existingNote && (
            <>
               <button onClick={handleDuplicate} title="Salin Catatan Ini" className="w-12 h-12 flex items-center justify-center bg-white/5 text-slate-400 rounded-2xl border border-white/10 hover:text-white transition-all">
                 <Copy className="w-5 h-5" />
               </button>
               <button onClick={handleDelete} className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all">
                 <Trash2 className="w-5 h-5" />
               </button>
            </>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 fab-gradient text-white rounded-2xl font-black shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98]">
            <Save className="w-5 h-5" /> Simpan
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 lg:p-10 border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Dumbbell className="w-48 h-48" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 relative z-10">
           <div className="flex-1 space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Pilih Tanggal</label>
              <div className="flex items-center gap-3 bg-white/5 px-5 py-4 rounded-[1.5rem] border border-white/5 focus-within:ring-2 ring-accent-blue transition-all">
                 <Calendar className="w-5 h-5 text-accent-blue" />
                 <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="bg-transparent outline-none flex-1 font-black text-white" />
              </div>
           </div>
           <div className="flex-1 space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Kategori Latihan</label>
              <div className="flex flex-wrap gap-2">
                 {WORKOUT_CATEGORIES.map(cat => (
                    <button 
                       key={cat}
                       onClick={() => setWorkoutCategory(cat)}
                       className={cn("px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border", workoutCategory === cat ? "active-nav-bg text-white border-transparent" : "bg-white/2 text-slate-500 border-white/5 hover:bg-white/5")}
                    >
                       {cat}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="relative group z-10">
           <input
             type="text"
             value={title}
             onFocus={() => setShowTitleDropdown(true)}
             onChange={(e) => { setTitle(e.target.value); setShowTitleDropdown(true); }}
             placeholder="Nama Latihan (Cth: Dada & Trisep)"
             className="w-full text-4xl lg:text-5xl font-black text-white outline-none placeholder:text-white/10 bg-transparent tracking-tight pr-12"
           />
           <button onClick={() => setShowTitleDropdown(!showTitleDropdown)} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors">
              <ChevronDown className={cn("w-7 h-7 transition-transform", showTitleDropdown ? "rotate-180" : "")} />
           </button>
           
           {showTitleDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 glass-card border border-white/10 rounded-[2rem] shadow-2xl z-[60] p-3 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-4">
                 {titleTemplates.filter(t => t.toLowerCase().includes(title.toLowerCase())).map((t, i) => (
                    <button 
                       key={i}
                       type="button"
                       onClick={() => { setTitle(t); setShowTitleDropdown(false); playClick(); }}
                       className="w-full text-left px-5 py-4 hover:bg-white/10 rounded-2xl font-black text-white text-sm transition-all"
                    >
                       {t}
                    </button>
                 ))}
                 {titleTemplates.filter(t => t.toLowerCase().includes(title.toLowerCase())).length === 0 && (
                    <div className="p-6 text-center text-[10px] text-slate-500 font-black uppercase tracking-widest">Simpan untuk buat template</div>
                 )}
              </div>
           )}
        </div>

        <div className="flex flex-wrap items-center gap-6 z-10 relative">
           <div className="flex items-center gap-4 bg-accent-blue/10 text-accent-blue p-5 rounded-[2rem] border border-accent-blue/20">
               <Timer className="w-7 h-7" />
               <div className="flex items-center gap-3">
                 <input 
                   type="number" 
                   value={durationMins} 
                   onChange={(e) => setDurationMins(e.target.value === '' ? '' : Number(e.target.value))} 
                   className="w-16 bg-transparent border-b border-accent-blue/20 outline-none text-center font-black text-2xl focus:border-accent-blue" 
                   placeholder="0"
                 />
                 <span className="font-black uppercase tracking-widest text-[10px]">Menit</span>
               </div>
           </div>
           
           <button onClick={addDetail} className="flex items-center gap-3 px-8 py-5 bg-white/5 border-2 border-dashed border-white/5 rounded-[2rem] text-slate-400 font-black uppercase tracking-widest text-[10px] hover:border-accent-blue hover:text-white transition-all group">
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Tambah Gerakan
           </button>
        </div>

        {details.length > 0 && (
           <div className="space-y-4 pt-6 z-10 relative">
              <h3 className="font-black uppercase tracking-[0.3em] text-slate-600 text-[10px] pl-4">Daftar Latihan</h3>
              {details.map((detail, index) => (
                 <div key={detail.id} className="bg-white/2 rounded-[2rem] p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center group border border-white/5 hover:bg-white/5 transition-all">
                    <div className="flex-1 w-full">
                       <input 
                          type="text" 
                          value={detail.exercise} 
                          onChange={(e) => updateDetail(index, 'exercise', e.target.value)}
                          placeholder="Nama Gerakan..."
                          className="w-full bg-transparent border-b border-white/5 outline-none font-black text-lg text-white focus:border-accent-blue py-2 transition-all"
                       />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                       <div className="bg-white/5 border border-white/5 rounded-[1.2rem] px-4 py-3 flex items-center gap-3">
                          <input 
                             type="number" 
                             value={detail.sets} 
                             onChange={(e) => updateDetail(index, 'sets', Number(e.target.value))}
                             className="w-10 text-center bg-transparent outline-none font-black text-white"
                          />
                          <span className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Sets</span>
                       </div>
                       
                       <div className="bg-white/5 border border-white/5 rounded-[1.2rem] px-4 py-3 flex items-center gap-3">
                          <input 
                             type="number" 
                             value={detail.reps} 
                             onChange={(e) => updateDetail(index, 'reps', Number(e.target.value))}
                             className="w-10 text-center bg-transparent outline-none font-black text-white"
                          />
                          <span className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Reps</span>
                       </div>

                       <div className="bg-white/5 border border-white/5 rounded-[1.2rem] px-4 py-3 flex items-center gap-3">
                          <input 
                             type="text" 
                             value={detail.weight} 
                             onChange={(e) => updateDetail(index, 'weight', e.target.value)}
                             placeholder="-"
                             className="w-14 text-center bg-transparent outline-none font-black text-white"
                          />
                          <span className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Kg</span>
                       </div>

                       <button onClick={() => deleteDetail(index)} className="p-3 text-slate-700 hover:text-red-500 transition-colors bg-white/5 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        )}
        
        <textarea
          value={routine}
          onChange={(e) => setRoutine(e.target.value)}
          placeholder="Catatan tambahan untuk sesi ini..."
          className="w-full flex-1 min-h-[200px] text-lg text-slate-300 outline-none placeholder:text-white/5 bg-transparent resize-none leading-relaxed transition-all p-4 z-10 relative"
        />
      </div>
    </div>
  );
}
