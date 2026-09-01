# BLR → LEH → BLR · Road Trip Command Center 🏔️

**Live app:** https://leh.travelerstab.com/

A personal web app I built to plan and survive a ~4,000 km round-trip road journey from
Bangalore to Leh — one of the highest, most remote drives in India. It started as a
spreadsheet, but a spreadsheet can't warn you about altitude sickness at 3 a.m. in a valley
with no signal. So I turned it into a single, installable **trip command center**.

---

## The problem

A Himalayan road trip has three failure modes that ordinary trip planners ignore:

1. **Money creeps.** Fuel, permits, stays, and food across two weeks quietly blow the budget.
2. **Altitude kills the unprepared.** Leh sits at ~3,500 m. Acute Mountain Sickness (AMS) is
   real, and the counter-measures (hydration, SpO2 monitoring, Diamox) only work if you
   actually track them, daily.
3. **Connectivity disappears.** The moments you most need your plan — a booking reference, an
   emergency number — are exactly when you have no network.

## The approach

One app that is **offline-first, health-aware, and honest about money** — shareable publicly
for anyone following along, but with personal data gated behind a passphrase.

---

## What's inside

| Module | What it does | Why it matters (PM lens) |
| ------ | ------------ | ------------------------ |
| 🗺️ **Itinerary** | Day-by-day BLR→LEH→BLR plan with routes, stops, and emergency contacts | The "source of truth" that keeps two travelers aligned |
| 💸 **Expense Tracker** | Log spends on the go; stored in a real database | Turns "where did the money go?" into a live, answerable question |
| 🧮 **Budget Calculator** | Detailed pre-trip budget breakdown | Sets expectations *before* the trip, not after |
| 🩺 **Wellness Log** | Daily **SpO2, water intake, headache, and Diamox** tracking | The genuinely novel feature — treats AMS as a product problem, not an afterthought |
| ✅ **Checklist** | Packing & prep checklist with persistent state | Reduces "did we forget the permits?" anxiety |
| 🏨 **Bookings** | Hotel/stay tracker with a verification status | Distinguishes *planned* from *confirmed* — a subtle but trip-saving distinction |

## Product decisions worth calling out

- **Public itinerary, private data.** The plan is shareable; expenses, wellness, and notes sit
  behind a passphrase gate. One product, two audiences.
- **Offline-first, not offline-maybe.** Ships as a PWA (installable to a phone home screen)
  with a service worker and an **offline write queue** that syncs when signal returns — because
  the mountains don't have Wi-Fi.
- **Health as a first-class feature.** Most travel apps stop at logistics. Tracking SpO2 and
  Diamox reframes the app around traveler *safety*, which is the actual job-to-be-done.

---

## Tech stack

Built to run entirely on the edge, with zero servers to babysit:

- **Frontend:** vanilla HTML/JS in `public/` — a lightweight PWA (service worker + manifest)
- **Backend:** Cloudflare Pages Functions (`functions/`) — serverless API at the edge
- **Database:** Cloudflare D1 (SQLite) — schema in `schema.sql`
- **Auth:** passphrase login with HMAC-signed session cookies + edge middleware

### Repository layout

```
functions/        Serverless API (auth, expenses, wellness, bookings, checklist, notes)
public/           PWA frontend — itinerary, tracker, budget, login, service worker
schema.sql        D1 database schema (entries, notes, checklists, bookings, wellness)
wrangler.toml     Cloudflare Pages + D1 configuration
.dev.vars.example Template for local secrets (copy to .dev.vars)
```

---

## Running it locally

```bash
npm install                 # 1. install dependencies
npx wrangler login          # 2. authenticate to Cloudflare
cp .dev.vars.example .dev.vars   # 3. create local secrets, then edit the values
npm run db:init:local       # 4. build the local database from schema.sql
npm run dev                 # 5. run at http://localhost:8788
```

### Environment variables

Set in `.dev.vars` locally, and in **Cloudflare Pages → Settings → Variables and Secrets**
for production. Never commit real values.

| Variable         | Purpose                          |
| ---------------- | -------------------------------- |
| `AUTH_PASS`      | Passphrase that gates login      |
| `SESSION_SECRET` | Key used to sign session cookies |

**Getting / resetting the login passphrase.** `AUTH_PASS` is a value *you choose* — the
passphrase entered on the live site's login page. It's already configured for the deployed app.
Cloudflare stores it encrypted and **cannot show it back**, so retrieve it from your password
manager. To reset: Cloudflare dashboard → **Workers & Pages → leh → Settings → Variables and
Secrets** → edit `AUTH_PASS` → save → redeploy (`npm run deploy`) → mirror the value in
`.dev.vars`.

## Deploy

```bash
npm run deploy      # deploy to Cloudflare Pages
npm run db:init     # (re)initialise the REMOTE D1 database from schema.sql
```

## Scripts

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Run locally with `wrangler pages dev` |
| `npm run deploy`        | Deploy to Cloudflare Pages            |
| `npm run db:init`       | Apply `schema.sql` to remote D1       |
| `npm run db:init:local` | Apply `schema.sql` to local D1        |

---

## Files kept out of git

Gitignored — back these up separately (e.g. a cloud drive) if moving to a new machine:

- `.dev.vars` — your local dev secrets (`AUTH_PASS`, `SESSION_SECRET`)
- `.wrangler/`, `node_modules/`, local D1 database — all auto-regenerated, no backup needed
