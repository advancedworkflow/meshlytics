import { describe, expect, it } from "vitest";
import type { Route } from "@meshlytics/schema";
import { analyzeRoutes } from "./index.js";

function route(path: string, dynamicSegments: string[] = []): Route {
  return { path, file: `${path}/page.tsx`, dynamicSegments };
}

describe("analyzeRoutes", () => {
  it("marks the root route as the index with depth 0", () => {
    const [root] = analyzeRoutes([route("/")]);
    expect(root).toMatchObject({ depth: 0, isDynamic: false, isIndex: true });
  });

  it("computes depth from the number of path segments", () => {
    const [analyzed] = analyzeRoutes([route("/dashboard/projects/[id]", ["id"])]);
    expect(analyzed?.depth).toBe(3);
  });

  it("flags a route as dynamic only when it has dynamic segments", () => {
    const [dynamic, static_] = analyzeRoutes([
      route("/dashboard/projects/[id]", ["id"]),
      route("/pricing"),
    ]).sort((a, b) => a.route.path.localeCompare(b.route.path));
    expect(dynamic?.isDynamic).toBe(true);
    expect(static_?.isDynamic).toBe(false);
  });

  it("sorts shallowest routes first, alphabetically within the same depth", () => {
    const analyzed = analyzeRoutes([
      route("/dashboard/projects/[id]", ["id"]),
      route("/pricing"),
      route("/"),
      route("/checkout"),
    ]);
    expect(analyzed.map((a) => a.route.path)).toEqual([
      "/",
      "/checkout",
      "/pricing",
      "/dashboard/projects/[id]",
    ]);
  });
});
