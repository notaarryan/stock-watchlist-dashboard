# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack stock watchlist dashboard. The repo is split into two independent workspaces:

- `server/` — Express 5 + TypeScript REST API (CommonJS, ts-node for dev)
- `client/` — React 19 + Vite 8 + Tailwind CSS 4 SPA (react-router-dom v7, recharts)

## Development Commands

Run each workspace from its own directory:

```bash
# Server (from server/)
npm run dev        # nodemon + ts-node (watches src/)
npm run build      # tsc → dist/
npm start          # node dist/index.js

# Client (from client/)
npm run dev        # Vite dev server with HMR
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # serve the built dist/
```

There are no workspace-level scripts at the repo root that orchestrate both at once — start them in separate terminals.

## Architecture

### Server

`server/src/index.ts` is the entry point. It wires together:
- CORS restricted to `CLIENT_URL` with `credentials: true`
- `express-session` + `passport` (session-based auth, stored server-side)
- Four routers mounted at `/auth`, `/watchlist`, `/stocks`, `/portfolio`

**Routes:**
| Prefix | File | Notes |
|---|---|---|
| `/auth` | `routes/auth.ts` | `POST /register`, `POST /login` (passport.authenticate), `POST /logout`, `GET /me` |
| `/watchlist` | `routes/watchlist.ts` | GET / POST / DELETE `/:symbol` — all require `isAuth` middleware |
| `/stocks` | `routes/stocks.ts` | `GET /search?q=` (Polygon ticker search), `GET /:symbol` (Finnhub live quote), `GET /:symbol/history?range=1W\|1M\|1Y\|10Y` (yahoo-finance2 chart), `GET /:symbol/overview` (Polygon ticker details) |
| `/portfolio` | `routes/portfolio.ts` | GET / POST / DELETE `/:lotId` — all require `isAuth`. Each row is a purchase "lot" (shares, price, date), not a single mutable position — a symbol can have multiple lots; aggregation (avg cost, gain/loss) happens client-side (`client/src/utils/portfolio.ts`), not server-side |

**Auth flow:** Passport LocalStrategy in `passport.ts` — verifies bcrypt password against PostgreSQL, serializes/deserializes by `user_id`.

**Middleware:** `middleware/isAuth.ts` — checks `req.isAuthenticated()`, returns 401 if not.

**Database:** Single `pg.Pool` exported from `db/pool.ts`, configured from `DATABASE_URL`. PostgreSQL tables: `users` (`user_id`, `username`, `password`), `stock_watchlist` (`user_id`, `stock_symbol`), and `portfolio_lots` (`lot_id`, `user_id`, `stock_symbol`, `shares`, `purchase_price`, `purchase_date`, `created_at` — no unique constraint on symbol, since multiple purchase lots per symbol are expected). Schema lives in `server/sql/*.sql`, applied via `npm run migrate` (`ts-node`, dev) or `npm run migrate:prod` (compiled, run once against a fresh database such as Neon before first boot). Every file in `sql/` is re-run on every `npm run migrate` invocation (idempotent via `CREATE TABLE IF NOT EXISTS`) — never add a `DROP TABLE` there, it would wipe data on every future migrate run. The session store (`connect-pg-simple`) also persists to this same database, auto-creating its `session` table on first run.

**Resetting the database:** `npm run db:reset` (`db:reset:prod` compiled) runs `src/db/reset.ts`, a standalone script (deliberately outside `sql/`) that drops `portfolio_lots`, `stock_watchlist`, `session`, and `users` — for wiping stale/manually-created tables before re-running `npm run migrate` to recreate the current schema. Destructive and irreversible; run only when you intend to lose existing data.

**Type augmentation:** `src/types/express.d.ts` extends `Express.User` with `{ user_id, username, password }`. The `tsconfig.json` `typeRoots` includes `./src/types` so this applies globally — do not move this file.

