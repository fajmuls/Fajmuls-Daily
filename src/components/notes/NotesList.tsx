import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../store';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  FileText, 
  Moon, 
  Instagram, 
  Lock, 
  Dumbbell, 
  NotebookPen, 
  CheckSquare, 
  Heart, 
  Sparkles, 
  Save, 
  Trash2, 
  ShieldAlert, 
  Square,
  ArrowRight,
  Plus,
  Map
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { NoteType, SpecialNote } from '../../types';
import { WorkspaceSyncModal } from '../WorkspaceSyncModal';
import { useAudio } from '../../hooks/useAudio';
import { motion, AnimatePresence } from 'framer-motion';

const NOTE_TYPES: { type: NoteType | 'prayer-list' | 'trips'; icon: any; label: string; color: string; bg: string; link: string; desc: string }[] = [
  { type: 'normal', icon: FileText, label: 'Biasa / Umum', color: 'text-stone-700', bg: 'bg-stone-100', link: '/notes/normal-list', desc: 'Catatan umum, ide, draf teks & jurnal.' },
  { type: 'prayer-list', icon: Moon, label: 'Qadha Shalat', color: 'text-indigo-700', bg: 'bg-indigo-100', link: '/notes/prayers', desc: 'Daftar & status qadha shalat fardhu.' },
  { type: 'trips', icon: Map, label: 'Summary Perjalanan', color: 'text-teal-700', bg: 'bg-teal-100', link: '/notes/trips', desc: 'Detail perjalanan antar kota & histori log.' },
  { type: 'ig', icon: Instagram, label: 'Catatan IG', color: 'text-pink-700', bg: 'bg-pink-100', link: '/notes/ig-list', desc: 'Ide takarir, lirik lagu, & post IG.' },
  { type: 'daily-goal', icon: CheckSquare, label: 'Daily Goals', color: 'text-blue-700', bg: 'bg-blue-100', link: '/notes/daily-goals', desc: 'Target pencapaian & resolusi harian.' },
  { type: 'personal', icon: Lock, label: 'Data Pribadi', color: 'text-emerald-700', bg: 'bg-emerald-100', link: '/notes/personal-list', desc: 'Data sensitif tersandi & rahasia.' },
  { type: 'workout', icon: Dumbbell, label: 'Olahraga', color: 'text-orange-700', bg: 'bg-orange-100', link: '/notes/workout-list', desc: 'Sesi latihan fisik & kebugaran tubuh.' },
];

