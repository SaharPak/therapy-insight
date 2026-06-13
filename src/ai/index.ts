import type { AIProvider, AIProviderId } from "./AIProvider";
import { AnthropicProvider } from "./AnthropicProvider";
import { MockProvider } from "./MockProvider";
import { OpenAIProvider } from "./OpenAIProvider";

export * from "./AIProvider";

const CONFIG_KEY = "therapy-insight:ai-config";

export interface AIConfig {
  provider: AIProviderId;
  /** Stored locally only; never synced. Empty for demo mode. */
  apiKey: string;
}

const DEFAULT_CONFIG: AIConfig = { provider: "mock", apiKey: "" };

export function loadAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<AIConfig>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

/** Build the active provider from config. Falls back to demo mode. */
export function getProvider(config: AIConfig = loadAIConfig()): AIProvider {
  switch (config.provider) {
    case "openai":
      return new OpenAIProvider(config.apiKey);
    case "anthropic":
      return new AnthropicProvider(config.apiKey);
    case "mock":
    default:
      return new MockProvider();
  }
}
