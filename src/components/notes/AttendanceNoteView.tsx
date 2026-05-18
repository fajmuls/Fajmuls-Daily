import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useAppContext } from '../../store';
import { AttendanceNote } from '../../types';
import { ArrowLeft, Trash2, Save, Plus, X, ListChecks, Hash } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

export function AttendanceNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'attendance') as AttendanceNote | undefined;

  const [title, setTitle] = useState('');
  const [codes, setCodes] = useState<{time: string, code: string, note?: string}[]>([]);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setCodes(existingNote.codes);
    } else {
      setTitle(`Absensi ${format(Date.now(), 'dd/MM/yyyy')}`);
      setCodes([{ time: format(Date.now(), 'HH:mm'), code: '', note: '' }]);
    }
  }, [existingNote]);

  const handleSave = () => {
    if (!title) return;
    const data: AttendanceNote = {
      id: existingNote?.id || uuidv4(),
      type: 'attendance',
      createdAt: existingNote?.createdAt || Date.now(),
      updatedAt: Date.now(),
      title,
      codes: codes.filter(c => c.code.trim() !== '')
    };
    if (existingNote) updateNote(data);
    else addNote(data);
    playSuccess();
    navigate('/notes/attendance-list');
  };

  const addCode = () => {
    setCodes(prev => [...prev, { time: format(Date.now(), 'HH:mm'), code: '', note: '' }]);
    playClick();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes/attendance-list'); }} className="w-12 h-12 flex items-center justify-center glass-card rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
          {existingNote && (
            <button onClick={() => { playError(); if(window.confirm("Hapus catatan absensi ini?")){ deleteNote(existingNote.id); navigate('/notes/attendance-list'); } }} className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 fab-gradient text-white rounded-2xl font-black shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98]">
            <Save className="w-5 h-5" /> Simpan
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 lg:p-10 border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-[2rem] flex items-center justify-center border border-blue-500/20 shadow-inner">
            <ListChecks className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-black tracking-[0.2em] text-slate-500 mb-2 uppercase">Judul / Nama Kegiatan Absensi</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full text-3xl font-black text-white outline-none bg-transparent placeholder:text-white/5 tracking-tight border-b border-white/5 pb-2 focus:border-blue-500 transition-all"
              placeholder="Masukkan Judul..."
            />
          </div>
        </div>

        <div className="space-y-6 relative z-10">
           <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 className="font-black text-white flex items-center gap-3 text-[10px] uppercase tracking-widest">
                 <Hash className="w-4 h-4 text-slate-600"/> Daftar Peserta / Kode
              </h3>
              <button onClick={addCode} className="flex items-center gap-2 py-3 px-5 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                <Plus className="w-4 h-4" /> Baris Baru
              </button>
           </div>
           
           <div className="space-y-4">
              {codes.map((c, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-center bg-white/2 p-5 rounded-[1.5rem] border border-white/5 group hover:bg-white/5 transition-all">
                   <div className="relative shrink-0">
                      <input 
                        type="time" 
                        value={c.time} 
                        onChange={e => {
                           const newCodes = [...codes];
                           newCodes[idx].time = e.target.value;
                           setCodes(newCodes);
                        }}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 font-mono font-black text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute -top-2 left-4 bg-dashboard-bg/80 backdrop-blur-md px-2 text-[8px] font-black uppercase text-slate-500 border border-white/5 rounded-full">Waktu</span>
                   </div>
                   
                   <div className="relative flex-1 min-w-[200px]">
                      <input 
                        type="text" 
                        value={c.code} 
                        onChange={e => {
                           const newCodes = [...codes];
                           newCodes[idx].code = e.target.value;
                           setCodes(newCodes);
                        }}
                        placeholder="Nama/Kode..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-black text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/10"
                      />
                      <span className="absolute -top-2 left-4 bg-dashboard-bg/80 backdrop-blur-md px-2 text-[8px] font-black uppercase text-slate-500 border border-white/5 rounded-full">Peserta</span>
                   </div>

                   <div className="relative flex-1 min-w-[200px]">
                      <input 
                        type="text" 
                        value={c.note} 
                        onChange={e => {
                           const newCodes = [...codes];
                           newCodes[idx].note = e.target.value;
                           setCodes(newCodes);
                        }}
                        placeholder="Keterangan..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/5"
                      />
                      <span className="absolute -top-2 left-4 bg-dashboard-bg/80 backdrop-blur-md px-2 text-[8px] font-black uppercase text-slate-500 border border-white/5 rounded-full">Memo</span>
                   </div>

                   <button onClick={() => setCodes(codes.filter((_, i) => i !== idx))} className="p-3 text-slate-700 hover:text-red-500 transition-colors bg-white/5 rounded-xl border border-white/5">
                     <X className="w-5 h-5" />
                   </button>
                </div>
              ))}
              {codes.length === 0 && (
                 <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest text-[10px]">Ketuk "Baris Baru" untuk mulai absensi</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
