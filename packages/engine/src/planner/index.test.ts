import { describe, expect, it } from "vitest";
import type { ApplicationModel } from "@meshlytics/schema";
import { buildInstrumentationPlan } from "./index.js";

const application: ApplicationModel = {
  framework: "next",
  router: "app",
  typescript: true,
  rootDir: "/app",
  routes: [
    { path: "/", file: "page.tsx", dynamicSegments: [] },
    { path: "/pricing", file: "pricing/page.tsx", dynamicSegments: [] },
    { path: "/dashboard/projects/[id]", file: "dashboard/projects/[id]/page.tsx", dynamicSegments: ["id"] },
  ],
};

describe("buildInstrumentationPlan", () => {
  it("only tracks routes present in selectedPaths", () => {
    const plan = buildInstrumentationPlan(application, ["/", "/pricing"]);
    expect(plan.tracked.map((t) => t.route.path).sort()).toEqual(["/", "/pricing"]);
  });

  it("omits routes that were not selected", () => {
    const plan = buildInstrumentationPlan(application, ["/"]);
    expect(plan.tracked.some((t) => t.route.path === "/dashboard/projects/[id]")).toBe(false);
  });

  it("ignores selected paths that don't exist in the application", () => {
    const plan = buildInstrumentationPlan(application, ["/", "/does-not-exist"]);
    expect(plan.tracked).toHaveLength(1);
  });

  it("applies default parameter capture settings when none are given", () => {
    const plan = buildInstrumentationPlan(application, ["/"]);
    expect(plan.tracked[0]?.params).toEqual({
      routeParams: true,
      queryParams: false,
      utmParams: true,
      referrer: true,
    });
  });

  it("merges partial overrides on top of the defaults", () => {
    const plan = buildInstrumentationPlan(application, ["/"], { queryParams: true });
    expect(plan.tracked[0]?.params).toEqual({
      routeParams: true,
      queryParams: true,
      utmParams: true,
      referrer: true,
    });
  });

  it("stamps version 1 and an ISO generatedAt, and carries the application through unchanged", () => {
    const plan = buildInstrumentationPlan(application, []);
    expect(plan.version).toBe(1);
    expect(() => new Date(plan.generatedAt).toISOString()).not.toThrow();
    expect(plan.application).toBe(application);
  });
});
