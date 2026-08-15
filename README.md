# deploy_prod_api

Building end to end CICD pipeline

## Getting Started

Install dependencies:

```
npm install
```

Run the server:

```
npm start        # node src/index.js
npm run dev      # node --watch src/index.js (auto-restarts on file changes)
```

The server listens on `PORT` (from a `.env` file) or defaults to `3000`.

Every request passes through, in order: `helmet` (security-related HTTP headers), `cors` (cross-origin request headers), `express.json()` / `express.urlencoded()` (JSON and form body parsing), `morgan` (Apache-style request logging, piped into the `winston` logger at `src/config/logger.js` — see `logs/combined.log`), and `cookieParser` (parses `req.cookies`).

## API Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/` | Basic hello-world route |
| GET | `/health` | Liveness check (status + timestamp) — for uptime monitors / load balancers |
| GET | `/api` | Sanity-check that the API is reachable |
| POST | `/api/auth/sign-up` | Validates the body against `signUpSchema` (Zod) and returns the would-be user — not yet wired to password hashing or the database |
| POST | `/api/auth/sign-in` | Placeholder — not yet wired to credential checking or issuing a JWT |
| POST | `/api/auth/sign-out` | Placeholder — not yet wired to clearing the auth cookie |

Any unmatched route returns a `404 { error: "Not Found" }`. Unhandled errors passed to `next(err)` are caught by a final error-handling middleware, logged via `winston`, and returned as a generic `500 { error: "Internal Server Error" }`.

## Project Structure

- `src/index.js` — entry point; loads `.env` via `dotenv/config`, then boots `src/server.js`.
- `src/server.js` — imports the Express app from `src/app.js` and starts it with `app.listen()`.
- `src/app.js` — defines the Express app, middleware, routes, and the 404/error handlers (no server startup here).
- `src/routes/auth.routes.js` — `/api/auth/*` route definitions (currently placeholder handlers).
- `src/validations/auth.validation.js` — Zod schemas (`signUpSchema`, `signInSchema`) describing expected request bodies; `signUpSchema` is applied in `signup` (`src/controllers/auth.controller.js`), `signInSchema` isn't wired in yet.
- `src/utils/jwt.js` — `jwt_token.sign()` wraps `jsonwebtoken` to issue tokens. **Known bug**: `jwt_token.verify` is not actually defined due to a brace-scoping mistake (it's dead code inside `sign`, not a sibling object property) — calling `jwt_token.verify(...)` currently throws `TypeError: jwt_token.verify is not a function`.
- `src/utils/cookies.js` — `cookies.set/get/clear` helpers with shared cookie defaults (httpOnly, secure in production, 24h maxAge) — intended for storing an auth token cookie.
- `src/utils/format.js` — `formatValidationErrors()` turns a Zod validation error into a single readable string.
- `src/config/database.js` — creates the Neon SQL client and the Drizzle `db` instance used to query it.
- `src/models/` — Drizzle table schema definitions (picked up by `drizzle-kit` for migrations). Currently: `users` (id, name, email, password, role, timestamps).
- `drizzle.config.js` — `drizzle-kit` configuration: where schema files live, where generated migrations go, and the DB connection string.
- `src/config/logger.js` — a `winston` logger (file transports for errors/combined logs, plus console output outside production).

## Import Aliases

This project uses Node's [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) (the `imports` field in `package.json`) so internal modules can be imported by alias instead of relative paths:

```js
import logger from '#config/logger.js';
```

Available aliases (each maps `#name/*` → `./src/name/*`): `#config`, `#controllers`, `#models`, `#routes`, `#utils`, `#validate`, `#services`, `#middleware`.

## Architecture

```mermaid
flowchart LR
    subgraph Boot
        A[src/index.js<br/>loads .env] --> B[src/server.js<br/>app.listen]
    end
    B --> C[src/app.js<br/>middleware + routes]
    C --> R[src/routes/auth.routes.js<br/>/api/auth/*]
    R -. "not yet wired in" .-> J[src/utils/jwt.js<br/>sign / verify*]
    R --> V[src/validations/auth.validation.js<br/>Zod schemas]
    R -. "not yet wired in" .-> K[src/utils/cookies.js<br/>set / get / clear]
    C -. "not yet wired in" .-> D[src/config/database.js<br/>drizzle db client]
    D --> E[(Neon Postgres)]
    F[drizzle.config.js] -. "npm run db:generate / db:migrate" .-> E
    F --> G[src/models/*.js<br/>table schemas]
```
<sub>*`verify` is broken — see the note under `src/utils/jwt.js` in Project Structure.</sub>

Request flow: `index.js` loads env vars → `server.js` starts the HTTP server around the app defined in `app.js` → middleware runs → route handlers respond. `/api/auth/sign-in` and `/api/auth/sign-out` are still placeholder handlers; `/api/auth/sign-up` now validates its body against `signUpSchema` and logs via `winston`, but the JWT and cookie helpers aren't called from any route yet. The database layer (`config/database.js`, using Drizzle + the Neon serverless driver) is set up but not yet called from any route — once a route imports `db` from `src/config/database.js`, it can query Neon Postgres using schemas defined in `src/models/`. Migrations are managed separately via `drizzle-kit` (`npm run db:generate`, `npm run db:migrate`, `npm run db:studio`), driven by `drizzle.config.js`.

## Database (Neon + Drizzle)

This project uses [Neon](https://neon.tech) (serverless Postgres) as the database and [Drizzle ORM](https://orm.drizzle.team) to query it.

1. Copy `.env.example` to `.env` and set `Database_URL` to your Neon connection string.
2. Define tables as Drizzle schemas under `src/models/`.
3. Generate and run migrations:

```
npm run db:generate    # generate SQL migrations from src/models/ schema
npm run db:migrate     # apply migrations to the database
npm run db:studio      # open Drizzle Studio to browse data
```

> Note: the env var is currently named `Database_URL` (mixed case) in `.env.example` and read the same way in `src/config/database.js` / `drizzle.config.js` — it works, but doesn't follow the conventional `UPPER_SNAKE_CASE` env var naming.

## Linting & Formatting

ESLint (`@eslint/js` recommended rules) plus Prettier are configured via `eslint.config.js`.

```
npm run lint           # check for lint/formatting issues
npm run lint:fix        # auto-fix what it can
npm run format          # apply Prettier formatting
npm run format:check    # check formatting without writing changes
```
