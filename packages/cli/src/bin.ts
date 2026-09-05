#!/usr/bin/env node
import { initCommand } from "./commands/init.js";
import { scanCommand } from "./commands/scan.js";
import { inspectCommand } from "./commands/inspect.js";
import { instrumentCommand } from "./commands/instrument.js";
import { generateCommand } from "./commands/generate.js";
import { doctorCommand } from "./commands/doctor.js";
import { brand, dim, log } from "./ui.js";

const USAGE = `
${brand("meshlytics")} — analytics instrumentation for modern web apps

${dim("Usage:")}
  npx meshlytics <command>

${dim("Commands:")}
  init         Detect your framework and scaffold meshlytics.config.json
  scan         Discover routes and save them to the config
  inspect      Show which routes and parameters are currently tracked
  instrument   Build the instrumentation plan and generate the SDK bootstrap
  generate     Regenerate the SDK bootstrap from an existing plan
  doctor       Check that your project is set up correctly

${dim("Flags:")}
  --all        (scan, instrument) act on every discovered route
`;

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;
  const cwd = process.cwd();

  switch (command) {
    case "init":
      return initCommand(cwd);
    case "scan":
      return scanCommand(cwd, args);
    case "inspect":
      return inspectCommand(cwd);
    case "instrument":
      return instrumentCommand(cwd, args);
    case "generate":
      return generateCommand(cwd);
    case "doctor":
      return doctorCommand(cwd);
    default:
      log(USAGE);
      if (command && command !== "help" && command !== "--help") {
        process.exitCode = 1;
      }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
