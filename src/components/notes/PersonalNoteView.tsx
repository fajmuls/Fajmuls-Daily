import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../store';
import { PersonalNote } from '../../types';
import { ArrowLeft, Trash2, Save, ShieldCheck, Plus, X, Copy, ClipboardPaste } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';

export function PersonalNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'personal') as PersonalNote | undefined;

  const [formData, setFormData] = useState({
    personName: '',
    extraNotes: ''
  });

  const [customFields, setCustomFields] = useState<{key: string, value: string}[]>([]);

  useEffect(() => {
    if (existingNote) {
      setFormData({
        personName: existingNote.personName || '',
        extraNotes: existingNote.extraNotes || ''
      });
      if (existingNote.customFields) {
        setCustomFields(existingNote.customFields);
      } else {
         // Migration
         const legacyFields = [
            { key: 'NIK 1', value: (existingNote as any).nik },
            { key: 'Email', value: (existingNote as any).email },
            { key: 'No. Rekening', value: (existingNote as any).accountNumber },
            { key: 'Alamat', value: (existingNote as any).address }
         ].filter(f => f.value);
         setCustomFields(legacyFields.length > 0 ? legacyFields : []);
      }
    } else {
       // Start empty but with clear prompt for name first
       setCustomFields([]);
    }
  }, [existingNote]);

  const handleCopy = () => {
    const text = `Profil: ${formData.personName}\n` + 
      customFields.map(f => `${f.key}: ${f.value}`).join('\n') + 
      (formData.extraNotes ? `\nCatatan: ${formData.extraNotes}` : '');
    
    // Fallback for document.execCommand if navigator.clipboard fails in some iframes
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        playSuccess();
        alert("Berhasil menyalin data profil!");
      });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Add as a new custom field if it looks like "Key: Value"
      const lines = text.split('\n');
      const newFields = [...customFields];
      lines.forEach(line => {
        if (line.includes(':')) {
           const [k, ...v] = line.split(':');
           newFields.push({ key: k.trim(), value: v.join(':').trim() });
        }
      });
      if (newFields.length > customFields.length) {
         setCustomFields(newFields);
      } else {
         setFormData(prev => ({ ...prev, extraNotes: prev.extraNotes + '\n' + text }));
      }
      playSuccess();
    } catch (err) {
      console.error(err);
      playError();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', val: string) => {
    const newFields = [...customFields];
    newFields[index][field] = val;
    setCustomFields(newFields);
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: `Info ${prev.length + 1}`, value: '' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const dataToSave = {
        id: existingNote?.id || uuidv4(),
        type: 'personal' as const,
        createdAt: existingNote?.createdAt || Date.now(),
        updatedAt: Date.now(),
        personName: formData.personName,
        extraNotes: formData.extraNotes,
        customFields: customFields.filter(f => f.key.trim() !== '' || f.value.trim() !== ''),
        // Keep legacy fields empty or as placeholders so types don't break if they are mandatory
        nik: '', ssn: '', postalCode: '', address: '', email: '', accountNumber: '', notes: []
    };

    if (existingNote) {
      updateNote(dataToSave as PersonalNote);
    } else {
      addNote(dataToSave as PersonalNote);
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
            <div className="flex gap-1 mr-2 border-r border-stone-200 pr-2">
               <button onClick={handleCopy} title="Salin Data" className="p-3 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors">
                 <Copy className="w-5 h-5" />
               </button>
               <button onClick={handlePaste} title="Tempel Data" className="p-3 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors">
                 <ClipboardPaste className="w-5 h-5" />
               </button>
            </div>
          )}
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
            <h1 className="text-3xl font-serif font-bold text-stone-900">Data Profil Pribadi</h1>
            <p className="text-stone-500 text-sm">Masukan Nama atau Pemilik data terlebih dahulu.</p>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-emerald-600 font-bold mb-2">Nama Pemilik Profil</label>
            <input type="text" name="personName" placeholder="Contoh: Muhammad Rahman Fajmul" value={formData.personName} onChange={handleChange} className="w-full bg-stone-50 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg border border-emerald-100" />
          </div>

          <div className="mt-8 pt-4 border-t border-stone-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-700 tracking-wide uppercase text-xs">Informasi & Kartu Identitas</h3>
                <button type="button" onClick={addCustomField} className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors text-xs">
                   <Plus className="w-4 h-4" /> Tambah File Baru
                </button>
             </div>
          </div>

          {/* Kolom Kustom */}
          <div className="space-y-3">
             {customFields.map((field, idx) => (
               <div key={idx} className="flex items-start gap-2 bg-stone-50/50 p-4 rounded-2xl border border-stone-100 group transition-all hover:bg-white hover:shadow-md">
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                       <input 
                         type="text" 
                         value={field.key} 
                         onChange={e => handleCustomFieldChange(idx, 'key', e.target.value)} 
                         placeholder="Label" 
                         className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-stone-600 text-sm" 
                       />
                       <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black uppercase text-stone-400">Label</span>
                    </div>
                    <div className="md:col-span-2 relative">
                       <input 
                         type="text" 
                         value={field.value} 
                         onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)} 
                         placeholder="Nilai Informasi" 
                         className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-stone-900" 
                       />
                       <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black uppercase text-stone-400">Value</span>
                    </div>
                 </div>
                 <button type="button" onClick={() => removeCustomField(idx)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
          </div>

          <div className="mt-8">
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Catatan Keterangan Tambahan</label>
            <textarea name="extraNotes" value={formData.extraNotes} onChange={handleChange} rows={6} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Informasi tambahan terkait profil ini..." />
          </div>
        </div>
      </div>
    </div>
  );
}
