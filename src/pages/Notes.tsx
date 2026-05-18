import { Routes, Route, useNavigate } from 'react-router-dom';
import { NotesList } from '../components/notes/NotesList';
import { NormalNoteView } from '../components/notes/NormalNoteView';
import { NormalNotesList } from '../components/notes/NormalNotesList';
import { MissedPrayersView } from '../components/notes/MissedPrayersView';
import { IGNoteView } from '../components/notes/IGNoteView';
import { IGNotesList } from '../components/notes/IGNotesList';
import { PersonalNoteView } from '../components/notes/PersonalNoteView';
import { PersonalNotesList } from '../components/notes/PersonalNotesList';
import { WorkoutNoteView } from '../components/notes/WorkoutNoteView';
import { WorkoutNotesList } from '../components/notes/WorkoutNotesList';

import { AttendanceNoteView } from '../components/notes/AttendanceNoteView';
import { AttendanceNotesList } from '../components/notes/AttendanceNotesList';

export function Notes() {
  return (
    <Routes>
      <Route path="/" element={<NotesList />} />
      <Route path="/normal-list" element={<NormalNotesList />} />
      <Route path="/normal/:id?" element={<NormalNoteView />} />
      <Route path="/prayers" element={<MissedPrayersView />} />
      <Route path="/ig-list" element={<IGNotesList />} />
      <Route path="/ig/:id?" element={<IGNoteView />} />
      <Route path="/personal-list" element={<PersonalNotesList />} />
      <Route path="/personal/:id?" element={<PersonalNoteView />} />
      <Route path="/workout-list" element={<WorkoutNotesList />} />
      <Route path="/workout/:id?" element={<WorkoutNoteView />} />
      <Route path="/attendance-list" element={<AttendanceNotesList />} />
      <Route path="/attendance/:id?" element={<AttendanceNoteView />} />
    </Routes>
  );
}
