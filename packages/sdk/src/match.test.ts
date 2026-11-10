import { describe, expect, it } from "vitest";
import { createRouteMatcher, normalizePathname } from "./match.js";
import type { PlanRoute } from "./types.js";

const params: PlanRoute["params"] = { routeParams: true, queryParams: false, utmParams: true, referrer: true };
const routes = (...paths: string[]): PlanRoute[] => paths.map((path) => ({ path, params }));

describe("normalizePathname", () => {
  it.each([
    ["/", "/"],
    ["", "/"],
    ["/pricing/", "/pricing"],
    ["/pricing?plan=pro#faq", "/pricing"],
    ["pricing", "/pricing"],
    ["//", "/"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizePathname(input)).toBe(expected);
  });
});

describe("createRouteMatcher", () => {
  it("matches the root and static routes exactly", () => {
    const match = createRouteMatcher(routes("/", "/pricing"));
    expect(match("/")?.route.path).toBe("/");
    expect(match("/pricing")?.route.path).toBe("/pricing");
    expect(match("/pricing/")?.route.path).toBe("/pricing");
    expect(match("/pricing/extra")).toBeUndefined();
    expect(match("/about")).toBeUndefined();
  });

  it("extracts a dynamic segment, decoding it", () => {
    const match = createRouteMatcher(routes("/dashboard/projects/[id]"));
    expect(match("/dashboard/projects/42")).toEqual({
      route: expect.objectContaining({ path: "/dashboard/projects/[id]" }),
      params: { id: "42" },
    });
    expect(match("/dashboard/projects/a%20b")?.params).toEqual({ id: "a b" });
    expect(match("/dashboard/projects")).toBeUndefined();
    expect(match("/dashboard/projects/42/settings")).toBeUndefined();
  });

  it("keeps a malformed escape sequence as-is instead of throwing", () => {
    const match = createRouteMatcher(routes("/p/[id]"));
    expect(match("/p/%E0%A4%A")?.params).toEqual({ id: "%E0%A4%A" });
  });

  it("matches a catch-all with one or more segments", () => {
    const match = createRouteMatcher(routes("/blog/[...slug]"));
    expect(match("/blog/a")?.params).toEqual({ slug: "a" });
    expect(match("/blog/a/b/c")?.params).toEqual({ slug: "a/b/c" });
    expect(match("/blog")).toBeUndefined();
  });

  it("matches an optional catch-all with zero or more segments", () => {
    const match = createRouteMatcher(routes("/docs/[[...slug]]"));
    expect(match("/docs")?.params).toEqual({});
    expect(match("/docs/a/b")?.params).toEqual({ slug: "a/b" });
  });

  it("prefers static over dynamic over catch-all, whatever the plan order", () => {
    const match = createRouteMatcher(routes("/blog/[...slug]", "/blog/[id]", "/blog/new"));
    expect(match("/blog/new")?.route.path).toBe("/blog/new");
    expect(match("/blog/42")?.route.path).toBe("/blog/[id]");
    expect(match("/blog/2026/hello")?.route.path).toBe("/blog/[...slug]");
  });

  it("supports several dynamic segments", () => {
    const match = createRouteMatcher(routes("/org/[org]/repo/[repo]"));
    expect(match("/org/acme/repo/api")?.params).toEqual({ org: "acme", repo: "api" });
  });
});

describe("createRouteMatcher with excluded routes", () => {
  it("drops a pathname whose most specific match is an excluded route", () => {
    const match = createRouteMatcher(routes("/projects/[id]"), ["/projects/new"]);
    expect(match("/projects/new")).toBeUndefined();
    expect(match("/projects/42")?.params).toEqual({ id: "42" });
  });

  it("lets a more specific tracked route win over an excluded broader one", () => {
    const match = createRouteMatcher(routes("/projects/new"), ["/projects/[id]"]);
    expect(match("/projects/new")?.route.path).toBe("/projects/new");
    expect(match("/projects/42")).toBeUndefined();
  });

  it("drops deeper paths claimed by an excluded catch-all", () => {
    const match = createRouteMatcher(routes("/docs/[[...slug]]"), ["/docs/internal/[...rest]"]);
    expect(match("/docs/guide")?.params).toEqual({ slug: "guide" });
    expect(match("/docs/internal/secret")).toBeUndefined();
  });

  it("ignores an excluded path that is also tracked", () => {
    const match = createRouteMatcher(routes("/pricing"), ["/pricing"]);
    expect(match("/pricing")?.route.path).toBe("/pricing");
  });
});
