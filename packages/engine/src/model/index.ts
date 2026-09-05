import type { ApplicationModel } from "@meshlytics/schema";
import { resolveRootDir } from "../scanner/index.js";
import { discoverApplication } from "../discovery/index.js";

/**
 * Runs scanner + discovery and returns the resulting application
 * model: framework, router, language, and every discovered route.
 */
export async function buildApplicationModel(cwd?: string): Promise<ApplicationModel> {
  const rootDir = resolveRootDir(cwd);
  return discoverApplication(rootDir);
}
