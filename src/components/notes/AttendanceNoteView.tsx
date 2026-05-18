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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/notes/attendance-list')} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {existingNote && (
            <button onClick={() => { if(window.confirm("Hapus?")){ deleteNote(existingNote.id); navigate('/notes/attendance-list'); } }} className="p-3 bg-red-50 text-red-600 rounded-full">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold">
            <Save className="w-5 h-5" /> Simpan
          </button>
        </div>
      </div>

      <div className="bg-paper rounded-3xl p-8 border border-stone-200 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <ListChecks className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-black tracking-widest text-stone-400 mb-1">Judul / Kegiatan</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full text-3xl font-serif font-bold text-stone-900 outline-none bg-transparent"
              placeholder="Judul Absensi"
            />
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-bold flex items-center gap-2"><Hash className="w-5 h-5 text-stone-400"/> Daftar Kode Absensi</h3>
              <button onClick={addCode} className="flex items-center gap-2 py-2 px-4 bg-stone-100 rounded-xl text-xs font-bold hover:bg-stone-200">
                <Plus className="w-4 h-4" /> Tambah Baris
              </button>
           </div>
           
           <div className="space-y-3">
              {codes.map((c, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-stone-50 p-4 rounded-2xl animate-in slide-in-from-right-2">
                   <input 
                     type="time" 
                     value={c.time} 
                     onChange={e => {
                        const newCodes = [...codes];
                        newCodes[idx].time = e.target.value;
                        setCodes(newCodes);
                     }}
                     className="bg-white border border-stone-200 rounded-lg p-2 font-mono text-sm outline-none"
                   />
                   <input 
                     type="text" 
                     value={c.code} 
                     onChange={e => {
                        const newCodes = [...codes];
                        newCodes[idx].code = e.target.value;
                        setCodes(newCodes);
                     }}
                     placeholder="Kode"
                     className="flex-1 bg-white border border-stone-200 rounded-lg p-2 font-bold outline-none"
                   />
                   <input 
                     type="text" 
                     value={c.note} 
                     onChange={e => {
                        const newCodes = [...codes];
                        newCodes[idx].note = e.target.value;
                        setCodes(newCodes);
                     }}
                     placeholder="Ket"
                     className="hidden md:block flex-1 bg-white border border-stone-200 rounded-lg p-2 text-sm outline-none"
                   />
                   <button onClick={() => setCodes(codes.filter((_, i) => i !== idx))} className="p-2 text-stone-300 hover:text-red-500">
                     <X className="w-4 h-4" />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
