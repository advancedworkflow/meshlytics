import { analyzeRoutes, buildApplicationModel } from "@meshlytics/engine";
import { configExists, readConfig, writeConfig } from "../config.js";
import { brand, dim, fail, heading, log, ok } from "../ui.js";

export async function scanCommand(cwd: string, args: string[]): Promise<void> {
  heading(brand("meshlytics scan"));

  const model = await buildApplicationModel(cwd);

  if (model.framework === "next") {
    ok("Framework detected: Next.js");
  } else {
    fail("No supported framework detected in this directory.");
    return;
  }
  if (model.typescript) ok("TypeScript detected");
  if (model.router === "app") ok("App Router detected");

  if (model.routes.length === 0) {
    log();
    fail("No routes found. Is this the root of your Next.js app?");
    return;
  }

  log();
  log(dim("Routes discovered:\n"));
  const analyzed = analyzeRoutes(model.routes);
  const widest = Math.max(...analyzed.map((r) => r.route.path.length));
  for (const { route } of analyzed) {
    log(`  ${route.path.padEnd(widest + 2)}${dim(route.file)}`);
  }

  const trackAll = args.includes("--all");
  if (configExists(cwd)) {
    const config = readConfig(cwd);
    config.discoveredRoutes = model.routes;
    if (trackAll) {
      config.trackedRoutes = model.routes.map((r) => r.path);
    }
    writeConfig(cwd, config);
    log();
    ok(`Saved ${model.routes.length} route(s) to meshlytics.config.json`);
    if (!trackAll) {
      log(dim("Edit `trackedRoutes` in meshlytics.config.json to choose what to track,"));
      log(dim("or re-run `meshlytics scan --all` to track every route."));
    }
  } else {
    log();
    log(dim("Run `npx meshlytics init` first to persist this scan into a config file."));
  }
}
