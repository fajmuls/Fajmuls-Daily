import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../store';
import { IGNote } from '../../types';
import { ArrowLeft, User, Plus, CheckSquare, Trash2, Edit3, Check, X } from 'lucide-react';
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

  // Filter only IG notes and group by owner
  const igNotes = notes.filter(n => n.type === 'ig') as IGNote[];
  const groupedByOwner = igNotes.reduce((acc, note) => {
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
               {igNotes.length > 0 && (
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
         <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2 border-b border-stone-200 pb-4">Daftar Akun IG</h1>
         <p className="text-stone-500 font-medium">Kumpulan catatan Instagram yang dikelompokkan per akun.</p>
      </header>

      {Object.keys(groupedByOwner).length === 0 ? (
         <div className="p-12 text-center text-stone-400 bg-stone-50 rounded-3xl border border-stone-200 border-dashed">
             Belum ada catatan IG.
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
           {Object.entries(groupedByOwner).map(([owner, ownerNotes]) => (
             <div key={owner} className="bg-paper rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col group">
                <div className="p-6 border-b border-stone-100 flex items-center gap-4 bg-stone-50/50">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-6 h-6" />
                   </div>
                   <div className="truncate">
                      <h3 className="font-bold text-lg text-stone-900 truncate">@{owner || 'Anonim'}</h3>
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
                           className={cn("w-full text-left py-4 hover:bg-stone-50 transition-colors", selectionMode ? "pl-12 pr-6" : "px-6")}
                         >
                            <p className="font-medium text-stone-700 truncate">{note.content || 'Catatan Kosong'}</p>
                            {note.songTitle && <p className="text-xs text-stone-400 mt-1 truncate">🎵 {note.songTitle}</p>}
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