**External APIs (three different providers, each for a different job):**
- Finnhub: real-time stock quote (`/stocks/:symbol`)
- yahoo-finance2 (`yf.chart`): historical OHLCV for `/stocks/:symbol/history` — range maps to an interval (`1W`/`1M` → daily, `1Y` → weekly, `10Y` → monthly) and a `period1` start date computed server-side
- Polygon.io: ticker search (`/stocks/search`) and ticker overview/details (`/stocks/:symbol/overview`)

### Client

Session-based SPA, routed with `react-router-dom` v7 (`src/routes/router.tsx`), wrapped in `RootLaylout` with a `Loader` hydrate fallback and a catch-all `Error` element.

**Auth state:** `context/AuthContext.tsx` holds `{ user, login, logout, loading }`, hydrated on mount via `GET /auth/me` (credentials included). Consume it through the `useAuth()` hook (`hooks/useAuth.ts`) rather than `useContext` directly. `ProtectedRoute` redirects unauthenticated users to `/login`, preserving the origin path in navigation state.

**Pages:** `Home`, `Login`, `Register` are public; `Watchlist` and `Stock` (`stocks/:symbol`) are wrapped in `ProtectedRoute`.

**API base URL:** the client reads the backend origin from `import.meta.env.VITE_BACKEND_URL` (client `.env`) — every fetch to the server must go through this, not a hardcoded host, and must pass `credentials: "include"` for session cookies to work.

Tailwind CSS 4 is configured via `@tailwindcss/vite` plugin (no `tailwind.config.js` — Tailwind 4 uses CSS-first config).

## Environment Variables

Copy `server/.env` for local dev. Required vars:

```
PORT
DATABASE_URL
CLIENT_URL
SESSION_SECRET
FINNHUB_API_KEY
POLYGON_API_KEY
```

`ALPHA_VANTAGE_API_KEY` still exists in `.env` but is no longer referenced by any server route — historical data now comes from yahoo-finance2 instead.

`server/db/pool.ts` connects via `DATABASE_URL` (a full Postgres connection string), not discrete `POSTGRESS_*` host/port/user vars — if you see the latter referenced elsewhere, treat `DATABASE_URL` as authoritative.

Client (`client/.env`) requires:

```
VITE_BACKEND_URL
```

## Deployment (Render backend, Vercel frontend, Neon database)

- **Neon:** create the database, then run `npm run migrate:prod` (after `npm run build`) from `server/` with `DATABASE_URL` pointed at Neon — this is the only way tables get created, there's no auto-migrate on boot. Neon connection strings include `?sslmode=require`; `pg` picks this up automatically via `pg-connection-string`, no extra `ssl` option needed.
- **Render:** root directory `server/`, build command `npm install --include=dev && npm run build`, start command `npm start`. Set `NODE_ENV=production` explicitly — it gates session cookie `secure`/`sameSite` behavior in `src/index.ts` (cross-site cookies from a Vercel frontend need `SameSite=None; Secure`, which requires HTTPS and `app.set("trust proxy", 1)` since Render terminates TLS at its proxy). Sessions are stored in Postgres via `connect-pg-simple`, not in-memory, so auth survives restarts/redeploys.
  - **Build command must use `--include=dev`**, not plain `npm install`: with `NODE_ENV=production` set (required above), `npm install` alone skips `devDependencies` — and `typescript`/`ts-node`/every `@types/*` package the build needs (`tsc` itself) live there. Without `--include=dev` the build fails with a wall of "Cannot find name 'process'" / "Could not find a declaration file for module 'express'" errors, even though the code is fine.
- **Vercel:** root directory `client/`, framework preset Vite. `client/vercel.json` rewrites all paths to `index.html` so client-side routes (e.g. `/watchlist`) don't 404 on refresh/direct nav.
- `CLIENT_URL` (server) and `VITE_BACKEND_URL` (client) must be the deployed origins with no trailing slash — CORS does an exact origin match.
