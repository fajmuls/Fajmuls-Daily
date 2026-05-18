import { useState } from 'react';
import { Sparkles, Save, Trash2, Heart, CheckSquare, Square } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { playSuccess, playError, playClick } = useAudio();

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

  const handleDeleteSingle = (id: string) => {
    const code = window.prompt("Masukkan kode verifikasi untuk menghapus catatan eksklusif ini: (Hint: FAJMUL)");
    if (code === "FAJMUL") {
      setSpecials(prev => prev.filter(s => s.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      playError();
    } else if (code !== null) {
      alert("Kode verifikasi salah!");
    }
  };

  const handleDeleteMultiple = () => {
    if (selectedIds.size === 0) return;
    const code = window.prompt(`Kamu akan menghapus ${selectedIds.size} catatan. Masukkan kode verifikasi: (Hint: FAJMUL)`);
    if (code === "FAJMUL") {
      setSpecials(prev => prev.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      playError();
    } else if (code !== null) {
      alert("Kode verifikasi salah!");
    }
  };

  const toggleSelect = (id: string) => {
    playClick();
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 md:pb-0">
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
        <div className="flex items-center justify-between">
          <h2 className="font-bold uppercase tracking-wider text-sm text-stone-500">Momen Tersimpan</h2>
          {selectedIds.size > 0 && (
            <button 
              onClick={handleDeleteMultiple}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" /> Hapus Terpilih ({selectedIds.size})
            </button>
          )}
        </div>
        
        {specials.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-stone-200 rounded-3xl text-center text-stone-400">
            Belum ada momen spesial yang dicatat.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specials.map(special => {
              const isSelected = selectedIds.has(special.id);
              return (
                <div 
                  key={special.id} 
                  className={cn(
                    "bg-paper p-8 rounded-3xl border shadow-sm relative group transition-colors cursor-pointer",
                    isSelected ? "border-red-300 ring-2 ring-red-100 bg-red-50/20" : "border-stone-200"
                  )}
                  onClick={(e) => {
                     // Prevent toggle when clicking the delete button
                     if ((e.target as HTMLElement).closest('button')) return;
                     toggleSelect(special.id);
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-mono text-stone-400">{format(special.createdAt, 'EEEE, d MMMM yyyy HH:mm', { locale: localeId })}</p>
                    <div className={cn("text-stone-300", isSelected && "text-red-500")}>
                      {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-3">{special.dayTitle}</h3>
                  <p className="text-stone-600 leading-relaxed font-medium line-clamp-4">{special.content}</p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSingle(special.id);
                    }}
                    className={cn(
                      "absolute bottom-6 right-6 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
