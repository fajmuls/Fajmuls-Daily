import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../store';
import { ArrowLeft, Car, MapPin, Play, Square, Map, ChevronRight, Plus, Archive, Trash2, Clock, CheckCircle2, ArrowDownUp, X } from 'lucide-react';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { TripLocation, TripSummary, TripTemplate } from '../../types';
import { useAudio } from '../../hooks/useAudio';

export function TripsView() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError } = useAudio();
  const { trips, tripTemplates, addTrip, updateTrip, deleteTrip, addTripTemplate, deleteTripTemplate, showConfirm } = useAppContext();

  const [activeTab, setActiveTab] = useState<'ongoing' | 'history'>('ongoing');
  
  // New Trip modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [originCity, setOriginCity] = useState('');
  const [originDetail, setOriginDetail] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destDetail, setDestDetail] = useState('');
  const [vehicle, setVehicle] = useState('Mobil');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const ongoingTrips = trips.filter(t => t.status === 'ongoing');
  const finishedTrips = trips.filter(t => t.status === 'completed');

  const startTrip = () => {
    if (!originCity || !destCity || !vehicle) {
      playError();
      alert("Kota asal, tujuan, dan kendaraan harus diisi!");
      return;
    }
    const origin: TripLocation = { city: originCity, detail: originDetail };
    const destination: TripLocation = { city: destCity, detail: destDetail };
    
    if (saveAsTemplate) {
      const exists = tripTemplates.some(t => 
        t.origin.city.toLowerCase() === originCity.toLowerCase() && 
        t.destination.city.toLowerCase() === destCity.toLowerCase() && 
        t.vehicle === vehicle &&
        (t.origin.detail || '').toLowerCase() === (originDetail || '').toLowerCase() &&
        (t.destination.detail || '').toLowerCase() === (destDetail || '').toLowerCase()
      );
      if (!exists) {
        addTripTemplate({
          id: Date.now().toString(),
          origin,
          destination,
          vehicle,
        });
      }
    }

    addTrip({
      id: Date.now().toString(),
      origin,
      destination,
      vehicle,
      status: 'ongoing',
      startTime: Date.now(),
      createdAt: Date.now(),
    });

    playSuccess();
    setShowNewModal(false);
    setActiveTab('ongoing');
    
    // reset form
    setOriginCity(''); setOriginDetail('');
    setDestCity(''); setDestDetail('');
    setSaveAsTemplate(false);
    setVehicle('Mobil');
  };

  const reverseLocations = () => {
    setOriginCity(destCity);
    setOriginDetail(destDetail);
    setDestCity(originCity);
    setDestDetail(originDetail);
  };

  const selectTemplate = (t: TripTemplate) => {
    setOriginCity(t.origin.city);
    setOriginDetail(t.origin.detail);
    setDestCity(t.destination.city);
    setDestDetail(t.destination.detail);
    setVehicle(t.vehicle);
    setSaveAsTemplate(false);
  };

  const endTrip = (trip: TripSummary) => {
    showConfirm(`Selesaikan perjalanan dari ${trip.origin.city} ke ${trip.destination.city}?`, () => {
      updateTrip({
        ...trip,
        status: 'completed',
        endTime: Date.now(),
      });
      playSuccess();
    });
  };

  const formatDuration = (start: number, end: number) => {
    const mins = differenceInMinutes(end, start);
    const hrs = differenceInHours(end, start);
    if (hrs > 0) {
      return `${hrs}j ${mins % 60}m`;
    }
    return `${mins} menit`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center gap-4 border-b border-stone-200 pb-6">
        <button 
          onClick={() => { playClick(); navigate('/notes'); }}
          className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif text-3xl font-black text-stone-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-teal-600" /> Summary Perjalanan
          </h1>
          <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1">
            Riwayat log perjalanan antar kota & tempat.
          </p>
        </div>
      </header>

      <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl w-fit">
        <button
          onClick={() => { playClick(); setActiveTab('ongoing'); }}
          className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'ongoing' ? "bg-white shadow text-stone-900" : "text-stone-500 hover:text-stone-900")}
        >
          Sedang Berjalan
        </button>
        <button
          onClick={() => { playClick(); setActiveTab('history'); }}
          className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'history' ? "bg-white shadow text-stone-900" : "text-stone-500 hover:text-stone-900")}
        >
          Riwayat
        </button>
      </div>

      {activeTab === 'ongoing' ? (
        <div className="space-y-6">
          <button 
            onClick={() => { playClick(); setShowNewModal(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" /> Mulai Perjalanan Baru
          </button>

          {ongoingTrips.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-stone-200 rounded-3xl text-center flex flex-col items-center gap-4 bg-stone-50/50">
              <div className="p-4 bg-stone-100 rounded-full text-stone-400">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">Belum ada perjalanan aktif</p>
                <p className="text-xs text-stone-400 mt-2">Mulai perjalanan untuk mencatat waktu tempuh.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ongoingTrips.map(trip => (
                <div key={trip.id} className="bg-white border-2 border-teal-600 p-6 rounded-3xl shadow-brutal animate-in zoom-in-95">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-100 text-teal-800 text-[9px] font-black uppercase tracking-widest rounded-full">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        Sedang Jalan
                      </span>
                    </div>
                    <div className="text-stone-400 text-xs font-mono font-bold">
                      {format(trip.startTime, 'HH:mm')}
                    </div>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-200">
                    <div className="relative">
                      <div className="absolute -left-[29px] top-1 w-4 h-4 bg-white border-2 border-stone-300 rounded-full z-10" />
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Dari</p>
                      <p className="font-serif text-2xl font-black leading-none text-stone-900">{trip.origin.city}</p>
                      {trip.origin.detail && <p className="text-sm text-stone-500 font-medium">{trip.origin.detail}</p>}
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[29px] top-1 w-4 h-4 bg-white border-2 border-teal-500 rounded-full z-10" />
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Tujuan</p>
                      <p className="font-serif text-2xl font-black leading-none text-stone-900">{trip.destination.city}</p>
                      {trip.destination.detail && <p className="text-sm text-stone-500 font-medium">{trip.destination.detail}</p>}
                    </div>
                  </div>

                  <div className="w-full h-40 md:h-48 rounded-xl overflow-hidden mt-6 border border-stone-200 bg-stone-100">
                    <iframe 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(`${trip.origin.city} to ${trip.destination.city}`)}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-6">
                    <div className="flex items-center gap-2 text-stone-500 font-medium text-sm">
                      <Car className="w-5 h-5" /> {trip.vehicle}
                    </div>
                    <button 
                      onClick={() => endTrip(trip)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-md"
                    >
                      <Square className="w-3.5 h-3.5" /> Selesaikan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {finishedTrips.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-stone-200 rounded-3xl text-center text-stone-400 font-bold uppercase tracking-widest text-xs">
              Belum ada riwayat perjalanan.
            </div>
          ) : (
            <div className="space-y-4">
              {finishedTrips.map(trip => (
                <div key={trip.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-center shrink-0 text-stone-400">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Dari</p>
                        <p className="font-serif text-xl font-black text-stone-900 leading-none truncate">{trip.origin.city}</p>
                        {trip.origin.detail && <p className="text-xs text-stone-500 mt-1 truncate">{trip.origin.detail}</p>}
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-300 hidden md:block shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Ke</p>
                        <p className="font-serif text-xl font-black text-stone-900 leading-none truncate">{trip.destination.city}</p>
                        {trip.destination.detail && <p className="text-xs text-stone-500 mt-1 truncate">{trip.destination.detail}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 md:w-64 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-stone-100">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{format(trip.startTime, 'd MMM yyyyy', { locale: localeId })}</span>
                      <span className="font-mono text-sm font-bold text-stone-900 bg-stone-50 px-2 py-0.5 rounded-lg mt-1 w-fit ml-auto border border-stone-200">
                        {trip.endTime ? formatDuration(trip.startTime, trip.endTime) : '-'}
                      </span>
                    </div>
                    <button 
                      onClick={() => showConfirm("Hapus riwayat ini?", () => deleteTrip(trip.id))}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex justify-center items-end md:items-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl font-black">Perjalanan Baru</h2>
            </div>
            
            {tripTemplates.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Dari Template Tersimpan</p>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {tripTemplates.map(t => (
                    <div key={t.id} className="shrink-0 relative group flex items-start">
                      <button onClick={() => { playClick(); selectTemplate(t); }} className="px-4 py-2 border border-stone-200 hover:border-teal-500 rounded-xl text-left transition-colors bg-white">
                        <p className="text-xs font-bold text-stone-900">{t.origin.city} &rarr; {t.destination.city}</p>
                        <p className="text-[9px] text-stone-500 mt-0.5">{t.vehicle}</p>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); showConfirm("Hapus template?", () => deleteTripTemplate(t.id)); }} 
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Kota Asal *</label>
                  <input type="text" value={originCity} onChange={e => setOriginCity(e.target.value)} placeholder="Ciamis" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tempat <span className="lowercase font-normal">(opsional)</span></label>
                  <input type="text" value={originDetail} onChange={e => setOriginDetail(e.target.value)} placeholder="Rumah" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium" />
                </div>
              </div>

              <div className="flex items-center justify-center -my-2 relative z-10 w-full">
                <button 
                  onClick={() => { playClick(); reverseLocations(); }} 
                  className="bg-white p-2 rounded-full border border-stone-200 hover:border-teal-400 text-stone-400 hover:text-teal-600 transition-all shadow-sm"
                  title="Tukar Asal & Tujuan"
                >
                  <ArrowDownUp className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Kota Tujuan *</label>
                  <input type="text" value={destCity} onChange={e => setDestCity(e.target.value)} placeholder="Bandung" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tempat <span className="lowercase font-normal">(opsional)</span></label>
                  <input type="text" value={destDetail} onChange={e => setDestDetail(e.target.value)} placeholder="Rumah Mang Jepi" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Kendaraan *</label>
                <div className="flex gap-2">
                  {['Motor', 'Mobil', 'Kereta', 'Bus'].map(v => (
                    <button key={v} onClick={() => setVehicle(v)} className={cn("flex-1 py-3 text-xs font-bold rounded-xl border transition-all", vehicle === v ? "bg-teal-50 border-teal-500 text-teal-700" : "bg-stone-50 border-stone-200 text-stone-500")}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 pt-2 cursor-pointer group">
                <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-all", saveAsTemplate ? "bg-teal-500 border-teal-500" : "bg-white border-stone-300 group-hover:border-teal-400")}>
                  {saveAsTemplate && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-xs font-bold text-stone-700">Simpan sebagai template</span>
                <input type="checkbox" className="hidden" checked={saveAsTemplate} onChange={e => setSaveAsTemplate(e.target.checked)} />
              </label>

              <div className="flex gap-3 pt-6 border-t border-stone-100">
                <button onClick={() => { playClick(); setShowNewModal(false); }} className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
                  Batal
                </button>
                <button onClick={startTrip} className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center justify-center gap-2 shadow-md">
                  <Play className="w-4 h-4 fill-white" /> Mulai Perjalanan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

