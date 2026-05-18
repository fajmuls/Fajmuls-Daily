import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc as addFirestoreDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppContext } from '../store';
import { UploadCloud, FileImage, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function Docs() {
  const { playSuccess, playError } = useAppContext() as any; 
  const [uploading, setUploading] = useState(false);
  const [firebaseDocs, setFirebaseDocs] = useState<any[]>([]);

  const fetchDocs = async () => {
    try {
      const q = query(collection(db, "daily_docs"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const docsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFirebaseDocs(docsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    // Check file size (Firestore limit is ~1MB per document, so we restrict to 800KB to be safe)
    if (file.size > 800 * 1024) {
      alert("Uh oh! Karena menggunakan Firestore (tanpa Storage), ukuran gambar maksimal 800KB. Tolong kompres gambarnya ya!");
      return;
    }

    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        await addFirestoreDoc(collection(db, "daily_docs"), {
          name: file.name,
          url: base64String,
          createdAt: Date.now()
        });
        
        setUploading(false);
        fetchDocs();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  }, []);

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] }
  });

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-10">
      <header>
        <h1 className="font-serif text-5xl font-bold text-stone-900 mb-2">Dokumentasi Harian</h1>
        <p className="text-stone-500 text-lg">Catatan foto yang tersimpan langsung di Firestore (Base64).</p>
      </header>

      <div 
        {...getRootProps()} 
        className={`p-12 border-2 border-dashed rounded-3xl text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px]
          ${isDragActive ? 'border-accent-orange bg-orange-50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center text-accent-orange">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold">Mengunggah ke Firestore...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-stone-500">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <UploadCloud className="w-8 h-8 text-stone-700" />
            </div>
            <p className="font-bold text-stone-700 text-lg">Tarik & lepas foto ke sini</p>
            <p className="text-sm mt-1">Maks. 800KB</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-bold uppercase tracking-wider text-sm text-stone-500 mb-6">Galeri Dokumen</h2>
        {firebaseDocs.length === 0 ? (
          <div className="p-8 text-center text-stone-400">Belum ada foto yang diunggah.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {firebaseDocs.map(doc => (
              <div key={doc.id} className="group relative aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
                <img src={doc.url} alt={doc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white font-bold text-sm truncate">{doc.name}</p>
                  <p className="text-white/80 text-xs">{format(doc.createdAt, 'd MMM yyyy', { locale: id })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
