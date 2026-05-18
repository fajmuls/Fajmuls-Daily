import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { NormalNote } from '../../types';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function NormalNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'normal') as NormalNote | undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
    }
  }, [existingNote]);

  const handleSave = () => {
    if (!title && !content) return;
    
    if (existingNote) {
      updateNote({
        ...existingNote,
        title,
        content
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'normal',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title,
        content
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="w-12 h-12 flex items-center justify-center glass-card rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
          {existingNote && (
            <button onClick={() => { if(window.confirm("Hapus catatan ini?")) handleDelete(); }} className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 fab-gradient text-white rounded-2xl font-black shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98]">
            <Save className="w-5 h-5" /> Simpan
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 lg:p-12 border border-white/5 shadow-2xl space-y-8 min-h-[600px] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <NotebookPen className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 space-y-6">
           <input
             type="text"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             placeholder="Judul Catatan"
             className="w-full text-4xl lg:text-5xl font-black text-white outline-none placeholder:text-white/10 bg-transparent tracking-tight"
           />
           
           <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
              <span>Status: {existingNote ? 'Drafters Terakhir' : 'Draft Baru'}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>{existingNote ? format(existingNote.updatedAt, 'd MMM yyyy', { locale: localeId }) : format(Date.now(), 'd MMM yyyy', { locale: localeId })}</span>
           </div>
           
           <textarea
             value={content}
             onChange={(e) => setContent(e.target.value)}
             placeholder="Tuliskan ceritamu hari ini..."
             className="w-full min-h-[500px] text-lg lg:text-xl text-slate-300 outline-none placeholder:text-white/5 bg-transparent resize-none leading-relaxed font-medium"
           />
        </div>
      </div>
    </div>
  );
}

import { NotebookPen } from 'lucide-react';
