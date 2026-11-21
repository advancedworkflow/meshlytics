import { generateAnonymousId, generateSessionId } from "@meshlytics/core";

/**
 * Where the SDK keeps visitor identity between page loads. The shape
 * matches the Web Storage API, so `window.localStorage` and
 * `window.sessionStorage` fit directly; a cookie-backed implementation
 * works too (e.g. to share ids across subdomains).
 */
export interface MeshlyticsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * - `"memory"` (default): nothing is written to the device; ids last
 *   for the current page only. No consent needed.
 * - `"localStorage"` / `"sessionStorage"`: resolved lazily (safe during
 *   SSR), falling back to memory when unavailable.
 * - any `MeshlyticsStorage`.
 */
export type StorageOption = "memory" | "localStorage" | "sessionStorage" | MeshlyticsStorage;

export const STORAGE_KEYS = {
  anonymousId: "meshlytics_anonymous_id",
  session: "meshlytics_session",
  userId: "meshlytics_user_id",
} as const;

/** Inactivity after which a new session starts (same default as GA / PostHog). */
export const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function memoryStorage(): MeshlyticsStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
}

/** The named Web Storage when it exists and is writable, else `null`. */
function webStorage(name: "localStorage" | "sessionStorage"): MeshlyticsStorage | null {
  try {
    const storage = (globalThis as Record<string, unknown>)[name] as MeshlyticsStorage | undefined;
    if (!storage) return null;
    const probe = "meshlytics_probe";
    storage.setItem(probe, probe);
    storage.removeItem(probe);
    return storage;
  } catch {
    // Safari private mode, disabled cookies, sandboxed iframe...
    return null;
  }
}

function resolveStorage(option: StorageOption): MeshlyticsStorage | null {
  if (option === "memory") return null;
  if (option === "localStorage" || option === "sessionStorage") return webStorage(option);
  return option;
}

interface StoredSession {
  id: string;
  lastActivity: number;
}

function parseSession(raw: string | null): StoredSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredSession>;
    return typeof value.id === "string" && typeof value.lastActivity === "number"
      ? { id: value.id, lastActivity: value.lastActivity }
      : null;
  } catch {
    return null;
  }
}

export interface IdentityOptions {
  storage?: StorageOption;
  sessionTimeoutMs?: number;
}

export interface Identity {
  /** Stable for as long as the storage keeps it, until `reset()`. */
  anonymousId(): string;
  /** Current session id; starts a new session after the inactivity timeout. Counts as activity. */
  sessionId(now?: number): string;
  userId(): string | undefined;
  setUserId(id: string): void;
  /** Forgets the user and starts over with a fresh anonymous id and session (e.g. on logout). */
  reset(): void;
  /** Switches storage at runtime, e.g. once consent is given or withdrawn. */
  setStorage(storage: StorageOption): void;
}

const ALL_KEYS = Object.values(STORAGE_KEYS);

export function createIdentity(options: IdentityOptions = {}): Identity {
  const timeout = options.sessionTimeoutMs ?? DEFAULT_SESSION_TIMEOUT_MS;
  let option: StorageOption = options.storage ?? "memory";
  // Resolved lazily so creating a client during SSR never touches storage.
  let persistent: MeshlyticsStorage | null | undefined;
  // Always holds the current values: the only store in "memory" mode,
  // and a safety net when the persistent store throws (quota, revoked access).
  let memory = memoryStorage();

  const store = () => (persistent === undefined ? (persistent = resolveStorage(option)) : persistent);

  function read(key: string): string | null {
    const backing = store();
    if (backing) {
      try {
        const value = backing.getItem(key);
        if (value !== null) return value;
      } catch {
        // Fall through to memory.
      }
    }
    return memory.getItem(key);
  }

  function write(key: string, value: string): void {
    memory.setItem(key, value);
    try {
      store()?.setItem(key, value);
    } catch {
      // Keep the in-memory copy.
    }
  }

  function remove(key: string): void {
    memory.removeItem(key);
    try {
      store()?.removeItem(key);
    } catch {
      // Nothing else to do.
    }
  }

  return {
    anonymousId() {
      const existing = read(STORAGE_KEYS.anonymousId);
      if (existing) return existing;
      const id = generateAnonymousId();
      write(STORAGE_KEYS.anonymousId, id);
      return id;
    },

    sessionId(now = Date.now()) {
      const session = parseSession(read(STORAGE_KEYS.session));
      const id = session && now - session.lastActivity < timeout ? session.id : generateSessionId();
      write(STORAGE_KEYS.session, JSON.stringify({ id, lastActivity: now }));
      return id;
    },

    userId() {
      return read(STORAGE_KEYS.userId) ?? undefined;
    },

    setUserId(id) {
      write(STORAGE_KEYS.userId, id);
    },

    reset() {
      for (const key of ALL_KEYS) remove(key);
    },

    setStorage(next) {
      const previous = store();
      const current = new Map(ALL_KEYS.map((key) => [key, read(key)] as const));

      option = next;
      persistent = undefined;
      memory = memoryStorage();
      const target = store();

      for (const key of ALL_KEYS) {
        // A returning visitor's stored ids win over this page's
        // temporary ones; anything missing is carried over.
        let stored: string | null = null;
        try {
          stored = target?.getItem(key) ?? null;
        } catch {
          // Treat as missing.
        }
        const value = key === STORAGE_KEYS.userId ? current.get(key) ?? stored : stored ?? current.get(key);
        if (value) write(key, value);
      }

      // Leaving a persistent store (e.g. consent withdrawn) wipes it.
      if (previous && previous !== target) {
        for (const key of ALL_KEYS) {
          try {
            previous.removeItem(key);
          } catch {
            // Nothing else to do.
          }
        }
      }
    },
  };
}
