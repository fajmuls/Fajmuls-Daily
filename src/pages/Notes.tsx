import { Routes, Route, useNavigate } from 'react-router-dom';
import { NotesList } from '../components/notes/NotesList';
import { NormalNoteView } from '../components/notes/NormalNoteView';
import { PrayerNoteView } from '../components/notes/PrayerNoteView';
import { IGNoteView } from '../components/notes/IGNoteView';
import { PersonalNoteView } from '../components/notes/PersonalNoteView';
import { WorkoutNoteView } from '../components/notes/WorkoutNoteView';

export function Notes() {
  return (
    <Routes>
      <Route path="/" element={<NotesList />} />
      <Route path="/normal/:id?" element={<NormalNoteView />} />
      <Route path="/prayer/:id?" element={<PrayerNoteView />} />
      <Route path="/ig/:id?" element={<IGNoteView />} />
      <Route path="/personal/:id?" element={<PersonalNoteView />} />
      <Route path="/workout/:id?" element={<WorkoutNoteView />} />
    </Routes>
  );
}
