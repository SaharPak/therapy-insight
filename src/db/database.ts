import Dexie, { type Table } from "dexie";
import type { Commitment, Insight, Note, NoteSource, Theme } from "../types";
import {
  type EncryptedBlob,
  checkVerifier,
  createVerifier,
  decryptBytes,
  decryptJSON,
  deriveKey,
  encryptBytes,
  encryptJSON,
  randomBytes,
} from "../crypto/crypto";

/** Row stored at rest. Sensitive content lives only inside EncryptedBlob fields. */
interface NoteRow {
  id: string;
  createdAt: number;
  noteDate: number;
  source: NoteSource;
  text: EncryptedBlob;
  image?: EncryptedBlob;
}

interface InsightRow {
  id: string;
  date: string;
  createdAt: number;
  payload: EncryptedBlob;
}

interface ThemeRow {
  id: string;
  createdAt: number;
  payload: EncryptedBlob;
}

interface CommitmentRow {
  id: string;
  createdAt: number;
  payload: EncryptedBlob;
}

interface MetaRow {
  key: string;
  value: unknown;
}

class TherapyInsightDB extends Dexie {
  notes!: Table<NoteRow, string>;
  insights!: Table<InsightRow, string>;
  themes!: Table<ThemeRow, string>;
  commitments!: Table<CommitmentRow, string>;
  meta!: Table<MetaRow, string>;

  constructor() {
    super("therapy-insight");
    this.version(1).stores({
      notes: "id, createdAt, noteDate",
      insights: "id, date, createdAt",
      themes: "id, createdAt",
      commitments: "id, createdAt",
      meta: "key",
    });
  }
}

export const db = new TherapyInsightDB();

const SALT_KEY = "vault:salt";
const VERIFIER_KEY = "vault:verifier";

function newId(): string {
  return crypto.randomUUID();
}

/* ----------------------------- Vault lifecycle ---------------------------- */

export async function vaultExists(): Promise<boolean> {
  const salt = await db.meta.get(SALT_KEY);
  return Boolean(salt);
}

/** Create a brand new vault from a passphrase. Returns the session key. */
export async function createVault(passphrase: string): Promise<CryptoKey> {
  const salt = randomBytes(16);
  const key = await deriveKey(passphrase, salt);
  const verifier = await createVerifier(key);
  await db.meta.bulkPut([
    { key: SALT_KEY, value: salt },
    { key: VERIFIER_KEY, value: verifier },
  ]);
  return key;
}

/** Unlock an existing vault. Returns the key on success, or null if wrong passphrase. */
export async function unlockVault(passphrase: string): Promise<CryptoKey | null> {
  const saltRow = await db.meta.get(SALT_KEY);
  const verifierRow = await db.meta.get(VERIFIER_KEY);
  if (!saltRow || !verifierRow) return null;

  const key = await deriveKey(passphrase, saltRow.value as Uint8Array);
  const ok = await checkVerifier(key, verifierRow.value as EncryptedBlob);
  return ok ? key : null;
}

/* --------------------------------- Notes ---------------------------------- */

export interface NewNoteInput {
  text: string;
  noteDate: number;
  source: NoteSource;
  imageBytes?: ArrayBuffer;
}

async function rowToNote(key: CryptoKey, row: NoteRow): Promise<Note> {
  const text = await decryptJSON<string>(key, row.text);
  let imageUrl: string | undefined;
  if (row.image) {
    const bytes = await decryptBytes(key, row.image);
    const blob = new Blob([bytes], { type: "image/jpeg" });
    imageUrl = URL.createObjectURL(blob);
  }
  return {
    id: row.id,
    createdAt: row.createdAt,
    noteDate: row.noteDate,
    source: row.source,
    text,
    imageUrl,
    hasImage: Boolean(row.image),
  };
}

