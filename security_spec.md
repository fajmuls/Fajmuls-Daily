# Security Specification - Fajmuls Daily

## Data Invariants
- Each user can only access, create, update, or delete their own data.
- Data is partitioned by `userId`.
- Roots of data:
  - `notes`: Personal notes of various types.
  - `financeRecords`: Income and expense records.
  - `missedPrayers`: Tracker for missed prayers.
  - `docs`: Daily documents or records.
- Note types: 'personal', 'workout', 'ig', 'normal', 'missed-prayer'.
- Finance types: 'income', 'expense'.

## Collections
- `/users/{userId}/notes/{noteId}`
- `/users/{userId}/finance/{recordId}`
- `/users/{userId}/prayers/{prayerId}`
- `/users/{userId}/docs/{docId}`

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create a note for another user's ID.
2. **Identity Spoofing (Update)**: Attempt to change the `userId` field of an existing record.
3. **Cross-User Read**: Attempt to list notes belonging to another `userId`.
4. **Unauthorized Delete**: Attempt to delete a finance record belonging to another user.
5. **Malformed Finance**: Create a finance record with a negative amount (if not allowed) or missing required fields.
6. **Resource Poisoning**: Inject a 1MB string into a note's title.
7. **Invalid Type**: Set finance type to 'robbery' instead of 'income'/'expense'.
8. **Bypassing Verification**: Write data without being a verified user (if required).
9. **Shadow Fields**: Add `isAdmin: true` to a user document.
10. **State Shortcutting**: Manually set `completedAt` without setting `completed` to true in prayers.
11. **Timestamp Spoofing**: Provide a future `createdAt` from the client.
12. **Orphaned Write**: Create a sub-record in a non-existent user path (though path is variable).

## Implementation Plan
- Partition everything under `/users/{userId}/`.
- Use `isValidId()` for all IDs.
- Use `isValid[Entity]()` for all writes.
- Enforce `request.auth.uid == userId`.
