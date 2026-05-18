import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { IGNote } from '../../types';
import { ArrowLeft, Trash2, Save, History, Palette, ChevronDown, User, Edit3 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

const BG_COLORS = [
  '#171412', // dark
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#64748b', // slate
];

export function IGNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'ig') as IGNote | undefined;

  const [owner, setOwner] = useState('Xiaomi');
  const [songTitle, setSongTitle] = useState('');
  const [content, setContent] = useState('');
  const [bgColor, setBgColor] = useState('#171412');
  const [showHistory, setShowHistory] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);

  const ownerTemplates = useMemo(() => {
    const owners = new Set<string>();
    owners.add('Xiaomi');
    owners.add('Mrachman');
    notes.filter(n => n.type === 'ig').forEach(n => {
       if ((n as IGNote).owner) owners.add((n as IGNote).owner);
    });
    return Array.from(owners);
  }, [notes]);

  useEffect(() => {
    if (existingNote) {
      setOwner(existingNote.owner || 'Xiaomi');
      setSongTitle(existingNote.songTitle);
      setContent(existingNote.content);
      setBgColor(existingNote.backgroundColor || '#171412');
    }
  }, [existingNote]);

  const handleSave = (bulkRenameOwner = false) => {
    if (!songTitle && !content) return;
    
    if (existingNote) {
      // If bulk renaming, update all notes with this owner
      if (bulkRenameOwner && existingNote.owner !== owner) {
         notes.filter(n => n.type === 'ig' && n.id !== existingNote.id).forEach(n => {
            if ((n as IGNote).owner === existingNote.owner) {
               updateNote({ ...n, owner } as IGNote);
            }
         });
      }

      updateNote({
        ...existingNote,
        owner,
        songTitle,
        content,
        backgroundColor: bgColor,
        history: existingNote.content !== content ? [existingNote.content, ...existingNote.history] : existingNote.history
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'ig',
        owner,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        songTitle,
        content,
        backgroundColor: bgColor,
        history: []
      });
    }
    playSuccess();
    navigate('/notes/ig-list');
  };

  const handleBulkRename = () => {
     if (!existingNote) return;
     if (owner === existingNote.owner) {
        alert("Nama pemilik belum berubah!");
        return;
     }
     const confirm = window.confirm(`Ubah semua pemilik dari "${existingNote.owner}" ke "${owner}"?`);
     if (confirm) {
        handleSave(true);
     }
  };

  const handleDelete = () => {
    if (existingNote) {
      const confirm = window.confirm("Apakah kamu ingin menghapus catatan IG ini?");
      if (confirm) {
         deleteNote(existingNote.id);
         playError();
         navigate('/notes/ig-list');
      }
    } else {
       navigate('/notes/ig-list');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes/ig-list'); }} className="w-12 h-12 flex items-center justify-center glass-card rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
          {existingNote && existingNote.history.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} className="w-12 h-12 flex items-center justify-center bg-white/5 text-slate-400 rounded-2xl border border-white/10 hover:text-white transition-all" title="Riwayat Edit">
              <History className="w-5 h-5" />
            </button>
          )}
          {existingNote && (
            <button onClick={handleDelete} className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 fab-gradient text-white rounded-2xl font-black shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98]">
            <Save className="w-5 h-5" /> Simpan
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 lg:p-10 border border-white/5 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Pemilik IG</label>
            <div className="relative">
               <input
                 type="text"
                 value={owner}
                 onFocus={() => setShowOwnerDropdown(true)}
                 onChange={(e) => { setOwner(e.target.value); setShowOwnerDropdown(true); }}
                 placeholder="Cth. Xiaomi"
                 className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent-blue font-bold text-white pr-12 transition-all"
               />
               <button onClick={() => setShowOwnerDropdown(!showOwnerDropdown)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors">
                  <ChevronDown className={cn("w-5 h-5 transition-transform", showOwnerDropdown ? "rotate-180" : "")} />
               </button>
            </div>

            {showOwnerDropdown && (
               <div className="absolute top-full left-0 right-0 mt-3 glass-card border border-white/10 rounded-2xl shadow-2xl z-[60] p-2 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-4">
                  {ownerTemplates.filter(o => o.toLowerCase().includes(owner.toLowerCase())).map((o, i) => (
                     <button 
                        key={i}
                        type="button"
                        onClick={() => { setOwner(o); setShowOwnerDropdown(false); playClick(); }}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all"
                     >
                        {o}
                     </button>
                  ))}
               </div>
            )}
            
            {existingNote && owner !== existingNote.owner && (
               <button 
                  onClick={handleBulkRename}
                  className="flex items-center gap-2 text-[10px] text-accent-blue font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
               >
                  <Edit3 className="w-3 h-3"/> Ubah Semua Pemilik "{existingNote.owner}"
               </button>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Judul Lagu</label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="Cth. Die With A Smile"
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent-blue font-bold text-white transition-all"
            />
          </div>
        </div>

        <div>
           <div className="flex items-center justify-between mb-4">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Layout Visual</label>
              <button 
                onClick={() => setShowColors(!showColors)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <Palette className="w-4 h-4" /> Ganti Tema
              </button>
           </div>
           
           {showColors && (
             <div className="flex flex-wrap gap-3 mb-6 animate-in fade-in zoom-in-95 duration-300">
                {BG_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setBgColor(c); setShowColors(false); }}
                    className={cn("w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 shadow-lg", bgColor === c ? "border-white" : "border-transparent")}
                    style={{ backgroundColor: c }}
                  />
                ))}
             </div>
           )}

           <div 
             className="rounded-[2.5rem] p-10 min-h-[400px] flex items-center justify-center transition-all border border-white/5 relative group cursor-text"
             style={{ backgroundColor: bgColor }}
           >
             <div className="absolute top-8 left-8 p-3 bg-white/10 rounded-full blur-xl opacity-20" />
             <div className="absolute bottom-8 right-8 p-6 bg-white/10 rounded-full blur-2xl opacity-20" />
             
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Tuliskan lirik atau pesanmu..."
               className="w-full text-center text-2xl lg:text-3xl outline-none placeholder:text-white/20 resize-none font-black text-white bg-transparent drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] relative z-10 leading-tight"
               rows={6}
             />
           </div>
           <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest mt-6 bg-white/2 p-4 rounded-2xl border border-white/5">
             <span>Dibuat: {existingNote ? format(existingNote.createdAt, 'd MMM yyyy', { locale: idLocale }) : '-'}</span>
             <span>Diedit: {existingNote ? format(existingNote.updatedAt, 'd MMM yyyy', { locale: idLocale }) : '-'}</span>
           </div>
        </div>
      </div>

      {showHistory && existingNote && existingNote.history.length > 0 && (
        <div className="glass-card rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-top-4 border border-white/5">
          <h3 className="font-black text-white flex items-center gap-3 uppercase tracking-widest text-xs">
            <History className="w-5 h-5 text-accent-blue"/> Riwayat Perubahan
          </h3>
          <div className="space-y-4">
            {existingNote.history.map((past, i) => (
              <div key={i} className="p-6 bg-white/2 rounded-2xl text-slate-400 text-sm font-medium border border-white/5 italic">
                "{past}"
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
