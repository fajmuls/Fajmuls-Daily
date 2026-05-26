import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc as addFirestoreDoc, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppContext } from '../store';
import { useAuth } from '../components/AuthWrapper';
import { UploadCloud, FileImage, Loader2, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function Docs() {
  const { setAlert, showConfirm } = useAppContext();
  const { playSuccess, playError } = useAppContext() as any; 
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [firebaseDocs, setFirebaseDocs] = useState<any[]>([]);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      <header>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-1">Dokumentasi Harian</h1>
        <p className="text-stone-500 text-sm italic">Simpan foto, kenangan, dan dokumen penting Anda.</p>
      </header>

      {pendingFile && previewUrl ? (
        <div className="bg-paper p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-stone-900">Preview Unggahan</h3>
            <button onClick={handleCancel} className="p-2 text-stone-400 hover:bg-stone-50 rounded-full transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>
          <div className="aspect-video bg-stone-100 rounded-xl overflow-hidden relative border border-stone-200 flex items-center justify-center">
             <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-1">Deskripsi (Opsional)</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 resize-y min-h-[80px]"
              placeholder="Tambahkan keterangan untuk foto ini..."
            />
          </div>
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-stone-900 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-stone-850 transition-colors disabled:opacity-50"
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
          className={`p-12 border-2 border-dashed rounded-3xl text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px]
            ${isDragActive ? 'border-accent-orange bg-orange-50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-stone-500">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <UploadCloud className="w-8 h-8 text-stone-700" />
            </div>
            <p className="font-bold text-stone-700 text-lg">Tarik & lepas foto ke sini</p>
            <p className="text-sm mt-1">Maks. 800KB</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-bold uppercase tracking-wider text-sm text-stone-500 mb-6">Galeri Dokumen</h2>
        {firebaseDocs.length === 0 ? (
          <div className="p-8 text-center text-stone-400">Belum ada foto yang diunggah.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {firebaseDocs.map(doc => (
              <div key={doc.id} className="group flex flex-col space-y-2 bg-white p-3 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative">
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="relative aspect-square bg-stone-100 rounded-[1.5rem] overflow-hidden border border-stone-100">
                  <img src={doc.url} alt={doc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-start justify-end">
                      <p className="text-white font-bold text-xs">{format(doc.createdAt, 'd MMMM yyyy', { locale: id })}</p>
                      <p className="text-stone-300 font-mono text-[10px]">{format(doc.createdAt, 'HH:mm', { locale: id })}</p>
                  </div>
                </div>
                {doc.description ? (
                  <p className="text-stone-700 text-sm font-medium px-2 pb-1 pt-1">{doc.description}</p>
                ) : (
                  <p className="text-stone-400 text-sm italic px-2 pb-1 pt-1">Tanpa deskripsi</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
