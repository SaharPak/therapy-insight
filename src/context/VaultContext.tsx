import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createVault, unlockVault, vaultExists } from "../db/database";
import { seedDemoData } from "../seed/seed";

type VaultStatus = "loading" | "needs_setup" | "locked" | "unlocked";

interface VaultContextValue {
  status: VaultStatus;
  /** The in-memory AES key. Only present when unlocked. */
  key: CryptoKey | null;
  /** Create a brand new vault (first run). */
  setup: (passphrase: string) => Promise<void>;
  /** Try to unlock an existing vault. Returns false on wrong passphrase. */
  unlock: (passphrase: string) => Promise<boolean>;
  lock: () => void;
  /** Re-check whether a vault exists (after a wipe, for example). */
  refresh: () => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<VaultStatus>("loading");
  const [key, setKey] = useState<CryptoKey | null>(null);

  const refresh = useCallback(async () => {
    const exists = await vaultExists();
    setKey(null);
    setStatus(exists ? "locked" : "needs_setup");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setup = useCallback(async (passphrase: string) => {
    const newKey = await createVault(passphrase);
    await seedDemoData(newKey);
    setKey(newKey);
    setStatus("unlocked");
  }, []);

  const unlock = useCallback(async (passphrase: string) => {
    const unlocked = await unlockVault(passphrase);
    if (!unlocked) return false;
    setKey(unlocked);
    setStatus("unlocked");
    return true;
  }, []);

  const lock = useCallback(() => {
    setKey(null);
    setStatus("locked");
  }, []);

  const value = useMemo<VaultContextValue>(
    () => ({ status, key, setup, unlock, lock, refresh }),
    [status, key, setup, unlock, lock, refresh],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within a VaultProvider");
  return ctx;
}

/** Convenience hook for screens that are only mounted when unlocked. */
export function useVaultKey(): CryptoKey {
  const { key } = useVault();
  if (!key) throw new Error("Vault is locked; no key available");
  return key;
}
