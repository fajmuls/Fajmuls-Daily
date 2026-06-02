import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { TripSummary } from '../../types';
import { X, CheckCircle2, UploadCloud, Loader2, Image as ImageIcon, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAudio } from '../../hooks/useAudio';

interface EndTripModalProps {
  trip: TripSummary | null;
  onClose: () => void;
  onEndTrip: (
    tripId: string, 
    details: { 
      tollCost: number; 
      fuelCost: number; 
      conditions: string[]; 
      receipts: { id: string; url: string; name: string }[];
      finalDestination?: { city: string; detail: string };
    }
  ) => void;
}

const PREDEFINED_CONDITIONS = ['Lancar', 'Macet', 'Macet Total', 'Hujan', 'Berkabut', 'Kecelakaan'];

export function EndTripModal({ trip, onClose, onEndTrip }: EndTripModalProps) {
  const { playClick } = useAudio();
  const [tollCost, setTollCost] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [receipts, setReceipts] = useState<{ id: string; url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [endDestCity, setEndDestCity] = useState('');
  const [endDestDetail, setEndDestDetail] = useState('');

  const [analyzing, setAnalyzing] = useState(false);

  const fetchCurrentLocation = async () => {
    if (!navigator.geolocation) return;
    setAnalyzing(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const response = await fetch(`/api/maps/reverse-geocoding?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
          const components = data.results[0].address_components;
          const cityComp = components.find((c: any) => c.types.includes('administrative_area_level_2') || c.types.includes('locality'));
          const subDistrictComp = components.find((c: any) => c.types.includes('administrative_area_level_3') || c.types.includes('sublocality'));
          if (cityComp) setEndDestCity(cityComp.long_name);
          if (subDistrictComp) setEndDestDetail(subDistrictComp.long_name);
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      } finally {
        setAnalyzing(false);
      }
    }, () => {
      setAnalyzing(false);
    }, { enableHighAccuracy: true });
  };

  useEffect(() => {
    if (trip) {
      setEndDestCity(trip.destination.city === "Belum Ditentukan" ? "" : trip.destination.city);
      setEndDestDetail(trip.destination.detail || "");
      if (trip.destination.city === "Belum Ditentukan") {
        fetchCurrentLocation();
      }
    }
  }, [trip]);

  const toggleCondition = (c: string) => {
    setConditions(prev => 
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    try {
      const newReceipts = [...receipts];
      for (const file of acceptedFiles) {
        const compressed = await compressImage(file);
        newReceipts.push({
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          url: compressed,
          name: file.name
        });
      }
      setReceipts(newReceipts);
    } catch(err) {
      console.error(err);
      alert('Gagal memproses gambar');
    } finally {
      setUploading(false);
    }
  }, [receipts]);

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] }
  });

  const removeReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  if (!trip) return null;

  const handleSave = () => {
    if (!endDestCity) {
      alert("Kota Tujuan harus diisi untuk menyelesaikan perjalanan!");
      return;
    }
    playClick();
    onEndTrip(trip.id, {
      tollCost: parseInt(tollCost) || 0,
      fuelCost: parseInt(fuelCost) || 0,
      conditions,
      receipts,
      finalDestination: { city: endDestCity, detail: endDestDetail }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-end md:items-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
        <h2 className="font-serif text-2xl font-black text-stone-900 mb-2">Selesaikan Perjalanan</h2>
        <p className="text-stone-500 text-sm font-medium mb-6">
          Berangkat dari <span className="font-bold text-stone-900">{trip.origin.city}</span>
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Kota Tujuan (Akhir) *</label>
                <button 
                  onClick={fetchCurrentLocation}
                  disabled={analyzing}
                  className="text-[8px] font-black uppercase text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1"
                >
                  {analyzing ? <Loader2 className="w-2 h-2 animate-spin" /> : <MapPin className="w-2 h-2" />}
                  {analyzing ? 'Mencari...' : 'Gunakan GPS'}
                </button>
              </div>
              <input type="text" value={endDestCity} onChange={e => setEndDestCity(e.target.value)} placeholder="Bandung" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tempat <span className="normal-case font-normal">(opsional)</span></label>
              <input type="text" value={endDestDetail} onChange={e => setEndDestDetail(e.target.value)} placeholder="Gedung Sate" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Bensin (Rp)</label>
              <input type="number" value={fuelCost} onChange={e => setFuelCost(e.target.value)} placeholder="0" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Tol (Rp)</label>
              <input type="number" value={tollCost} onChange={e => setTollCost(e.target.value)} placeholder="0" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm font-bold" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Kondisi Jalan</label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_CONDITIONS.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCondition(c)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                    conditions.includes(c) ? "bg-teal-50 border-teal-500 text-teal-700" : "bg-white border-stone-200 text-stone-500 hover:border-teal-300 hover:text-teal-600"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Bukti Struk (Opsional)</label>
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors",
                isDragActive ? "border-teal-400 bg-teal-50" : "border-stone-200 bg-stone-50 hover:bg-stone-100"
              )}
            >
              {/* @ts-ignore */}
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-teal-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-bold">Memproses...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-stone-400">
                  <UploadCloud className="w-6 h-6" />
                  <span className="text-xs font-medium">Upload foto struk / e-toll</span>
                </div>
              )}
            </div>

            {receipts.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                {receipts.map(r => (
                  <div key={r.id} className="relative shrink-0 w-20 h-20 bg-stone-100 rounded-xl overflow-hidden group">
                    <img src={r.url} alt={r.name} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeReceipt(r.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t border-stone-100">
          <button onClick={() => { playClick(); onClose(); }} className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
            Nanti Saja
          </button>
          <button onClick={handleSave} className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-md">
            Simpan Perjalanan
          </button>
        </div>
      </div>
    </div>
  );
}
