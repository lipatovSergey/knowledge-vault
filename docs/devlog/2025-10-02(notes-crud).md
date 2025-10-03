## 2025-10-03 — Notes CRUD groundwork

**Goal**  
Kick off the Notes CRUD slice and bring the component structure in line with the rest of the codebase so we can iterate with TDD.

### What changed today

- Added `src/components/notes/index.js` to assemble the service with the Mongo repository (same pattern as users/auth).
- Updated `note.service.js` so the factory closes over `noteRepo` and returns DTOs via the new mapper instead of raw Mongoose documents.
- Created `note.mapper.js` (`toNoteDto`) to convert documents or lean objects into a clean API payload `{ id, title, content, createdAt, updatedAt }`.
- Introduced `note.validator.js` with a Zod schema for the create payload (`title`, `content`) and wired it through the shared `validate` middleware.
- Reworked the controller and route: `POST /api/notes` now requires auth, pulls `userId` from the session, and returns the mapped DTO with status 201.
- Started the integration test suite in `src/components/notes/__tests__/notes.create.test.js`; first test covers the happy path (user signs in, creates a note, receives DTO with the exact set of fields).

### Why

- Central composition (`index.js`) keeps dependency wiring consistent and readable.
- Mapper ensures the API response is stable and hides Mongo-specific fields like `_id`/`__v`.
- Zod validation mirrors existing components, so request guards stay uniform across the app.
- Integration test documents expected behaviour before we expand into listing and other operations.

### Next steps

- Flesh out negative tests for creation (missing fields, unauthenticated access).
- Implement and cover `GET /api/notes` (list) and `GET /api/notes/:id` with ownership checks.
- Add PATCH/DELETE handlers once reading endpoints are locked in.
