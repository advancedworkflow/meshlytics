import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { discoverNextAppRouterRoutes } from "./next-app-router.js";

const FIXTURE_APP_DIR = fileURLToPath(
  new URL("../../../tests/fixtures/nextjs-app-router/app", import.meta.url),
);

describe("discoverNextAppRouterRoutes", () => {
  it("finds every page.tsx and converts its path to a URL route", async () => {
    const routes = await discoverNextAppRouterRoutes(FIXTURE_APP_DIR);
    expect(routes.map((r) => r.path)).toEqual([
      "/",
      "/about",
      "/blog/[...slug]",
      "/dashboard/projects/[id]",
      "/pricing",
    ]);
  });

  it("drops route groups from the URL but keeps them as noise-free segments", async () => {
    const routes = await discoverNextAppRouterRoutes(FIXTURE_APP_DIR);
    const about = routes.find((r) => r.path === "/about");
    expect(about?.file).toBe("(marketing)/about/page.tsx");
  });

  it("extracts dynamic segment names", async () => {
    const routes = await discoverNextAppRouterRoutes(FIXTURE_APP_DIR);
    const project = routes.find((r) => r.path === "/dashboard/projects/[id]");
    expect(project?.dynamicSegments).toEqual(["id"]);

    const blog = routes.find((r) => r.path === "/blog/[...slug]");
    expect(blog?.dynamicSegments).toEqual(["slug"]);
  });
});
