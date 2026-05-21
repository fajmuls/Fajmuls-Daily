import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../store';
import { PersonalNote } from '../../types';
import { ArrowLeft, Plus, ShieldCheck, CheckSquare, Trash2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { decryptText } from '../../lib/crypto';

export function PersonalNotesList() {
  const navigate = useNavigate();
  const { user, notes, deleteNote, showConfirm } = useAppContext();
  const { playClick, playSuccess, playError } = useAudio();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const personalNotes = notes.filter(n => n.type === 'personal') as PersonalNote[];

  const handleCreateNew = () => {
    playSuccess();
    navigate('/notes/personal');
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    showConfirm(`Hapus ${selectedIds.length} profil terpilih?`, () => {
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
                 <Trash2 className="w-4 h-4" /> Hapus ({selectedIds.length})
               </button>
               <button onClick={() => { setSelectionMode(false); setSelectedIds([]); }} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-full font-bold hover:bg-stone-200 transition-all">
                 Batal
               </button>
             </>
          ) : (
             <>
               {personalNotes.length > 0 && (
                 <button onClick={() => setSelectionMode(true)} className="p-3 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-all">
                   <CheckSquare className="w-5 h-5" />
                 </button>
               )}
               <button onClick={handleCreateNew} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
                 <Plus className="w-5 h-5" /> Profil Baru
               </button>
             </>
          )}
        </div>
      </div>

      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-stone-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-500" /> Profil Pribadi
        </h1>
        <p className="text-stone-500 mt-2">Daftar informasi penting untuk setiap orang.</p>
      </header>

      {personalNotes.length === 0 ? (
        <div className="bg-paper p-10 rounded-3xl border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-bold text-stone-700">Belum Ada Profil</h2>
          <p className="text-stone-500 text-sm">Tambahkan profil pertama untuk mulai mencatat Data Pribadi.</p>
          <button onClick={handleCreateNew} className="mt-4 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-colors">
            Buat Profil Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalNotes.map(note => (
            <button
              key={note.id}
              onClick={(e) => {
                 if (selectionMode) {
                   toggleSelection(note.id, e);
                 } else {
                   playClick(); navigate(`/notes/personal/${note.id}`);
                 }
              }}
              className={cn("text-left bg-paper p-6 rounded-3xl border transition-all group relative overflow-hidden", selectionMode && selectedIds.includes(note.id) ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20" : "border-stone-200 hover:border-emerald-300 hover:shadow-md")}
            >
              <div className={cn("absolute top-0 right-0 w-24 h-24 transition-opacity rounded-bl-full", selectionMode && selectedIds.includes(note.id) ? "bg-emerald-500 opacity-100" : "bg-gradient-to-br from-emerald-100 to-transparent opacity-0 group-hover:opacity-100")} />
              
              {selectionMode && (
                <div className="absolute top-4 right-4 z-20">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-white", selectedIds.includes(note.id) ? "text-emerald-600" : "text-stone-300 border-2 border-stone-300")}>
                    {selectedIds.includes(note.id) && <CheckSquare className="w-6 h-6" />}
                  </div>
                </div>
              )}

              <h3 className="font-bold text-xl text-stone-900 mb-2 relative z-10">{user ? decryptText(note.personName || '', user.uid) : '' || 'Tanpa Nama'}</h3>
              <p className="text-sm text-stone-500 font-mono mb-4 truncate text-ellipsis">
                 {note.customFields && note.customFields.length > 0 && user
                    ? `${decryptText(note.customFields[0].key, user.uid)}: ${decryptText(note.customFields[0].value, user.uid) || '-'}` 
                    : `Data Belum Lengkap`}
              </p>
              <div className="flex justify-between items-center text-xs text-stone-400 relative z-10">
                <span>Diperbarui</span>
                <span className="font-mono">{format(note.updatedAt, 'd MMM yyyy', { locale: idLocale })}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