export async function addNote(
  key: CryptoKey,
  input: NewNoteInput,
): Promise<string> {
  const id = newId();
  const row: NoteRow = {
    id,
    createdAt: Date.now(),
    noteDate: input.noteDate,
    source: input.source,
    text: await encryptJSON(key, input.text),
    image: input.imageBytes
      ? await encryptBytes(key, input.imageBytes)
      : undefined,
  };
  await db.notes.put(row);
  return id;
}

export async function updateNoteText(
  key: CryptoKey,
  id: string,
  text: string,
): Promise<void> {
  await db.notes.update(id, { text: await encryptJSON(key, text) });
}

/** All notes, newest session first. Image URLs are created for display. */
export async function getNotes(key: CryptoKey): Promise<Note[]> {
  const rows = await db.notes.orderBy("noteDate").reverse().toArray();
  return Promise.all(rows.map((row) => rowToNote(key, row)));
}

export async function getNote(
  key: CryptoKey,
  id: string,
): Promise<Note | undefined> {
  const row = await db.notes.get(id);
  return row ? rowToNote(key, row) : undefined;
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function countNotes(): Promise<number> {
  return db.notes.count();
}

/* -------------------------------- Insights -------------------------------- */

type InsightPayload = Pick<
  Insight,
  "strength" | "reminder" | "affirmation" | "sourceNoteIds" | "lang"
>;

export async function getInsightForDate(
  key: CryptoKey,
  date: string,
): Promise<Insight | undefined> {
  const row = await db.insights.where("date").equals(date).first();
  if (!row) return undefined;
  const payload = await decryptJSON<InsightPayload>(key, row.payload);
  return { id: row.id, date: row.date, createdAt: row.createdAt, ...payload };
}

export async function saveInsight(
  key: CryptoKey,
  date: string,
  payload: InsightPayload,
): Promise<Insight> {
  const existing = await db.insights.where("date").equals(date).first();
  const id = existing?.id ?? newId();
  const createdAt = existing?.createdAt ?? Date.now();
  await db.insights.put({
    id,
    date,
    createdAt,
    payload: await encryptJSON(key, payload),
  });
  return { id, date, createdAt, ...payload };
}

/* ----------------------- Themes & Commitments (groundwork) ---------------- */

export async function getThemes(key: CryptoKey): Promise<Theme[]> {
  const rows = await db.themes.toArray();
  return Promise.all(rows.map((r) => decryptJSON<Theme>(key, r.payload)));
}

export async function saveTheme(key: CryptoKey, theme: Theme): Promise<void> {
  await db.themes.put({
    id: theme.id,
    createdAt: Date.now(),
    payload: await encryptJSON(key, theme),
  });
}

export async function getCommitments(key: CryptoKey): Promise<Commitment[]> {
  const rows = await db.commitments.toArray();
  return Promise.all(rows.map((r) => decryptJSON<Commitment>(key, r.payload)));
}

export async function saveCommitment(
  key: CryptoKey,
  commitment: Commitment,
): Promise<void> {
  await db.commitments.put({
    id: commitment.id,
    createdAt: Date.now(),
    payload: await encryptJSON(key, commitment),
  });
}

/* ------------------------------- Maintenance ------------------------------ */

export async function wipeAllData(): Promise<void> {
  await db.delete();
  await db.open();
}

/** Decrypt everything into a portable backup object (for export). */
export async function exportAll(key: CryptoKey) {
  const [notes, insights, themes, commitments] = await Promise.all([
    getNotes(key),
    db.insights.toArray().then((rows) =>
      Promise.all(
        rows.map(async (row) => ({
          id: row.id,
          date: row.date,
          createdAt: row.createdAt,
          ...(await decryptJSON<InsightPayload>(key, row.payload)),
        })),
      ),
    ),
    getThemes(key),
    getCommitments(key),
  ]);
  // Strip transient object URLs from the export.
  const exportableNotes = notes.map(({ imageUrl: _omit, ...rest }) => rest);
  return {
    app: "therapy-insight",
    version: 1,
    exportedAt: new Date().toISOString(),
    notes: exportableNotes,
    insights,
    themes,
    commitments,
  };
}
