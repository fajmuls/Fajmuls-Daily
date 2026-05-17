import { useState } from 'react';
import { Sparkles, Save, Trash2, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAudio } from '../hooks/useAudio';

interface SpecialNote {
  id: string;
  dayTitle: string;
  content: string;
  createdAt: number;
}

export function Special() {
  const [specials, setSpecials] = useLocalStorage<SpecialNote[]>('fajmuls-specials', []);
  const [dayTitle, setDayTitle] = useState('');
  const [content, setContent] = useState('');
  const { playSuccess, playError } = useAudio();

  const handleSave = () => {
    if (!dayTitle) return;
    
    setSpecials(prev => [{
      id: Date.now().toString(),
      dayTitle,
      content,
      createdAt: Date.now()
    }, ...prev]);

    setDayTitle('');
    setContent('');
    playSuccess();
  };

  const handleDelete = (id: string) => {
    setSpecials(prev => prev.filter(s => s.id !== id));
    playError();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="font-serif text-5xl font-bold text-stone-900 mb-2 flex items-center gap-4">
          Menu Spesial <Sparkles className="w-10 h-10 text-accent-orange" />
        </h1>
        <p className="text-stone-500 text-lg">Catatan eksklusif harian untuk momen yang sangat spesial.</p>
      </header>

      <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden">
        <Heart className="absolute -right-10 -bottom-10 w-64 h-64 text-orange-500/5 rotate-12" />
        
        <div className="relative z-10 space-y-6">
          <input
            type="text"
            value={dayTitle}
            onChange={(e) => setDayTitle(e.target.value)}
            placeholder="Hari apa ini? (Contoh: Hari Ulang Tahunnya...)"
            className="w-full text-3xl font-serif font-bold text-stone-900 outline-none placeholder:text-stone-400 bg-transparent"
          />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis sebuah pesan eksklusif yang sangat spesial..."
            className="w-full min-h-[150px] text-lg text-stone-700 outline-none placeholder:text-stone-400 bg-white/50 p-6 rounded-2xl border border-white/60 resize-y backdrop-blur-sm"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Save className="w-5 h-5" /> Simpan Momen
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="font-bold uppercase tracking-wider text-sm text-stone-500">Momen Tersimpan</h2>
        
        {specials.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-stone-200 rounded-3xl text-center text-stone-400">
            Belum ada momen spesial yang dicatat.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specials.map(special => (
              <div key={special.id} className="bg-paper p-8 rounded-3xl border border-stone-200 shadow-sm relative group">
                <p className="text-xs font-mono text-stone-400 mb-4">{format(special.createdAt, 'EEEE, d MMMM yyyy HH:mm', { locale: id })}</p>
                <h3 className="font-serif text-2xl font-bold mb-3">{special.dayTitle}</h3>
                <p className="text-stone-600 leading-relaxed font-medium">{special.content}</p>
                
                <button
                  onClick={() => handleDelete(special.id)}
                  className="absolute top-6 right-6 p-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
