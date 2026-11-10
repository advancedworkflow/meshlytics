import { describe, expect, it, vi } from "vitest";
import { createClient } from "./client.js";
import { memoryStorage } from "./identity.js";
import type { MeshlyticsPlan, PlanRoute } from "./types.js";

const ALL_ON: PlanRoute["params"] = { routeParams: true, queryParams: true, utmParams: true, referrer: true };

function makePlan(routes: PlanRoute[], excludedRoutes?: string[]): MeshlyticsPlan {
  return {
    version: 1,
    generatedAt: "2026-09-06T12:00:00.000Z",
    application: { framework: "next", router: "app" },
    routes,
    excludedRoutes,
  };
}

describe("createClient().track", () => {
  it("emits a named event carrying properties and a session/anonymous id", () => {
    const transport = vi.fn();
    const client = createClient({ transport });

    client.track("checkout_started", { plan: "pro" });

    expect(transport).toHaveBeenCalledTimes(1);
    const event = transport.mock.calls[0]![0];
    expect(event.name).toBe("checkout_started");
    expect(event.properties).toEqual({ plan: "pro" });
    expect(event.sessionId).toMatch(/^ses_/);
    expect(event.anonymousId).toMatch(/^anon_/);
    expect(() => new Date(event.timestamp).toISOString()).not.toThrow();
  });
});

describe("createClient().page", () => {
  it("emits a page_view event with the given route and options", () => {
    const transport = vi.fn();
    const client = createClient({ transport });

    client.page({ route: "/checkout", queryParams: { utm_source: "x" }, referrer: "https://x.com" });

    const event = transport.mock.calls[0]![0];
    expect(event.name).toBe("page_view");
    expect(event.route).toBe("/checkout");
    expect(event.queryParams).toEqual({ utm_source: "x" });
    expect(event.referrer).toBe("https://x.com");
  });

  it("leaves route undefined when none is given and there is no browser location", () => {
    const transport = vi.fn();
    const client = createClient({ transport });

    client.page();

    expect(transport.mock.calls[0]![0].route).toBeUndefined();
  });

  it("passes query/utm/referrer through unchanged when no plan is configured", () => {
    const transport = vi.fn();
    const client = createClient({ transport });

    client.page({ route: "/", queryParams: { a: "1" }, utm: { source: "x" }, referrer: "r" });

    const event = transport.mock.calls[0]![0];
    expect(event.queryParams).toEqual({ a: "1" });
    expect(event.utm).toEqual({ source: "x" });
    expect(event.referrer).toBe("r");
  });

  it("strips a parameter the plan disables for that route, even if it was passed in", () => {
    const plan: MeshlyticsPlan = {
      version: 1,
      generatedAt: "2026-09-06T12:00:00.000Z",
      application: { framework: "next", router: "app" },
      routes: [
        { path: "/", params: { routeParams: true, queryParams: false, utmParams: false, referrer: true } },
      ],
    };
    const transport = vi.fn();
    const client = createClient({ transport, plan });

    client.page({ route: "/", queryParams: { a: "1" }, utm: { source: "x" }, referrer: "r" });

    const event = transport.mock.calls[0]![0];
    expect(event.queryParams).toBeUndefined();
    expect(event.utm).toBeUndefined();
    expect(event.referrer).toBe("r");
  });

  it("emits nothing for a route the plan doesn't mention", () => {
    const transport = vi.fn();
    const client = createClient({
      transport,
      plan: makePlan([{ path: "/tracked", params: ALL_ON }]),
    });

    client.page({ route: "/untracked", queryParams: { a: "1" } });

    expect(transport).not.toHaveBeenCalled();
  });

  it("matches a dynamic route and reports the pattern plus extracted params", () => {
    const transport = vi.fn();
    const client = createClient({
      transport,
      plan: makePlan([{ path: "/dashboard/projects/[id]", params: ALL_ON }]),
    });

    client.page({ route: "/dashboard/projects/42" });

    const event = transport.mock.calls[0]![0];
    expect(event.route).toBe("/dashboard/projects/[id]");
    expect(event.routeParams).toEqual({ id: "42" });
  });

  it("does not attribute an untracked static page to a tracked dynamic pattern", () => {
    const transport = vi.fn();
    const client = createClient({
      transport,
      plan: makePlan([{ path: "/projects/[id]", params: ALL_ON }], ["/projects/new"]),
    });

    client.page({ route: "/projects/new" });
    expect(transport).not.toHaveBeenCalled();

    client.page({ route: "/projects/42" });
    expect(transport.mock.calls[0]![0].routeParams).toEqual({ id: "42" });
  });

  it("drops route params when the plan disables them, and never leaks them via route", () => {
    const transport = vi.fn();
    const client = createClient({
      transport,
      plan: makePlan([{ path: "/users/[id]", params: { ...ALL_ON, routeParams: false } }]),
    });

    client.page({ route: "/users/jane@example.com" });

    const event = transport.mock.calls[0]![0];
    expect(event.route).toBe("/users/[id]");
    expect(event.routeParams).toBeUndefined();
    expect(JSON.stringify(event)).not.toContain("jane");
  });

  it("does not leak query params on a dynamic route whose plan disables them", () => {
    const transport = vi.fn();
    const client = createClient({
      transport,
      plan: makePlan([{ path: "/reset/[token]", params: { ...ALL_ON, queryParams: false } }]),
    });

    client.page({ route: "/reset/abc", queryParams: { email: "a@b.com" } });

    expect(transport.mock.calls[0]![0].queryParams).toBeUndefined();
  });
});

