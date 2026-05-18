import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Note, FinanceRecord, MissedPrayer, DailyDoc } from './types';
import { useAuth } from './components/AuthWrapper';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, where, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';

interface AppState {
  notes: Note[];
  financeRecords: FinanceRecord[];
  missedPrayers: MissedPrayer[];
  docs: DailyDoc[];
  specials: any[];
  loading: boolean;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addFinanceRecord: (record: FinanceRecord) => void;
  deleteFinanceRecord: (id: string) => void;
  togglePrayer: (id: string) => void;
  addMissedPrayer: (prayer: MissedPrayer) => void;
  deleteMissedPrayer: (id: string) => void;
  addDoc: (doc: DailyDoc) => void;
  addSpecial: (special: any) => void;
  deleteSpecial: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [missedPrayers, setMissedPrayers] = useState<MissedPrayer[]>([]);
  const [docs, setDocs] = useState<DailyDoc[]>([]);
  const [specials, setSpecials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setFinanceRecords([]);
      setMissedPrayers([]);
      setDocs([]);
      setSpecials([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const qNotes = query(collection(db, 'notes'), where('userId', '==', user.uid));
    const unsubNotes = onSnapshot(qNotes, (snap) => {
      setNotes(snap.docs.map(doc => doc.data() as Note));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'notes'));

    const qFinance = query(collection(db, 'finance'), where('userId', '==', user.uid));
    const unsubFinance = onSnapshot(qFinance, (snap) => {
      setFinanceRecords(snap.docs.map(doc => doc.data() as FinanceRecord));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'finance'));

    const qPrayers = query(collection(db, 'prayers'), where('userId', '==', user.uid));
    const unsubPrayers = onSnapshot(qPrayers, (snap) => {
      setMissedPrayers(snap.docs.map(doc => doc.data() as MissedPrayer));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'prayers'));

    const qDocs = query(collection(db, 'docs'), where('userId', '==', user.uid));
    const unsubDocs = onSnapshot(qDocs, (snap) => {
      setDocs(snap.docs.map(doc => doc.data() as DailyDoc));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'docs'));

    const qSpecials = query(collection(db, 'specials'), where('userId', '==', user.uid));
    const unsubSpecials = onSnapshot(qSpecials, (snap) => {
      setSpecials(snap.docs.map(doc => doc.data()));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'specials'));

    return () => {
      unsubNotes();
      unsubFinance();
      unsubPrayers();
      unsubDocs();
      unsubSpecials();
    };
  }, [user]);

  const addNote = async (note: Note) => {
    if (!user) return;
    try {
      const data = { ...note, userId: user.uid };
      await setDoc(doc(db, 'notes', note.id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'notes');
    }
  };
  
  const updateNote = async (updatedNote: Note) => {
    if (!user) return;
    try {
      const { id, ...data } = updatedNote;
      await updateDoc(doc(db, 'notes', id), { ...data, userId: user.uid, updatedAt: Date.now() });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'notes');
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'notes');
    }
  };
  
  const addFinanceRecord = async (record: FinanceRecord) => {
    if (!user) return;
    try {
      const data = { ...record, userId: user.uid };
      await setDoc(doc(db, 'finance', record.id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'finance');
    }
  };

  const deleteFinanceRecord = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'finance', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'finance');
    }
  };

  const togglePrayer = async (id: string) => {
    if (!user) return;
    try {
      const prayer = missedPrayers.find(p => p.id === id);
      if (prayer) {
        await updateDoc(doc(db, 'prayers', id), {
          completed: !prayer.completed,
          completedAt: !prayer.completed ? Date.now() : null
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'prayers');
    }
  };

  const addMissedPrayer = async (prayer: MissedPrayer) => {
    if (!user) return;
    try {
      const data = { ...prayer, userId: user.uid };
      await setDoc(doc(db, 'prayers', prayer.id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'prayers');
    }
  };

  const deleteMissedPrayer = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'prayers', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'prayers');
    }
  };

  const addDoc = async (dailyDoc: DailyDoc) => {
    if (!user) return;
    try {
      const data = { ...dailyDoc, userId: user.uid };
      await setDoc(doc(db, 'docs', dailyDoc.id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'docs');
    }
  };

  const addSpecial = async (special: any) => {
    if (!user) return;
    try {
      const data = { ...special, userId: user.uid };
      await setDoc(doc(db, 'specials', special.id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'specials');
    }
  };

  const deleteSpecial = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'specials', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'specials');
    }
  };

  return (
    <AppContext.Provider value={{
      notes, financeRecords, missedPrayers, docs, specials, loading, addNote, updateNote, deleteNote, addFinanceRecord, deleteFinanceRecord, togglePrayer, addMissedPrayer, deleteMissedPrayer, addDoc, addSpecial, deleteSpecial
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


