import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useAppContext } from '../../store';
import { IGNote } from '../../types';
import { ArrowLeft, Trash2, Save, History, Palette, ChevronDown, User, Edit3, Calendar, FileDown } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useRef } from 'react';

import { COLORS } from '../../data';

export function IGNoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote, showConfirm, setAlert } = useAppContext();
  const { playSuccess, playClick, playError } = useAudio();

  const existingNote = notes.find(n => n.id === id && n.type === 'ig') as IGNote | undefined;

  const pdfRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    playClick();
    
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Catatan_${owner || 'ID'}_${format(new Date(), 'yyyyMMdd')}.pdf`);
      setAlert("Berhasil mengekspor bentuk PDF!");
      playSuccess();
    } catch(e) {
      playError();
      setAlert("Gagal mengekspor PDF!");
    }
  };

  const [owner, setOwner] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [content, setContent] = useState('');
  const [bgColor, setBgColor] = useState('#171412');
  const [customDate, setCustomDate] = useState(Date.now());
  const [showHistory, setShowHistory] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const ownerTemplates = useMemo(() => {
    const owners = new Set<string>();
    notes.filter(n => n.type === 'ig').forEach(n => {
       if ((n as IGNote).owner) owners.add((n as IGNote).owner);
    });
    return Array.from(owners);
  }, [notes]);

  useEffect(() => {
    if (existingNote) {
      setOwner(existingNote.owner || '');
      setSongTitle(existingNote.songTitle);
      setContent(existingNote.content);
      setBgColor(existingNote.backgroundColor || '#171412');
      setCustomDate(existingNote.createdAt);
    }
  }, [existingNote]);

  const handleSave = (bulkRenameOwner = false) => {
    if (!songTitle && !content) return;
    
    if (existingNote) {
      // If bulk renaming, update all notes with this owner
      if (bulkRenameOwner && existingNote.owner !== owner) {
         notes.filter(n => n.type === 'ig' && n.id !== existingNote.id).forEach(n => {
            if ((n as IGNote).owner === existingNote.owner) {
               updateNote({ ...n, owner } as IGNote);
            }
         });
      }

      updateNote({
        ...existingNote,
        owner,
        songTitle,
        content,
        backgroundColor: bgColor,
        createdAt: customDate,
        updatedAt: Date.now(),
        history: existingNote.content !== content ? [existingNote.content, ...(existingNote.history || [])] : (existingNote.history || [])
      });
    } else {
      addNote({
        id: uuidv4(),
        type: 'ig',
        owner,
        createdAt: customDate,
        updatedAt: Date.now(),
        songTitle,
        content,
        backgroundColor: bgColor,
        history: []
      });
    }
    playSuccess();
    navigate('/notes/ig-list');
  };

  const handleBulkRename = () => {
     if (!existingNote) return;
     if (owner === existingNote.owner) {
        setAlert("Nama pemilik belum berubah!");
        return;
     }
     showConfirm(`Ubah semua pemilik dari "${existingNote.owner}" ke "${owner}"?`, () => {
        handleSave(true);
     });
  };

  const handleDelete = () => {
    if (existingNote) {
      showConfirm("Apakah kamu ingin menghapus catatan IG ini?", () => {
         deleteNote(existingNote.id);
         playError();
         navigate('/notes/ig-list');
      });
    } else {
       navigate('/notes/ig-list');
    }
  };

  const handleExportText = () => {
    if (!existingNote) return;
    const contentText = content.trim() ? content.trim() : "rip";
    const dateStr = format(customDate, 'dd MMMM yyyy, HH:mm', { locale: idLocale });
    let text = `${owner || "Tanpa Nama"} - ${songTitle || "Tanpa Judul"} - ${dateStr}\n\n`;
    text += contentText;
    
    // Copy to clipboard
    navigator.clipboard.writeText(text);
    setAlert("Berhasil menyalin catatan ke clipboard dalam format teks!");
    playSuccess();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <button onClick={() => { playClick(); navigate('/notes/ig-list'); }} className="p-3 bg-paper rounded-full border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {existingNote && (
            <div className="flex gap-2">
              <button onClick={handleExportText} className="p-3 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors" title="Salin Teks">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button onClick={handleExportPDF} className="p-3 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors" title="Download PDF">
                <FileDown className="w-5 h-5" />
              </button>
            </div>
          )}
          {existingNote && (existingNote.history?.length || 0) > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} className="p-3 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors" title="Riwayat Edit">
              <History className="w-5 h-5" />
            </button>
          )}
          {existingNote && (
            <button onClick={handleDelete} className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => handleSave(false)} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
            <Save className="w-5 h-5" /> Simpan
          </button>
        </div>
      </div>

      <div ref={pdfRef} className="bg-paper rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group z-20">
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2 flex justify-between">
               <span>Nama / ID Pemilik</span> 
            </label>
            <div className="relative">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">@</div>
               <input
                 type="text"
                 value={owner}
                 onFocus={() => setShowOwnerDropdown(true)}
                 onChange={(e) => { setOwner(e.target.value); setShowOwnerDropdown(true); }}
                 placeholder="username atau nama..."
                 className="w-full bg-stone-50 rounded-xl pl-8 pr-10 py-3 outline-none focus:ring-2 focus:ring-purple-500 font-bold text-stone-900 border border-stone-200 hover:border-stone-300 transition-colors"
               />
               <button onClick={() => setShowOwnerDropdown(!showOwnerDropdown)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-300 hover:text-stone-600 transition-colors rounded-lg">
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showOwnerDropdown ? "rotate-180" : "")} />
               </button>
            </div>

            {showOwnerDropdown && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-2 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  {ownerTemplates.filter(o => o.toLowerCase().includes(owner.toLowerCase())).map((o, i) => (
                     <button 
                        key={i}
                        type="button"
                        onClick={() => { setOwner(o); setShowOwnerDropdown(false); playClick(); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-stone-50 rounded-xl text-sm font-bold text-stone-700 transition-colors flex items-center gap-2"
                     >
                        <User className="w-4 h-4 text-stone-400" /> {o}
                     </button>
                  ))}
                  {ownerTemplates.length === 0 && <p className="text-xs text-stone-400 p-2 text-center">Belum ada ID tersimpan</p>}
               </div>
            )}
            
            {existingNote && owner !== existingNote.owner && owner.trim() !== '' && (
               <button 
                  onClick={handleBulkRename}
                  className="mt-2 flex items-center gap-1.5 text-[10px] text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100 font-bold uppercase tracking-wider hover:bg-purple-100 transition-colors"
               >
                  <Edit3 className="w-3 h-3"/> Ubah Semua "{existingNote.owner}" jadi "{owner}"
               </button>
            )}
          </div>
          <div className="z-10">
            <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold mb-2">Judul Catatan / Lagu</label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="Contoh: Die With A Smile"
              className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 font-bold text-stone-900 border border-stone-200 hover:border-stone-300 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
             <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold">Isi Catatan</label>
             <button 
               onClick={() => setShowColors(!showColors)}
               className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
             >
               <Palette className="w-4 h-4" /> Tema
             </button>
          </div>
          
          {showColors && (
            <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in">
               {COLORS.map(c => (
                 <button
                   key={c}
                   onClick={() => { setBgColor(c); setShowColors(false); }}
                   className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm", bgColor === c ? "border-stone-900 scale-110" : "border-stone-200 opacity-80 hover:opacity-100")}
                   style={{ backgroundColor: c }}
                 />
               ))}
            </div>
          )}

          <div 
            className="rounded-3xl p-8 min-h-[300px] flex items-center justify-center transition-colors shadow-inner"
            style={{ backgroundColor: bgColor }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Apa yang ada di pikiranmu?"
              className="w-full text-center text-xl outline-none placeholder:opacity-50 resize-none font-medium text-white bg-transparent drop-shadow-md"
              rows={6}
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-4 pt-4 border-t border-stone-100 px-2 opacity-60">
            <button onClick={() => setShowDatePicker(!showDatePicker)} className="flex items-center gap-1 hover:text-stone-600 transition-colors">
              <Calendar className="w-3 h-3" />
              Dibuat: {format(customDate, 'd MMM yyyy, HH:mm', { locale: idLocale })}
            </button>
            {showDatePicker && (
               <div className="absolute bottom-20 left-6 bg-white border border-stone-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <p className="text-[9px] mb-3">Pilih Waktu (Timestamp)</p>
                  <input 
                    type="datetime-local" 
                    value={new Date(customDate).toISOString().slice(0, 16)}
                    onChange={(e) => setCustomDate(new Date(e.target.value).getTime())}
                    className="bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 font-medium font-sans text-xs outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <button onClick={() => setShowDatePicker(false)} className="w-full mt-3 py-2 bg-stone-900 text-white rounded-lg text-[10px]">Tutup</button>
               </div>
            )}
            <span className="flex items-center gap-1">⏱️ Diedit: {existingNote ? format(existingNote.updatedAt, 'd MMM yyyy, HH:mm', { locale: idLocale }) : 'Baru'}</span>
          </div>
        </div>
      </div>

      {showHistory && existingNote && (existingNote.history?.length || 0) > 0 && (
        <div className="bg-stone-100 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <History className="w-5 h-5"/> Riwayat Edit
          </h3>
          <ul className="space-y-3">
            {(existingNote.history || []).map((past, i) => (
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