export function NotesList() {
  const { notes, specials, trips, addSpecial, deleteSpecial } = useAppContext();
  const { playSuccess, playError, playClick } = useAudio();
  const [showSync, setShowSync] = useState(false);
  const [activeTab, setActiveTab] = useState<'standard' | 'special'>('standard');

  // Special Mode State Variables
  const [dayTitle, setDayTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Sound play helper safely debounced
  const lastPlayTime = useState(0);

  const handleSaveSpecial = () => {
    if (!dayTitle.trim()) return;
    playClick();

    addSpecial({
      id: Date.now().toString(),
      dayTitle: dayTitle.trim(),
      content: content.trim(),
      createdAt: Date.now()
    });

    setDayTitle('');
    setContent('');
    playSuccess();
  };

  const handleVerifyDeleteSpecial = () => {
    if (verificationCode === "FAJMUL") {
      if (isBulkDelete) {
        selectedIds.forEach(id => deleteSpecial(id));
        setSelectedIds(new Set());
      } else if (verificationId) {
        deleteSpecial(verificationId);
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(verificationId);
          return newSet;
        });
      }
      setVerificationId(null);
      setVerificationCode('');
      setIsBulkDelete(false);
      playError();
    } else {
      playClick(); // Error cue
      setVerificationCode('');
    }
  };

  const handleDeleteSingleSpecial = (id: string) => {
    setVerificationId(id);
    setIsBulkDelete(false);
    setVerificationCode('');
  };

  const handleDeleteMultipleSpecials = () => {
    if (selectedIds.size === 0) return;
    setVerificationId('bulk');
    setIsBulkDelete(true);
    setVerificationCode('');
  };

  const toggleSelectSpecial = (id: string) => {
    playClick();
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Helper metrics
  const getNoteCount = (type: NoteType | 'prayer-list' | 'trips') => {
    if (type === 'prayer-list') return "..."; // Dynamically rendered inside respective list
    if (type === 'trips') return trips.length;
    return notes.filter(n => n.type === type).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg ring-4 ring-stone-100">
            <NotebookPen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-4xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              Catatan
            </h1>
            <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1">
              Tempat kumpul ide-ide santai & memori penting mu.
            </p>
          </div>
        </div>
        
        {activeTab === 'standard' && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { playClick(); setShowSync(true); }} 
              className="p-3 px-6 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl transition-all font-bold text-xs md:text-sm tracking-tight whitespace-nowrap"
            >
              Ekspor ke Google Tasks
            </button>
          </div>
        )}
      </header>

      {/* Mode Navigation Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200 gap-1 w-full max-w-md shadow-sm">
          <button
            onClick={() => { playClick(); setActiveTab('standard'); }}
            className={cn(
              "flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all flex items-center justify-center gap-2",
              activeTab === 'standard' 
                ? "bg-white text-stone-900 shadow border border-stone-200" 
                : "text-stone-500 hover:text-stone-900"
            )}
          >
            <NotebookPen className="w-4 h-4" /> Catatan & Target
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('special'); }}
            className={cn(
              "flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all flex items-center justify-center gap-2",
              activeTab === 'special' 
                ? "bg-accent-crimson text-white shadow" 
                : "text-stone-500 hover:text-stone-900"
            )}
          >
            <Heart className="w-4 h-4" /> Mode Spesial {specials.length > 0 && `(${specials.length})`}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'standard' ? (
        <div className="space-y-12 animate-in fade-in duration-300">
          
          {/* Grid Layout of Beautiful Premium Note Categories */}
          <div>
            <h2 className="font-bold uppercase tracking-widest text-[10px] text-stone-400 mb-6 flex items-center gap-2">
              <Plus className="w-3 h-3" /> Pilih Templat Catatan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {NOTE_TYPES.map((nt, idx) => {
                const count = getNoteCount(nt.type);
                // Random subtle rotations for a "casual" sticky note feel
                const rotations = ["hover:rotate-1", "hover:-rotate-1", "hover:rotate-2", "hover:-rotate-2"];
                const rotation = rotations[idx % rotations.length];
                
                return (
                  <Link 
                    key={nt.type} 
                    to={nt.link} 
                    onClick={playClick}
                    className={cn(
                      "group border-2 border-stone-900 rounded-[2rem] p-6 shadow-brutal hover:-translate-y-1 hover:translate-x-1 hover:shadow-brutal-active hover:rotate-1 transition-all flex flex-col justify-between min-h-[170px]",
                      nt.bg
                    )}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] bg-white group-hover:scale-110 transition-transform", nt.color)}>
                          <nt.icon className="w-6 h-6" />
                        </div>
                        {count !== "..." && (
                          <span className="text-[9px] uppercase font-black tracking-widest bg-white border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] text-stone-900 px-3 py-1 rounded-full">
                            {count} catatan
                          </span>
                        )}
                      </div>
                      <h3 className={cn("font-serif text-2xl font-black group-hover:text-amber-700 transition-colors tracking-tight leading-none mb-2", nt.color)}>
                        {nt.label}
                      </h3>
                      <p className="text-stone-700 text-xs font-bold leading-relaxed">{nt.desc}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-black text-stone-900 uppercase tracking-widest mt-4 group-hover:translate-x-1 transition-transform">
                      <span>Buka</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recently updated general note cards */}
          <div className="border-t border-stone-200 pt-8">
            <h2 className="font-bold uppercase tracking-wider text-xs text-stone-400 mb-6">Aktivitas Terakhir</h2>
            {notes.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-stone-200 rounded-3xl text-sm font-semibold text-stone-400 uppercase tracking-wider">
                Tidak ada catatan yang ditemukan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.slice(0, 6).map(note => {
                  const config = NOTE_TYPES.find(t => t.type === note.type);
                  if (!config) return null;

                  const Icon = config.icon;
                  
                  let title = '';
                  let preview = '';
                  if (note.type === 'normal') { title = note.title; preview = note.content; }
                  if (note.type === 'ig') { title = `Caption IG: ${note.songTitle}`; preview = note.content; }
                  if (note.type === 'personal') { title = `Data: ${note.personName || 'Tersimpan'}`; preview = note.extraNotes; }
                  if (note.type === 'workout') { title = note.title; preview = `${note.durationMins} menit sesi olahraga`; }
                  if (note.type === 'daily-goal') { 
                    title = `Daily Goals (${note.dateStr})`; 
                    const completed = note.goals.filter(g => g.completed).length;
                    preview = `${completed} dari ${note.goals.length} target harian terselesaikan.`;
                  }

                  return (
                    <Link 
                      key={note.id} 
                      to={config.link} 
                      onClick={playClick}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 border-stone-900 shadow-brutal hover:shadow-brutal-active hover:-translate-y-1 transition-all group flex flex-col h-48 relative overflow-hidden",
                        config.bg || "bg-white"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-2 rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] bg-white text-stone-900")}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] uppercase tracking-widest font-black text-stone-900 opacity-60">{config.label}</span>
                      </div>
                      <h3 className="font-serif italic font-medium text-xl text-stone-900 line-clamp-1 mb-1.5 group-hover:text-amber-800 transition-colors">
                        {title || 'Tanpa Judul'}
                      </h3>
                      <p className="text-stone-800 opacity-80 line-clamp-2 text-xs font-semibold leading-relaxed flex-1">{preview}</p>
                      <p className="text-[9px] text-stone-900 opacity-60 mt-4 font-mono uppercase tracking-wider">{format(note.createdAt, 'd MMM yyyy HH:mm', { locale: localeId })}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        // Mode Spesial (Merged from Special.tsx beautifully)
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300">
          
          {/* Creator form card */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 md:p-8 rounded-[2.5rem] border-2 border-red-200 shadow-md relative overflow-hidden">
            <Heart className="absolute -right-10 -bottom-10 w-64 h-64 text-red-500/5 rotate-12 select-none" />
            
            <div className="relative z-10 space-y-6">
              <input
                type="text"
                value={dayTitle}
                onChange={(e) => setDayTitle(e.target.value)}
                placeholder="Hari apa ini? (Contoh: Hari Jadi, Wisuda, dsb...)"
                className="w-full text-2xl md:text-3xl font-serif font-black text-stone-900 outline-none placeholder:text-stone-400 bg-transparent"
              />
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis sebuah pesan eksklusif atau momen bersejarah yang sangat spesial di sini..."
                className="w-full min-h-[140px] text-base text-stone-700 outline-none placeholder:text-stone-400 bg-white/75 p-5 rounded-2xl border border-red-100 resize-y"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSpecial}
                  className="flex items-center gap-2 px-8 py-3.5 bg-stone-900 text-white rounded-full font-black uppercase text-xs tracking-wider hover:bg-stone-800 transition-all shadow active:scale-95"
                >
                  <Save className="w-4 h-4" /> Simpan Momen
                </button>
              </div>
            </div>
          </div>

          {/* Moments List */}
          <div className="space-y-6">
            
            {/* Delete verification authorization */}
            {verificationId && (
              <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 animate-in slide-in-from-top-4 flex flex-col md:flex-row items-center gap-4">
                <div className="shrink-0 w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold text-red-950">Autentikasi Penghapusan Momen</h3>
                  <p className="text-xs text-red-700 font-medium">Masukkan kunci pengaman <strong>FAJMUL</strong> untuk meluncurkan perintah ini.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <input 
                    autoFocus
                    type="text"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyDeleteSpecial()}
                    placeholder="Sandi"
                    className="bg-white border border-red-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 font-black tracking-widest text-center uppercase text-sm w-full md:w-32"
                  />
                  <button onClick={handleVerifyDeleteSpecial} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors text-xs uppercase tracking-wider">
                    Konfirmasi
                  </button>
                  <button onClick={() => { playClick(); setVerificationId(null); setVerificationCode(''); }} className="bg-stone-200 text-stone-600 px-4 py-2 rounded-xl font-bold hover:bg-stone-300 transition-colors text-xs uppercase tracking-wider">
                    Batal
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="font-bold uppercase tracking-wider text-xs text-stone-400">Arsip Momen Istimewa</h2>
              {selectedIds.size > 0 && (
                <button 
                  onClick={handleDeleteMultipleSpecials}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors text-xs uppercase tracking-wider"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Terpilih ({selectedIds.size})
                </button>
              )}
            </div>
            
            {specials.length === 0 ? (
              <div className="p-16 border-2 border-dashed border-stone-200 rounded-[2rem] text-center text-stone-400 font-bold uppercase tracking-wider text-xs bg-stone-50/50">
                Belum ada arsip momen spesial.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {specials.map(special => {
                  const isSelected = selectedIds.has(special.id);
                  return (
                    <div 
                      key={special.id} 
                      className={cn(
                        "bg-paper p-8 rounded-3xl border shadow-sm relative group transition-all cursor-pointer bg-white",
                        isSelected ? "border-red-300 ring-2 ring-red-100 bg-red-50/10" : "border-stone-200 hover:border-stone-400"
                      )}
                      onClick={(e) => {
                         // Stop toggle when clicking action triggers
                         if ((e.target as HTMLElement).closest('button')) return;
                         toggleSelectSpecial(special.id);
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider">{format(special.createdAt, 'EEEE, d MMMM yyyy HH:mm', { locale: localeId })}</p>
                        <div className={cn("text-stone-300 hover:text-red-500", isSelected && "text-red-600")}>
                          {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <h3 className="font-serif text-2xl font-black text-stone-900 line-clamp-1">{special.dayTitle}</h3>
                      </div>
                      <p className="text-stone-600 leading-relaxed text-sm font-semibold line-clamp-4 whitespace-pre-wrap">{special.content}</p>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSingleSpecial(special.id);
                        }}
                        className="absolute right-4 bottom-4 p-2 bg-stone-50 hover:bg-red-50 hover:text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity border border-stone-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Sync modal export */}
      <WorkspaceSyncModal isOpen={showSync} onClose={() => setShowSync(false)} contextType="notes" />
    </div>
  );
}