describe("createClient().identify", () => {
  it("emits an identify event with the id and traits nested in properties", () => {
    const transport = vi.fn();
    const client = createClient({ transport });

    client.identify("user_1", { email: "a@b.com" });

    const event = transport.mock.calls[0]![0];
    expect(event.name).toBe("identify");
    expect(event.properties).toEqual({ id: "user_1", traits: { email: "a@b.com" } });
    expect(event.userId).toBe("user_1");
  });

  it("attaches userId to every later event, keeping the anonymous id for stitching", () => {
    const transport = vi.fn();
    const client = createClient({ transport });

    client.track("before_login");
    client.identify("user_1");
    client.track("after_login");

    const [before, , after] = transport.mock.calls.map((call) => call[0]);
    expect(before.userId).toBeUndefined();
    expect(after.userId).toBe("user_1");
    expect(after.anonymousId).toBe(before.anonymousId);
  });

  it("reset() drops the user and starts a new anonymous id and session", () => {
    const transport = vi.fn();
    const client = createClient({ transport });

    client.identify("user_1");
    client.track("a");
    client.reset();
    client.track("b");

    const a = transport.mock.calls[1]![0];
    const b = transport.mock.calls[2]![0];
    expect(b.userId).toBeUndefined();
    expect(b.anonymousId).not.toBe(a.anonymousId);
    expect(b.sessionId).not.toBe(a.sessionId);
  });
});

describe("createClient() identity across page loads", () => {
  it("stores nothing by default: a new page load gets a new anonymous id", () => {
    const first = vi.fn();
    const second = vi.fn();
    createClient({ transport: first }).track("a");
    createClient({ transport: second }).track("b");

    expect(second.mock.calls[0]![0].anonymousId).not.toBe(first.mock.calls[0]![0].anonymousId);
  });

  it("setStorage() after consent keeps the ids already used on this page", () => {
    const transport = vi.fn();
    const client = createClient({ transport });
    client.track("before_consent");
    client.setStorage(memoryStorage());
    client.track("after_consent");

    const [before, after] = transport.mock.calls.map((call) => call[0]);
    expect(after.anonymousId).toBe(before.anonymousId);
    expect(after.sessionId).toBe(before.sessionId);
  });

  it("reuses the anonymous id, session and user from storage on the next load", () => {
    const storage = memoryStorage();
    const firstLoad = vi.fn();
    const first = createClient({ transport: firstLoad, storage });
    first.identify("user_1");

    const secondLoad = vi.fn();
    createClient({ transport: secondLoad, storage }).track("returned");

    const before = firstLoad.mock.calls[0]![0];
    const after = secondLoad.mock.calls[0]![0];
    expect(after.anonymousId).toBe(before.anonymousId);
    expect(after.sessionId).toBe(before.sessionId);
    expect(after.userId).toBe("user_1");
  });

  it("starts a new session after the inactivity timeout", () => {
    vi.useFakeTimers();
    try {
      const transport = vi.fn();
      const client = createClient({ transport, storage: memoryStorage() });

      client.track("a");
      vi.advanceTimersByTime(31 * 60_000);
      client.track("b");

      const [a, b] = transport.mock.calls.map((call) => call[0]);
      expect(b.sessionId).not.toBe(a.sessionId);
      expect(b.anonymousId).toBe(a.anonymousId);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("createClient() transport selection", () => {
  it("does not throw when neither endpoint nor transport is configured", () => {
    const client = createClient();
    expect(() => client.track("noop")).not.toThrow();
  });

  it("logs to the console when debug is enabled", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const client = createClient({ transport: vi.fn(), debug: true });

    client.track("debug_event");

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
