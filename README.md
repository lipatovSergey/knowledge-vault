# Knowledge Vault

Backend project for personal knowledge management built on the MERN stack. The code base showcases production-grade practices for Express 5, session-based authentication, secure password recovery, and integration testing with Jest + Supertest.

---

## Quick Overview

- Node.js 18+, Express 5, MongoDB/Mongoose, Jest + Supertest.
- Layered architecture (routes → controllers → services → repositories) separates HTTP, business logic, and persistence concerns.
- Session-based authentication with secure reset tokens, session regeneration, and neutral responses.
- Development was driven by TDD and inspired by [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices/tree/master).

---

## Key Features

- **User lifecycle**: registration, login/logout, profile `me`, name update, sessions implemented with `express-session`.
- **Password recovery**: selector/validator token pair stored in MongoDB, one-time usage, neutral responses, in-memory mailer for tests.
- **Notes**: full CRUD for a single note plus a list endpoint scoped to the authenticated user.
- **Engineering practices**: centralized RFC 7807 error handler, Winston logging, sanitized request logging, graceful shutdown hooks.

---

## Quick Start

### Requirements

- Node.js ≥ 18.18
- MongoDB (local instance or Atlas cluster)

### Installation

```bash
npm install
```

### Configuration

The project uses the `config` package. For local development create `.env.development` next to `package.json`:

```env
MONGO_URI=mongodb://localhost:27017/knowledge-vault-dev
SESSION_SECRET=dev-secret
FRONTEND_URL=http://localhost:3000
```

For production set environment variables outside the repository:

- `MONGO_URI` — connection string (cluster + database alias)
- `SESSION_SECRET` — session signing secret
- `FRONTEND_URL` — base URL used in password-reset emails

### NPM Scripts

- `npm run dev` — development mode (`NODE_ENV=development`, `nodemon`)
- `npm test` — Jest + Supertest with in-memory MongoDB (`mongodb-memory-server`)
- `npm start` — production mode (`NODE_ENV=production`)

---

## Architecture Overview

### HTTP Validation

- Separate middleware validates specific request segments: `validateBody`, `validateParams`, `validateResetToken`, etc.
- Each middleware stores validated data in its own namespace (`req.validatedBody`, `req.validatedParams`, `req.validatedResetToken`) to avoid conflicts and ease debugging.
- Controllers read only validated data; the order of middleware in routes reflects the transformation pipeline.
- Adding a new input source means writing a dedicated middleware and documenting its namespace so the team always knows where to look.

```
HTTP Request
    ↓
Routes (Express Router)
    ↓        ↘ middleware: sessions, validation, auth guards
Controllers (accept request, call services)
    ↓
Services (business rules, security, orchestration)
    ↓
Repositories (MongoDB access via Mongoose)
    ↓
MongoDB
```

Cross-cutting utilities (sessions, crypto, logging, validation helpers) remain stateless and reusable.

---

## Core Modules

- **Auth** (`src/components/auth`) — login/logout, password reset flow, session regeneration.
- **Users** (`src/components/users`) — registration, profile management, password hashing, Zod validation.
- **Note** (`src/components/note`) — create/read/update/delete operations and the user-scoped notes list.

---

## API Overview

| Area  | Method & Path                 | Purpose                                             | Access                |
| ----- | ----------------------------- | --------------------------------------------------- | --------------------- |
| Auth  | `POST /api/auth/login`        | Login with session regeneration                     | Guest only            |
|       | `POST /api/auth/logout`       | Destroy session, clear cookie                       | Authenticated         |
|       | `POST /api/auth/password/forgot` | Start password reset with neutral response         | Public                |
|       | `POST /api/auth/password/reset`  | Validate token, change password, destroy session   | Public (token-based)  |
| Users | `POST /api/user`              | Register user with Zod validation                   | Public                |
|       | `GET /api/user/me`            | Retrieve own profile                                | Authenticated         |
|       | `PATCH /api/user/me`          | Update display name                                 | Authenticated         |
|       | `DELETE /api/user/me`         | Self-delete account and logout                      | Authenticated         |
| Notes | `POST /api/note`              | Create note                                         | Authenticated         |
|       | `GET /api/note`               | List all notes for current user                     | Authenticated         |
|       | `GET /api/note/:id`           | Fetch single note                                   | Owner                 |
|       | `PATCH /api/note/:id`         | Update title/content                                | Owner                 |
|       | `DELETE /api/note/:id`        | Delete note                                         | Owner                 |

