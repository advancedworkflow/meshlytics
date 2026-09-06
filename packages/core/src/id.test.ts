import { describe, expect, it } from "vitest";
import { generateAnonymousId, generateId, generateSessionId } from "./id.js";

describe("generateId", () => {
  it("returns a non-empty string with no prefix", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
    expect(id).not.toContain("_");
  });

  it("prefixes the id with an underscore separator", () => {
    const id = generateId("evt");
    expect(id.startsWith("evt_")).toBe(true);
  });

  it("generates unique values across calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("generateSessionId", () => {
  it("is prefixed with ses_", () => {
    expect(generateSessionId().startsWith("ses_")).toBe(true);
  });
});

describe("generateAnonymousId", () => {
  it("is prefixed with anon_", () => {
    expect(generateAnonymousId().startsWith("anon_")).toBe(true);
  });
});
