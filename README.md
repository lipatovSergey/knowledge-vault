# Knowledge Vault

Session-based notes API with user auth and password reset. Express + Mongoose + Zod validation,
tested with Jest/Supertest.

## Features

- User registration, login/logout, profile update/delete
- Password reset via selector/validator token and email outbox
- Note CRUD with pagination, fields projection, search, and tag filters
- Session-based auth (express-session + connect-mongo)
- RFC 7807-style error responses (application/problem+json)

## Tech Stack

- Node.js 20, Express 5
- MongoDB/Mongoose
- Zod for contracts/validation
- express-session + connect-mongo for sessions
- Jest + Supertest + mongodb-memory-server for tests
- TypeScript, ESLint, Prettier

## Architecture

- Controllers: thin HTTP layer using validated contracts
- Services: business logic (user/auth/note/token)
- Repositories: Mongoose-only data access
- Contracts: Zod schemas for requests/responses
- Middleware: validation, auth/guest gates, error handler, session config
- Utils: search normalization, session helpers, random token generation
- Flow: request → validation middleware (Zod) → controller → service → repository (Mongoose) →
  MongoDB

## Getting Started

1. Install: `npm install`
2. Set env vars (see below). For local dev you can use a `.env`.
3. Run dev: `npm run dev` (tsx watch, NODE_ENV=development)
4. Run tests: `npm test`

## Scripts

- `npm run dev` — start in watch mode
- `npm test` — Jest + Supertest (ts-jest)
- `npm run lint` — ESLint
- `npm run build` — tsc build to `dist`
- `npm start` — run built server (NODE_ENV=production)

## Environment Variables

- `MONGO_URI` (required) — Mongo connection string
- `SESSION_SECRET` (required) — session signing secret
- `FRONTEND_URL` — base URL used in password-reset links (e.g., `https://app.example.com`)
- `PORT` — defaults to config value (3000 in dev)
- Optional per config: `db.name` via config files

## API Overview

- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/password/forgot`,
  `POST /api/auth/password/reset`
- User: `POST /api/user` (register), `GET /api/user/me`, `PATCH /api/user/me`, `DELETE /api/user/me`
- Notes: `POST /api/note`, `GET /api/note` (fields, page, limit, search, tags), `GET /api/note/:id`,
  `PATCH /api/note/:id`, `DELETE /api/note/:id`
- Validation: Zod-based; PATCH note requires at least one of title/content/tags; tags are
  normalized/deduped.
- Errors: problem+json with `title`, `detail`, `status`, `type`, `instance`; validation errors
  include field details.
- Full request/response examples: keep in your API reference (e.g., `docs/api-reference.md`).

## Auth & Sessions

- Login flow (session-based): client POSTs `/api/auth/login` with credentials; server sets
  `connect.sid` (httpOnly, sameSite=lax by default, secure in production). Frontend must send
  cookies with `credentials: "include"`/`withCredentials: true`.
- Session cookie: `httpOnly`, `sameSite` defaults to `lax`; `secure` enabled in production.
- Behind a proxy/HTTPS terminator, `app.set("trust proxy", 1)` is enabled in production to allow
  `secure` cookies.
- For cross-origin frontends, set `sameSite: "none"` + `secure: true` in production.

## Testing

- Integration tests use `mongodb-memory-server`; test setup sets `MONGO_URI` to the in-memory
  instance.
- Test runner bootstraps the in-memory Mongo and overrides `MONGO_URI` automatically; no manual DB
  setup needed.
- Full coverage of auth, user, and note routes, including validation/error cases.
- To run: `npm test`

## Production Notes

- Ensure `MONGO_URI`, `SESSION_SECRET`, and `FRONTEND_URL` are set.
- Run behind HTTPS; keep `secure` cookies on and `trust proxy` enabled if TLS terminates upstream.
- Connect to Mongo before serving requests; sessions share the Mongo client when available.

## Configs

- `tsconfig.json`: dev config (noEmit, isolatedModules) extending `tsconfig.base.json`.
- `tsconfig.base.json`: shared strict TS settings for `src`/`tests`.
- `tsconfig.build.json`: production build output to `dist`.
- `tsconfig.ci.json`: CI build output to `dist-ci` for Jest CI runs.
- `jest.config.js`: local Jest with ts-jest (on-the-fly TS) rooted in `src`/`tests`.
- `jest.ci.config.js`: CI Jest targeting built JS in `dist-ci`.
- `eslint.config.cjs`: ESLint rules/plugins (TS, Jest) excluding build artifacts.

## Versioned READMEs

- v0 (TS migration): `docs/README.v0-ts.md`
- v1: `docs/README.v1.md`
