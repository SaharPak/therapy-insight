# Manual Test Plan — Therapy Insight v0.1

No automated test suite ships yet. This is the manual checklist for verifying a
stable build. Run `npm run dev` and open http://localhost:5173 unless noted.

Tip: to test a clean first run, use **Settings → Delete everything** (or clear
the site's IndexedDB + localStorage in browser dev tools).

| # | Test case | Steps | Expected result | Pass |
|---|-----------|-------|-----------------|------|
| 1 | App opens | Open the app URL | Welcome/unlock screen renders with brand, language buttons, no console errors | [ ] |
| 2 | Demo mode loads | Create a passphrase on first run | App lands on Today; Memories shows clearly-fake seeded reflections | [ ] |
| 3 | Add note | Capture → "Write a reflection instead" → type text → Save memory | Returns to Memories; new note appears at/near top | [ ] |
| 4 | Save note (photo) | Capture → choose/take a photo → review extracted text → Save | Note saved with thumbnail; image shown in detail | [ ] |
| 5 | View history | Open Memories | Reverse-chronological list with thumbnails and dates | [ ] |
| 6 | View note detail | Tap a memory | Detail view shows date, full text, image (if any), Edit/Delete | [ ] |
| 7 | Edit note | In detail → Edit text → change → Save | Updated text persists after navigating away and back | [ ] |
| 8 | Delete note | In detail → Delete → confirm | Note removed; returns to Memories with reduced count | [ ] |
| 9 | Search | In Memories, type a word from a note | List filters to matches; non-matches hidden; clearing shows all | [ ] |
| 10 | Search empty state | Search for a string with no matches | "No reflections match your search." message shown | [ ] |
| 11 | Export data | Settings → Export a backup (JSON) | A `therapy-insight-export-YYYY-MM-DD.json` file downloads with decrypted data | [ ] |
| 12 | Clear all data | Settings → Delete everything → confirm | Returns to first-run setup screen; Memories empty after new passphrase | [ ] |
| 13 | Lock | Settings → Lock now | Returns to unlock screen; correct passphrase unlocks, data intact | [ ] |
| 14 | Wrong passphrase | On unlock, enter a wrong passphrase | Gentle error; data stays locked | [ ] |
| 15 | Missing API key behavior | Settings → select OpenAI/Anthropic, leave key empty | App keeps working; Demo mode still functions; no crash | [ ] |
| 16 | External AI consent | Settings → select a cloud provider | Warning shown: "Only use AI analysis if you are comfortable sending this text..."; capture still offers manual entry | [ ] |
| 17 | Privacy & safety copy visible | Open Settings; open "Need to talk to someone now?" | Privacy notice + non-medical disclaimer + crisis note are visible and calm | [ ] |
| 18 | Language toggle (RTL) | Settings → switch to فارسی | Whole UI flips to RTL and Persian; dates use Persian (Jalali) calendar; switch back to English restores LTR | [ ] |
| 19 | Mobile layout | Open dev tools device toolbar (e.g. iPhone) | Layout fits; bottom nav usable; no overflow or clipped controls | [ ] |
| 20 | Build verification | `npm run build` | Type-check + build succeed; `dist/` produced | [ ] |
| 21 | Lint/typecheck | `npm run lint` | Exits 0 with no type errors | [ ] |
| 22 | Reload persistence | Add a note, reload the page, unlock | Note still present (persisted in IndexedDB) | [ ] |

## Notes

- Tests 15 and 16 confirm the app never blocks on missing keys and never sends
  data without consent.
- For a realistic demo, run test 18 in both languages.
- If any test fails, capture the console output and the failing step.
