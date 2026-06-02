import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc as addFirestoreDoc, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppContext } from '../store';
import { useAuth } from '../components/AuthWrapper';
import { UploadCloud, FileImage, Loader2, X, Trash2, Wand2, FileText, Check } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Markdown from 'react-markdown';

export function Docs() {
  const { setAlert, showConfirm } = useAppContext();
  const { playSuccess, playError, playClick } = useAppContext() as any; 
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [firebaseDocs, setFirebaseDocs] = useState<any[]>([]);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAIOCR = async () => {
    if (!pendingFile) return;
    setAnalyzing(true);
    playClick?.();

    try {
      const base64String = await compressImage(pendingFile);
      const response = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String })
      });
      const data = await response.json();
      if (data.text) {
        setDescription(prev => prev ? `${prev}\n\n${data.text}` : data.text);
        playSuccess?.();
      }
    } catch (e) {
      console.error(e);
      playError?.();
      setAlert("Gagal menganalisis gambar.");
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchDocs = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, `users/${user.uid}/docs`), 
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const docsData = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setFirebaseDocs(docsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, []);

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > 2000 || height > 2000) {
            const scale = 2000 / Math.max(width, height);
            width *= scale;
            height *= scale;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No ctx');
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          let headLen = dataUrl.length * 0.75;
          while (headLen > 800 * 1024 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            headLen = dataUrl.length * 0.75;
          }
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] }
  });

  const handleCancel = () => {
    setPendingFile(null);
    setDescription('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleDelete = (docId: string) => {
    showConfirm("Yakin ingin menghapus dokumentasi ini?", async () => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/docs/${docId}`));
        setAlert("Dokumentasi berhasil dihapus.");
        fetchDocs();
      } catch (err) {
        console.error(err);
        setAlert("Gagal menghapus dokumentasi.");
      }
    });
  };

  const handleUpload = async () => {
    if (!pendingFile || !user) return;
    setUploading(true);
    
    try {
      const base64String = await compressImage(pendingFile);
      
      await addFirestoreDoc(collection(db, `users/${user.uid}/docs`), {
        userId: user.uid,
        name: pendingFile.name,
        description: description,
        url: base64String,
        createdAt: Date.now()
      });
      
      setUploading(false);
      handleCancel();
      fetchDocs();
    } catch (error) {
      console.error(error);
      setUploading(false);
      setAlert("Terjadi kesalahan saat mengompres/mengunggah gambar.");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center gap-4 justify-between border-b border-stone-200 pb-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-600 rounded-2xl shadow-brutal border-2 border-stone-900">
             <FileImage className="w-6 h-6 text-white" />
           </div>
           <div>
              <h1 className="font-serif text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Dokumentasi Harian</h1>
              <p className="text-stone-500 font-bold uppercase tracking-widest text-[10px] mt-1">Simpan foto, kenangan, dan dokumen penting Anda.</p>
           </div>
        </div>
      </header>

      {pendingFile && previewUrl ? (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-stone-900 shadow-brutal space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-stone-900 uppercase tracking-widest text-xs">Preview Unggahan</h3>
            <button onClick={handleCancel} className="p-2 bg-stone-100 hover:bg-red-100 text-stone-400 hover:text-red-500 rounded-full transition-colors border border-stone-200 hover:border-red-200">
              <X className="w-5 h-5"/>
            </button>
          </div>
          <div className="aspect-video bg-stone-100 rounded-3xl overflow-hidden relative border-2 border-stone-900 shadow-inner flex items-center justify-center">
             <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-widest text-stone-400 font-black">Deskripsi Keterangan <span className="text-stone-300 normal-case font-medium">(Opsional)</span></label>
              <button 
                onClick={handleAIOCR}
                disabled={analyzing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-200 disabled:opacity-50 shadow-sm"
              >
                {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                {analyzing ? 'Menganalisis...' : 'Analisis AI'}
              </button>
            </div>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-200 focus:border-indigo-600 rounded-2xl px-5 py-4 outline-none font-medium text-stone-700 transition-colors resize-y min-h-[120px]"
              placeholder="Tambahkan memori atau biarkan AI menganalisis gambar ini..."
            />
          </div>
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-brutal active:translate-y-1 active:shadow-brutal-active disabled:opacity-50 disabled:active:translate-y-0 text-sm"
          >
            {uploading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Mengunggah...</>
            ) : (
              <><UploadCloud className="w-5 h-5" /> Unggah Sekarang</>
            )}
          </button>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`p-12 border-4 border-dashed rounded-[3rem] text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[280px] group
            ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-stone-500 group-hover:-translate-y-2 transition-transform">
            <div className="p-5 bg-white border-2 border-stone-900 rounded-3xl shadow-brutal mb-5 group-hover:shadow-brutal-active">
              <UploadCloud className="w-8 h-8 text-stone-900" />
            </div>
            <p className="font-black text-stone-800 text-xl tracking-tight">Tarik & Lepas Gambar</p>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mt-2">Atau klik untuk menelusuri (Maks 1MB)</p>
          </div>
        </div>
      )}

      <div className="pt-8">
        <h2 className="font-black uppercase tracking-widest text-xs text-stone-400 mb-6 flex items-center gap-2">
           <FileImage className="w-4 h-4" /> Galeri Tersimpan
        </h2>
        {firebaseDocs.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-stone-200 rounded-[2rem] text-sm font-bold text-stone-400 uppercase tracking-wider bg-stone-50/50">
             Belum ada foto yang diunggah.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {firebaseDocs.map(doc => (
              <div key={doc.id} className="group flex flex-col space-y-3 bg-white p-4 rounded-[2.5rem] border-2 border-stone-900 shadow-brutal hover:-translate-y-1 hover:shadow-brutal-active transition-all relative">
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="absolute -top-3 -right-3 z-10 w-10 h-10 flex items-center justify-center bg-white border-2 border-stone-900 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-brutal hover:rotate-12"
                  title="Hapus gambar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="relative aspect-square bg-stone-100 rounded-3xl overflow-hidden border-2 border-stone-200 group-hover:border-stone-400 transition-colors">
                  <img src={doc.url} alt={doc.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent p-5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex flex-col items-start justify-end">
                      <p className="text-white font-black text-xs uppercase tracking-widest">{format(doc.createdAt, 'd MMM yyyy', { locale: id })}</p>
                      <p className="text-stone-300 font-mono text-[10px] font-bold mt-1">{format(doc.createdAt, 'HH:mm', { locale: id })}</p>
                  </div>
                </div>
                <div className="px-2 pt-1 pb-2">
                  {doc.description ? (
                    <div className="text-stone-800 text-xs font-medium leading-relaxed prose prose-stone prose-xs line-clamp-4">
                      <Markdown>{doc.description}</Markdown>
                    </div>
                  ) : (
                    <p className="text-stone-400 text-[10px] italic font-medium">Tanpa deskripsi</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
