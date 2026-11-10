import type { PlanRoute } from "./types.js";

type Segment =
  | { kind: "static"; value: string }
  | { kind: "dynamic"; name: string }
  | { kind: "catchAll"; name: string }
  | { kind: "optionalCatchAll"; name: string };

interface CompiledRoute {
  /** `null` for an excluded route: it can win a match, but never emits. */
  route: PlanRoute | null;
  segments: Segment[];
}

export interface RouteMatch {
  route: PlanRoute;
  params: Record<string, string>;
}

function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function compileSegment(raw: string): Segment {
  if (raw.startsWith("[[...") && raw.endsWith("]]")) {
    return { kind: "optionalCatchAll", name: raw.slice(5, -2) };
  }
  if (raw.startsWith("[...") && raw.endsWith("]")) {
    return { kind: "catchAll", name: raw.slice(4, -1) };
  }
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return { kind: "dynamic", name: raw.slice(1, -1) };
  }
  return { kind: "static", value: raw };
}

const SEGMENT_RANK: Record<Segment["kind"], number> = {
  static: 3,
  dynamic: 2,
  catchAll: 1,
  optionalCatchAll: 0,
};

/**
 * Orders routes so the most specific pattern is tried first:
 * `/blog/new` beats `/blog/[id]`, which beats `/blog/[...slug]`.
 * Compared segment by segment, then longer patterns first.
 */
function compareSpecificity(a: CompiledRoute, b: CompiledRoute): number {
  const length = Math.max(a.segments.length, b.segments.length);
  for (let i = 0; i < length; i++) {
    const rankA = a.segments[i] ? SEGMENT_RANK[a.segments[i]!.kind] : -1;
    const rankB = b.segments[i] ? SEGMENT_RANK[b.segments[i]!.kind] : -1;
    if (rankA !== rankB) return rankB - rankA;
  }
  return 0;
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Strips query string, hash, and trailing slashes from a pathname. */
export function normalizePathname(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0] ?? "";
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function matchSegments(segments: Segment[], parts: string[]): Record<string, string> | null {
  const params: Record<string, string> = {};

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;

    if (segment.kind === "catchAll" || segment.kind === "optionalCatchAll") {
      // Next.js only allows a catch-all as the last segment.
      const rest = parts.slice(i);
      if (rest.length === 0 && segment.kind === "catchAll") return null;
      if (rest.length > 0) params[segment.name] = rest.map(decode).join("/");
      return params;
    }

    const part = parts[i];
    if (part === undefined) return null;

    if (segment.kind === "static") {
      if (decode(part) !== segment.value) return null;
    } else {
      params[segment.name] = decode(part);
    }
  }

  return segments.length === parts.length ? params : null;
}

/**
 * Builds a matcher over the plan's route patterns
 * (`/dashboard/projects/[id]`, `/blog/[...slug]`, ...) that resolves a
 * concrete pathname (`/dashboard/projects/42`) to the most specific
 * matching route and its extracted parameters.
 *
 * `excludedPaths` are untracked patterns that still take part in
 * matching: when one of them is the most specific match, the result is
 * `undefined` rather than a less specific tracked route.
 */
export function createRouteMatcher(
  routes: PlanRoute[],
  excludedPaths: string[] = [],
): (pathname: string) => RouteMatch | undefined {
  const tracked = new Set(routes.map((route) => route.path));
  const compiled: CompiledRoute[] = [
    ...routes.map((route) => ({ route, path: route.path })),
    ...excludedPaths.filter((path) => !tracked.has(path)).map((path) => ({ route: null, path })),
  ]
    .map(({ route, path }) => ({ route, segments: splitPath(path).map(compileSegment) }))
    .sort(compareSpecificity);

  return (pathname) => {
    const parts = splitPath(normalizePathname(pathname));
    for (const { route, segments } of compiled) {
      const params = matchSegments(segments, parts);
      if (params) return route ? { route, params } : undefined;
    }
    return undefined;
  };
}
