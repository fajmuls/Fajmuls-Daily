import { format, differenceInMinutes, differenceInHours } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { ArrowRight, Wallet, NotebookPen, FileImage, ShieldAlert, X, TrendingUp, Map, Car, Square, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAudio } from '../hooks/useAudio';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function Dashboard() {
  const { playSuccess, playClick } = useAudio();
  const { notes, financeRecords, docs, specials, missedPrayers, trips, updateTrip, showConfirm, loading, hideAmounts } = useAppContext();
  const [showGreeting, setShowGreeting] = useLocalStorage('fajmus-show-greeting', true);
  const { isInstallable, installPWA } = usePWAInstall();

  const todayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

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
    showConfirm(`Selesaikan perjalanan dari ${trip.origin.city} ke ${trip.destination.city}?`, () => {
      updateTrip({
        ...trip,
        status: 'completed',
        endTime: Date.now(),
      });
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.getNotifications({ tag: `trip-${trip.id}` }).then(notifications => {
            notifications.forEach(n => n.close());
          });
        });
      }
      playSuccess();
    }, false, 'Selesaikan');
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

      {ongoingTrips.map(trip => (
        <div key={trip.id} className="bg-teal-50 border-2 border-teal-500 rounded-[2.5rem] overflow-hidden shadow-brutal animate-in slide-in-from-top-4 flex flex-col md:flex-row relative">
          <div className="p-6 md:w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-200 text-teal-900 text-[9px] font-black uppercase tracking-widest rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                  </span>
                  Perjalanan Aktif
                </span>
                <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">{formatDuration(trip.startTime)}</span>
              </div>

              <div className="space-y-1 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600/70">Asal &amp; Tujuan</p>
                <p className="font-serif text-3xl font-black text-teal-950 leading-tight">
                  {trip.origin.city} &rarr; {trip.destination.city}
                </p>
                <div className="text-sm font-medium text-teal-800 flex items-center gap-2">
                  <Car className="w-4 h-4" /> {trip.vehicle}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Link to="/notes/trips" className="flex-1 text-center py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-white border-2 border-teal-200 hover:border-teal-400 text-teal-800 transition-all">
                Detail
              </Link>
              <button 
                onClick={() => endTrip(trip)}
                className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-teal-900 hover:bg-black text-white transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Square className="w-4 h-4" /> Selesaikan
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 h-48 md:h-auto min-h-[200px] border-t-2 md:border-t-0 md:border-l-2 border-teal-500 bg-stone-200">
            <iframe 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${trip.origin.city} to ${trip.destination.city}`)}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
              width="100%" 
              height="100%" 
              frameBorder="0" 
              style={{ border: 0 }} 
              allowFullScreen 
            />
          </div>
        </div>
      ))}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        {/* Finance Snippet */}
        <div className="bg-paper p-8 rounded-[2.5rem] shadow-brutal border-2 border-obsidian relative overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-active transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:rotate-0 pointer-events-none">
             <Wallet className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div className="p-4 bg-stone-900 text-white rounded-2xl shadow-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <Link to="/finance" className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all shadow-sm">
              <ArrowRight className="w-5 h-5 text-stone-700" />
            </Link>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black mb-2">Estimasi Saldo</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-stone-900">
              {hideAmounts ? "Rp •••••••" : `Rp ${totalFinance.toLocaleString('id-ID')}`}
            </h2>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <TrendingUp className="w-3 h-3" /> Aktif
              </div>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">{financeRecords.length} Catatan</p>
            </div>
          </div>
        </div>

        {/* Notes Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-brutal border-2 border-obsidian hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-active transition-all">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-stone-100 rounded-2xl">
              <NotebookPen className="w-6 h-6 text-stone-700" />
            </div>
            <Link to="/notes" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-1">Status Catatan</p>
              <h2 className="text-4xl font-bold tracking-tight text-stone-900 flex items-baseline gap-2">
                {notes.length + missedPrayers.length} <span className="text-xl text-stone-400 font-normal">total</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-2 border-t border-stone-100">
              <div className="flex flex-col bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Biasa</span>
                <span className="text-lg font-bold text-stone-800">{noteCounts.normal}</span>
              </div>
              <div className="flex flex-col bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Instagram</span>
                <span className="text-lg font-bold text-stone-800">{noteCounts.ig}</span>
              </div>
              <div className="flex flex-col bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Pribadi</span>
                <span className="text-lg font-bold text-stone-800">{noteCounts.personal}</span>
              </div>
              <div className="flex flex-col bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Olahraga</span>
                <span className="text-lg font-bold text-stone-800">{noteCounts.workout}</span>
              </div>
              <div className="flex flex-col col-span-2 pt-2 border-t border-stone-50">
                <span className="text-[10px] font-bold text-accent-orange uppercase tracking-tighter">Qadha Shalat (Belum Lunas)</span>
                <span className="text-xl font-bold text-stone-900">{noteCounts.qadha}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Docs Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-brutal border-2 border-obsidian hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-active transition-all">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-stone-100 rounded-2xl">
              <FileImage className="w-6 h-6 text-stone-700" />
            </div>
            <Link to="/docs" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Dokumentasi</p>
            <h2 className="text-4xl font-bold font-sans flex items-baseline gap-2">
              {docs.length} <span className="text-xl text-stone-400 font-sans font-normal">foto</span>
            </h2>
            <p className="text-stone-500 mt-2">Tersimpan di Cloud</p>
          </div>
        </div>

        {/* Special Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-brutal border-2 border-obsidian hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-active transition-all">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <Link to="/special" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Spesial</p>
            <h2 className="text-4xl font-bold font-sans flex items-baseline gap-2">
              {specials.length} <span className="text-xl text-stone-400 font-sans font-normal">item</span>
            </h2>
            <p className="text-stone-500 mt-2">Catatan sangat penting & rahasia</p>
          </div>
        </div>
      </section>
    </div>
  );
}
