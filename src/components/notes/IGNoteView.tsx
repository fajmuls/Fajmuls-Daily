import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useAppContext } from '../../store';
import { IGNote } from '../../types';
import { ArrowLeft, Trash2, Save, History } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

const COLORS = ['#fee2e2', '#ffedd5', '#fef3c7', '#dcfce7', '#e0e7ff', '#fce7f3', '#f3f4f6', '#171412'];

export function IGNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'ig') as IGNote | undefined;

  const [songTitle, setSongTitle] = useState('');
  const [content, setContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState(COLORS[0]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (existingNote) {
      setSongTitle(existingNote.songTitle);
      setContent(existingNote.content);
      setBackgroundColor(existingNote.backgroundColor);
    }
  }, [existingNote]);

  const handleSave = () => {
    if (!content) return;
    
    if (existingNote) {
      updateNote({
        ...existingNote,
        songTitle,
        content,
        backgroundColor,
        history: existingNote.content !== content ? [existingNote.content, ...existingNote.history] : existingNote.history
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'ig',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        songTitle,
        content,
        backgroundColor,
        history: []
      });
    }
    playSuccess();
    navigate('/notes');
  };

  const handleDelete = () => {
    if (existingNote) {
      deleteNote(existingNote.id);
      playError();
    }
    navigate('/notes');
  };

  const isDarkBg = backgroundColor === '#171412';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {existingNote && existingNote.history.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} className="p-3 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors">
              <History className="w-5 h-5" />
            </button>
          )}
          {existingNote && (
            <button onClick={handleDelete} className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
            <Save className="w-5 h-5" /> Save
          </button>
        </div>
      </div>

      <div className="bg-paper rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Song Title</label>
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="e.g. Die With A Smile"
            className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 font-medium"
          />
        </div>

        <div>
           <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Background Color</label>
           <div className="flex gap-2 flex-wrap">
             {COLORS.map(c => (
               <button
                 key={c}
                 onClick={() => setBackgroundColor(c)}
                 className={cn("w-10 h-10 rounded-full border-2 transition-transform", backgroundColor === c ? "border-stone-900 scale-110" : "border-transparent")}
                 style={{ backgroundColor: c }}
               />
             ))}
           </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Note Content</label>
          <div 
            className="rounded-3xl p-8 min-h-[300px] flex items-center justify-center transition-colors"
            style={{ backgroundColor }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className={cn(
                "w-full text-center text-xl outline-none placeholder:opacity-50 bg-transparent resize-none font-medium",
                isDarkBg ? "text-white" : "text-stone-900"
              )}
              rows={6}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-400 font-mono mt-2 px-2">
            <span>Created: {existingNote ? format(existingNote.createdAt, 'PPp') : 'Unsaved'}</span>
            <span>Edited: {existingNote ? format(existingNote.updatedAt, 'PPp') : 'Unsaved'}</span>
          </div>
        </div>
      </div>

      {showHistory && existingNote && existingNote.history.length > 0 && (
        <div className="bg-stone-100 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <History className="w-5 h-5"/> Edit History
          </h3>
          <ul className="space-y-3">
            {existingNote.history.map((past, i) => (
              <li key={i} className="p-4 bg-paper rounded-2xl text-stone-600 text-sm italic border border-stone-200">
                "{past}"
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
