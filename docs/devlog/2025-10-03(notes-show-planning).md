## 2025-10-03 — Notes show planning

**Goal**  
Lay the groundwork for `GET /api/notes/:id` so we can ship ownership-aware reads next session.

### What changed today

- Decided to keep CRUD endpoint tests split by file; created `notes.get.test.js` scaffold mirroring the create suite setup.
- Added the first red test for the happy path (authorized user retrieves own note and receives the exact DTO shape).
- Verified the test fails with 404, confirming the endpoint wiring still needs to be implemented.

### Why

- Separate test files keep growing suites readable and make focused `describe.only` runs easier during TDD.
- Starting with the happy-path red test sets up the contract before touching routes/services, keeping us in the `red → green → refactor` loop.

### Next steps

- Implement the minimal route/controller/service chain so the positive test goes green.
- Extend the suite with 404 (missing note) and 403 (foreign note) scenarios using the future `ForbiddenError`.
