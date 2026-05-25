import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { IGNote } from '../../types';
import { Search, SortAsc, SortDesc, ArrowLeft, User, Plus, CheckSquare, Trash2, Edit3, Check, X, Clock, Instagram } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

export function IGNotesList() {
  const navigate = useNavigate();
  const { notes, deleteNote, updateNote, showConfirm, setAlert } = useAppContext();
  const { playClick, playError, playSuccess } = useAudio();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingOwner, setEditingOwner] = useState<string | null>(null);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Filter only IG notes and group by owner
  const filteredNotes = notes.filter(n => {
    if (n.type !== 'ig') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const ig = n as IGNote;
    return ig.owner.toLowerCase().includes(q) || 
           ig.songTitle.toLowerCase().includes(q) || 
           ig.content.toLowerCase().includes(q);
  }) as IGNote[];

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    return sortBy === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
  });

  const groupedByOwner = sortedNotes.reduce((acc, note) => {
    if (!acc[note.owner]) acc[note.owner] = [];
    acc[note.owner].push(note);
    return acc;
  }, {} as Record<string, IGNote[]>);

  const handleCreate = () => {
    playClick();
    navigate('/notes/ig');
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

  const handleStartEditOwner = (owner: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingOwner(owner);
    setNewOwnerName(owner);
  };

  const handleSaveOwnerName = (oldOwner: string) => {
    if (!newOwnerName || newOwnerName === oldOwner) {
      setEditingOwner(null);
      return;
    }

    const notesToUpdate = groupedByOwner[oldOwner];
    notesToUpdate.forEach(note => {
      updateNote({ ...note, owner: newOwnerName });
    });

    setEditingOwner(null);
    playSuccess();
    setAlert(`Berhasil mengubah nama dari @${oldOwner} ke @${newOwnerName}`);
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
               <button onClick={handleCreate} className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-all shadow-md shadow-pink-100">
                 <Plus className="w-5 h-5" /> Catatan Baru
               </button>
             </>
          )}
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6 mb-6 mt-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg ring-4 ring-pink-50 shrink-0">
            <Instagram className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Catatan IG
            </h1>
            <p className="text-stone-500 text-sm font-medium">
              Kumpulan catatan Instagram yang dikelompokkan per akun.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
               <input 
                 type="text"
                 placeholder="Cari lagu, pemilik, atau isi..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-paper border border-stone-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 shadow-sm text-sm"
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

      {Object.keys(groupedByOwner).length === 0 ? (
         <div className="p-12 text-center text-stone-400 bg-stone-50 rounded-3xl border border-stone-200 border-dashed">
             Belum ada catatan IG.
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
           {Object.entries(groupedByOwner).map(([owner, ownerNotes]) => (
             <div key={owner} className="bg-paper rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col group">
                <div className="p-6 border-b border-stone-100 flex items-center gap-4 bg-stone-50/50">
                   <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-6 h-6" />
                   </div>
                   <div className="truncate flex-1">
                      {editingOwner === owner ? (
                         <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input 
                              autoFocus
                              value={newOwnerName}
                              onChange={e => setNewOwnerName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSaveOwnerName(owner)}
                              className="w-full bg-white border border-indigo-300 rounded-lg px-2 py-1 outline-none font-bold text-stone-900"
                            />
                            <button onClick={() => handleSaveOwnerName(owner)} className="p-1 text-green-600 hover:bg-green-50 rounded-md">
                               <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingOwner(null)} className="p-1 text-red-600 hover:bg-red-50 rounded-md">
                               <X className="w-4 h-4" />
                            </button>
                         </div>
                      ) : (
                         <div className="flex items-center gap-2 group/title">
                            <h3 className="font-bold text-lg text-stone-900 truncate">@{owner || 'Anonim'}</h3>
                            <button onClick={(e) => handleStartEditOwner(owner, e)} className="p-1 text-stone-300 hover:text-pink-500 opacity-0 group-hover/title:opacity-100 transition-opacity">
                               <Edit3 className="w-4 h-4" />
                            </button>
                         </div>
                      )}
                      <p className="text-sm text-stone-500">{ownerNotes.length} catatan</p>
                   </div>
                </div>
                <ul className="divide-y divide-stone-100 flex-1 bg-white">
                   {ownerNotes.map(note => (
                      <li key={note.id} className="relative">
                         {selectionMode && (
                           <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
                              <button onClick={(e) => toggleSelection(note.id, e)} className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-colors", selectedIds.includes(note.id) ? "bg-stone-900 border-stone-900 text-white" : "border-stone-300 bg-white")}>
                                 {selectedIds.includes(note.id) && <CheckSquare className="w-3 h-3" />}
                              </button>
                           </div>
                         )}
                         <button 
                           onClick={(e) => {
                             if (selectionMode) {
                                toggleSelection(note.id, e);
                             } else {
                                playClick(); navigate(`/notes/ig/${note.id}`);
                             }
                           }} 
                           className={cn("w-full text-left p-6 hover:brightness-95 transition-all")}
                           style={{ backgroundColor: note.backgroundColor || '#F4F4F4' }}
                         >
                            <div className="flex flex-col gap-3">
                               {note.songTitle && (
                                  <div className="flex items-center gap-2">
                                     <span className={cn("text-base font-bold truncate flex-1", (note.backgroundColor && note.backgroundColor !== '#F4F4F4') ? "text-white" : "text-stone-900")}>
                                        🎵 {note.songTitle}
                                     </span>
                                  </div>
                               )}
                               <p className={cn("text-lg font-bold leading-tight break-words", (note.backgroundColor && note.backgroundColor !== '#F4F4F4') ? "text-white drop-shadow-sm" : "text-stone-700")}>
                                  {note.content || '-'}
                               </p>
                               <div className="flex justify-end pt-1 border-t border-black/5">
                                  <span className={cn("text-[10px] font-bold shrink-0 uppercase tracking-tighter flex items-center gap-1", (note.backgroundColor && note.backgroundColor !== '#F4F4F4') ? "text-white/80" : "text-stone-400")}>
                                     <Clock className="w-3 h-3" />
                                     {format(note.createdAt, 'd MMM yyyy - HH:mm', { locale: localeId })}
                                  </span>
                               </div>
                            </div>
                         </button>
                      </li>
                   ))}
                </ul>
             </div>
           ))}
         </div>
      )}
    </div>
  );
}
