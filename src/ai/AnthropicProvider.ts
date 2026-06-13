import {
  type AIProvider,
  type CommitmentResult,
  type DailyInsightResult,
  type NoteContext,
  type ThemeResult,
  ProviderNotConfiguredError,
} from "./AIProvider";

/**
 * Stub for a real Anthropic (Claude) provider. See OpenAIProvider for the
 * intended implementation shape. Completed later behind the same surface.
 *
 * Every call must be gated behind explicit user consent because it sends
 * sensitive note content off-device.
 */
export class AnthropicProvider implements AIProvider {
  readonly id = "anthropic" as const;
  readonly label = "Anthropic Claude (cloud)";
  readonly sendsDataOffDevice = true;

  constructor(private readonly apiKey: string) {}

  private ensureConfigured() {
    if (!this.apiKey) throw new ProviderNotConfiguredError("anthropic");
    throw new Error(
      "AnthropicProvider is not implemented yet. Use Demo mode for now.",
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
