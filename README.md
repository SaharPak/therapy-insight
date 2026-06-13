# Therapy Insight

A **private, local-first reflection companion**. It gives you a calm place to
collect therapy notes, personal reflections, and emotional check-ins over time,
and gently helps you remember your own growth by surfacing past reflections and
affirmations drawn from your own words.

Available in English and Persian (Farsi), with full right-to-left support.

> **This app is a personal reflection tool. It is not therapy, medical advice,
> diagnosis, or treatment, and it does not replace a licensed professional.**
>
> If you are in immediate danger or may harm yourself or someone else, contact
> local emergency services or a crisis helpline immediately. The in-app
> "Need to talk to someone now?" link lists helplines.

## What this project is

- A gentle, private journal for reflections, therapy notes, and affirmations.
- Local-first: your data is encrypted and stored only on your device.
- A personal wellbeing experiment / portfolio piece.

## What this project is NOT

- Not a medical, diagnostic, or therapeutic product.
- Not a replacement for therapy or professional care.
- No accounts, no social features, no public sharing, no payments.
- No server: nothing is uploaded anywhere by default.

## Core user journey

1. Open the app and read the privacy & safety notice.
2. Create a passphrase (encrypts everything on your device).
3. Add a reflection / therapy note (type it, or photograph a page).
4. Browse and search your saved reflections.
5. Open a reflection to read, edit, or delete it.
6. See a gentle daily affirmation, a strength, and a reminder drawn from your
   own past notes on the **Today** screen.
7. Export your data, or clear everything, from **Settings**.

## Screens

- **Today** — daily affirmation, a strength to remember, and a gentle reminder
  grounded in your own notes.
- **Capture** — add a reflection by typing or photographing a note.
- **Memories** — searchable, reverse-chronological history with detail/edit/delete.
- **Settings** — language, insight engine, data export, lock, delete-all, and the
  Privacy & Safety notice.

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS
- Dexie (IndexedDB) + Web Crypto API for encrypted local storage
- vite-plugin-pwa (installable to the home screen)
- npm as the package manager

## Local setup

Requirements: Node.js 18+ (developed on Node 25) and npm.

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
npm run build    # type-check + production build (outputs to dist/)
npm run preview  # preview the production build locally
npm run lint     # type-check only (tsc --noEmit)
```

On first run you choose a passphrase, and a small set of clearly-fake demo
reflections is seeded so the app feels alive. See "Demo mode" below.

## Demo mode

The default **Demo mode** runs fully offline and needs no API keys or real data:

- A handful of clearly-fictional sample reflections are seeded on first run.
- The daily affirmation/strength/reminder are produced on-device from a built-in
  content set (and from your own notes once you add them).
- Nothing leaves your device.

To start fresh with your own data, go to **Settings → Delete everything**, then
create a new passphrase.

## How your data is stored

- All notes, images, and insights are encrypted at rest in **IndexedDB** using
  **AES-GCM (256-bit)**. The key is derived from your passphrase with **PBKDF2
  (250k iterations, SHA-256)** and kept only in memory.
- Only a random salt and a small verifier are persisted, never your passphrase.
- **There is no password recovery** — that is what keeps the data private. If you
  forget the passphrase, the data cannot be decrypted.
- **Export**: Settings → "Export a backup (JSON)" downloads a decrypted JSON copy
  for your own safekeeping.
- **Delete**: Settings → "Delete everything" wipes the local database and
  passphrase. "Lock now" clears the in-memory key without deleting data.

## AI / external API behavior

- **Demo mode (default)** is fully on-device and is the recommended mode.
- **OpenAI / Anthropic** providers exist as clearly-labelled stubs. They are
  **optional**, **off by default**, and **not wired to a network in this
  version** — selecting them shows a clear notice.
- If/when implemented, any cloud call is gated behind **explicit consent** and a
  warning: "Only use AI analysis if you are comfortable sending this text to the
  selected AI provider." A missing API key never blocks the app; it falls back to
  Demo mode.

## Environment variables

None are required. The app has no backend and no build-time secrets. See
[.env.example](.env.example) for details. API keys (if you ever enable a cloud
provider) are entered in the app and stored only in your browser's localStorage.

## Deployment

This is a static single-page app (plus a service worker). Build and deploy the
`dist/` folder to any static host:

```bash
npm run build    # produces dist/
```

- **Netlify / Vercel / Cloudflare Pages**: build command `npm run build`, output
  directory `dist`. Add a SPA fallback so client routes work (rewrite all paths
  to `/index.html`).
- **GitHub Pages / any static server**: serve `dist/` and configure the same SPA
  fallback to `index.html`.

No server-side runtime, database, or environment configuration is needed.

## Privacy notes

- Local-first by design: no accounts, no servers, no analytics, no tracking.
- Data is encrypted on-device and only you (with your passphrase) can read it.
- Clearing your browser site data also deletes the local database.

## Known limitations

- **No passphrase recovery.** Forgetting it means the data is unrecoverable.
- **Cloud AI is stubbed.** Real handwriting OCR / AI insight is not implemented;
  Demo mode covers the full experience.
- **OCR demo is sample text**, not true recognition of your handwriting.
- **Dev-server advisory**: `npm audit` flags `esbuild`/`vite` (development server
  only; not shipped in `dist/`). Fixing requires a breaking `vite@8` upgrade,
  intentionally deferred for v0.1 stability.
- Single-device only; there is no sync or cloud backup (export JSON manually).
- No automated test suite yet; see [MANUAL_TEST_PLAN.md](MANUAL_TEST_PLAN.md).

## Future ideas (not in v0.1)

- Tags / mood labels and date filtering.
- Theme map and progress tracking (data model already includes `Theme` and
  `Commitment`).
- A real, consent-gated AI provider via a backend proxy (so keys never live in
  the browser).
- Optional encrypted export/import for moving between devices.

## Project structure

```
src/
  ai/          Pluggable AIProvider interface + Mock/OpenAI/Anthropic + config
  components/  UI: VaultGate, BottomNav, CrisisFooter, icons
  context/     VaultContext (in-memory key + lock state)
  crypto/      Web Crypto helpers (PBKDF2 + AES-GCM)
  db/          Dexie schema + encrypted repository
  i18n/        English/Persian translations + language context (RTL)
  lib/         Image compression + date helpers (Jalali-aware)
  pages/       Today, Capture, Memories, MemoryDetail, Settings
  seed/        First-run demo data (clearly fictional)
  types.ts     Domain models (Note, Insight, Theme, Commitment)
```
