import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store';
import { useAuth } from '../components/AuthWrapper';
import { UploadCloud, FileImage, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function Docs() {
  const { docs: firebaseDocs, addDoc, playSuccess, playError } = useAppContext() as any; 
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    if (file.size > 800 * 1024) {
      alert("Uh oh! Karena menggunakan Firestore (tanpa Storage), ukuran gambar maksimal 800KB. Tolong kompres gambarnya ya!");
      return;
    }

    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, []);

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

  const handleUpload = async () => {
    if (!pendingFile || !user) return;
    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        await addDoc({
          id: uuidv4(),
          userId: user.uid,
          name: pendingFile.name,
          description: description,
          url: base64String,
          createdAt: Date.now()
        });
        
        setUploading(false);
        handleCancel();
      };
      reader.readAsDataURL(pendingFile);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-10">
      <header>
        <h1 className="font-serif text-5xl font-bold text-stone-900 mb-2">Dokumentasi Harian</h1>
        <p className="text-stone-500 text-lg">Simpan foto, kenangan, dan dokumen penting Anda.</p>
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
              <div key={doc.id} className="group flex flex-col space-y-2">
                <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
                  <img src={doc.url} alt={doc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white/80 text-xs">{format(doc.createdAt, 'd MMM yyyy', { locale: id })}</p>
                  </div>
                </div>
                {doc.description ? (
                  <p className="text-stone-700 text-sm font-medium px-1">{doc.description}</p>
                ) : (
                  <p className="text-stone-400 text-sm italic px-1">Tanpa deskripsi</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
