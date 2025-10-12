## 2025-10-10 – Ownership via query filters

### What I worked on
- Replaced manual owner checks with MongoDB filters that use `{ _id, ownerId }` for note queries.
- Swapped `findById` for `findOne` in the read path so the ownership filter always applies.
- Updated repository methods, services, and tests to rely on a single database call and return 404 when the note is missing or belongs to someone else.

### Important decisions
- Kept DELETE and PATCH aligned: both now return `null` and 404 for foreign notes, which reduces data leaks.
- For PATCH I used `findOneAndUpdate` with `includeResultMetadata: true` to get both the updated note and the `updatedExisting` flag without an extra query.

### Lessons learned
- Pushing ownership rules into the query makes security simpler and removes race conditions between read and write steps.
- Integration tests should cover both “note not found” and “note belongs to another user” so the 404 contract stays clear.
