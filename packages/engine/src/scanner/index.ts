import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Resolves and validates the directory the rest of the pipeline
 * should operate on. This is the first pipeline step: it doesn't
 * know anything about frameworks yet, it just locates the project.
 */
export function resolveRootDir(cwd: string = process.cwd()): string {
  const rootDir = resolve(cwd);
  if (!existsSync(rootDir)) {
    throw new Error(`Cannot scan "${rootDir}": directory does not exist.`);
  }
  return rootDir;
}
