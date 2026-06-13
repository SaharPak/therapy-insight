/**
 * Passphrase-based encryption helpers built on the Web Crypto API.
 *
 * A passphrase is stretched with PBKDF2 into an AES-GCM key. That key never
 * leaves memory; only a random salt and a small "verifier" (an encrypted known
 * value) are persisted, so we can confirm a passphrase without storing it.
 */

const PBKDF2_ITERATIONS = 250_000;
const VERIFIER_PLAINTEXT = "therapy-insight:verifier:v1";

export interface EncryptedBlob {
  iv: Uint8Array;
  data: ArrayBuffer;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/** Derive an AES-GCM key from a passphrase + salt. */
export async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(passphrase) as BufferSource,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBytes(
  key: CryptoKey,
  bytes: ArrayBuffer | Uint8Array,
): Promise<EncryptedBlob> {
  const iv = randomBytes(12);
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    bytes as BufferSource,
  );
  return { iv, data };
}

export async function decryptBytes(
  key: CryptoKey,
  blob: EncryptedBlob,
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: blob.iv as BufferSource },
    key,
    blob.data,
  );
}

export async function encryptString(
  key: CryptoKey,
  text: string,
): Promise<EncryptedBlob> {
  return encryptBytes(key, textEncoder.encode(text));
}

export async function decryptString(
  key: CryptoKey,
  blob: EncryptedBlob,
): Promise<string> {
  const buffer = await decryptBytes(key, blob);
  return textDecoder.decode(buffer);
}

export async function encryptJSON<T>(
  key: CryptoKey,
  value: T,
): Promise<EncryptedBlob> {
  return encryptString(key, JSON.stringify(value));
}

export async function decryptJSON<T>(
  key: CryptoKey,
  blob: EncryptedBlob,
): Promise<T> {
  return JSON.parse(await decryptString(key, blob)) as T;
}

/** Build the verifier blob used to validate a passphrase on unlock. */
export async function createVerifier(key: CryptoKey): Promise<EncryptedBlob> {
  return encryptString(key, VERIFIER_PLAINTEXT);
}

/** Returns true if the key can decrypt the verifier (i.e. correct passphrase). */
export async function checkVerifier(
  key: CryptoKey,
  verifier: EncryptedBlob,
): Promise<boolean> {
  try {
    const value = await decryptString(key, verifier);
    return value === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}
