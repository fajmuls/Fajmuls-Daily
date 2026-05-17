import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../store';
import { NormalNote } from '../../types';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function NormalNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'normal') as NormalNote | undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
    }
  }, [existingNote]);

  const handleSave = () => {
    if (!title && !content) return;
    
    if (existingNote) {
      updateNote({
        ...existingNote,
        title,
        content
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'normal',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title,
        content
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {existingNote && (
            <button onClick={handleDelete} className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
            <Save className="w-5 h-5" /> Simpan
          </button>
        </div>
      </div>

      <div className="bg-paper rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul Catatan"
          className="w-full text-4xl font-serif font-bold text-stone-900 outline-none placeholder:text-stone-300 bg-transparent"
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Mulai mengetik..."
          className="w-full min-h-[400px] text-lg text-stone-700 outline-none placeholder:text-stone-300 bg-transparent resize-y"
        />
      </div>
    </div>
  );
}
