import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Note, FinanceRecord, MissedPrayer, DailyDoc } from './types';
import { INITIAL_MISSED_PRAYERS, INITIAL_IG_NOTES } from './data';

interface AppState {
  notes: Note[];
  financeRecords: FinanceRecord[];
  missedPrayers: MissedPrayer[];
  docs: DailyDoc[];
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addFinanceRecord: (record: FinanceRecord) => void;
  deleteFinanceRecord: (id: string) => void;
  togglePrayer: (id: string) => void;
  addDoc: (doc: DailyDoc) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useLocalStorage<Note[]>('fajmuls-notes', INITIAL_IG_NOTES);
  const [financeRecords, setFinanceRecords] = useLocalStorage<FinanceRecord[]>('fajmuls-finance', []);
  const [missedPrayers, setMissedPrayers] = useLocalStorage<MissedPrayer[]>('fajmuls-prayers', INITIAL_MISSED_PRAYERS);
  const [docs, setDocs] = useLocalStorage<DailyDoc[]>('fajmuls-docs', []);

  const addNote = (note: Note) => setNotes(prev => [note, ...prev]);
  
  const updateNote = (updatedNote: Note) => {
    setNotes(prev => {
      const index = prev.findIndex(n => n.id === updatedNote.id);
      if (index === -1) return prev;
      const newArray = [...prev];
      newArray[index] = { ...updatedNote, updatedAt: Date.now() };
      return newArray;
    });
  };

  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));
  
  const addFinanceRecord = (record: FinanceRecord) => setFinanceRecords(prev => [record, ...prev]);
  const deleteFinanceRecord = (id: string) => setFinanceRecords(prev => prev.filter(r => r.id !== id));

  const togglePrayer = (id: string) => {
    setMissedPrayers(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, completed: !p.completed, completedAt: !p.completed ? Date.now() : undefined };
      }
      return p;
    }));
  };

  const addDoc = (doc: DailyDoc) => setDocs(prev => [doc, ...prev]);

  return (
    <AppContext.Provider value={{
      notes, financeRecords, missedPrayers, docs, addNote, updateNote, deleteNote, addFinanceRecord, deleteFinanceRecord, togglePrayer, addDoc
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
