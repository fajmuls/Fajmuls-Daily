import { format, differenceInMinutes, differenceInHours, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { ArrowRight, Wallet, NotebookPen, FileImage, ShieldAlert, X, TrendingUp, Car, Square, Download, Navigation as LucideNavigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAudio } from '../hooks/useAudio';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { EndTripModal } from '../components/notes/EndTripModal';
import { TripSummary } from '../types';
import { MonthlyWrapped } from '../components/dashboard/MonthlyWrapped';
import { TripTrackingMap } from '../components/dashboard/TripTrackingMap';
import { APIProvider } from '@vis.gl/react-google-maps';

// A simple simulated contribution calendar mapping days to boolean
function generateHabitGrid(notes: any[]) {
  // Activity simulation logic
  return Array.from({ length: 28 }).map((_, i) => {
    return Math.random() > 0.4; 
  });
}

export function Dashboard() {
  const { playSuccess, playClick } = useAudio();
  const { notes, financeRecords, docs, specials, missedPrayers, trips, updateTrip, showConfirm, loading, hideAmounts, addFinanceRecord } = useAppContext();
  const [showGreeting, setShowGreeting] = useLocalStorage('fajmus-show-greeting', true);
  const { isInstallable, installPWA } = usePWAInstall();
  const [tripToEnd, setTripToEnd] = useState<TripSummary | null>(null);
  const [showWrapped, setShowWrapped] = useState(false);

  const todayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });
  const habitGrid = useMemo(() => generateHabitGrid(notes), [notes]);
  const streak = habitGrid.slice(-7).filter(x => x).length;

  const totalFinance = financeRecords.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const noteCounts = {
    normal: notes.filter(n => n.type === 'normal').length,
    ig: notes.filter(n => n.type === 'ig').length,
    personal: notes.filter(n => n.type === 'personal').length,
    workout: notes.filter(n => n.type === 'workout').length,
    qadha: missedPrayers.length
  };

  const ongoingTrips = trips.filter(t => t.status === 'ongoing');

  const endTrip = (trip: any) => {
    setTripToEnd(trip);
  };

  const handleEndTrip = (tripId: string, details: { 
    tollCost: number; 
    fuelCost: number; 
    conditions: string[]; 
    receipts: { id: string; url: string; name: string }[];
    finalDestination?: { city: string; detail: string };
  }) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    updateTrip({
      ...trip,
      status: 'completed',
      endTime: Date.now(),
      tollCost: details.tollCost,
      fuelCost: details.fuelCost,
      conditions: details.conditions,
      receipts: details.receipts,
      ...(details.finalDestination && { destination: details.finalDestination })
    });

    if (details.tollCost > 0 || details.fuelCost > 0) {
      if (details.fuelCost > 0) {
        addFinanceRecord({
          id: Date.now().toString(),
          amount: details.fuelCost,
          type: 'expense',
          category: 'Transport',
          note: `Bensin ${trip.origin.city} - ${trip.destination.city}`,
          createdAt: Date.now()
        });
      }
      if (details.tollCost > 0) {
        addFinanceRecord({
          id: (Date.now() + 1).toString(),
          amount: details.tollCost,
          type: 'expense',
          category: 'Transport',
          note: `Tol ${trip.origin.city} - ${trip.destination.city}`,
          createdAt: Date.now() + 1
        });
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications({ tag: `trip-${trip.id}` }).then(notifications => {
          notifications.forEach(n => n.close());
        });
      });
    }
    playSuccess();
    setTripToEnd(null);
  };

  const formatDuration = (start: number) => {
    const mins = differenceInMinutes(Date.now(), start);
    const hrs = differenceInHours(Date.now(), start);
    if (hrs > 0) return `${hrs}j ${mins % 60}m berlalu`;
    return `${mins} menit berlalu`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg ring-4 ring-stone-100">
             <Wallet className="w-6 h-6" />
          </div>
          <div className="font-sans text-2xl font-black tracking-tight text-stone-900">Fajmuls<span className="text-stone-300">Daily</span></div>
        </div>
        
        {isInstallable && (
          <button 
            onClick={() => { playClick(); installPWA(); }}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all"
          >
            <Download className="w-4 h-4" /> Install App
          </button>
        )}
      </div>

      {showGreeting && (
        <header className="space-y-2 relative group">
          <h1 className="font-sans text-5xl md:text-7xl font-bold tracking-tight text-stone-900">
            Selamat Siang.
          </h1>
          <p className="text-xl text-stone-500 font-medium tracking-wide">
            {todayDate}
          </p>
          <button 
             onClick={() => setShowGreeting(false)} 
             className="absolute top-0 right-0 p-2 text-stone-300 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity"
             title="Sembunyikan Salam"
          >
             <X className="w-5 h-5" />
          </button>
        </header>
      )}
      
      {!showGreeting && (
         <button 
           onClick={() => setShowGreeting(true)}
           className="text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-colors"
         >
           Tampilkan Salam +
         </button>
      )}

      {/* Habit Streak & Wrapped */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white border-2 border-stone-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <TrendingUp className="w-5 h-5 text-emerald-500" />
                 <h3 className="font-bold text-stone-900 uppercase tracking-widest text-xs">Konsistensi</h3>
              </div>
              <p className="text-3xl font-black text-stone-900">{streak} <span className="text-sm font-medium text-stone-500">hari berturut-turut</span></p>
           </div>
           <div className="flex gap-1 mt-6">
              {habitGrid.map((isActive, i) => (
                 <div key={i} className={`flex-1 aspect-square rounded-sm ${isActive ? 'bg-emerald-400' : 'bg-stone-100'} transition-colors duration-500`} />
              ))}
           </div>
         </div>
         
         <div 
           onClick={() => setShowWrapped(true)}
           className="bg-stone-900 rounded-[2rem] p-6 shadow-brutal border-2 border-stone-900 text-white cursor-pointer hover:-translate-y-1 hover:shadow-brutal-active transition-all group relative overflow-hidden"
         >
           <div className="absolute -right-4 -top-4 opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:rotate-0">
             <Wallet className="w-48 h-48" />
           </div>
           <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Edisi {format(new Date(), 'MMMM', { locale: id })}</p>
                 <h3 className="text-2xl font-serif font-black tracking-tight">Cek Kilas Balik Bulan Ini</h3>
              </div>
              <div className="flex items-center justify-between mt-6">
                 <p className="text-xs font-medium text-stone-400">Tap untuk membuka &rarr;</p>
              </div>
           </div>
         </div>
      </div>

      {showWrapped && <MonthlyWrapped onClose={() => setShowWrapped(false)} />}

      {ongoingTrips.map(trip => (
        <div key={trip.id} className="bg-teal-50 border-2 border-teal-500 rounded-[2.5rem] overflow-hidden shadow-brutal animate-in slide-in-from-top-4 flex flex-col md:flex-row relative">
          <div className="p-6 md:w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-200 text-teal-900 text-[9px] font-black uppercase tracking-widest rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                  </span>
                  Melacak Perjalanan
                </span>
                <span className="text-teal-700 text-[10px] font-mono font-black bg-white/50 px-3 py-1 rounded-lg border border-teal-100">{formatDuration(trip.startTime)}</span>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex flex-col gap-1">
                   <p className="text-[8px] font-black uppercase tracking-widest text-teal-600/70">Waktu Mulai Perjalanan</p>
                   <p className="text-xl font-bold text-teal-950">{format(trip.startTime, 'HH:mm - d MMM yyyy')}</p>
                </div>

                <div className="space-y-2 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200 before:border-r-2 before:border-dotted before:border-teal-300">
                  <div className="relative">
                    <div className="absolute -left-[24.5px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-teal-500 z-10" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-teal-600/50">Asal</p>
                    <p className="text-lg font-black text-teal-950 truncate">{trip.origin.city}</p>
                    <p className="text-[10px] text-teal-600 font-medium truncate">{trip.origin.detail}</p>
                  </div>
                  <div className="relative pt-4">
                    <div className="absolute -left-[24.5px] top-5.5 w-4 h-4 rounded-full bg-teal-500 border-4 border-white z-10" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-teal-600/50">Tujuan</p>
                    <p className="text-lg font-black text-teal-950 truncate">{trip.destination.city}</p>
                    <p className="text-[10px] text-teal-600 font-medium truncate">{trip.destination.detail}</p>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 border border-teal-200 rounded-xl text-teal-800 font-bold text-xs">
                  <Car className="w-4 h-4" /> {trip.vehicle}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/notes/trips" className="flex-1 text-center py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white border-2 border-teal-200 hover:border-teal-400 text-teal-800 transition-all">
                Detail Transit
              </Link>
              <button 
                onClick={() => endTrip(trip)}
                className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-teal-900 hover:bg-black text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200 active:translate-y-px"
              >
                <Square className="w-4 h-4" /> Selesaikan
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 h-80 md:h-auto min-h-[350px] border-t-2 md:border-t-0 md:border-l-2 border-teal-500 bg-stone-100 overflow-hidden">
             <APIProvider apiKey={process.env.GOOGLE_MAPS_PLATFORM_KEY || ''}>
               <TripTrackingMap 
                 origin={trip.origin} 
                 destination={trip.destination} 
                 ongoing={true} 
               />
             </APIProvider>
          </div>
        </div>
      ))}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        {/* Finance Snippet */}
        <div className="bg-paper p-8 rounded-[2.5rem] shadow-brutal border-2 border-obsidian relative overflow-hidden group hover:-translate-y-1 hover:shadow-brutal-active transition-all">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="p-4 bg-stone-900 text-white rounded-2xl shadow-xl flex items-center gap-3">
              <Wallet className="w-6 h-6" />
              <span className="font-bold text-xs uppercase tracking-widest leading-none mt-0.5">Keuangan</span>
            </div>
            <Link to="/finance" className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all shadow-sm">
              <ArrowRight className="w-5 h-5 text-stone-700" />
            </Link>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black mb-2">Total Saldo Aktif</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900 bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600">
                {hideAmounts ? "Rp •••••••" : `Rp ${totalFinance.toLocaleString('id-ID')}`}
              </h2>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-200">
                  <TrendingUp className="w-3 h-3" /> Transaksi Berjalan
                </div>
                <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">{financeRecords.length} Catatan Bulan Ini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Snippet */}
        <div className="bg-paper p-8 rounded-[2.5rem] shadow-brutal border-2 border-obsidian hover:-translate-y-1 hover:shadow-brutal-active transition-all">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="p-4 bg-stone-900 text-white rounded-2xl shadow-xl flex items-center gap-3">
              <NotebookPen className="w-6 h-6" />
              <span className="font-bold text-xs uppercase tracking-widest leading-none mt-0.5">Catatan</span>
            </div>
            <Link to="/notes" className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all shadow-sm">
              <ArrowRight className="w-5 h-5 text-stone-700" />
            </Link>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black mb-2">Total Seluruh Catatan</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900">
                {notes.length + missedPrayers.length} <span className="text-xl text-stone-400 font-normal">Item</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-stone-100">
              <div className="flex flex-col bg-stone-50 border border-stone-200 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mb-1">Harian</span>
                <span className="text-2xl font-black text-stone-800">{noteCounts.normal}</span>
              </div>
              <div className="flex flex-col bg-stone-50 border border-stone-200 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mb-1">Instagram</span>
                <span className="text-2xl font-black text-stone-800">{noteCounts.ig}</span>
              </div>
              <div className="flex flex-col bg-stone-50 border border-stone-200 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mb-1">Pribadi</span>
                <span className="text-2xl font-black text-stone-800">{noteCounts.personal}</span>
              </div>
              <div className="flex flex-col bg-stone-50 border border-stone-200 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mb-1">Olahraga</span>
                <span className="text-2xl font-black text-stone-800">{noteCounts.workout}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-1 md:col-span-2">
          {/* Docs Snippet */}
          <div className="bg-paper p-8 rounded-[2.5rem] shadow-brutal border-2 border-obsidian hover:-translate-y-1 hover:shadow-brutal-active transition-all">
            <div className="flex justify-between items-start mb-12">
              <div className="p-4 bg-stone-900 text-white rounded-2xl shadow-xl flex items-center gap-3">
                <FileImage className="w-6 h-6" />
                <span className="font-bold text-xs uppercase tracking-widest leading-none mt-0.5">Dokumen</span>
              </div>
              <Link to="/docs" className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all shadow-sm">
                <ArrowRight className="w-5 h-5 text-stone-700" />
              </Link>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black mb-2">Penyimpanan Cloud</p>
              <h2 className="text-4xl md:text-5xl font-black text-stone-900">
                {docs.length} <span className="text-xl text-stone-400 font-sans font-normal">berkas</span>
              </h2>
            </div>
          </div>

          {/* Special Snippet */}
          <div className="bg-paper p-8 rounded-[2.5rem] shadow-brutal border-2 border-red-500 hover:-translate-y-1 hover:shadow-brutal-active transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:rotate-0 pointer-events-none text-red-500">
               <ShieldAlert className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="p-4 bg-red-500 text-white rounded-2xl shadow-xl flex items-center gap-3">
                <ShieldAlert className="w-6 h-6" />
                <span className="font-bold text-xs uppercase tracking-widest leading-none mt-0.5">Spesial</span>
              </div>
              <Link to="/special" className="p-3 bg-red-50 hover:bg-red-100 rounded-2xl transition-all shadow-sm">
                <ArrowRight className="w-5 h-5 text-red-600" />
              </Link>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-black mb-2">Catatan Rahasia</p>
              <h2 className="text-4xl md:text-5xl font-black text-stone-900">
                {specials.length} <span className="text-xl text-stone-400 font-sans font-normal">item terkunci</span>
              </h2>
            </div>
          </div>
        </div>
      </section>

      <EndTripModal 
        trip={tripToEnd} 
        onClose={() => setTripToEnd(null)} 
        onEndTrip={handleEndTrip} 
      />
    </div>
  );
}
