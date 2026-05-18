import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../store';
import { PersonalNote } from '../../types';
import { ArrowLeft, Trash2, Save, ShieldCheck, Plus, X } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function PersonalNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'personal') as PersonalNote | undefined;

  const [formData, setFormData] = useState({
    personName: '',
    nik: '',
    ssn: '',
    postalCode: '',
    address: '',
    email: '',
    accountNumber: '',
    extraNotes: ''
  });

  const [customFields, setCustomFields] = useState<{key: string, value: string}[]>([]);

  useEffect(() => {
    if (existingNote) {
      setFormData({
        personName: existingNote.personName || '',
        nik: existingNote.nik || '',
        ssn: existingNote.ssn || '',
        postalCode: existingNote.postalCode || '',
        address: existingNote.address || '',
        email: existingNote.email || '',
        accountNumber: existingNote.accountNumber || '',
        extraNotes: existingNote.extraNotes || ''
      });
      if (existingNote.customFields) {
        setCustomFields(existingNote.customFields);
      }
    }
  }, [existingNote]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', val: string) => {
    const newFields = [...customFields];
    newFields[index][field] = val;
    setCustomFields(newFields);
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (existingNote) {
      updateNote({
        ...existingNote,
        ...formData,
        customFields: customFields.filter(f => f.key.trim() !== '' || f.value.trim() !== '')
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'personal',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...formData,
        customFields: customFields.filter(f => f.key.trim() !== '' || f.value.trim() !== '')
      });
    }
    playSuccess();
    navigate('/notes/personal-list');
  };

  const handleDelete = () => {
    if (existingNote) {
      const confirm = window.confirm("Apakah kamu ingin menghapus profil ini beserta seluruh datanya?");
      if (confirm) {
         deleteNote(existingNote.id);
         playError();
         navigate('/notes/personal-list');
      }
    } else {
      navigate('/notes/personal-list');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes/personal-list'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
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
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold text-stone-900">Data Pribadi</h1>
            <p className="text-stone-500 text-sm">Masukan Nama atau Pemilik data terlebih dahulu.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-emerald-600 font-bold mb-2">Nama Pemilik Profil</label>
            <input type="text" name="personName" placeholder="Contoh: Muhammad Rahman Fajmul" value={formData.personName} onChange={handleChange} className="w-full bg-stone-50 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg border border-emerald-100" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">NIK</label>
            <input type="text" name="nik" value={formData.nik} onChange={handleChange} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">NISN / SSN</label>
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

          <div className="md:col-span-2 mt-4 pt-4 border-t border-stone-100">
             <h3 className="font-bold text-stone-700 mb-4 tracking-wide">Data Tambahan Sendiri</h3>
          </div>

          {/* Kolom Kustom */}
          {customFields.map((field, idx) => (
            <div key={idx} className="md:col-span-2 flex items-start gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Label Info</label>
                    <input type="text" value={field.key} onChange={e => handleCustomFieldChange(idx, 'key', e.target.value)} placeholder="Contoh: Nama Pasangan" className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Nilai / Isi</label>
                    <input type="text" value={field.value} onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)} placeholder="Isi informasi..." className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                 </div>
              </div>
              <button type="button" title="Hapus Kustom" onClick={() => removeCustomField(idx)} className="mt-8 p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl flex-shrink-0 border border-transparent hover:border-red-200">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <div className="md:col-span-2 pb-4">
            <button type="button" onClick={addCustomField} className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 px-4 py-3 border border-emerald-200 rounded-xl text-sm w-full justify-center">
               <Plus className="w-4 h-4" />
               Tambah Info Kustom Lainnya
            </button>
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
