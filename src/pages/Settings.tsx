import { useState } from "react";
import { useVault, useVaultKey } from "../context/VaultContext";
import {
  type AIConfig,
  type AIProviderId,
  loadAIConfig,
  saveAIConfig,
} from "../ai";
import { exportAll, wipeAllData } from "../db/database";
import { GearIcon, LockIcon, SparkIcon, TrashIcon } from "../components/icons";

const PROVIDERS: { id: AIProviderId; label: string; note: string }[] = [
  {
    id: "mock",
    label: "Demo mode (on-device)",
    note: "Realistic sample output. Nothing leaves your device.",
  },
  {
    id: "openai",
    label: "OpenAI (cloud)",
    note: "Coming soon. Sends note content off-device when enabled.",
  },
  {
    id: "anthropic",
    label: "Anthropic Claude (cloud)",
    note: "Coming soon. Sends note content off-device when enabled.",
  },
];

export function Settings() {
  const key = useVaultKey();
  const { lock, refresh } = useVault();

  const [config, setConfig] = useState<AIConfig>(loadAIConfig());
  const [savedFlash, setSavedFlash] = useState(false);

  function updateConfig(next: AIConfig) {
    setConfig(next);
    saveAIConfig(next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  async function handleExport() {
    const data = await exportAll(key);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `therapy-insight-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleWipe() {
    const sure = window.confirm(
      "Delete ALL notes, insights and your passphrase from this device? This cannot be undone.",
    );
    if (!sure) return;
    await wipeAllData();
    await refresh();
  }

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex items-center gap-2">
        <GearIcon className="h-6 w-6 text-sage-500" />
        <h1 className="font-serif text-2xl text-sage-700">Settings</h1>
      </header>

      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <SparkIcon className="h-5 w-5 text-sage-500" />
          <h2 className="font-medium text-sage-700">Insight engine</h2>
          {savedFlash && (
            <span className="ml-auto text-xs text-sage-500">Saved</span>
          )}
        </div>
        <div className="space-y-2">
          {PROVIDERS.map((p) => (
            <label
              key={p.id}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${
                config.provider === p.id
                  ? "border-sage-400 bg-sage-50"
                  : "border-sand-200 bg-white/60"
              }`}
            >
              <input
                type="radio"
                name="provider"
                className="mt-1 accent-sage-500"
                checked={config.provider === p.id}
                onChange={() => updateConfig({ ...config, provider: p.id })}
              />
              <span>
                <span className="block text-sm font-medium text-sage-700">
                  {p.label}
                </span>
                <span className="block text-xs text-sage-500">{p.note}</span>
              </span>
            </label>
          ))}
        </div>

        {config.provider !== "mock" && (
          <label className="block">
            <span className="text-xs font-medium text-sage-600">API key</span>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) =>
                updateConfig({ ...config, apiKey: e.target.value })
              }
              className="input mt-1"
              placeholder="Stored only on this device"
            />
            <span className="mt-1 block text-xs text-sage-500/80">
              Cloud providers aren't wired up yet in this prototype. Demo mode
              gives you the full experience today.
            </span>
          </label>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-medium text-sage-700">Your data</h2>
        <p className="text-xs text-sage-500">
          Everything is encrypted on this device with your passphrase. Export a
          decrypted backup, or remove it all.
        </p>
        <button onClick={handleExport} className="btn-ghost w-full">
          Export a backup (JSON)
        </button>
        <button onClick={lock} className="btn-ghost w-full">
          <LockIcon className="h-4 w-4" />
          Lock now
        </button>
        <button
          onClick={handleWipe}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-bloom-400/40 bg-bloom-400/10 px-5 py-3 font-medium text-bloom-500 transition active:scale-[0.98]"
        >
          <TrashIcon className="h-4 w-4" />
          Delete everything
        </button>
      </section>

      <p className="px-2 text-center text-xs leading-relaxed text-sage-500/80">
        Therapy Insight offers reflections and affirmations drawn from your own
        notes. It is not a medical device and does not provide diagnosis or
        treatment. Please keep seeing your therapist.
      </p>
    </div>
  );
}
