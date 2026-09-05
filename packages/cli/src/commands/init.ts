import { detectFramework } from "@meshlytics/engine";
import { configExists, createDefaultConfig, writeConfig } from "../config.js";
import { brand, dim, fail, heading, log, ok } from "../ui.js";

export async function initCommand(cwd: string): Promise<void> {
  heading(brand("meshlytics init"));

  if (configExists(cwd)) {
    fail("meshlytics.config.json already exists — this project is already initialized.");
    log(dim("Run `npx meshlytics scan` to (re)discover routes."));
    return;
  }

  const info = detectFramework(cwd);

  if (info.framework === "next") {
    ok(`Framework detected: Next.js`);
    ok(`Router: ${info.router === "app" ? "App Router" : info.router}`);
  } else {
    fail("No supported framework detected in this directory.");
    log(dim("Meshlytics currently supports Next.js (App Router). Run this from your app's root."));
  }
  if (info.typescript) ok("TypeScript detected");

  writeConfig(cwd, createDefaultConfig());
  ok("Created meshlytics.config.json");

  log();
  log(dim("Next step: npx meshlytics scan"));
}
