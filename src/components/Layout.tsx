import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, NotebookPen, FileText, Star, Mic, LogOut, User as UserIcon } from 'lucide-react';
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
  const { user, profile, logout } = useAuth();

  const handleVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    console.log("Mendeteksi suara:", lower);
    
    // 1. Navigation Commands
    if (lower.includes('keuangan') || lower.includes('uang')) {
      navigate('/finance');
      playSuccess();
      return;
    } else if (lower.includes('ig') || lower.includes('instagram')) {
      navigate('/notes/ig-list');
      playSuccess();
      return;
    } else if (lower.includes('spesial') || lower.includes('khusus')) {
      navigate('/special');
      playSuccess();
      return;
    } else if (lower.includes('dokumen') || lower.includes('foto')) {
      navigate('/docs');
      playSuccess();
      return;
    } else if (lower.includes('catatan') || lower.includes('tulis')) {
      navigate('/notes');
      playSuccess();
      return;
    } else if (lower.includes('beranda') || lower.includes('dashboard') || lower.includes('home')) {
      navigate('/');
      playSuccess();
      return;
    }

    // 2. Smart Element Detection (Buttons/Inputs)
    // Mencari button yang teksnya mirip dengan perintah
    const buttons = document.querySelectorAll('button, a, label');
    let found = false;
    
    buttons.forEach((el) => {
       const elText = el.textContent?.toLowerCase() || '';
       if (elText && lower.includes(elText) && elText.length > 2) {
          (el as HTMLElement).click();
          playSuccess();
          found = true;
       }
    });

    if (found) return;

    // 3. Fallback to general search or ignore
    console.log("Perintah tidak dikenali:", lower);
  };

  const { isListening, startListening, stopListening } = useVoiceCommand(handleVoiceCommand);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);

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

  const UserProfile = ({ compact = false }) => (
    <div className={cn("flex items-center gap-3", compact ? "" : "p-4 mx-4 mb-4 bg-stone-100 rounded-2xl border border-stone-200")}>
      {(profile?.photoURL || user?.photoURL) ? (
        <img src={profile?.photoURL || user?.photoURL} alt="Profile" className={cn("rounded-full border border-stone-200 object-cover", compact ? "w-8 h-8" : "w-10 h-10")} />
      ) : (
        <div className={cn("bg-stone-200 flex items-center justify-center rounded-full text-stone-500", compact ? "w-8 h-8" : "w-10 h-10")}>
           <UserIcon className={compact ? "w-4 h-4" : "w-5 h-5"} />
        </div>
      )}
      {!compact && (
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-stone-900 truncate">{profile?.displayName || user?.displayName || 'Pengguna'}</p>
          <p className="text-xs text-stone-500 truncate">{profile?.email || user?.email}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-cream font-sans text-stone-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200 bg-paper">
        <div className="p-6">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-accent-orange">Fajmus Daily</h1>
        </div>
        
        <UserProfile />
        
        <nav className="flex-1 px-4 space-y-2">
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

        <div className="p-4 border-t border-stone-200 space-y-2">
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
          
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm bg-red-50 text-red-600 hover:bg-red-100"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-paper border-b border-stone-200">
          <div className="flex items-center gap-3">
             <UserProfile compact />
             <h1 className="font-serif text-lg font-bold text-accent-orange">Fajmus Daily</h1>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={toggleVoice}
               className={cn("p-2 rounded-full", isListening ? "bg-accent-orange text-white animate-pulse" : "bg-stone-100 text-stone-600")}
             >
               <Mic className="w-5 h-5" />
             </button>
             <button 
               onClick={logout}
               className="p-2 rounded-full bg-red-50 text-red-600"
             >
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </header>

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
