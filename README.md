# Therapy Insight

A local-first companion that turns your old therapy notes into daily insight,
grounded affirmations, and a record of your growth.

Photograph a page from your notes, let it extract the text, and each day
receive a strength to remember, a reminder drawn from your own words, and a
positive affirmation. Everything is stored encrypted on your device.

> Therapy Insight offers reflections and affirmations drawn from your own notes.
> It is **not** a medical device and does not provide diagnosis or treatment.
> Please keep seeing your therapist. If you are in crisis, use the in-app
> "Need to talk to someone now?" link.

## Features (MVP)

- **Capture** — Take or upload a photo of a note, or write a reflection. Text is
  extracted by a pluggable AI layer, then you review/edit before saving.
- **Today** — A daily strength, a reminder grounded in your own past notes, and a
  positive affirmation. Generated once per day and stored (encrypted).
- **Memories** — A reverse-chronological timeline of everything you've captured,
  with thumbnails and full detail/edit views.
- **Settings** — Choose the insight engine, export a backup, lock, or delete all
  data.

## Privacy model (hybrid)

- All notes, images, and insights are encrypted at rest in IndexedDB using
  AES-GCM. The key is derived from your passphrase with PBKDF2 and never leaves
  memory; only a random salt and a verifier are stored. There is no password
  recovery by design.
- The default **Demo mode** runs entirely on-device and sends nothing anywhere.
- Cloud AI providers (OpenAI / Anthropic) are stubbed behind the same interface
  and are gated behind explicit consent before any data leaves the device.

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS
- Dexie (IndexedDB) + Web Crypto API for encrypted local storage
- vite-plugin-pwa (installable to the home screen)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

Open the app, create a passphrase on first run (demo data is seeded so it feels
alive), and explore.

## Architecture

```
src/
  ai/          Pluggable AIProvider interface + Mock/OpenAI/Anthropic + config
  components/  UI: VaultGate, BottomNav, CrisisFooter, icons
  context/     VaultContext (in-memory key + lock state)
  crypto/      Web Crypto helpers (PBKDF2 + AES-GCM)
  db/          Dexie schema + encrypted repository
  lib/         Image compression + date helpers
  pages/       Today, Capture, Memories, MemoryDetail, Settings
  seed/        First-run demo data (with generated paper-style note images)
  types.ts     Domain models (Note, Insight, Theme, Commitment)
```

## Roadmap (next iterations)

- Theme / topic map: visualize recurring themes across years.
- Commitments & progress: track what you agreed to work on, with charts.
- Real cloud AI providers for stronger handwriting OCR and richer insight.
- Reminders / notifications, and optional encrypted cloud sync.

The data model already includes `Theme` and `Commitment` so these can be built
without a migration.
