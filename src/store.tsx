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
import { Note, FinanceRecord, MissedPrayer, DailyDoc, SpecialNote } from './types';
import { INITIAL_MISSED_PRAYERS, INITIAL_IG_NOTES } from './data';
import { useAuth } from './components/AuthWrapper';

interface AppState {
  notes: Note[];
  financeRecords: FinanceRecord[];
  missedPrayers: MissedPrayer[];
  docs: DailyDoc[];
  specials: SpecialNote[];
  loading: boolean;
  confirmDialog: { isOpen: boolean; message: string; onConfirm: () => void } | null;
  alertMessage: string | null;
  financeMappings: { [key: string]: string };
  hideAmounts: boolean;
  setHideAmounts: (hide: boolean) => void;
  setAlert: (message: string | null) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
  updateFinanceMapping: (category: string, group: string) => void;
  deleteFinanceMapping: (category: string) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addFinanceRecord: (record: FinanceRecord) => void;
  deleteFinanceRecord: (id: string) => void;
  togglePrayer: (id: string) => void;
  addMissedPrayer: (prayer: MissedPrayer) => void;
  deleteMissedPrayer: (id: string) => void;
  deleteAllMissedPrayers: () => void;
  addDoc: (doc: DailyDoc) => void;
  addSpecial: (special: SpecialNote) => void;
  deleteSpecial: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [missedPrayers, setMissedPrayers] = useState<MissedPrayer[]>([]);
  const [docs, setDocs] = useState<DailyDoc[]>([]);
  const [specials, setSpecials] = useState<SpecialNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [financeMappings, setFinanceMappings] = useState<{ [key: string]: string }>({});
  const [hideAmounts, setHideAmounts] = useState(() => localStorage.getItem('fajmus-hide-amounts') === 'true');

