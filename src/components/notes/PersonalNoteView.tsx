import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../store';
import { PersonalNote } from '../../types';
import { ArrowLeft, Trash2, Save, ShieldCheck } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function PersonalNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'personal') as PersonalNote | undefined;

  const [formData, setFormData] = useState({
    nik: '',
    ssn: '',
    postalCode: '',
    address: '',
    email: '',
    accountNumber: '',
    extraNotes: ''
  });

  useEffect(() => {
    if (existingNote) {
      setFormData({
        nik: existingNote.nik,
        ssn: existingNote.ssn,
        postalCode: existingNote.postalCode,
        address: existingNote.address,
        email: existingNote.email,
        accountNumber: existingNote.accountNumber,
        extraNotes: existingNote.extraNotes
      });
    }
  }, [existingNote]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (existingNote) {
      updateNote({
        ...existingNote,
        ...formData
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'personal',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...formData
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
            <Save className="w-5 h-5" /> Simpan Data
          </button>
        </div>
      </div>

      <div className="bg-paper rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-6">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Data Pribadi</h1>
            <p className="text-stone-500">Catatan aman untuk informasi sensitif Anda.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">NIK</label>
            <input type="text" name="nik" value={formData.nik} onChange={handleChange} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">SSN</label>
            <input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Nomor Rekening</label>
            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Alamat</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Kode Pos</label>
            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Catatan Lainnya</label>
            <textarea name="extraNotes" value={formData.extraNotes} onChange={handleChange} rows={4} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
