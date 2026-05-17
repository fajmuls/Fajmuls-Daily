import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, NotebookPen, FileText, Star, Mic } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useVoiceCommand } from '../hooks/useVoiceCommand';
import { cn } from '../lib/utils';
import { AppProvider } from '../store';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Wallet, label: 'Finance', path: '/finance' },
  { icon: NotebookPen, label: 'Daily Notes', path: '/notes' },
  { icon: FileText, label: 'Docs', path: '/docs' },
  { icon: Star, label: 'Special', path: '/special' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { playClick, playSuccess } = useAudio();
  const navigate = useNavigate();

  const handleVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('finance') || lower.includes('money')) {
      navigate('/finance');
      playSuccess();
    } else if (lower.includes('notes') || lower.includes('note')) {
      navigate('/notes');
      playSuccess();
    } else if (lower.includes('docs') || lower.includes('document')) {
      navigate('/docs');
      playSuccess();
    } else if (lower.includes('special')) {
      navigate('/special');
      playSuccess();
    } else if (lower.includes('dashboard') || lower.includes('home')) {
      navigate('/');
      playSuccess();
    }
  };

  const { isListening, startListening, stopListening } = useVoiceCommand(handleVoiceCommand);

  return (
    <div className="flex h-screen w-full bg-cream font-sans text-stone-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200 bg-paper">
        <div className="p-6">
          <h1 className="font-serif text-2xl font-bold tracking-tight">Fajmul's Daily</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
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
            onClick={isListening ? stopListening : startListening}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
              isListening ? "bg-accent-orange text-white animate-pulse" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            )}
          >
            <Mic className="w-5 h-5" />
            {isListening ? "Listening..." : "Voice Command"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-paper border-b border-stone-200">
          <h1 className="font-serif text-xl font-bold">Fajmul's</h1>
          <button 
            onClick={isListening ? stopListening : startListening}
            className={cn("p-2 rounded-full", isListening ? "bg-accent-orange text-white animate-pulse" : "bg-stone-100")}
          >
            <Mic className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>

        {/* Mobile Bottom Bar */}
        <nav className="md:hidden flex items-center justify-around bg-paper border-t border-stone-200 pb-safe">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={playClick}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 p-3 flex-1",
                isActive ? "text-stone-900 font-bold" : "text-stone-500"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
