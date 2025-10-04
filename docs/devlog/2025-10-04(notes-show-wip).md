## 2025-10-04 — Notes show WIP

**Goal**  
Start turning the red `GET /api/notes/:id` test green by wiring controller → service → repository and sketching the validation touch points.

### What changed today

- Expanded the happy-path integration test to hit `/api/notes/:id`, temporarily printing the payload so the DTO shape is visible while wiring the stack.
- Added `getNote` handlers across controller, service, and Mongo repository so a fetched document is returned as DTO data.
- Exposed the new endpoint in `note.routes.js`, leaving a TODO to slot in params validation once the middleware understands `req.params`.
- Introduced a Zod schema scaffold for `params.id` to document the desired contract, even though the middleware still ignores nested envelopes.

### Why

- Seeing the test fail with 200 payload output confirms the wiring is close and highlights the remaining normalisation work.
- Implementing the service/repository call chain now provides a backbone for layering ownership checks and 404/403 branches next.
- The Zod schema acts as executable documentation of the expected request shape, guiding the upcoming middleware refactor.

### Next steps

- Update the validate middleware to parse `{ params }` envelopes and remove the temporary `console.log` noise from the test.
- Enforce ownership and missing-note branches with dedicated errors and matching test coverage.
