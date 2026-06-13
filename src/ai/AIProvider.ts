/**
 * Pluggable AI provider abstraction.
 *
 * The whole app talks to this interface, never to a concrete vendor. In the
 * MVP a MockProvider supplies realistic demo output with zero network calls.
 * Real providers (OpenAI / Anthropic) drop in later behind the same surface.
 */

export interface NoteContext {
  id: string;
  text: string;
  /** Epoch millis of when the session happened. */
  noteDate: number;
}

export interface DailyInsightResult {
  /** A strength to be reminded of today. */
  strength: string;
  /** A gentle reminder, ideally grounded in the user's own notes. */
  reminder: string;
  /** A positive affirmation for the day. */
  affirmation: string;
  /** Notes that informed this insight. */
  sourceNoteIds: string[];
}

export interface ThemeResult {
  label: string;
  noteIds: string[];
}

export interface CommitmentResult {
  text: string;
  noteIds: string[];
}

export type AIProviderId = "mock" | "openai" | "anthropic";

/** Language hint for generated content. */
export type AILang = "en" | "fa";

export interface AIProvider {
  readonly id: AIProviderId;
  readonly label: string;
  /** True when using the provider sends note data off-device. */
  readonly sendsDataOffDevice: boolean;

  /** Extract text from a photographed note. */
  ocr(image: Blob, lang?: AILang): Promise<string>;

  /** Build today's grounded insight from recent notes. */
  generateDailyInsight(
    notes: NoteContext[],
    date: string,
    lang?: AILang,
  ): Promise<DailyInsightResult>;

  /** Cluster recurring themes across notes (groundwork for later UI). */
  extractThemes(notes: NoteContext[]): Promise<ThemeResult[]>;

  /** Pull out commitments / agreed actions (groundwork for later UI). */
  extractCommitments(notes: NoteContext[]): Promise<CommitmentResult[]>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(
      `The "${provider}" provider is not configured yet. Add an API key in Settings, or switch to Demo mode.`,
    );
    this.name = "ProviderNotConfiguredError";
  }
}
