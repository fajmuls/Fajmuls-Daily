import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { NormalNote } from '../../types';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function NormalNotesList() {
  const navigate = useNavigate();
  const { notes } = useAppContext();
  const { playClick } = useAudio();

  const normalNotes = notes.filter(n => n.type === 'normal') as NormalNote[];

  const handleCreate = () => {
    playClick();
    navigate('/notes/normal');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={handleCreate} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
          <Plus className="w-5 h-5" /> Catatan Baru
        </button>
      </div>

      <header className="py-4">
         <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2 border-b border-stone-200 pb-4">Catatan Biasa</h1>
         <p className="text-stone-500 font-medium">Kumpulan tulisan dan catatan harian.</p>
      </header>

      {normalNotes.length === 0 ? (
         <div className="p-12 text-center text-stone-400 bg-stone-50 rounded-3xl border border-stone-200 border-dashed">
             Belum ada catatan biasa.
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
           {normalNotes.map(note => (
             <button 
               key={note.id} 
               onClick={() => { playClick(); navigate(`/notes/normal/${note.id}`); }}
               className="text-left bg-paper rounded-3xl p-6 border border-stone-200 hover:border-stone-400 shadow-sm transition-all group"
             >
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                   </div>
                   <div className="truncate">
                      <h3 className="font-bold text-lg text-stone-900 truncate">{note.title || 'Tanpa Judul'}</h3>
                      <p className="text-xs text-stone-400 uppercase tracking-wider">{format(note.createdAt, 'd MMM yyyy, HH:mm', { locale: localeId })}</p>
                   </div>
                </div>
                <p className="text-stone-500 line-clamp-3 text-sm leading-relaxed">{note.content || 'Isi catatan kosong...'}</p>
             </button>
           ))}
         </div>
      )}
    </div>
  );
}
