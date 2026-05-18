import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { ArrowRight, Wallet, NotebookPen, FileImage, ShieldAlert, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Dashboard() {
  const { notes, financeRecords } = useAppContext();
  const [docsCount, setDocsCount] = useState(0);
  const [specialsCount, setSpecialsCount] = useState(0);
  const [showGreeting, setShowGreeting] = useLocalStorage('fajmus-show-greeting', true);
  
  useEffect(() => {
    // get firestore docs count
    const fetchDocsCount = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "docs"));
        setDocsCount(querySnapshot.size);
      } catch (e) {
        console.error("Error fetching docs count", e);
      }
    };
    fetchDocsCount();

    // get specials count from localstorage
    const localSpecials = localStorage.getItem('fajmuls-specials');
    if (localSpecials) {
      try {
        const parsed = JSON.parse(localSpecials);
        setSpecialsCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting('Selamat Malam');
    else if (hour < 11) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 19) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  const todayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  const totalFinance = financeRecords.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {showGreeting && (
        <header className="relative group pt-4">
          <div className="absolute -left-4 top-0 w-2 h-20 bg-accent-gold rounded-full" />
          <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tighter text-trip-brown leading-none">
            {greeting}.
          </h1>
          <p className="text-xl text-stone-500 font-medium tracking-wide mt-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent-orange rounded-full" />
            {todayDate}
          </p>
          <button 
             onClick={() => setShowGreeting(false)} 
             className="absolute top-4 right-0 p-2 text-stone-300 hover:text-trip-brown opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:rotate-90"
             title="Sembunyikan Salam"
          >
             <X className="w-6 h-6" />
          </button>
        </header>
      )}
      
      {!showGreeting && (
         <button 
           onClick={() => setShowGreeting(true)}
           className="px-4 py-2 bg-stone-100 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-trip-brown hover:text-white transition-all shadow-sm"
         >
           Show Welcome +
         </button>
      )}

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Finance Snippet - Large Area */}
        <div className="md:col-span-8 bg-trip-brown text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group min-h-[320px] flex flex-col justify-between">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent-orange/20 rounded-full blur-3xl group-hover:bg-accent-orange/30 transition-all duration-700" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
              <Wallet className="w-7 h-7 text-accent-yellow" />
            </div>
            <Link to="/finance" className="flex items-center gap-2 text-white/50 hover:text-white transition-all group/btn">
               <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">Rincian</span>
               <div className="p-3 bg-white/10 rounded-full group-hover/btn:bg-accent-orange transition-colors">
                  <ArrowRight className="w-5 h-5" />
               </div>
            </Link>
          </div>

          <div className="relative z-10 pt-10">
            <p className="text-sm uppercase tracking-[0.25em] text-white/40 font-black mb-3">Saldo Bersih Saat Ini</p>
            <h2 className="text-5xl md:text-7xl font-bold font-serif tracking-tight">
              <span className="text-accent-gold mr-2 text-3xl">Rp</span>
              {totalFinance.toLocaleString('id-ID')}
            </h2>
            <div className="mt-8 flex items-center gap-6">
               <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Transaksi</span>
                  <span className="font-bold text-xl">{financeRecords.length}</span>
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Status</span>
                  <span className="font-bold text-accent-green text-sm flex items-center gap-1 uppercase">Aktif <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" /></span>
               </div>
            </div>
          </div>
        </div>

        {/* Notes Snippet - Smaller but Vibrant */}
        <div className="md:col-span-4 bg-accent-gold p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <NotebookPen className="w-7 h-7 text-trip-brown" />
            </div>
            <Link to="/notes" className="p-3 bg-trip-brown text-white rounded-full hover:scale-110 transition-transform">
               <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-trip-brown/50 font-black mb-1">Total Entri</p>
            <h2 className="text-6xl font-bold font-serif text-trip-brown">
              {notes.length}
            </h2>
            <p className="text-trip-brown/60 font-bold text-sm mt-2">Pribadi, IG & Olahraga</p>
          </div>
        </div>

        {/* Docs Snippet */}
        <div className="md:col-span-6 bg-white p-8 rounded-[2.5rem] shadow-lg border border-stone-100 flex items-center justify-between group hover:shadow-xl transition-all">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-stone-100 rounded-3xl flex items-center justify-center group-hover:bg-trip-moss group-hover:text-white transition-all duration-500">
               <FileImage className="w-8 h-8" />
            </div>
            <div>
               <p className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400">Arsip Digital</p>
               <h3 className="text-3xl font-bold text-stone-900">{docsCount} Dokumen</h3>
            </div>
          </div>
          <Link to="/docs" className="w-12 h-12 flex items-center justify-center bg-stone-50 rounded-2xl hover:bg-trip-brown hover:text-white transition-all group-hover:rotate-45">
             <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Special Snippet */}
        <div className="md:col-span-6 bg-[#FEF2F2] p-8 rounded-[2.5rem] shadow-lg border border-red-100 flex items-center justify-between group hover:bg-stone-900 hover:text-white transition-all duration-500">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center border border-red-200 group-hover:bg-red-500 group-hover:text-white group-hover:rotate-12 transition-all">
               <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
               <p className="text-[10px] uppercase font-black tracking-[0.2em] text-red-300 group-hover:text-red-400">Zona Rahasia</p>
               <h3 className="text-3xl font-bold">{specialsCount} Vault</h3>
            </div>
          </div>
          <Link to="/special" className="w-12 h-12 flex items-center justify-center bg-stone-900 text-white rounded-2xl hover:bg-accent-orange transition-all group-hover:bg-white group-hover:text-stone-900 border border-stone-800">
             <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
