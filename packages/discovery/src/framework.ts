import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ApplicationModel } from "@meshlytics/schema";

type Framework = ApplicationModel["framework"];
type RouterKind = ApplicationModel["router"];

export interface FrameworkInfo {
  framework: Framework;
  router: RouterKind;
  typescript: boolean;
  appDir: string | null;
}

function readPackageJson(rootDir: string): Record<string, unknown> | null {
  const pkgPath = join(rootDir, "package.json");
  if (!existsSync(pkgPath)) return null;
  try {
    return JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch {
    return null;
  }
}

function hasDependency(pkg: Record<string, unknown> | null, name: string): boolean {
  if (!pkg) return false;
  const deps = { ...(pkg.dependencies as object), ...(pkg.devDependencies as object) };
  return name in deps;
}

/**
 * Inspects a project directory and figures out which framework and
 * router it uses, without importing or executing any project code.
 */
export function detectFramework(rootDir: string): FrameworkInfo {
  const pkg = readPackageJson(rootDir);
  const typescript =
    existsSync(join(rootDir, "tsconfig.json")) || hasDependency(pkg, "typescript");

  const isNext = hasDependency(pkg, "next");

  const candidateAppDirs = [join(rootDir, "app"), join(rootDir, "src", "app")];
  const candidatePagesDirs = [join(rootDir, "pages"), join(rootDir, "src", "pages")];

  const appDir = candidateAppDirs.find((dir) => existsSync(dir)) ?? null;
  const pagesDir = candidatePagesDirs.find((dir) => existsSync(dir)) ?? null;

  if (isNext && appDir) {
    return { framework: "next", router: "app", typescript, appDir };
  }
  if (isNext && pagesDir) {
    return { framework: "next", router: "pages", typescript, appDir: pagesDir };
  }
  if (isNext) {
    return { framework: "next", router: "unknown", typescript, appDir: null };
  }
  return { framework: "unknown", router: "unknown", typescript, appDir: null };
}
