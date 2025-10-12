## Context
- I tried to extend the old `validate.middleware` so it could merge data coming from different steps (token, body, params).
- While analysing the behaviour I noticed that the spread operator only performs a shallow merge and overwrites nested objects like `body`.

## Key Thoughts
- If multiple middleware put data into the same nested object, we risk losing values (the reset token disappears when body validation runs).
- Deep merge felt like an overkill for this project: more code, more edge cases (arrays, dates), more tests to maintain.
- Keeping one universal validator makes it harder to reason about ownership: controllers do not know which middleware supplied which data.

## Decision
- Split validation into specialised middleware: `validateBody`, `validateResetToken`, and future ones for params/query.
- Give each middleware its own channel on the request object (`req.validatedBody`, `req.validatedResetToken`, ...). This prevents accidental overrides and highlights responsibility.

## Implementation Notes
- Renamed the original middleware to `validateBody` and updated controllers to read from `req.validatedBody`.
- Created `validate-reset-token.middleware` that writes into `req.validatedResetToken`.
- Updated README to record the convention and make sure future middleware follow the same pattern.

## Next Steps
- Introduce a params validator following the same channel pattern.
- Consider adding lightweight helpers/tests to assert that controllers only access the channels they expect.
