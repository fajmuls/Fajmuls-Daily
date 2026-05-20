import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../store';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FileText, Moon, Instagram, Lock, Dumbbell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NoteType } from '../../types';
import { WorkspaceSyncModal } from '../WorkspaceSyncModal';

const NOTE_TYPES: { type: NoteType | 'prayer-list'; icon: any; label: string; color: string; bg: string; link: string }[] = [
  { type: 'normal', icon: FileText, label: 'Biasa', color: 'text-stone-700', bg: 'bg-stone-100', link: '/notes/normal-list' },
  { type: 'prayer-list', icon: Moon, label: 'Qadha Shalat', color: 'text-indigo-700', bg: 'bg-indigo-100', link: '/notes/prayers' },
  { type: 'ig', icon: Instagram, label: 'Catatan IG', color: 'text-pink-700', bg: 'bg-pink-100', link: '/notes/ig-list' },
  { type: 'personal', icon: Lock, label: 'Data Pribadi', color: 'text-emerald-700', bg: 'bg-emerald-100', link: '/notes/personal-list' },
  { type: 'workout', icon: Dumbbell, label: 'Olahraga', color: 'text-orange-700', bg: 'bg-orange-100', link: '/notes/workout-list' },
];

export function NotesList() {
  const { notes } = useAppContext();
  const [showSync, setShowSync] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-5xl font-bold text-stone-900">Catatan Harian</h1>
          <p className="text-stone-500 text-lg mt-2 font-medium">Pilih templat untuk ngebikin catatan baru.</p>
        </div>
        <div>
           <button onClick={() => setShowSync(true)} className="p-3 px-6 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all font-bold text-sm tracking-tight whitespace-nowrap">
             Ekspor ke Google Tasks
           </button>
        </div>
      </header>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {NOTE_TYPES.map(nt => (
          <Link 
            key={nt.type} 
            to={nt.link} 
            className="group flex flex-col items-center justify-center p-6 bg-paper border border-stone-200 rounded-3xl hover:border-stone-400 hover:shadow-md transition-all"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", nt.bg, nt.color)}>
              <nt.icon className="w-7 h-7" />
            </div>
            <span className="font-bold text-sm text-center">{nt.label}</span>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="font-bold uppercase tracking-wider text-sm text-stone-500 mb-6">Catatan Terakhir</h2>
        {notes.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-stone-200 rounded-3xl text-stone-400">
            Tidak ada catatan yang ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => {
              const config = NOTE_TYPES.find(t => t.type === note.type);
              if (!config) return null; // Skip if config is not found

              const Icon = config.icon;
              
              let title = '';
              let preview = '';
              if (note.type === 'normal') { title = note.title; preview = note.content; }
              if (note.type === 'ig') { title = `IG: ${note.songTitle}`; preview = note.content; }
              if (note.type === 'personal') { title = `Rekaman Data Pribadi`; }
              if (note.type === 'workout') { title = note.title; preview = `${note.durationMins} menit`; }

              return (
                <Link key={note.id} to={`/notes/${note.type}/${note.id}`} className="bg-paper p-6 rounded-3xl border border-stone-200 hover:shadow-lg transition-all group flex flex-col h-48 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded-xl", config.bg, config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs uppercase tracking-wider font-bold text-stone-400">{config.label}</span>
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 line-clamp-1 mb-2 group-hover:text-accent-orange transition-colors">
                    {title || 'Tanpa Judul'}
                  </h3>
                  <p className="text-stone-500 line-clamp-2 text-sm flex-1">{preview}</p>
                  <p className="text-xs text-stone-400 mt-4 font-mono">{format(note.createdAt, 'd MMM yyyy HH:mm', { locale: id })}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <WorkspaceSyncModal isOpen={showSync} onClose={() => setShowSync(false)} contextType="notes" />
    </div>
  );
}
