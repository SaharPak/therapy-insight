import { useState } from "react";
import { useVault, useVaultKey } from "../context/VaultContext";
import {
  type AIConfig,
  type AIProviderId,
  loadAIConfig,
  saveAIConfig,
} from "../ai";
import { useLang } from "../i18n/LanguageContext";
import { type Lang, langLabel } from "../i18n/translations";
import { exportAll, wipeAllData } from "../db/database";
import {
  GearIcon,
  HeartIcon,
  LockIcon,
  SparkIcon,
  TrashIcon,
} from "../components/icons";

const PROVIDER_IDS: AIProviderId[] = ["mock", "openai", "anthropic"];

export function Settings() {
  const key = useVaultKey();
  const { lock, refresh } = useVault();
  const { t, lang, setLang } = useLang();

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
    const sure = window.confirm(t("settings_wipe_confirm"));
    if (!sure) return;
    await wipeAllData();
    await refresh();
  }

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex items-center gap-2">
        <GearIcon className="h-6 w-6 text-sage-500" />
        <h1 className="font-serif text-2xl text-sage-700">
          {t("settings_title")}
        </h1>
      </header>

      <section className="card space-y-3">
        <h2 className="font-medium text-sage-700">{t("settings_language")}</h2>
        <div className="flex gap-2">
          {(["en", "fa"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                lang === l
                  ? "border-sage-400 bg-sage-50 text-sage-700"
                  : "border-sand-200 bg-white/60 text-sage-600"
              }`}
            >
              {langLabel[l]}
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <SparkIcon className="h-5 w-5 text-sage-500" />
          <h2 className="font-medium text-sage-700">{t("settings_engine")}</h2>
          {savedFlash && (
            <span className="ms-auto text-xs text-sage-500">
              {t("settings_saved")}
            </span>
          )}
        </div>
        <div className="space-y-2">
          {PROVIDER_IDS.map((id) => (
            <label
              key={id}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${
                config.provider === id
                  ? "border-sage-400 bg-sage-50"
                  : "border-sand-200 bg-white/60"
              }`}
            >
              <input
                type="radio"
                name="provider"
                className="mt-1 accent-sage-500"
                checked={config.provider === id}
                onChange={() => updateConfig({ ...config, provider: id })}
              />
              <span>
                <span className="block text-sm font-medium text-sage-700">
                  {t(`provider_${id}_label`)}
                </span>
                <span className="block text-xs text-sage-500">
                  {t(`provider_${id}_note`)}
                </span>
              </span>
            </label>
          ))}
        </div>

        {config.provider !== "mock" && (
          <>
            <p className="rounded-2xl bg-bloom-400/10 p-3 text-xs leading-relaxed text-sage-700">
              {t("settings_ai_warning")}
            </p>
            <label className="block">
              <span className="text-xs font-medium text-sage-600">
                {t("settings_apikey")}
              </span>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) =>
                  updateConfig({ ...config, apiKey: e.target.value })
                }
                className="input mt-1"
                placeholder={t("settings_apikey_ph")}
              />
              <span className="mt-1 block text-xs text-sage-500/80">
                {t("settings_apikey_note")}
              </span>
            </label>
          </>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-medium text-sage-700">{t("settings_data")}</h2>
        <p className="text-xs text-sage-500">{t("settings_data_note")}</p>
        <button onClick={handleExport} className="btn-ghost w-full">
          {t("settings_export")}
        </button>
        <button onClick={lock} className="btn-ghost w-full">
          <LockIcon className="h-4 w-4" />
          {t("settings_lock")}
        </button>
        <button
          onClick={handleWipe}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-bloom-400/40 bg-bloom-400/10 px-5 py-3 font-medium text-bloom-500 transition active:scale-[0.98]"
        >
          <TrashIcon className="h-4 w-4" />
          {t("settings_delete")}
        </button>
      </section>

      <section className="card space-y-3">
        <div className="flex items-center gap-2">
          <HeartIcon className="h-5 w-5 text-sage-500" />
          <h2 className="font-medium text-sage-700">
            {t("settings_privacy_title")}
          </h2>
        </div>
        <p className="text-xs leading-relaxed text-sage-600">
          {t("settings_privacy_local")}
        </p>
        <p className="text-xs leading-relaxed text-sage-600">
          {t("settings_disclaimer")}
        </p>
        <p className="rounded-2xl bg-bloom-400/10 p-3 text-xs leading-relaxed text-sage-700">
          {t("settings_crisis_note")}
        </p>
      </section>
    </div>
  );
}