Error responses follow RFC 7807 (Problem+JSON) with fields `title`, `status`, `type`, `detail`, `instance`, and `errors` for validation issues.

---

## Security & Data Protection

- **Sessions**: `express-session` + `connect-mongo`, `requireGuest`/`requireAuth` guards, session regeneration on login, destroy helper that wraps callback API in a promise.
- **Passwords**: `bcrypt` with configurable salt rounds, password checks centralized in services to provide consistent error messages.
- **Reset tokens**: selector/validator pair, validator stored as bcrypt hash, TTL index cleans expired tokens, fake hashes mitigate timing attacks.
- **Validation**: Zod schemas; middleware writes results to `req.validatedBody` / `req.validatedParams` / `req.validatedResetToken`.
- **Logging**: Winston transports log structured events (without secrets) to console (except test) and files.

---

## Testing & Quality

- **Jest + Supertest** cover user, auth, and password reset flows end-to-end.
- **Mongo-memory-server** provides fast deterministic database for tests; hooks wipe collections between cases.
- **In-memory mailer** allows asserting emails without external SMTP.
- **ESLint** flat config with `eslint-plugin-n`, `eslint-plugin-jest`, `eslint-plugin-jsdoc`; strict rules for Node/CommonJS.
- **Devlog** (`docs/devlog/*`) records TDD iterations, design decisions, and trade-offs.

---

## Local Run Checklist

1. Install Node.js ≥ 18.18 and MongoDB (or use an Atlas cluster).
2. `npm install`
3. Configure environment variables (see “Configuration” above).
4. `npm run dev` to start the development server with nodemon.
5. `npm test` to run Jest in-band against in-memory MongoDB.

---

## Configuration

The `config` package composes settings from:

- `config/default.json` — baseline values (port, `db.name`, reset token TTL).
- `config/test.json` — test-only overrides (port, test session secret).
- `config/production.json` — production database name.
- `config/custom-environment-variables.json` — mapping for `PORT`, `MONGO_URI`, `SESSION_SECRET`, optionally `FRONTEND_URL`.

`MONGO_URI` and `SESSION_SECRET` **must** be provided via `.env.*` or environment variables; the app fails fast if they are missing.

---

## Logging & Observability

- Structured logs with timestamp, level, and metadata (sanitized payloads).
- File transports: `logs/error.log` and `logs/combined.log`; console output is disabled in test mode.
- Central error handler distinguishes operational `AppError` subclasses from unexpected exceptions and hides stack traces in production.

---

## Project Structure

```
src/
  app.js            # Express app factory
  server.js         # MongoDB connection and HTTP server bootstrap
  components/
    auth/           # Routes, controllers, services for authentication
    users/          # User domain use cases
    note/           # Note CRUD and list endpoints
  config/           # Winston logger, env exposure, DB connection
  middleware/       # Sessions, validation, auth guards
  errors/           # AppError hierarchy + Problem+JSON integration
  utils/            # Session helpers, random util, body sanitizer
tests/
  helpers/          # Expect factories, in-memory mail helper
  utils/            # In-memory Mongo bootstrap
```

---

## Engineering Practices

- **TDD**: features start with a red test → minimal implementation → refactor.
- **Layered design**: thin controllers, business logic in services, persistence in repositories.
- **Dependency injection**: services accept repositories/utils as dependencies to simplify mocking.
- **Documentation**: README, devlog, and TODOs capture reasoning and next steps.

---

## Roadmap

1. Extend notes module (summary view, filters, bulk operations).
2. Swap in a real mail transport (Nodemailer + SMTP/Ethereal) behind `MailService`.
3. Introduce rate limiting (login, password reset) and active session management.
4. Add observability (healthcheck, Prometheus metrics) and audit logging.
5. Produce an OpenAPI contract and wire up minimal CI/CD.

---

## Known Limitations

- Mail delivery relies on in-memory store; a production-ready transport/shaping layer is still required.
- Session cookie currently has `secure: false`; switch to `true` and serve over HTTPS before going live.
- Docker/CI pipeline is not yet part of the repository; planned for the next iteration.

---

## Additional Materials

- **Devlog**: `docs/devlog/*` — TDD journals (e.g., password reset feature notes).
