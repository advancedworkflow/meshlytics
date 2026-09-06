import { describe, expect, it, vi } from "vitest";
import { createClient } from "./client.js";
import type { MeshlyticsPlan } from "./types.js";

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

  it("does not touch parameters for a route the plan doesn't mention", () => {
    const plan: MeshlyticsPlan = {
      version: 1,
      generatedAt: "2026-09-06T12:00:00.000Z",
      application: { framework: "next", router: "app" },
      routes: [{ path: "/tracked", params: { routeParams: true, queryParams: false, utmParams: true, referrer: true } }],
    };
    const transport = vi.fn();
    const client = createClient({ transport, plan });

    client.page({ route: "/untracked", queryParams: { a: "1" } });

    expect(transport.mock.calls[0]![0].queryParams).toEqual({ a: "1" });
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
