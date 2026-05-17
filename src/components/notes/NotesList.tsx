import { Link } from 'react-router-dom';
import { useAppContext } from '../../store';
import { format } from 'date-fns';
import { FileText, Moon, Instagram, Lock, Dumbbell, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NoteType } from '../../types';

const NOTE_TYPES: { type: NoteType; icon: any; label: string; color: string; bg: string }[] = [
  { type: 'normal', icon: FileText, label: 'Normal Note', color: 'text-stone-700', bg: 'bg-stone-100' },
  { type: 'prayer', icon: Moon, label: 'Qadha Prayers', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  { type: 'ig', icon: Instagram, label: 'IG Notes', color: 'text-pink-700', bg: 'bg-pink-100' },
  { type: 'personal', icon: Lock, label: 'Personal Data', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  { type: 'workout', icon: Dumbbell, label: 'Workout', color: 'text-orange-700', bg: 'bg-orange-100' },
];

export function NotesList() {
  const { notes } = useAppContext();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-5xl font-bold text-stone-900">Daily Notes</h1>
          <p className="text-stone-500 text-lg mt-2 font-medium">Select a template to create a new record.</p>
        </div>
      </header>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {NOTE_TYPES.map(nt => (
          <Link 
            key={nt.type} 
            to={`/notes/${nt.type}`} 
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
        <h2 className="font-bold uppercase tracking-wider text-sm text-stone-500 mb-6">Recent Records</h2>
        {notes.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-stone-200 rounded-3xl text-stone-400">
            No notes found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => {
              const config = NOTE_TYPES.find(t => t.type === note.type)!;
              const Icon = config.icon;
              
              let title = '';
              let preview = '';
              if (note.type === 'normal') { title = note.title; preview = note.content; }
              if (note.type === 'prayer') { title = `Missed on ${note.date}`; }
              if (note.type === 'ig') { title = `IG: ${note.songTitle}`; preview = note.content; }
              if (note.type === 'personal') { title = `Data Record`; }
              if (note.type === 'workout') { title = note.title; preview = `${note.durationMins} mins`; }

              return (
                <Link key={note.id} to={`/notes/${note.type}/${note.id}`} className="bg-paper p-6 rounded-3xl border border-stone-200 hover:shadow-lg transition-all group flex flex-col h-48">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded-xl", config.bg, config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs uppercase tracking-wider font-bold text-stone-400">{config.label}</span>
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 line-clamp-1 mb-2 group-hover:text-accent-orange transition-colors">
                    {title || 'Untitled'}
                  </h3>
                  <p className="text-stone-500 line-clamp-2 text-sm flex-1">{preview}</p>
                  <p className="text-xs text-stone-400 mt-4 font-mono">{format(note.createdAt, 'MMM d, yyyy h:mm a')}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
