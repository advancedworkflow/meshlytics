import type { ApplicationModel } from "@meshlytics/schema";
import { detectFramework } from "./framework.js";
import { discoverNextAppRouterRoutes } from "./next-app-router.js";

export { detectFramework } from "./framework.js";
export type { FrameworkInfo } from "./framework.js";
export { discoverNextAppRouterRoutes } from "./next-app-router.js";

/**
 * Detects the framework used in `rootDir` and discovers every route
 * it exposes, returning a complete `ApplicationModel`.
 */
export async function discoverApplication(rootDir: string): Promise<ApplicationModel> {
  const info = detectFramework(rootDir);

  const routes =
    info.framework === "next" && info.router === "app" && info.appDir
      ? await discoverNextAppRouterRoutes(info.appDir)
      : [];

  return {
    framework: info.framework,
    router: info.router,
    typescript: info.typescript,
    rootDir,
    routes,
  };
}
