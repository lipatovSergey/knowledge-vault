## 2025-10-06 – Notes delete endpoint

### What I worked on
- Finished backend flow for `DELETE /api/notes/:id`.
- Followed TDD: wrote failing integration tests first, then updated repository, service, and controller until tests passed.

### Important decisions
- Added repository helper to fetch only the owner id with `select("ownerId")`. This keeps the query light.
- Kept the delete method returning `true`/`false` based on `deletedCount` so the service can guard against race conditions.
- Service still checks for `NotFoundError` before and after calling delete. Even if the note was found earlier, a second check protects against concurrent deletes.

### Moments of doubt and how I resolved them
- Unsure where to convert `ObjectId` to string. Chose to do it in the service so the repository stays close to raw database output.
- Wondered if the delete method needs to return anything. Decided to return a boolean so other callers can assert the result and so tests stay explicit.
- Questioned why console logs stayed empty in tests. Realized the global error handler turns exceptions into HTTP responses, so logs are silent unless I log manually.
