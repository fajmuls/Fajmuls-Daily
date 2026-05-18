import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../store';
import { AttendanceNote } from '../../types';
import { ArrowLeft, Plus, ListChecks, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useAudio } from '../../hooks/useAudio';

export function AttendanceNotesList() {
  const navigate = useNavigate();
  const { notes } = useAppContext();
  const { playClick } = useAudio();

  const attendances = notes.filter(n => n.type === 'attendance') as AttendanceNote[];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/notes')} className="p-3 bg-paper rounded-full border border-stone-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button 
           onClick={() => { playClick(); navigate('/notes/attendance'); }} 
           className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800"
        >
          <Plus className="w-5 h-5" /> Buat Absensi Baru
        </button>
      </div>

      <header className="py-4">
         <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2 border-b border-stone-200 pb-4">Kode Absensi</h1>
         <p className="text-stone-500 font-medium tracking-tight">Kumpulan catatan kode absensi harian dan kegiatan.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attendances.length === 0 ? (
          <div className="md:col-span-2 p-20 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-200 text-stone-400">
             Belum ada catatan absensi.
          </div>
        ) : (
          attendances.map(note => (
            <Link 
              key={note.id} 
              to={`/notes/attendance/${note.id}`}
              className="bg-paper p-6 rounded-3xl border border-stone-200 hover:shadow-lg transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ListChecks className="w-7 h-7" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-stone-900">{note.title}</h3>
                    <p className="text-xs text-stone-400 font-mono mt-1">
                      {format(note.createdAt, 'd MMM yyyy', { locale: idLocale })} • {note.codes.length} entri
                    </p>
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
