import {
  type AIProvider,
  type CommitmentResult,
  type DailyInsightResult,
  type NoteContext,
  type ThemeResult,
  ProviderNotConfiguredError,
} from "./AIProvider";

/**
 * Stub for a real OpenAI-backed provider. Wired behind the same AIProvider
 * surface so it can be completed later without touching the rest of the app.
 *
 * Intended implementation:
 *  - ocr(): send the image to a vision model and return extracted text.
 *  - generateDailyInsight(): prompt with recent notes + strong safety system
 *    prompt (affirmations/reminders only, never clinical advice).
 *  - extractThemes()/extractCommitments(): structured JSON extraction.
 *
 * Every call must be gated behind explicit user consent because it sends
 * sensitive note content off-device.
 */
export class OpenAIProvider implements AIProvider {
  readonly id = "openai" as const;
  readonly label = "OpenAI (cloud)";
  readonly sendsDataOffDevice = true;

  constructor(private readonly apiKey: string) {}

  private ensureConfigured() {
    if (!this.apiKey) throw new ProviderNotConfiguredError("openai");
    throw new Error(
      "OpenAIProvider is not implemented yet. Use Demo mode for now.",
    );
  }

  async ocr(_image: Blob): Promise<string> {
    this.ensureConfigured();
    return "";
  }

  async generateDailyInsight(
    _notes: NoteContext[],
    _date: string,
  ): Promise<DailyInsightResult> {
    this.ensureConfigured();
    return { strength: "", reminder: "", affirmation: "", sourceNoteIds: [] };
  }

  async extractThemes(_notes: NoteContext[]): Promise<ThemeResult[]> {
    this.ensureConfigured();
    return [];
  }

  async extractCommitments(_notes: NoteContext[]): Promise<CommitmentResult[]> {
    this.ensureConfigured();
    return [];
  }
}
