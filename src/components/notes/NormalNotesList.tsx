import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { NormalNote } from '../../types';
import { ArrowLeft, Plus, FileText, CheckSquare, Trash2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

export function NormalNotesList() {
  const navigate = useNavigate();
  const { notes, deleteNote, showConfirm } = useAppContext();
  const { playClick, playError } = useAudio();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const normalNotes = notes.filter(n => n.type === 'normal') as NormalNote[];

  const handleCreate = () => {
    playClick();
    navigate('/notes/normal');
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    showConfirm(`Hapus ${selectedIds.length} catatan terpilih?`, () => {
       selectedIds.forEach(id => deleteNote(id));
       setSelectedIds([]);
       setSelectionMode(false);
       playError();
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {selectionMode ? (
             <>
               <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0} className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-full font-bold hover:bg-red-200 transition-all disabled:opacity-50">
                 <Trash2 className="w-5 h-5" /> Hapus ({selectedIds.length})
               </button>
               <button onClick={() => { setSelectionMode(false); setSelectedIds([]); }} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-full font-bold hover:bg-stone-200 transition-all">
                 Batal
               </button>
             </>
          ) : (
             <>
               {normalNotes.length > 0 && (
                 <button onClick={() => setSelectionMode(true)} className="p-3 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-all">
                   <CheckSquare className="w-5 h-5" />
                 </button>
               )}
               <button onClick={handleCreate} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
                 <Plus className="w-5 h-5" /> Catatan Baru
               </button>
             </>
          )}
        </div>
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
               onClick={(e) => {
                 if (selectionMode) {
                   toggleSelection(note.id, e);
                 } else {
                   playClick(); navigate(`/notes/normal/${note.id}`);
                 }
               }}
               className={cn("text-left bg-paper rounded-3xl p-6 border transition-all group relative", selectionMode && selectedIds.includes(note.id) ? "border-stone-900 shadow-md bg-stone-50" : "border-stone-200 hover:border-stone-400 shadow-sm")}
             >
                {selectionMode && (
                  <div className="absolute top-6 right-6">
                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", selectedIds.includes(note.id) ? "bg-stone-900 border-stone-900" : "border-stone-300")}>
                      {selectedIds.includes(note.id) && <CheckSquare className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                   </div>
                   <div className="truncate pr-8">
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
