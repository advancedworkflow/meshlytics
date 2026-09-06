import { describe, expect, it } from "vitest";
import {
  parseInstrumentationPlan,
  parseMeshEvent,
  MeshEventSchema,
  RouteParamConfigSchema,
} from "./index.js";

describe("parseMeshEvent", () => {
  it("accepts a minimal page_view event", () => {
    const event = parseMeshEvent({
      name: "page_view",
      timestamp: "2026-09-06T12:00:00.000Z",
    });
    expect(event.name).toBe("page_view");
  });

  it("accepts a fully populated custom event", () => {
    const event = parseMeshEvent({
      name: "checkout_started",
      timestamp: "2026-09-06T12:00:00.000Z",
      route: "/checkout",
      routeParams: { id: "42" },
      queryParams: { utm_source: "newsletter" },
      utm: { source: "newsletter", medium: "email" },
      referrer: "https://google.com",
      properties: { cartValue: 129 },
      sessionId: "ses_abc",
      anonymousId: "anon_abc",
    });
    expect(event.properties?.cartValue).toBe(129);
  });

  it("rejects an event missing a required field", () => {
    expect(() => parseMeshEvent({ timestamp: "2026-09-06T12:00:00.000Z" })).toThrow();
  });

  it("rejects a non-ISO timestamp", () => {
    expect(() => parseMeshEvent({ name: "page_view", timestamp: "not-a-date" })).toThrow();
  });

  it("defaults are not applied to an unparsed object", () => {
    // MeshEventSchema has no defaults; every optional field is simply absent unless provided.
    const event = MeshEventSchema.parse({ name: "page_view", timestamp: "2026-09-06T12:00:00.000Z" });
    expect(event.route).toBeUndefined();
  });
});

describe("RouteParamConfigSchema", () => {
  it("fills in defaults for an empty object", () => {
    const config = RouteParamConfigSchema.parse({});
    expect(config).toEqual({
      routeParams: true,
      queryParams: false,
      utmParams: true,
      referrer: true,
    });
  });

  it("respects explicit overrides", () => {
    const config = RouteParamConfigSchema.parse({ queryParams: true, referrer: false });
    expect(config.queryParams).toBe(true);
    expect(config.referrer).toBe(false);
    expect(config.routeParams).toBe(true);
  });
});

describe("parseInstrumentationPlan", () => {
  const validPlan = {
    version: 1 as const,
    generatedAt: "2026-09-06T12:00:00.000Z",
    application: {
      framework: "next" as const,
      router: "app" as const,
      typescript: true,
      rootDir: "/app",
      routes: [{ path: "/", file: "page.tsx", dynamicSegments: [] }],
    },
    tracked: [
      {
        route: { path: "/", file: "page.tsx", dynamicSegments: [] },
        params: { routeParams: true, queryParams: false, utmParams: true, referrer: true },
      },
    ],
  };

  it("accepts a well-formed plan", () => {
    expect(() => parseInstrumentationPlan(validPlan)).not.toThrow();
  });

  it("rejects an unsupported plan version", () => {
    expect(() => parseInstrumentationPlan({ ...validPlan, version: 2 })).toThrow();
  });

  it("rejects an application with an invalid framework value", () => {
    expect(() =>
      parseInstrumentationPlan({
        ...validPlan,
        application: { ...validPlan.application, framework: "nuxt" },
      }),
    ).toThrow();
  });

  it("rejects a tracked route missing its param config", () => {
    const { params, ...trackedWithoutParams } = validPlan.tracked[0]!;
    expect(() =>
      parseInstrumentationPlan({ ...validPlan, tracked: [trackedWithoutParams] }),
    ).toThrow();
  });
});
