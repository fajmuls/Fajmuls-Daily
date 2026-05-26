import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { NormalNote } from '../../types';
import { Search, SortAsc, SortDesc, ArrowLeft, Plus, FileText, CheckSquare, Trash2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

export function NormalNotesList() {
  const navigate = useNavigate();
  const { notes, deleteNote, showConfirm } = useAppContext();
  const { playClick, playError } = useAudio();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const filteredNotes = notes.filter(n => {
    if (n.type !== 'normal') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const note = n as NormalNote;
    return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
  }) as NormalNote[];

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    return sortBy === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
  });

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
               {filteredNotes.length > 0 && (
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

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6 mb-6 mt-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg ring-4 ring-stone-100 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Catatan Biasa
            </h1>
            <p className="text-stone-500 text-sm font-medium">
              Kumpulan tulisan dan catatan harian.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text"
              placeholder="Cari judul atau isi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-paper border border-stone-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 shadow-sm text-sm"
            />
         </div>
         <button 
           onClick={() => { setSortBy(sortBy === 'newest' ? 'oldest' : 'newest'); playClick(); }}
           className="flex items-center gap-2 px-6 py-3 bg-paper border border-stone-200 rounded-2xl font-bold text-stone-700 hover:bg-stone-50 transition-all text-sm shrink-0"
         >
            {sortBy === 'newest' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            {sortBy === 'newest' ? 'Terbaru' : 'Terlama'}
         </button>
      </div>

      {sortedNotes.length === 0 ? (
         <div className="p-12 text-center text-stone-400 bg-stone-50 rounded-3xl border border-stone-200 border-dashed">
             {searchQuery ? 'Tidak ada catatan yang cocok.' : 'Belum ada catatan biasa.'}
         </div>
      ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
           {sortedNotes.map((note, idx) => {
             const rotations = ["hover:rotate-1", "hover:-rotate-1", "hover:rotate-2", "hover:-rotate-2"];
             const rotation = rotations[idx % rotations.length];
             
             return (
               <button 
                 key={note.id} 
                 onClick={(e) => {
                   if (selectionMode) {
                     toggleSelection(note.id, e);
                   } else {
                     playClick(); navigate(`/notes/normal/${note.id}`);
                   }
                 }}
                 className={cn(
                   "text-left bg-white rounded-[2.5rem] p-8 border-2 transition-all group relative overflow-hidden", 
                   selectionMode && selectedIds.includes(note.id) 
                     ? "border-stone-900 shadow-brutal bg-stone-50" 
                     : "border-stone-200 hover:border-stone-900 hover:shadow-brutal",
                   rotation
                 )}
               >
                  {/* Tape Decoration */}
                  <div className="absolute top-0 left-1/4 -translate-y-2 w-12 h-8 bg-amber-200/40 -rotate-6 group-hover:bg-amber-200/60 transition-colors" />
                  
                  {selectionMode && (
                    <div className="absolute top-6 right-6 z-10">
                      <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", selectedIds.includes(note.id) ? "bg-stone-900 border-stone-900" : "border-stone-300")}>
                        {selectedIds.includes(note.id) && <CheckSquare className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors border border-stone-200">
                        <FileText className="w-5 h-5" />
                     </div>
                     <div className="truncate pr-8">
                        <h3 className="font-serif text-xl font-black text-stone-900 truncate tracking-tight">{note.title || 'Tanpa Judul'}</h3>
                        <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest">{format(note.createdAt, 'd MMM yyyy, HH:mm', { locale: localeId })}</p>
                     </div>
                  </div>
                  <p className="text-stone-500 line-clamp-3 text-sm font-semibold leading-relaxed h-14 overflow-hidden">{note.content || 'Isi catatan kosong...'}</p>
                  
                  <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-stone-300 group-hover:text-stone-900 transition-colors">
                     <span>Baca Selengkapnya</span>
                     <Plus className="w-2 h-2" />
                  </div>
               </button>
             );
           })}
         </div>
      )}
    </div>
  );
}
