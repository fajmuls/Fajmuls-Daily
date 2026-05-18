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
        const querySnapshot = await getDocs(collection(db, "daily_docs"));
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

  const todayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  const totalFinance = financeRecords.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showGreeting && (
        <header className="space-y-2 relative group">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-stone-900">
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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        {/* Finance Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-stone-100 rounded-2xl">
              <Wallet className="w-6 h-6 text-stone-700" />
            </div>
            <Link to="/finance" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Saldo Bersih</p>
            <h2 className="text-4xl font-bold font-serif">
              Rp {totalFinance.toLocaleString('id-ID')}
            </h2>
            <p className="text-stone-500 mt-2">{financeRecords.length} catatan bulan ini</p>
          </div>
        </div>

        {/* Notes Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-stone-100 rounded-2xl">
              <NotebookPen className="w-6 h-6 text-stone-700" />
            </div>
            <Link to="/notes" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Total Catatan</p>
            <h2 className="text-4xl font-bold font-serif flex items-baseline gap-2">
              {notes.length} <span className="text-xl text-stone-400 font-sans font-normal">entri</span>
            </h2>
            <p className="text-stone-500 mt-2">Pribadi, IG, Olahraga & Qadha</p>
          </div>
        </div>

        {/* Docs Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
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
            <h2 className="text-4xl font-bold font-serif flex items-baseline gap-2">
              {docsCount} <span className="text-xl text-stone-400 font-sans font-normal">foto</span>
            </h2>
            <p className="text-stone-500 mt-2">Tersimpan di Cloud</p>
          </div>
        </div>

        {/* Special Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
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
            <h2 className="text-4xl font-bold font-serif flex items-baseline gap-2">
              {specialsCount} <span className="text-xl text-stone-400 font-sans font-normal">item</span>
            </h2>
            <p className="text-stone-500 mt-2">Catatan sangat penting & rahasia</p>
          </div>
        </div>
      </section>
    </div>
  );
}
