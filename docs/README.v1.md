# Knowledge Vault — Notes API Enhancements

This README captures the feature work completed after the initial TS migration. It focuses on the
notes component: querying, filtering, projection, validation, indexing, and tests.

## What Changed

- Added flexible list endpoint capabilities: pagination with defaults (`page=1`, `limit=20`), total
  count, and a consistent response shape `{ data, total, page, limit }`.
- Introduced field projection with a whitelist. `fields` defaults to `["title", "updatedAt"]` and
  can explicitly include `content`, `tags`, `createdAt` as needed.
- Implemented search across both `title` and `content`, case-insensitive, with regex metacharacters
  escaped for safety and a max length cap.
- Added tag filtering with AND semantics (`$all`): notes must contain all requested tags. Tags are
  validated (lowercase, allowed chars/length), deduped, and optional.
- Combined filters: search, tags, pagination, and projection work together under a single contract.
- Strengthened validation: Zod schemas for query/body, numeric coercion/bounds on `page/limit`,
  max-length on search, validated tags, and strict response schemas that mirror the controller
  output.
- Added indexing to support queries: compound index `{ userId: 1, tags: 1, updatedAt: -1 }`
  (search by tags + sort). Pagination by `updatedAt` is preserved.
- Mapping/contracts alignment: list item responses have optional fields (respecting projection),
  full note responses remain complete. Mappers include only what was requested.

## Current API Behavior (Notes List)

- Query params:
  - `page`/`limit`: defaults 1/20, max limit 100; response echoes `page/limit/total`.
  - `fields`: whitelist projection, defaults to `["title", "updatedAt"]`.
  - `search`: substring match on `title` and `content`, case-insensitive, metacharacters escaped,
    empty/whitespace treated as no filter, length capped.
  - `tags`: optional, lowercase, validated, deduped; AND logic via `$all`; empty input treated as no
    filter.
- Response: `{ data: [...], total, page, limit }` where `data` respects the requested fields.
- Sorting: `updatedAt` desc by default.

## Tests

- Pagination: defaults, custom limits, out-of-range pages, validation errors, correct slices.
- Search: matches title/content, case-insensitive, no-match/empty behavior, regex literals,
  pagination + fields.
- Tags: single/multiple tags (AND), no matches, invalid/too many tags, comma-separated/repeated
  params, pagination + tags, search + tags, cross-user isolation.
- Projection: `fields` respected in all combinations.

## Notes and Indexing

- Tag and search filters are combined with `userId`; indexes support tag filtering with sort.
- Search uses regex; consider a text index on `title`/`content` later if scale demands it.
- Validation errors return 400 with clear messages; unauthorized routes remain session-protected.

## Final Observations

- Defaults are centralized in the query schema; repositories assume explicit projection/pagination.
+- Strict projection keeps payloads small; optional fields in the contract mirror the projection.
 - Combined filters and pagination are tested to guard regressions; remove any `.only` before running
   the full suite.
