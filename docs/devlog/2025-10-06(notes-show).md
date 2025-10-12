## 2025-10-06 – Notes show endpoint

### What I worked on
- Strengthened `GET /api/notes/:id` by expanding integration tests under a TDD flow.
- Ensured the endpoint covers authentication, authorization, validation, and not-found scenarios.

### Important decisions
- Adopted minimal client-facing error messages (`"Access denied"`) to avoid leaking ownership info, while keeping detailed logs server-side.
- Added `401` paths for missing session and post-logout cases to separate authentication failures from `403` authorization failures.
- Validated ObjectId format early to send a clear `400` with field-specific errors.

### Moments of doubt and how I resolved them
- Unsure whether to explain ownership in the `ForbiddenError`. Chose a generic denial message to prevent information disclosure.
- Questioned if extra tests for logout and anonymous users were needed. Realized they confirm the auth middleware order, so added both.
- Noticed the console stayed silent during failing tests; confirmed the error handler converts exceptions into HTTP responses and that suppressed logs are expected in test mode.

### Next ideas
- Add coverage for repository/service failures (mocking a thrown error to expect `500`).
- Reuse the Unauthorized/Forbidden separation pattern when building future list and delete endpoints.
