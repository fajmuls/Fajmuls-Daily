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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes/personal-list'); }} className="w-12 h-12 flex items-center justify-center glass-card rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
          {existingNote && (
            <div className="flex gap-2">
               <button onClick={handleCopy} title="Salin Data" className="w-12 h-12 flex items-center justify-center bg-white/5 text-slate-400 rounded-2xl border border-white/10 hover:text-white transition-all">
                 <Copy className="w-5 h-5" />
               </button>
               <button onClick={handlePaste} title="Tempel Data" className="w-12 h-12 flex items-center justify-center bg-white/5 text-slate-400 rounded-2xl border border-white/10 hover:text-white transition-all">
                 <ClipboardPaste className="w-5 h-5" />
               </button>
            </div>
          )}
          {existingNote && (
            <button onClick={handleDelete} className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 fab-gradient text-white rounded-2xl font-black shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98]">
            <Save className="w-5 h-5" /> Simpan Data
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-[2rem] flex items-center justify-center border border-green-500/20 shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Data Profil Pribadi</h1>
            <p className="text-slate-500 font-medium tracking-wide">Pengelola arsip data rahasia & identitas.</p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
           <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Nama Lengkap Pemilik Profil</label>
            <input 
              type="text" 
              name="personName" 
              placeholder="Contoh: Muhammad Rahman Fajmul" 
              value={formData.personName} 
              onChange={handleChange} 
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-green-500 font-black text-xl text-white transition-all shadow-inner" 
            />
          </div>

          <div className="pt-6">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="font-black text-white uppercase tracking-[0.2em] text-[10px]">Detail Informasi & Kartu</h3>
                <button type="button" onClick={addCustomField} className="flex items-center gap-2 text-green-400 font-black hover:opacity-80 transition-opacity text-[10px] uppercase tracking-widest bg-green-400/5 px-4 py-2 rounded-xl border border-green-400/10">
                   <Plus className="w-4 h-4" /> Baris Baru
                </button>
             </div>

             <div className="space-y-4">
                {customFields.map((field, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/2 p-5 rounded-[2rem] border border-white/5 group hover:bg-white/5 transition-all">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="relative">
                          <input 
                            type="text" 
                            value={field.key} 
                            onChange={e => handleCustomFieldChange(idx, 'key', e.target.value)} 
                            placeholder="Label" 
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 font-black text-white text-xs" 
                          />
                          <span className="absolute -top-2 left-4 bg-dashboard-bg/80 backdrop-blur-md px-2 text-[8px] font-black uppercase text-slate-500 border border-white/5 rounded-full">Label</span>
                       </div>
                       <div className="md:col-span-2 relative">
                          <input 
                            type="text" 
                            value={field.value} 
                            onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)} 
                            placeholder="Isi data..." 
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 font-bold text-white text-sm" 
                          />
                          <span className="absolute -top-2 left-4 bg-dashboard-bg/80 backdrop-blur-md px-2 text-[8px] font-black uppercase text-slate-500 border border-white/5 rounded-full">Data</span>
                       </div>
                    </div>
                    <button type="button" onClick={() => removeCustomField(idx)} className="p-3 text-slate-600 hover:text-red-500 transition-colors bg-white/5 rounded-xl border border-white/5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>
          </div>

          <div className="pt-6">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-3">Arsip Keterangan Tambahan</label>
            <textarea 
              name="extraNotes" 
              value={formData.extraNotes} 
              onChange={handleChange} 
              rows={6} 
              className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-6 py-5 outline-none focus:ring-2 focus:ring-green-500 font-medium text-slate-300 resize-none leading-relaxed transition-all" 
              placeholder="Berikan detail tambahan atau konteks rahasia di sini..." 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
