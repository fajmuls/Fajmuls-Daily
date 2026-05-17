export type NoteType = 'normal' | 'ig' | 'personal' | 'workout';

export interface BaseNote {
  id: string;
  type: NoteType;
  createdAt: number;
  updatedAt: number;
}

export interface NormalNote extends BaseNote {
  type: 'normal';
  title: string;
  content: string;
}

export interface IGNote extends BaseNote {
  type: 'ig';
  owner: string;
  songTitle: string;
  content: string;
  backgroundColor: string;
  history: string[]; // Keep track of past contents
}

export interface PersonalNote extends BaseNote {
  type: 'personal';
  nik: string;
  ssn: string;
  postalCode: string;
  address: string;
  email: string;
  accountNumber: string;
  extraNotes: string;
}

export interface WorkoutNote extends BaseNote {
  type: 'workout';
  title: string;
  routine: string;
  durationMins: number;
}

export type Note = NormalNote | IGNote | PersonalNote | WorkoutNote;

export interface FinanceRecord {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
  createdAt: number;
}

export type Fardhu = 'Subuh' | 'Dzuhur' | 'Ashar' | 'Maghrib' | 'Isya' | 'Belum Diketahui';

export interface MissedPrayer {
  id: string;
  prayer: Fardhu;
  dateInfo: string;
  completed: boolean;
  completedAt?: number;
}

export interface DailyDoc {
  id: string;
  url: string;
  name: string;
  createdAt: number;
}
