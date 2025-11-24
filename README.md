# Knowledge Vault — TS Migration Notes

This README captures what changed between the previous version and the current one: my first migration of the project to TypeScript and a rebuilt architecture. This file only applies to this version; the final version will have its own README.

## What Changed
- Fully moved the codebase from JS to TS: dropped reliance on `allowJs`, updated `tsconfig`, added typing for routes, services, repositories, and test utilities.
- Reworked configuration: moved `MONGO_URI` to `process.env`, removed hard config caching at import time so tests and different environments can set their own values.
- Rebuilt the session/DB connection layer: single helper for `MONGO_URI`, connect to Mongo before starting the app, MemoryStore in tests.
- Clarified the build layout: dedicated `dist-ci` for CI, build-specific `tsconfig.ci.json`, Jest settings aimed at built JS.
- Updated the CI workflow: explicit `NODE_CONFIG_DIR`, correct paths to setup files, early setup for in-memory Mongo, lint excludes `dist`/`dist-ci`/`node_modules`.
- Unified contracts/domain/persistence layers: inputs validated by Zod contracts, controllers map to domain, services operate on domain types, repositories work with persistence models.
- Separated reset-token handling: string contract (selector.validator), domain object { selector, validator }, persistence shape { selector, validatorHash, userId, expiresAt }. Added an explicit bcrypt adapter and a DUMMY_HASH for timing-safe comparisons.
- Moved auth/user/note components to the new architecture: thin controllers, logic in services, repositories isolate Mongoose. Added primitives for fields (email, title, content, etc.), shared mappers and helpers.
- Reorganized tests: all integration tests rewritten in TS and split by endpoint (auth, user, note). Unit tests for the token repository/service use mocked dependencies and domain types.

## New Architecture (Layers)
- **Controllers/Routes** — HTTP wrapper only, read validated data.
- **Services** — business rules and orchestration, receive dependencies (repositories/utilities) from outside.
- **Repositories** — work with Mongoose models, no business logic.
- **Infrastructure** — DB connection, sessions, config, helper utilities.
- **Test Layer** — single setup for in-memory Mongo (`startMemoryMongo`), global `beforeAll`, collection cleanup between tests.

## Key Decisions and Pitfalls
- Removed top-level config constants: previously `config.get` at import time blocked dynamic overrides in tests. Now `MONGO_URI` always comes from the environment, and missing variables throw an explicit error.
- Split early setup (`setupFiles`) and late setup (`setupFilesAfterEnv`): early sets `NODE_ENV=test`, late starts the memory server and connects the DB.
- Tuned Jest for built code: `setupFiles`/`roots` point to `dist-ci` so tests run on build artifacts.
- CI now passes configs via `NODE_CONFIG_DIR` so `config` finds `config/test.json` even if the working directory is `dist-ci`.
- Lint ignores build directories so TODO/FIXME from dependencies and artifacts do not leak into reports.

## Tests and CI
- All tests pass locally and in CI: Jest + Supertest, `mongodb-memory-server` for a fast isolated DB.
- Workflow: checkout → setup Node 20 → `npm ci` → lint → build (`dist-ci`) → test with `NODE_CONFIG_DIR` and the test environment.
- Locally: `npm test` (ts-jest, on-the-fly compilation). In CI: `npm run build:ci` → `npm run test:ci` (Jest runs built JS from `dist-ci`, `jest.ci.config.js`).

## Final Observations
- First JS → TS migration: the main tasks were removing hidden global state (configs at import time) and agreeing on environment initialization.
- Layer separation and explicit dependency injection simplified mocking and test isolation.
- Working with `mongodb-memory-server` requires setting the URI early; any import-time caches break tests.

