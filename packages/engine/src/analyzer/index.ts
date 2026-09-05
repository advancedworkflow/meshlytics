import type { Route } from "@meshlytics/schema";

export interface AnalyzedRoute {
  route: Route;
  depth: number;
  isDynamic: boolean;
  isIndex: boolean;
}

/**
 * Adds display/ranking metadata to discovered routes without
 * changing their shape, so the CLI can render them (grouped, sorted
 * by depth) without re-deriving this on every command.
 */
export function analyzeRoutes(routes: Route[]): AnalyzedRoute[] {
  return routes
    .map((route) => ({
      route,
      depth: route.path === "/" ? 0 : route.path.split("/").filter(Boolean).length,
      isDynamic: route.dynamicSegments.length > 0,
      isIndex: route.path === "/",
    }))
    .sort((a, b) => a.depth - b.depth || a.route.path.localeCompare(b.route.path));
}
