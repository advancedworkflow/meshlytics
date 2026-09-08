import { existsSync } from "node:fs";
import { detectFramework } from "@meshlytics/engine";
import { configPath, planPath } from "../config.js";
import { brand, fail, heading, ok } from "../ui.js";

export async function doctorCommand(cwd: string): Promise<void> {
  heading(brand("meshlytics doctor"));

  const [major = 0] = process.versions.node.split(".").map(Number);
  major >= 18 ? ok(`Node.js ${process.versions.node}`) : fail(`Node.js ${process.versions.node} (need >=18)`);

  existsSync(`${cwd}/package.json`) ? ok("package.json found") : fail("No package.json in this directory");

  const info = detectFramework(cwd);
  info.framework === "next" ? ok(`Framework: Next.js (${info.router})`) : fail("No supported framework detected");
  info.typescript ? ok("TypeScript configured") : fail("TypeScript not detected");

  existsSync(configPath(cwd)) ? ok("meshlytics.config.json present") : fail("meshlytics.config.json missing — run `meshlytics init`");
  existsSync(planPath(cwd)) ? ok("meshlytics.plan.json present") : fail("meshlytics.plan.json missing — run `meshlytics instrument`");
}
