import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../store';
import { IGNote } from '../../types';
import { ArrowLeft, User, Plus } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function IGNotesList() {
  const navigate = useNavigate();
  const { notes } = useAppContext();
  const { playClick } = useAudio();

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
                      <li key={note.id}>
                         <button onClick={() => { playClick(); navigate(`/notes/ig/${note.id}`); }} className="w-full text-left px-6 py-4 hover:bg-stone-50 transition-colors">
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