  const setAlert = (message: string | null) => setAlertMessage(message);
  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };
  const closeConfirm = () => {
    setConfirmDialog(null);
  };

  const toggleHideAmounts = (hide: boolean) => {
    setHideAmounts(hide);
    localStorage.setItem('fajmus-hide-amounts', hide ? 'true' : 'false');
  };

  // Track if initial data has loaded
  const [initialLoaded, setInitialLoaded] = useState({
    notes: false,
    finance: false,
    prayers: false,
    docs: false,
    specials: false,
    mappings: false
  });

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
      setNotes(snapshot.docs.map(d => d.data() as Note));
      setInitialLoaded(prev => ({ ...prev, notes: true }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/notes`));

    const unsubFinance = onSnapshot(query(collection(db, `${userPath}/finance`), orderBy('createdAt', 'desc')), (snapshot) => {
      setFinanceRecords(snapshot.docs.map(d => d.data() as FinanceRecord));
      setInitialLoaded(prev => ({ ...prev, finance: true }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/finance`));

    const unsubPrayers = onSnapshot(collection(db, `${userPath}/prayers`), (snapshot) => {
      setMissedPrayers(snapshot.docs.map(d => d.data() as MissedPrayer));
      setInitialLoaded(prev => ({ ...prev, prayers: true }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/prayers`));

    const unsubDocs = onSnapshot(query(collection(db, `${userPath}/docs`), orderBy('createdAt', 'desc')), (snapshot) => {
      setDocs(snapshot.docs.map(d => d.data() as DailyDoc));
      setInitialLoaded(prev => ({ ...prev, docs: true }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/docs`));

    const unsubSpecials = onSnapshot(query(collection(db, `${userPath}/specials`), orderBy('createdAt', 'desc')), (snapshot) => {
      setSpecials(snapshot.docs.map(d => d.data() as SpecialNote));
      setInitialLoaded(prev => ({ ...prev, specials: true }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/specials`));

    const unsubMappings = onSnapshot(doc(db, `${userPath}/settings/financeMappings`), (snapshot) => {
      if (snapshot.exists()) {
        setFinanceMappings(snapshot.data() as { [key: string]: string });
      }
      setInitialLoaded(prev => ({ ...prev, mappings: true }));
    }, (err) => handleFirestoreError(err, OperationType.GET, `${userPath}/settings/financeMappings`));

    return () => {
      unsubNotes();
      unsubFinance();
      unsubPrayers();
      unsubDocs();
      unsubSpecials();
      unsubMappings();
    };
  }, [user]);

  // Update loading state when all initial data is loaded
  useEffect(() => {
    if (initialLoaded.notes && initialLoaded.finance && initialLoaded.prayers && initialLoaded.docs && initialLoaded.specials && initialLoaded.mappings) {
      setLoading(false);
    }
  }, [initialLoaded]);

  // Migration from LocalStorage to Firestore (one-time)
  useEffect(() => {
    if (!user || loading) return;

    const migrationFlag = localStorage.getItem(`fajmuls-migrated-${user.uid}`);
    if (migrationFlag) return;

    const checkAndMigrate = async () => {
      const userPath = `users/${user.uid}`;
      const suffix = `-${user.uid}`;
      const batch = writeBatch(db);
      let hasData = false;
      
      // Notes
      const localNotes = localStorage.getItem(`fajmuls-notes${suffix}`);
      if (localNotes) {
        const notesToMigrate = JSON.parse(localNotes);
        if (notesToMigrate.length > 0) {
          notesToMigrate.forEach((n: Note) => {
            batch.set(doc(db, `${userPath}/notes`, n.id), n);
          });
          hasData = true;
        }
      } else if (notes.length === 0) {
        // Only seed if both local and remote are empty
        INITIAL_IG_NOTES.forEach((n) => {
          batch.set(doc(db, `${userPath}/notes`, n.id), n);
        });
        hasData = true;
      }

      // Prayers
      const localPrayers = localStorage.getItem(`fajmuls-prayers${suffix}`);
      if (localPrayers) {
        const prayersToMigrate = JSON.parse(localPrayers);
        if (prayersToMigrate.length > 0) {
          prayersToMigrate.forEach((p: MissedPrayer) => {
            batch.set(doc(db, `${userPath}/prayers`, p.id), p);
          });
          hasData = true;
        }
      } else if (missedPrayers.length === 0) {
        INITIAL_MISSED_PRAYERS.forEach((p) => {
          batch.set(doc(db, `${userPath}/prayers`, p.id), p);
        });
        hasData = true;
      }

      // Finance
      const financeLocal = localStorage.getItem(`fajmuls-finance${suffix}`);
      if (financeLocal) {
        const data = JSON.parse(financeLocal);
        data.forEach((r: FinanceRecord) => {
          batch.set(doc(db, `${userPath}/finance`, r.id), r);
        });
        hasData = true;
      }

      // Docs
      const docsLocal = localStorage.getItem(`fajmuls-docs${suffix}`);
      if (docsLocal) {
        const data = JSON.parse(docsLocal);
        data.forEach((d: DailyDoc) => {
          batch.set(doc(db, `${userPath}/docs`, d.id), d);
        });
        hasData = true;
      }

      // Specials
      const specialsLocal = localStorage.getItem(`fajmuls-specials${suffix}`) || localStorage.getItem('fajmuls-specials');
      if (specialsLocal) {
        const data = JSON.parse(specialsLocal);
        data.forEach((s: SpecialNote) => {
          batch.set(doc(db, `${userPath}/specials`, s.id), s);
        });
        hasData = true;
      }

      if (hasData) {
        await batch.commit().catch(e => console.error("Migration error:", e));
      }
      
      localStorage.setItem(`fajmuls-migrated-${user.uid}`, 'true');
    };

    checkAndMigrate();
  }, [user, loading, notes.length, missedPrayers.length]);

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

  const deleteAllMissedPrayers = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    missedPrayers.forEach(p => {
      batch.delete(doc(db, `users/${user.uid}/prayers`, p.id));
    });
    try {
      await batch.commit();
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/prayers`); }
  };

  const addDoc = async (docObj: DailyDoc) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/docs`, docObj.id), docObj);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/docs/${docObj.id}`); }
  };

  const addSpecial = async (special: SpecialNote) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/specials`, special.id), special);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/specials/${special.id}`); }
  };

  const deleteSpecial = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/specials`, id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/specials/${id}`); }
  };

  const updateFinanceMapping = async (category: string, group: string) => {
    if (!user) return;
    const newMappings = { ...financeMappings, [category]: group };
    try {
      await setDoc(doc(db, `users/${user.uid}/settings`, 'financeMappings'), newMappings);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/settings/financeMappings`); }
  };

  const deleteFinanceMapping = async (category: string) => {
    if (!user) return;
    const newMappings = { ...financeMappings };
    delete newMappings[category];
    try {
      await setDoc(doc(db, `users/${user.uid}/settings`, 'financeMappings'), newMappings);
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/settings/financeMappings`); }
  };

  return (
    <AppContext.Provider value={{
      notes, financeRecords, missedPrayers, docs, specials, loading, 
      confirmDialog, alertMessage, financeMappings, hideAmounts, setHideAmounts: toggleHideAmounts, setAlert, showConfirm, closeConfirm, updateFinanceMapping, deleteFinanceMapping,
      addNote, updateNote, deleteNote, addFinanceRecord, deleteFinanceRecord, togglePrayer, addMissedPrayer, deleteMissedPrayer, deleteAllMissedPrayers, addDoc, addSpecial, deleteSpecial
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


