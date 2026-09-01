# Leh Trip Itinerary & Budget Planner

**Live demo:** https://leh.travelerstab.com/

A Cloudflare Pages app (static frontend + Pages Functions API) backed by a Cloudflare D1
database. Includes a trip itinerary, budget/expense tracker, checklist, wellness log, and a
passphrase-gated login for personal data.

## Tech stack

- **Frontend:** static HTML/JS in `public/` (PWA with service worker + manifest)
- **Backend:** Cloudflare Pages Functions in `functions/`
- **Database:** Cloudflare D1 (SQLite), schema in `schema.sql`
- **Config:** `wrangler.toml`

## Prerequisites

- Node.js + npm
- A Cloudflare account (for deploy and remote D1)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Authenticate to Cloudflare (opens browser)
npx wrangler login

# 3. Create your local secrets file (gitignored)
cp .dev.vars.example .dev.vars
# then edit .dev.vars and set AUTH_PASS and SESSION_SECRET

# 4. Build the local D1 database from the schema
npm run db:init:local

# 5. Run the app locally
npm run dev
```

## Environment variables

Set in `.dev.vars` for local dev, and in **Cloudflare Pages → Settings → Environment
variables** for production. Never commit real values.

| Variable         | Purpose                              |
| ---------------- | ------------------------------------ |
| `AUTH_PASS`      | Passphrase that gates login          |
| `SESSION_SECRET` | Key used to sign session cookies     |

### Getting / resetting the login passphrase

`AUTH_PASS` is a value **you choose** — it's the passphrase entered on the login page of the
live site. It is already configured in Cloudflare for the deployed app.

- **To retrieve it:** Cloudflare stores it encrypted and **cannot show it back** to you.
  Look it up wherever you saved it (e.g. a password manager). Secret env vars are write-only
  in the dashboard.
- **To reset it (if forgotten):**
  1. Cloudflare dashboard → **Workers & Pages** → the **leh** Pages project
  2. **Settings → Variables and Secrets**
  3. Edit `AUTH_PASS`, set a new value, and **Save**
  4. Redeploy (`npm run deploy`) or trigger a new deployment so the change takes effect
  5. Put the same value in your local `.dev.vars`

## Deploy

```bash
npm run deploy          # deploy to Cloudflare Pages
npm run db:init         # (re)initialise the REMOTE D1 database from schema.sql
```

## Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Run locally with `wrangler pages dev`    |
| `npm run deploy`        | Deploy to Cloudflare Pages               |
| `npm run db:init`       | Apply `schema.sql` to remote D1          |
| `npm run db:init:local` | Apply `schema.sql` to local D1           |

## Files that are NOT in git

These are gitignored — back them up separately (e.g. cloud drive) if you need them on a new
machine:

- `.dev.vars` — your local dev secrets (`AUTH_PASS`, `SESSION_SECRET`)
- `.wrangler/`, `node_modules/`, local D1 database — all auto-regenerated, no backup needed
