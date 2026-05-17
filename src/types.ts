export type NoteType = 'normal' | 'prayer' | 'ig' | 'personal' | 'workout';

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

export interface PrayerNote extends BaseNote {
  type: 'prayer';
  date: string;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

export interface IGNote extends BaseNote {
  type: 'ig';
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

export type Note = NormalNote | PrayerNote | IGNote | PersonalNote | WorkoutNote;

export interface FinanceRecord {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
  createdAt: number;
}
