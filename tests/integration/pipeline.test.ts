import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildApplicationModel,
  buildInstrumentationPlan,
  generateInstrumentationModule,
} from "@meshlytics/engine";

const FIXTURE_ROOT = fileURLToPath(new URL("../fixtures/nextjs-app-router", import.meta.url));

describe("engine pipeline: discovery -> application model -> plan -> generated code", () => {
  it("detects the fixture as a Next.js App Router project and discovers every route", async () => {
    const model = await buildApplicationModel(FIXTURE_ROOT);

    expect(model.framework).toBe("next");
    expect(model.router).toBe("app");
    expect(model.routes.map((r) => r.path).sort()).toEqual([
      "/",
      "/about",
      "/blog/[...slug]",
      "/dashboard/projects/[id]",
      "/pricing",
    ]);
  });

  it("builds an instrumentation plan tracking only the routes selected", async () => {
    const model = await buildApplicationModel(FIXTURE_ROOT);
    const plan = buildInstrumentationPlan(model, ["/", "/pricing"]);

    expect(plan.tracked.map((t) => t.route.path).sort()).toEqual(["/", "/pricing"]);
    expect(plan.application).toBe(model);
  });

  it("generates instrumentation code that reflects the plan for a dynamic route", async () => {
    const model = await buildApplicationModel(FIXTURE_ROOT);
    const plan = buildInstrumentationPlan(model, ["/dashboard/projects/[id]"], {
      routeParams: true,
      queryParams: false,
    });

    const code = generateInstrumentationModule(plan);

    expect(code).toContain('path: "/dashboard/projects/[id]"');
    expect(code).toContain("routeParams: true");
    expect(code).toContain("queryParams: false");
    expect(code).not.toContain('path: "/pricing"');
  });

  it("produces no tracked routes when nothing is selected, without erroring", async () => {
    const model = await buildApplicationModel(FIXTURE_ROOT);
    const plan = buildInstrumentationPlan(model, []);

    expect(plan.tracked).toEqual([]);
    expect(generateInstrumentationModule(plan)).toContain("routes: [\n\n    ],");
  });
});
