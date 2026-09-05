import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { generateInstrumentationModule } from "@meshlytics/engine";
import { parseInstrumentationPlan } from "@meshlytics/schema";
import { outputPath, planPath } from "../config.js";
import { brand, dim, fail, heading, log, ok } from "../ui.js";

export async function generateCommand(cwd: string): Promise<void> {
  heading(brand("meshlytics generate"));

  const path = planPath(cwd);
  if (!existsSync(path)) {
    fail("No meshlytics.plan.json found.");
    log(dim("Run `npx meshlytics instrument` first to create one."));
    return;
  }

  const plan = parseInstrumentationPlan(JSON.parse(readFileSync(path, "utf8")));
  const code = generateInstrumentationModule(plan);
  writeFileSync(outputPath(cwd), code, "utf8");
  ok("Wrote meshlytics.instrumentation.ts from meshlytics.plan.json");
}
