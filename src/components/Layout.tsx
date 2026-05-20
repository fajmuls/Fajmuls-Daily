import { ReactNode, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, NotebookPen, FileText, Star, Mic, LogOut, Search, X, Command, User as UserIcon } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useVoiceCommand } from '../hooks/useVoiceCommand';
import { useAuth } from './AuthWrapper';
import { cn } from '../lib/utils';

const desktopNavItems = [
  { icon: LayoutDashboard, label: 'Beranda', path: '/' },
  { icon: Wallet, label: 'Keuangan', path: '/finance' },
  { icon: NotebookPen, label: 'Catatan', path: '/notes' },
  { icon: FileText, label: 'Dokumen', path: '/docs' },
  { icon: Star, label: 'Spesial', path: '/special' },
];

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Beranda', path: '/' },
  { icon: Wallet, label: 'Keuangan', path: '/finance' },
  { icon: Star, label: 'Spesial', path: '/special' }, // Move special here
  { icon: NotebookPen, label: 'Catatan', path: '/notes' },
  { icon: FileText, label: 'Dokumen', path: '/docs' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { playClick, playSuccess } = useAudio();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Force redirect to home on initial load/refresh as requested
    if (window.location.hash !== '#/') {
      navigate('/');
    }
  }, []);

  const handleVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    console.log("Mendeteksi suara:", lower);
    
    if (lower.includes('keuangan') || lower.includes('uang')) {
      navigate('/finance');
      playSuccess();
    } else if (lower.includes('ig') || lower.includes('instagram')) {
      navigate('/notes/ig-list');
      playSuccess();
    } else if (lower.includes('spesial') || lower.includes('khusus')) {
      navigate('/special');
      playSuccess();
    } else if (lower.includes('dokumen') || lower.includes('foto')) {
      navigate('/docs');
      playSuccess();
    } else if (lower.includes('catatan') || lower.includes('tulis')) {
      navigate('/notes'); // or notes list depending on intent
      playSuccess();
    } else if (lower.includes('beranda') || lower.includes('dashboard') || lower.includes('home')) {
      navigate('/');
      playSuccess();
    }
  };

  const { isListening, startListening, stopListening } = useVoiceCommand(handleVoiceCommand);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const allRoutes = [
      { label: 'Keuangan', path: '/finance', keywords: 'uang saldo transaksi dompet' },
      { label: 'Catatan', path: '/notes', keywords: 'tulis note draft' },
      { label: 'Catatan IG', path: '/notes/ig-list', keywords: 'instagram lagu owner' },
      { label: 'Dokumen', path: '/docs', keywords: 'file foto pdf' },
      { label: 'Input Keuangan', path: '/finance', keywords: 'tambah setor tarik' },
      { label: 'Spesial', path: '/special', keywords: 'fitur khusus' },
    ];
    return allRoutes.filter(r => r.label.toLowerCase().includes(q) || r.keywords.includes(q)).slice(0, 5);
  }, [searchQuery]);

  const toggleVoice = () => {
     if (isListening) {
        stopListening();
        setVoiceHint(null);
     } else {
        setVoiceHint("Sebutkan perintah (Cth: 'Keuangan', 'IG', 'Dashboard')");
        startListening();
        setTimeout(() => setVoiceHint(null), 5000);
     }
  };

  const UserProfile = ({ compact = false }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="relative">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); playClick(); }}
          className={cn("flex items-center gap-3 transition-all", compact ? "hover:scale-105" : "p-4 mx-4 mb-4 bg-stone-100 rounded-2xl border border-stone-200 hover:bg-stone-200")}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className={cn("rounded-full border border-stone-200 object-cover shadow-sm", compact ? "w-8 h-8" : "w-10 h-10")} />
          ) : (
            <div className={cn("bg-stone-200 flex items-center justify-center rounded-full text-stone-500", compact ? "w-8 h-8" : "w-10 h-10")}>
               <UserIcon className={compact ? "w-4 h-4" : "w-5 h-5"} />
            </div>
          )}
          {!compact && (
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold text-sm text-stone-900 truncate">{user?.displayName || 'Pengguna'}</p>
              <p className="text-xs text-stone-500 truncate">{user?.email}</p>
            </div>
          )}
        </button>

        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: compact ? 10 : -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: compact ? 10 : -10 }}
                className={cn(
                  "absolute z-50 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 w-48 overflow-hidden",
                  compact ? "top-full right-0 mt-2" : "bottom-full left-4 mb-2"
                )}
              >
                 <div className="px-3 py-2 border-b border-stone-100 md:hidden">
                    <p className="font-bold text-xs text-stone-900 truncate">{user?.displayName}</p>
                    <p className="text-[10px] text-stone-500 truncate">{user?.email}</p>
                 </div>
                 <button 
                   onClick={() => { setShowMenu(false); navigate('/finance'); playClick(); }}
                   className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
                 >
                    <Wallet className="w-4 h-4" />
                    Setelan Keuangan
                 </button>
                 <button 
                   onClick={() => { setShowMenu(false); logout(); }}
                   className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                 >
                    <LogOut className="w-4 h-4" />
                    Keluar
                 </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-cream font-sans text-stone-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200 bg-paper">
        <div className="p-6 flex items-center gap-3">
          <img src="https://files.catbox.moe/c1ebqe.png" alt="Logo" className="w-10 h-10 object-contain" />
          <h1 className="font-serif text-2xl font-bold tracking-tight text-accent-orange">Fajmuls Daily</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 pt-4">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={playClick}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
                isActive 
                  ? "bg-stone-900 text-cream shadow-sm" 
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-200">
          <button 
            onClick={toggleVoice}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm",
              isListening ? "bg-accent-orange text-white animate-pulse shadow-sm" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            )}
          >
            <Mic className="w-4 h-4" />
            {isListening ? "Mendengarkan..." : "Perintah Suara"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-paper/50 backdrop-blur-md border-b border-stone-100 shrink-0">
           <div className="flex-1 max-w-md relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari fitur... (Cth: Keuangan)"
                  className="w-full bg-stone-100/50 border border-transparent focus:border-stone-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:shadow-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {searchQuery.trim() && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white border border-stone-200 rounded-3xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-stone-50 bg-stone-50/50 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-2">Hasil Pencarian</span>
                       <Command className="w-3 h-3 text-stone-300" />
                    </div>
                    <div className="p-2">
                       {searchResults.length > 0 ? searchResults.map((res, i) => (
                         <button 
                           key={i}
                           onClick={() => { navigate(res.path); setSearchQuery(""); playClick(); }}
                           className="w-full text-left px-4 py-3 hover:bg-stone-50 rounded-xl flex items-center justify-between group transition-all"
                         >
                            <span className="font-bold text-stone-700 group-hover:text-stone-900">{res.label}</span>
                            <div className="w-6 h-6 bg-stone-100 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Search className="w-3 h-3 text-stone-400" />
                            </div>
                         </button>
                       )) : (
                         <div className="p-8 text-center text-stone-400 text-xs italic">Tidak ada fitur yang cocok.</div>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
           <UserProfile compact />
        </header>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-paper border-b border-stone-200">
          <div className="flex items-center gap-3">
             <img src="https://files.catbox.moe/c1ebqe.png" alt="Logo" className="w-8 h-8 object-contain" />
             <h1 className="font-serif text-lg font-bold text-accent-orange">Fajmuls Daily</h1>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setShowSearch(!showSearch)} className="p-2 bg-stone-100 rounded-full text-stone-600">
                <Search className="w-5 h-5" />
             </button>
             <UserProfile compact />
             <button 
               onClick={toggleVoice}
               className={cn("p-2 rounded-full", isListening ? "bg-accent-orange text-white animate-pulse shadow-sm" : "bg-stone-100 text-stone-600")}
             >
               <Mic className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-[73px] left-0 right-0 z-40 bg-white border-b border-stone-200 p-4 shadow-lg"
            >
               <div className="relative">
                  <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Apa yang ingin Anda cari?"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 outline-none"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
               </div>
               {searchQuery.trim() && (
                 <div className="mt-4 space-y-2">
                    {searchResults.map((res, i) => (
                      <button 
                        key={i}
                        onClick={() => { navigate(res.path); setShowSearch(false); setSearchQuery(""); playClick(); }}
                        className="w-full flex items-center justify-between p-4 bg-stone-50 rounded-2xl active:bg-stone-100"
                      >
                         <span className="font-bold">{res.label}</span>
                         <Search className="w-4 h-4 text-stone-400" />
                      </button>
                    ))}
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-4 md:p-8 pb-32 md:pb-8">
          {children}
        </div>

        {/* Voice Callout */}
        {voiceHint && (
           <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-stone-900/90 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
              <div className="w-2 h-2 bg-accent-orange rounded-full animate-ping" />
              {voiceHint}
           </div>
        )}

        {/* Mobile Bottom Bar (Smaller icons & fonts) */}
        <nav className="md:hidden flex items-center justify-around bg-paper border-t border-stone-200 fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,16px)] pt-1 px-1">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={playClick}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 p-1 flex-1 rounded-xl transition-colors",
                isActive ? "text-stone-900 font-bold bg-stone-100" : "text-stone-500 hover:bg-stone-50"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-4 h-4", isActive ? "scale-110" : "")} />
                  <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
