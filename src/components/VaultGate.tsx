import { useState, type FormEvent } from "react";
import { useVault } from "../context/VaultContext";
import { useLang } from "../i18n/LanguageContext";
import { langLabel, type Lang } from "../i18n/translations";
import { LockIcon, SparkIcon } from "./icons";

/**
 * Shown before the app is unlocked. Handles both first-run setup (create a
 * passphrase) and returning unlock. The passphrase never leaves the device and
 * is never stored; it only derives the in-memory encryption key.
 */
export function VaultGate() {
  const { status, setup, unlock } = useVault();
  const { t, lang, setLang } = useLang();
  const isSetup = status === "needs_setup";

  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (isSetup) {
      if (passphrase.length < 6) {
        setError(t("gate_err_short"));
        return;
      }
      if (passphrase !== confirm) {
        setError(t("gate_err_match"));
        return;
      }
      setBusy(true);
      try {
        await setup(passphrase);
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      const ok = await unlock(passphrase);
      if (!ok) setError(t("gate_err_wrong"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell min-h-screen justify-center px-6 py-10">
      <div className="animate-fade-up">
        <div className="mb-4 flex justify-center gap-2">
          {(["en", "fa"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                lang === l
                  ? "bg-sage-500 text-white"
                  : "bg-white/70 text-sage-600"
              }`}
            >
              {langLabel[l]}
            </button>
          ))}
        </div>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-500 text-white shadow-soft">
            <SparkIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-serif text-2xl text-sage-700">
            {t("brand")}
          </h1>
          <p className="mt-2 text-sm text-sage-600">
            {isSetup ? t("gate_setup_subtitle") : t("gate_unlock_subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-sage-600">
              {t("gate_passphrase")}
            </span>
            <input
              type="password"
              autoFocus
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="input mt-1"
              placeholder={t("gate_passphrase_ph")}
              autoComplete={isSetup ? "new-password" : "current-password"}
            />
          </label>

          {isSetup && (
            <label className="block">
              <span className="text-xs font-medium text-sage-600">
                {t("gate_confirm")}
              </span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input mt-1"
                placeholder={t("gate_confirm_ph")}
                autoComplete="new-password"
              />
            </label>
          )}

          {error && <p className="text-sm text-bloom-500">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            <LockIcon className="h-4 w-4" />
            {busy ? t("gate_working") : isSetup ? t("gate_create") : t("gate_unlock")}
          </button>

          {isSetup && (
            <p className="text-center text-xs text-sage-500/80">
              {t("gate_no_recovery")}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
