import { configExists, readConfig } from "../config.js";
import { brand, dim, fail, heading, log, ok } from "../ui.js";

export async function inspectCommand(cwd: string): Promise<void> {
  heading(brand("meshlytics inspect"));

  if (!configExists(cwd)) {
    fail("No meshlytics.config.json found.");
    log(dim("Run `npx meshlytics init` then `npx meshlytics scan` first."));
    return;
  }

  const config = readConfig(cwd);

  if (config.discoveredRoutes.length === 0) {
    fail("No scanned routes yet.");
    log(dim("Run `npx meshlytics scan` first."));
    return;
  }

  const tracked = new Set(config.trackedRoutes);

  log();
  log(dim("Routes:\n"));
  for (const route of config.discoveredRoutes) {
    const mark = tracked.has(route.path) ? "\x1b[32m◉\x1b[0m" : "\x1b[2m○\x1b[0m";
    log(`  ${mark} ${route.path}`);
  }

  log();
  log(dim("Parameters captured on tracked routes:\n"));
  for (const [key, value] of Object.entries(config.params)) {
    value ? ok(key) : fail(key);
  }

  log();
  log(dim(`${tracked.size}/${config.discoveredRoutes.length} route(s) selected for tracking.`));
  log(dim("Edit meshlytics.config.json to change the selection, then run `meshlytics instrument`."));
}
