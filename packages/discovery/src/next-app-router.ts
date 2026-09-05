import { relative, sep } from "node:path";
import fg from "fast-glob";
import type { Route } from "@meshlytics/schema";

const PAGE_FILE_GLOB = "**/page.{tsx,ts,jsx,js}";

/**
 * Turns a single App Router directory segment into its URL segment,
 * returning `null` for segments that don't appear in the URL
 * (route groups like `(marketing)`).
 */
function toUrlSegment(segment: string): { segment: string | null; param: string | null } {
  // Route group: (marketing) -> not part of the URL.
  if (segment.startsWith("(") && segment.endsWith(")")) {
    return { segment: null, param: null };
  }
  // Catch-all: [...slug] -> :slug (kept bracketed for consistency).
  if (segment.startsWith("[...") && segment.endsWith("]")) {
    const param = segment.slice(4, -1);
    return { segment: `[...${param}]`, param };
  }
  // Optional catch-all: [[...slug]]
  if (segment.startsWith("[[...") && segment.endsWith("]]")) {
    const param = segment.slice(5, -2);
    return { segment: `[[...${param}]]`, param };
  }
  // Dynamic segment: [id] -> [id]
  if (segment.startsWith("[") && segment.endsWith("]")) {
    const param = segment.slice(1, -1);
    return { segment: `[${param}]`, param };
  }
  return { segment, param: null };
}

function filePathToRoute(appDir: string, filePath: string): Route {
  const relativePath = relative(appDir, filePath);
  const segments = relativePath.split(sep).slice(0, -1); // drop the page.tsx file itself

  const urlSegments: string[] = [];
  const dynamicSegments: string[] = [];

  for (const rawSegment of segments) {
    const { segment, param } = toUrlSegment(rawSegment);
    if (segment) urlSegments.push(segment);
    if (param) dynamicSegments.push(param);
  }

  const path = "/" + urlSegments.join("/");

  return {
    path: path === "/" ? "/" : path.replace(/\/+$/, ""),
    file: relativePath.split(sep).join("/"),
    dynamicSegments,
  };
}

/**
 * Discovers every route in a Next.js App Router project by looking
 * for `page.{tsx,ts,jsx,js}` files under `appDir`.
 */
export async function discoverNextAppRouterRoutes(appDir: string): Promise<Route[]> {
  const files = await fg(PAGE_FILE_GLOB, {
    cwd: appDir,
    absolute: true,
    ignore: ["**/node_modules/**"],
  });

  return files
    .map((file) => filePathToRoute(appDir, file))
    .sort((a, b) => a.path.localeCompare(b.path));
}
