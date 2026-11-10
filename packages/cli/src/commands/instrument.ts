import { writeFileSync } from "node:fs";
import { buildApplicationModel, buildInstrumentationPlan, generateInstrumentationModule } from "@meshlytics/engine";
import { configExists, outputPath, planPath, readConfig } from "../config.js";
import { brand, dim, fail, heading, log, ok } from "../ui.js";

export async function instrumentCommand(cwd: string, args: string[]): Promise<void> {
  heading(brand("meshlytics instrument"));

  if (!configExists(cwd)) {
    fail("No meshlytics.config.json found.");
    log(dim("Run `npx meshlytics init` then `npx meshlytics scan` first."));
    return;
  }

  const config = readConfig(cwd);
  const trackAll = args.includes("--all");
  const selectedPaths = trackAll
    ? config.discoveredRoutes.map((r) => r.path)
    : config.trackedRoutes;

  if (selectedPaths.length === 0) {
    fail("No routes selected for tracking.");
    log(dim("Edit `trackedRoutes` in meshlytics.config.json, or run `meshlytics instrument --all`."));
    return;
  }

  const model = await buildApplicationModel(cwd);
  const plan = buildInstrumentationPlan(model, selectedPaths, config.params);

  writeFileSync(planPath(cwd), JSON.stringify(plan, null, 2) + "\n", "utf8");
  ok(`Wrote meshlytics.plan.json (${plan.tracked.length} tracked route(s))`);

  const code = generateInstrumentationModule(plan);
  writeFileSync(outputPath(cwd), code, "utf8");
  ok(`Wrote meshlytics.instrumentation.ts`);

  log();
  log(dim("Create your client from it once, near your app's root:"));
  log(dim(`  import { createClient } from "meshlytics";`));
  log(dim(`  import { meshlyticsPlan } from "./meshlytics.instrumentation";`));
  log(dim(`  export const meshlytics = createClient({ plan: meshlyticsPlan, endpoint: "/api/events" });`));
}
