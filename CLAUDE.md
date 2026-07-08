# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack stock watchlist dashboard. The repo is split into two independent workspaces:

- `server/` — Express 5 + TypeScript REST API (CommonJS, ts-node for dev)
- `client/` — React 19 + Vite 8 + Tailwind CSS 4 SPA

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
- `express-session` + `passport` (session-based auth, stored server-side)
- Three routers mounted at `/auth`, `/watchlist`, `/stocks`

**Routes:**
| Prefix | File | Notes |
|---|---|---|
| `/auth` | `routes/auth.ts` | `POST /register`, `POST /login` (passport.authenticate), `POST /logout` |
| `/watchlist` | `routes/watchlist.ts` | GET / POST / DELETE `/:symbol` — all require `isAuth` middleware |
| `/stocks` | `routes/stocks.ts` | `GET /:symbol` (Finnhub live quote), `GET /:symbol/history?range=1W\|1M\|1Y\|10Y` (Alpha Vantage) |

**Auth flow:** Passport LocalStrategy in `passport.ts` — verifies bcrypt password against PostgreSQL, serializes/deserializes by `user_id`.

**Middleware:** `middleware/isAuth.ts` — checks `req.isAuthenticated()`, returns 401 if not.

**Database:** Single `pg.Pool` exported from `db/pool.ts`. PostgreSQL tables: `users` (`user_id`, `username`, `password`) and `stock_watchlist` (`user_id`, `stock_symbol`).

**Type augmentation:** `src/types/express.d.ts` extends `Express.User` with `{ user_id, username, password }`. The `tsconfig.json` `typeRoots` includes `./src/types` so this applies globally — do not move this file.

**External APIs:**
- Finnhub: real-time stock quote (`/stocks/:symbol`)
- Alpha Vantage: historical OHLCV, range maps to `TIME_SERIES_DAILY` (1W/1M), `TIME_SERIES_WEEKLY` (1Y), `TIME_SERIES_MONTHLY` (10Y)

### Client

Currently the Vite + React scaffold (`client/src/App.tsx`). The actual watchlist UI is not yet built. Tailwind CSS 4 is configured via `@tailwindcss/vite` plugin (no `tailwind.config.js` — Tailwind 4 uses CSS-first config).

## Environment Variables

Copy `server/.env` for local dev. Required vars:

```
PORT
POSTGRESS_PORT / POSTGRESS_USERNAME / POSTGRESS_HOST / POSTGRESS_PASSWORD / POSTGRESS_DB
SESSION_SECRET
FINNHUB_API_KEY
ALPHA_VANTAGE_API_KEY
```

Note: the env var prefix is `POSTGRESS_` (double-s) — match this exactly in new code.
