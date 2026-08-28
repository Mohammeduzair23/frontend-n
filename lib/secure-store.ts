import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'medicare_access_token';
const REFRESH_TOKEN_KEY = 'medicare_refresh_token';
const USER_KEY = 'medicare_user';

export type StoredUser = {
  id: string;
  email: string;
  role: 'Patient' | 'Doctor' | 'Hospital' | 'Labs';
};

export async function saveTokens(accessToken: string, refreshToken?: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveUser(user: StoredUser) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<StoredUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

// ── JWT expiry check ─────────────────────────────────────────────
//
// Decodes only the JWT payload segment (base64url) to read `exp` — no
// signature verification here, that's the server's job on every request.
// This is purely a client-side "is it worth trying this token at all"
// check, used by auth-store's hydrate() to refresh proactively instead of
// always firing the first request with a token we already know is dead.

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  // Fast path — atob is available on modern RN/Hermes and on web.
  if (typeof atob === 'function') {
    return atob(padded);
  }

  // Fallback: manual base64 decode, in case atob isn't polyfilled in this
  // JS engine. No external dependency (Buffer isn't guaranteed in RN either).
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (const char of padded) {
    if (char === '=') break;
    const value = chars.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}

/**
 * True if the token's `exp` claim is in the past (or within `bufferSeconds`
 * of it), or if the token can't be parsed at all — in which case we treat
 * it as expired so the caller refreshes rather than trying a dead token.
 */
export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return true;
    const json = base64UrlDecode(payloadSegment);
    const payload = JSON.parse(json) as { exp?: number };
    if (!payload.exp) return false; // no exp claim present — nothing to check locally
    return Date.now() >= payload.exp * 1000 - bufferSeconds * 1000;
  } catch {
    return true;
  }
}