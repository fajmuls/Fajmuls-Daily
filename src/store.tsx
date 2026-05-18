import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { Note, FinanceRecord, MissedPrayer, DailyDoc } from './types';
import { INITIAL_MISSED_PRAYERS, INITIAL_IG_NOTES } from './data';
import { useAuth } from './components/AuthWrapper';

interface AppState {
  notes: Note[];
  financeRecords: FinanceRecord[];
  missedPrayers: MissedPrayer[];
  docs: DailyDoc[];
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
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [missedPrayers, setMissedPrayers] = useState<MissedPrayer[]>([]);
  const [docs, setDocs] = useState<DailyDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setFinanceRecords([]);
      setMissedPrayers([]);
      setDocs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const userPath = `users/${user.uid}`;
    
    // Listeners
    const unsubNotes = onSnapshot(query(collection(db, `${userPath}/notes`), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(d => d.data() as Note);
      // Initialize with default notes if empty and first time
      setNotes(data.length > 0 ? data : []);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/notes`));

    const unsubFinance = onSnapshot(query(collection(db, `${userPath}/finance`), orderBy('createdAt', 'desc')), (snapshot) => {
      setFinanceRecords(snapshot.docs.map(d => d.data() as FinanceRecord));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/finance`));

    const unsubPrayers = onSnapshot(collection(db, `${userPath}/prayers`), (snapshot) => {
      const data = snapshot.docs.map(d => d.data() as MissedPrayer);
      setMissedPrayers(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/prayers`));

    const unsubDocs = onSnapshot(query(collection(db, `${userPath}/docs`), orderBy('createdAt', 'desc')), (snapshot) => {
      setDocs(snapshot.docs.map(d => d.data() as DailyDoc));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/docs`));

    setLoading(false);

    return () => {
      unsubNotes();
      unsubFinance();
      unsubPrayers();
      unsubDocs();
    };
  }, [user]);

  // Migration from LocalStorage to Firestore (one-time if Firestore is empty)
  useEffect(() => {
    if (!user || loading) return;

    const checkAndMigrate = async () => {
      const userPath = `users/${user.uid}`;
      const suffix = `-${user.uid}`;
      
      // We check if Firestore collections are empty before migrating
      // This is a simple heuristic
      if (notes.length === 0) {
        const local = localStorage.getItem(`fajmuls-notes${suffix}`);
        const notesToMigrate = local ? JSON.parse(local) : INITIAL_IG_NOTES;
        if (notesToMigrate.length > 0) {
          const batch = writeBatch(db);
          notesToMigrate.forEach((n: Note) => {
            const ref = doc(db, `${userPath}/notes`, n.id);
            batch.set(ref, n);
          });
          await batch.commit().catch(e => console.error("Migration error:", e));
        }
      }

      if (missedPrayers.length === 0) {
        const local = localStorage.getItem(`fajmuls-prayers${suffix}`);
        const prayersToMigrate = local ? JSON.parse(local) : INITIAL_MISSED_PRAYERS;
        if (prayersToMigrate.length > 0) {
          const batch = writeBatch(db);
          prayersToMigrate.forEach((p: MissedPrayer) => {
            const ref = doc(db, `${userPath}/prayers`, p.id);
            batch.set(ref, p);
          });
          await batch.commit().catch(e => console.error("Migration error:", e));
        }
      }

      // Similarly for finance and docs if they exist in localStorage
      const financeLocal = localStorage.getItem(`fajmuls-finance${suffix}`);
      if (financeLocal && financeRecords.length === 0) {
        const data = JSON.parse(financeLocal);
        const batch = writeBatch(db);
        data.forEach((r: FinanceRecord) => {
          const ref = doc(db, `${userPath}/finance`, r.id);
          batch.set(ref, r);
        });
        await batch.commit().catch(e => console.error("Migration error:", e));
      }

      const docsLocal = localStorage.getItem(`fajmuls-docs${suffix}`);
      if (docsLocal && docs.length === 0) {
        const data = JSON.parse(docsLocal);
        const batch = writeBatch(db);
        data.forEach((d: DailyDoc) => {
          const ref = doc(db, `${userPath}/docs`, d.id);
          batch.set(ref, d);
        });
        await batch.commit().catch(e => console.error("Migration error:", e));
      }
    };

    checkAndMigrate();
  }, [user, loading]);

  const addNote = async (note: Note) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/notes`, note.id), note);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/notes/${note.id}`); }
  };
  
  const updateNote = async (updatedNote: Note) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/notes`, updatedNote.id), { ...updatedNote, updatedAt: Date.now() });
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/notes/${updatedNote.id}`); }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/notes`, id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/notes/${id}`); }
  };
  
  const addFinanceRecord = async (record: FinanceRecord) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/finance`, record.id), record);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/finance/${record.id}`); }
  };

  const deleteFinanceRecord = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/finance`, id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/finance/${id}`); }
  };

  const togglePrayer = async (id: string) => {
    if (!user) return;
    const prayer = missedPrayers.find(p => p.id === id);
    if (!prayer) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/prayers`, id), { 
        ...prayer, 
        completed: !prayer.completed, 
        completedAt: !prayer.completed ? Date.now() : undefined 
      });
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/prayers/${id}`); }
  };

  const addMissedPrayer = async (prayer: MissedPrayer) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/prayers`, prayer.id), prayer);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/prayers/${prayer.id}`); }
  };

  const deleteMissedPrayer = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/prayers`, id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/prayers/${id}`); }
  };

  const addDoc = async (docObj: DailyDoc) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/docs`, docObj.id), docObj);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/docs/${docObj.id}`); }
  };

  return (
    <AppContext.Provider value={{
      notes, financeRecords, missedPrayers, docs, loading, addNote, updateNote, deleteNote, addFinanceRecord, deleteFinanceRecord, togglePrayer, addMissedPrayer, deleteMissedPrayer, addDoc
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


