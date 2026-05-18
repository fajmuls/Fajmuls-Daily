import { Link } from 'react-router-dom';
import { useAppContext } from '../../store';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FileText, Moon, Instagram, Lock, Dumbbell, ListChecks, ChevronRight, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NoteType } from '../../types';
import { motion } from 'motion/react';

const NOTE_TYPES: { type: NoteType | 'prayer-list'; icon: any; label: string; color: string; bg: string; link: string }[] = [
  { type: 'normal', icon: FileText, label: 'Biasa', color: 'text-blue-400', bg: 'bg-blue-400/10', link: '/notes/normal-list' },
  { type: 'prayer-list', icon: Moon, label: 'Qadha Shalat', color: 'text-purple-400', bg: 'bg-purple-400/10', link: '/notes/prayers' },
  { type: 'ig', icon: Instagram, label: 'Catatan IG', color: 'text-pink-400', bg: 'bg-pink-400/10', link: '/notes/ig-list' },
  { type: 'personal', icon: Lock, label: 'Data Pribadi', color: 'text-green-400', bg: 'bg-green-400/10', link: '/notes/personal-list' },
  { type: 'workout', icon: Dumbbell, label: 'Olahraga', color: 'text-yellow-400', bg: 'bg-yellow-400/10', link: '/notes/workout-list' },
  { type: 'attendance', icon: ListChecks, label: 'Absensi', color: 'text-sky-400', bg: 'bg-sky-400/10', link: '/notes/attendance-list' },
];

export function NotesList() {
  const { notes } = useAppContext();

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Katalog Catatan</h1>
          <p className="text-slate-500 font-medium">Arsip jurnal harian dan data pribadimu.</p>
        </div>
        <Link to="/notes/normal" className="fab-gradient px-8 py-3 rounded-2xl text-white font-black shadow-lg flex items-center gap-3 active:scale-95 transition-transform">
           <Plus className="w-5 h-5" />
           Baru
        </Link>
      </header>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {NOTE_TYPES.map(nt => (
          <Link 
            key={nt.type} 
            to={nt.link} 
            className="glass-card group flex flex-col items-center justify-center p-6 rounded-[2rem] border border-white/5 hover:bg-white/5 transition-all text-center"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-lg", nt.bg, nt.color)}>
              <nt.icon className="w-7 h-7" />
            </div>
            <span className="font-bold text-xs text-white uppercase tracking-wider">{nt.label}</span>
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-white">Catatan Terakhir</h2>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{notes.length} Total</span>
        </div>
        
        {notes.length === 0 ? (
          <div className="p-20 text-center glass-card border border-white/5 rounded-[2.5rem] text-slate-500 font-medium">
            Belum ada catatan. Mulai tulis ceritamu hari ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, index) => {
              const config = NOTE_TYPES.find(t => t.type === note.type);
              if (!config) return null;

              const Icon = config.icon;
              
              let title = '';
              let preview = '';
              if (note.type === 'normal') { title = note.title; preview = note.content; }
              if (note.type === 'ig') { title = note.songTitle; preview = note.content; }
              if (note.type === 'personal') { title = `Data Pribadi`; }
              if (note.type === 'workout') { title = note.title; preview = `${note.durationMins} menit workout`; }
              if (note.type === 'attendance') { title = note.title; preview = `${note.codes.length} entri absensi`; }

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={note.id}
                >
                  <Link to={`/notes/${note.type}/${note.id}`} className="glass-card p-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group flex flex-col h-56 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-3 rounded-2xl shadow-lg", config.bg, config.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{config.label}</span>
                    </div>
                    <h3 className="font-black text-xl text-white line-clamp-1 mb-2 group-hover:text-accent-blue transition-colors">
                      {title || 'Untitiled'}
                    </h3>
                    <p className="text-slate-400 line-clamp-2 text-xs font-medium flex-1">{preview}</p>
                    <div className="flex items-center justify-between mt-4">
                       <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{format(note.createdAt, 'd MMM yyyy', { locale: id })}</p>
                       <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
