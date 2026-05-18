import { useState } from 'react';
import { Save, Trash2, Heart, Lock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAppContext } from '../store';
import { useAudio } from '../hooks/useAudio';

export function Special() {
  const { specials, addSpecial, deleteSpecial } = useAppContext();
  const [dayTitle, setDayTitle] = useState('');
  const [content, setContent] = useState('');
  const { playSuccess, playError } = useAudio();
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    if (!dayTitle) return;
    addSpecial({
      id: Date.now().toString(),
      dayTitle,
      content,
      createdAt: Date.now()
    });
    setDayTitle('');
    setContent('');
    setShowForm(false);
    playSuccess();
  };

  const handleDeleteSingle = (id: string) => {
    const code = window.prompt("Masukkan kode verifikasi:");
    if (code === "FAJMUL") {
      deleteSpecial(id);
      playError();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 md:pb-0">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400">Restricted Access</p>
          <h1 className="font-serif text-6xl font-bold text-stone-900 flex items-center gap-3">
            Menu Spesial <Lock className="w-8 h-8 text-stone-300" />
          </h1>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="p-4 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all shadow-xl active:scale-95"
        >
          {showForm ? <Trash2 className="w-6 h-6 rotate-45" /> : <Plus className="w-6 h-6" />}
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="space-y-8">
            <input
              type="text"
              value={dayTitle}
              onChange={(e) => setDayTitle(e.target.value)}
              placeholder="Judul momen..."
              className="w-full text-4xl font-serif font-bold text-stone-900 outline-none placeholder:text-stone-200 bg-transparent"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis detail momen spesial ini..."
              className="w-full min-h-[160px] text-xl text-stone-600 outline-none placeholder:text-stone-300 bg-stone-50 p-8 rounded-3xl border border-stone-100 resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-10 py-5 bg-trip-brown text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-lg active:scale-95"
              >
                <Save className="w-6 h-6" /> Amankan Momen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="font-bold uppercase tracking-widest text-xs text-stone-400">Vault ({specials.length})</h2>
        </div>
        
        {specials.length === 0 ? (
          <div className="py-32 text-center space-y-4">
            <Heart className="w-12 h-12 text-stone-100 mx-auto" />
            <p className="text-stone-400 font-medium">Belum ada momen yang diamankan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {specials.map(special => (
              <div 
                key={special.id} 
                className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-tighter bg-stone-50 px-3 py-1 rounded-full">
                    {format(special.createdAt, 'd MMM yyyy • HH:mm', { locale: localeId })}
                  </span>
                  <button
                    onClick={() => handleDeleteSingle(special.id)}
                    className="p-3 text-stone-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-serif text-3xl font-bold mb-4 text-stone-900 group-hover:text-accent-orange transition-colors">{special.dayTitle}</h3>
                <p className="text-stone-500 text-lg leading-relaxed font-medium">{special.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
