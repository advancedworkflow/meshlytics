import { describe, expect, it } from "vitest";
import {
  createIdentity,
  DEFAULT_SESSION_TIMEOUT_MS,
  memoryStorage,
  STORAGE_KEYS,
  type MeshlyticsStorage,
} from "./identity.js";

const MINUTE = 60_000;

function throwingStorage(): MeshlyticsStorage {
  return {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
}

describe("anonymousId", () => {
  it("is generated once, then reused from storage", () => {
    const storage = memoryStorage();
    const id = createIdentity({ storage }).anonymousId();

    expect(id).toMatch(/^anon_/);
    expect(storage.getItem(STORAGE_KEYS.anonymousId)).toBe(id);
    // A second client on the same storage = the next page load.
    expect(createIdentity({ storage }).anonymousId()).toBe(id);
  });
});

describe("sessionId", () => {
  it("survives a page load within the inactivity window", () => {
    const storage = memoryStorage();
    const first = createIdentity({ storage }).sessionId(0);
    expect(createIdentity({ storage }).sessionId(29 * MINUTE)).toBe(first);
  });

  it("rolls over after 30 minutes of inactivity by default", () => {
    const identity = createIdentity({ storage: memoryStorage() });
    const first = identity.sessionId(0);
    expect(identity.sessionId(DEFAULT_SESSION_TIMEOUT_MS)).not.toBe(first);
  });

  it("extends the window on every activity", () => {
    const identity = createIdentity({ storage: memoryStorage() });
    const first = identity.sessionId(0);
    identity.sessionId(20 * MINUTE);
    identity.sessionId(40 * MINUTE);
    expect(identity.sessionId(60 * MINUTE)).toBe(first);
  });

  it("honours a custom timeout", () => {
    const identity = createIdentity({ storage: memoryStorage(), sessionTimeoutMs: MINUTE });
    const first = identity.sessionId(0);
    expect(identity.sessionId(2 * MINUTE)).not.toBe(first);
  });

  it("starts a new session when the stored value is corrupt", () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEYS.session, "{not json");
    expect(createIdentity({ storage }).sessionId(0)).toMatch(/^ses_/);
  });
});

describe("userId and reset", () => {
  it("persists the identified user across page loads", () => {
    const storage = memoryStorage();
    createIdentity({ storage }).setUserId("user_1");
    expect(createIdentity({ storage }).userId()).toBe("user_1");
  });

  it("reset forgets the user and issues a new anonymous id and session", () => {
    const identity = createIdentity({ storage: memoryStorage() });
    identity.setUserId("user_1");
    const anon = identity.anonymousId();
    const session = identity.sessionId(0);

    identity.reset();

    expect(identity.userId()).toBeUndefined();
    expect(identity.anonymousId()).not.toBe(anon);
    expect(identity.sessionId(1)).not.toBe(session);
  });
});

describe("storage failures", () => {
  it("keeps ids stable for the page when storage throws", () => {
    const identity = createIdentity({ storage: throwingStorage() });
    const anon = identity.anonymousId();
    identity.setUserId("user_1");

    expect(identity.anonymousId()).toBe(anon);
    expect(identity.sessionId(0)).toBe(identity.sessionId(1));
    expect(identity.userId()).toBe("user_1");
    expect(() => identity.reset()).not.toThrow();
  });

  it("falls back to memory when localStorage is unavailable (SSR, Node)", () => {
    const identity = createIdentity({ storage: "localStorage" });
    expect(identity.anonymousId()).toBe(identity.anonymousId());
  });
});

describe("default storage", () => {
  it("is memory: ids are stable within a page but nothing outlives it", () => {
    const page1 = createIdentity();
    expect(page1.anonymousId()).toBe(page1.anonymousId());
    expect(createIdentity().anonymousId()).not.toBe(page1.anonymousId());
  });
});

describe("setStorage (consent)", () => {
  it("persists the current page's ids once consent is given", () => {
    const device = memoryStorage();
    const identity = createIdentity();
    const anon = identity.anonymousId();
    const session = identity.sessionId(0);
    identity.setUserId("user_1");

    identity.setStorage(device);

    expect(device.getItem(STORAGE_KEYS.anonymousId)).toBe(anon);
    expect(device.getItem(STORAGE_KEYS.userId)).toBe("user_1");
    // Next page load, same device.
    const next = createIdentity({ storage: device });
    expect(next.anonymousId()).toBe(anon);
    expect(next.sessionId(MINUTE)).toBe(session);
  });

  it("recognises a returning visitor: stored ids win over this page's temporary ones", () => {
    const device = memoryStorage();
    const known = createIdentity({ storage: device }).anonymousId();

    const identity = createIdentity(); // consent banner not answered yet
    const temporary = identity.anonymousId();
    identity.setStorage(device);

    expect(temporary).not.toBe(known);
    expect(identity.anonymousId()).toBe(known);
  });

  it("keeps the user identified on this page even if the device remembered another", () => {
    const device = memoryStorage();
    createIdentity({ storage: device }).setUserId("old_user");

    const identity = createIdentity();
    identity.setUserId("new_user");
    identity.setStorage(device);

    expect(identity.userId()).toBe("new_user");
  });

  it("wipes the device when consent is withdrawn, without changing ids mid-page", () => {
    const device = memoryStorage();
    const identity = createIdentity({ storage: device });
    const anon = identity.anonymousId();
    identity.setUserId("user_1");

    identity.setStorage("memory");

    for (const key of Object.values(STORAGE_KEYS)) expect(device.getItem(key)).toBeNull();
    expect(identity.anonymousId()).toBe(anon);
    expect(identity.userId()).toBe("user_1");
  });
});
