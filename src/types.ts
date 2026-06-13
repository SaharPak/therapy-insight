/**
 * Core domain types for Therapy Insight.
 *
 * These describe the *decrypted* shape of data as used in the UI. At rest,
 * sensitive fields are encrypted (see src/db/database.ts).
 */

export type NoteSource = "photo" | "manual";

export interface Note {
  id: string;
  /** When the record was created in the app. */
  createdAt: number;
  /** When the session / note actually happened (user-editable). */
  noteDate: number;
  source: NoteSource;
  /** Extracted (and possibly user-edited) text of the note. */
  text: string;
  /** Object URL for the decrypted image, created lazily for display. */
  imageUrl?: string;
  /** Whether this note has an associated image stored. */
  hasImage: boolean;
}

export interface Insight {
  id: string;
  /** ISO date string (YYYY-MM-DD) this insight belongs to. */
  date: string;
  strength: string;
  reminder: string;
  affirmation: string;
  sourceNoteIds: string[];
  /** Language the insight was generated in ("en" | "fa"). */
  lang: string;
  createdAt: number;
}

/** Groundwork for a later iteration: clustered recurring themes. */
export interface Theme {
  id: string;
  label: string;
  noteIds: string[];
  firstSeen: number;
  lastSeen: number;
}

export type CommitmentStatus = "active" | "in_progress" | "done" | "paused";

/** Groundwork for a later iteration: things agreed with the therapist. */
export interface Commitment {
  id: string;
  text: string;
  status: CommitmentStatus;
  /** 0-100 self-reported progress. */
  progress: number;
  noteIds: string[];
  createdAt: number;
}
