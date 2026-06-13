import { useState, type FormEvent } from "react";
import { useVault } from "../context/VaultContext";
import { LockIcon, SparkIcon } from "./icons";

/**
 * Shown before the app is unlocked. Handles both first-run setup (create a
 * passphrase) and returning unlock. The passphrase never leaves the device and
 * is never stored; it only derives the in-memory encryption key.
 */
export function VaultGate() {
  const { status, setup, unlock } = useVault();
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
        setError("Please choose a passphrase of at least 6 characters.");
        return;
      }
      if (passphrase !== confirm) {
        setError("The two passphrases do not match.");
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
      if (!ok) setError("That passphrase didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell min-h-screen justify-center px-6 py-10">
      <div className="animate-fade-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-500 text-white shadow-soft">
            <SparkIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-serif text-2xl text-sage-700">
            Therapy Insight
          </h1>
          <p className="mt-2 text-sm text-sage-600">
            {isSetup
              ? "Let's protect your notes. Choose a passphrase \u2014 it stays on this device and encrypts everything you save."
              : "Welcome back. Enter your passphrase to unlock your notes."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-sage-600">
              Passphrase
            </span>
            <input
              type="password"
              autoFocus
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="input mt-1"
              placeholder="Your private passphrase"
              autoComplete={isSetup ? "new-password" : "current-password"}
            />
          </label>

          {isSetup && (
            <label className="block">
              <span className="text-xs font-medium text-sage-600">
                Confirm passphrase
              </span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input mt-1"
                placeholder="Type it again"
                autoComplete="new-password"
              />
            </label>
          )}

          {error && <p className="text-sm text-bloom-500">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            <LockIcon className="h-4 w-4" />
            {busy
              ? "Working\u2026"
              : isSetup
                ? "Create my private space"
                : "Unlock"}
          </button>

          {isSetup && (
            <p className="text-center text-xs text-sage-500/80">
              There is no password recovery — that's what keeps your notes
              private. Keep your passphrase somewhere safe.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
