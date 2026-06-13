# Stabilization Report — Therapy Insight

Target: a clean, reliable **v0.1 stable** version. Scope: stabilize, document,
and make demo-ready. No big new features, no redesign, no new architecture.

Date: 2026-06-13

---

## 1. Current status: STABLE ✅

The app installs, runs, builds, type-checks, and the full core journey works in
both English and Persian (RTL). Demo mode works with no secrets. Privacy and
safety messaging is clear and non-medical.

| Definition of Done | Status |
|---|---|
| 1. Installs successfully (`npm ci`) | ✅ |
| 2. Runs locally (`npm run dev`) | ✅ |
| 3. Build passes (`npm run build`) | ✅ |
| 4. TypeScript/lint passes (`npm run lint`) | ✅ (no ESLint; tsc is the linter — documented) |
| 5. Core user journey works end-to-end | ✅ (verified in browser) |
| 6. Demo mode works without real data/keys | ✅ |
| 7. Privacy & safety messaging clear | ✅ (Settings card + crisis link) |
| 8. README accurate | ✅ (rewritten) |
| 9. `.env.example` exists | ✅ (documents that no env vars are required) |
| 10. `MANUAL_TEST_PLAN.md` exists | ✅ |
| 11. `STABILIZATION_REPORT.md` exists | ✅ (this file) |

## 2. Audit findings (what I inspected)

- **Framework / tooling**: Vite 5 + React 18 + TypeScript, Tailwind CSS,
  vite-plugin-pwa. Package manager: npm. Scripts: `dev`, `build`, `preview`,
  `lint`.
- **Data storage**: Local-first. Dexie (IndexedDB) with all sensitive content
  encrypted via Web Crypto (PBKDF2 → AES-GCM-256). Passphrase-gated; key kept in
  memory only; no recovery by design.
- **AI/API dependencies**: A pluggable `AIProvider` interface. Default
  `MockProvider` is fully on-device. `OpenAIProvider` / `AnthropicProvider` are
  intentional stubs (not networked). No API keys in the repo; keys (if ever set)
  live only in `localStorage`.
- **Routes/screens**: Today, Capture, Memories, MemoryDetail, Settings, plus a
  VaultGate (setup/unlock) and a persistent crisis-resources footer.
- **Build/runtime**: Clean. `npm ci`, `npm run lint`, and `npm run build` all
  succeed. No runtime/console errors observed in browser verification.
- **Privacy/safety**: Strong baseline (encryption, no server, crisis link). Gaps
  were copy/clarity, not behavior (addressed below).

## 3. What was broken / missing (and fixed)

This repo was already in good shape, so stabilization was about closing small
gaps against the Definition of Done rather than fixing breakage:

- **No search/browse of past notes** → Added a simple, client-side search box to
  the Memories screen (case-insensitive substring match), with a clear
  no-results empty state. RTL/Persian aware. (`src/pages/Memories.tsx`,
  `src/i18n/translations.ts`)
- **Privacy & safety copy was thin / not the required wording** → Added a
  dedicated **Privacy & safety** card in Settings with: a local-first privacy
  explanation, the exact non-medical disclaimer ("It is not therapy, medical
  advice, diagnosis, or treatment…"), and a calm crisis note. (`src/pages/Settings.tsx`)
- **AI consent warning not explicit enough** → Added the explicit warning
  ("Only use AI analysis if you are comfortable sending this text to the selected
  AI provider.") shown when a cloud provider is selected. (`src/pages/Settings.tsx`)
- **Docs missing/outdated** → Rewrote `README.md` (setup, run, build, deploy,
  data storage, demo mode, AI behavior, env vars, privacy, safety, known
  limitations, future ideas). Added `.env.example`, `MANUAL_TEST_PLAN.md`, and
  this report.

All changes kept lint and build green; new features were verified in-browser.

## 4. What still needs manual setup

**Nothing is required to run or demo the app.** It works fully offline in Demo
mode with no configuration.

Optional, only if you later want real cloud AI:
- Implement `OpenAIProvider` / `AnthropicProvider` (currently stubs).
- Strongly recommended: route those calls through a small backend proxy so the
  API key never lives in the browser. The current design stores any in-app key
  in `localStorage`, which is acceptable for a local prototype but not ideal for
  a shipped product.

## 5. What is safe to demo

- The entire app in Demo mode: first-run passphrase setup, Today
  affirmation/strength/reminder, adding reflections (typed or photo), the
  Memories list + search + detail/edit/delete, export JSON, lock, delete-all.
- Language switching between English and Persian (RTL, Jalali calendar).
- The Privacy & Safety notice and crisis-resources link.
- Seeded demo content is clearly fictional and contains no real personal data,
  names, locations, or medical details.

## 6. What should NOT be touched yet

- **Crypto layer** (`src/crypto/crypto.ts`, vault logic in `src/db/database.ts`,
  `src/context/VaultContext.tsx`): correct and security-sensitive. Changing key
  derivation, salt/verifier handling, or the IndexedDB schema risks making
  existing local data permanently unreadable. Leave as-is unless adding a proper
  versioned migration.
- **i18n key set** (`src/i18n/translations.ts`): English and Persian dictionaries
  must stay in sync; the `t()` keys are typed against the English object.
- **The AI provider interface contract**: stubs are wired behind it; keep the
  interface stable so a real provider can drop in later.

## 7. Next 5 recommended tasks

1. **Add a versioned Dexie migration path** before any schema change, so future
   features don't risk existing encrypted data.
2. **Implement a real, consent-gated AI provider via a backend proxy** (keys off
   the client), reusing the existing `AIProvider` interface and consent flow.
3. **Add lightweight tags / mood labels** (the data model and UI are simple
   enough to extend) plus filtering in Memories.
4. **Introduce automated tests**: unit tests for the crypto round-trip and the
   DB repository, and a smoke test for the core journey (e.g. Vitest +
   Playwright).
5. **Resolve the dev-only `esbuild`/`vite` advisory** by planning a controlled
   upgrade to a patched Vite (a breaking `vite@8` bump), tested against the build.

## 8. Verification log (this pass)

- `npm ci` → success (416 packages).
- `npm run lint` → exit 0, no type errors.
- `npm run build` → success; `dist/` produced (JS ~316 kB / ~105 kB gzip).
- Browser verification → core journey, Persian RTL + Jalali dates, new search
  (incl. no-results + clear), Privacy & Safety card, and AI consent warning all
  confirmed; no console errors.

### Known, accepted limitations

- No passphrase recovery (intentional; protects privacy).
- Cloud AI + OCR are stubs; Demo mode covers the experience.
- `npm audit` reports 2 dev-only advisories (esbuild/vite dev server); not in the
  shipped `dist/`. Deferred to avoid a breaking upgrade in v0.1.
- Single-device; no sync (manual JSON export/import only).
- No automated test suite yet (manual plan provided).
