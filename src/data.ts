import { IGNote, MissedPrayer } from './types';
import { v4 as uuidv4 } from 'uuid';

const IG_SONGS = [
  { song: 'Engkaulah Kamuku', note: 'Mendarah' },
  { song: 'Engkaulah Kamuku', note: '🥹✋🏻🤝🏻🫸🏻😭' },
  { song: 'THANK YOU 4 LOVING ME', note: '' },
  { song: 'THANK YOU 4 LOVING ME', note: '' },
  { song: 'Jatuh Hati', note: '' },
  { song: 'i\'ve always loved you', note: '' },
  { song: 'i\'ve always loved you', note: '' },
  { song: 'Mendarah', note: '🥀' },
  { song: 'Rumah 13 10', note: '' },
  { song: 'Saat kau telah mengerti', note: '' },
  { song: 'The Only Exeption', note: '' },
  { song: 'Kangen', note: '' },
  { song: 'in a silent room', note: '' },
  { song: 'Lihat Kebunku', note: '' },
  { song: 'Wi$t Li$t (Acoustic)', note: '' },
  { song: 'Ada Untukmu', note: '' },
  { song: 'i\'d like to watch you sleeping', note: '' },
  { song: 'Indah Apa Adanya', note: '🤍' },
  { song: 'Tanda', note: '' },
  { song: 'About You', note: 'Semangat 🩶' }
];

export const INITIAL_IG_NOTES: IGNote[] = IG_SONGS.map((item, index) => ({
  id: uuidv4(),
  type: 'ig',
  owner: 'Xiaomi',
  songTitle: item.song,
  content: item.note,
  backgroundColor: '#171412', // Enforce black color as default
  history: [],
  createdAt: Date.now() - (index * 100000), // artificial spacing
  updatedAt: Date.now() - (index * 100000)
}));

const MISSED_PRAYERS_DATA = [
  ...["lupa tanggal", "lupa tanggal", "5 Mei 2024", "20 Mei 2024", "29 Mei 2024", "31 Mei 2024", "7 Juli 2024", "16 Agustus 2024", "28 Agustus 2024", "30 Agustus 2024", "15 September 2024", "11 Oktober 2024", "20 Oktober 2024", "29 Oktober 2024", "13 November 2024", "23 November 2024", "10 Desember 2024", "12 Desember 2024", "19 Desember 2024", "20 Desember 2024", "15 Januari 2025", "31 Maret 2025", "7 April 2025", "22 April 2025", "7 Mei 2025", "23 Juli 2025", "28 Desember 2025", "30 Desember 2025", "15 Mei 2026"].map(date => ({ prayer: 'Isya' as const, date })),
  ...["5 Mei 2024", "11 Juli 2024 (kalo gk salah)", "14 Juli 2024", "23 November 2024", "7 April 2025", "7 Mei 2025", "22 Juni 2025", "25 Juni 2025", "23 Juli 2025", "9 Agustus 2025", "1 Desember 2025", "23 Desember 2025"].map(date => ({ prayer: 'Dzuhur' as const, date })),
  ...["13 Mei 2024", "11 Juni 2024", "19 Juli 2024", "15 September 2024", "September 2024", "17 November 2024", "7 April 2025", "7 Mei 2025", "21 Mei 2025", "27 Mei 2025", "25 Juni 2025", "20 Agustus 2025", "23 Agustus 2025", "lupa tanggal", "1 Desember 2025", "11 Januari 2026"].map(date => ({ prayer: 'Ashar' as const, date })),
  ...["29 September 2024", "19 Oktober 2024", "15 November 2024", "7 April 2025", "22 Juni 2025", "1 September 2025", "25 Oktober 2025", "11 Januari 2026"].map(date => ({ prayer: 'Maghrib' as const, date })),
  ...["8 Juni 2024", "8 Mei 2025", "6 Juni 2025", "12 Juni 2025", "14 Juni 2025", "Maret 2026"].map(date => ({ prayer: 'Subuh' as const, date })),
  { prayer: 'Belum Diketahui' as const, date: 'Kamis 28 November 2024' }
];

export const INITIAL_MISSED_PRAYERS: MissedPrayer[] = MISSED_PRAYERS_DATA.map(item => ({
  id: uuidv4(),
  prayer: item.prayer,
  dateInfo: item.date,
  completed: false,
}));
