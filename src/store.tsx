import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Note, FinanceRecord } from './types';

interface AppState {
  notes: Note[];
  financeRecords: FinanceRecord[];
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addFinanceRecord: (record: FinanceRecord) => void;
  deleteFinanceRecord: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useLocalStorage<Note[]>('fajmuls-notes', []);
  const [financeRecords, setFinanceRecords] = useLocalStorage<FinanceRecord[]>('fajmuls-finance', []);

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

  return (
    <AppContext.Provider value={{
      notes, financeRecords, addNote, updateNote, deleteNote, addFinanceRecord, deleteFinanceRecord
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
