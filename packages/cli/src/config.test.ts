import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configExists, createDefaultConfig, planPath, readConfig, writeConfig } from "./config.js";

let cwd: string;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "meshlytics-cli-"));
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe("configExists / readConfig", () => {
  it("reports no config and returns defaults before init", () => {
    expect(configExists(cwd)).toBe(false);
    expect(readConfig(cwd)).toEqual(createDefaultConfig());
  });

  it("round-trips a config written with writeConfig", () => {
    const config = createDefaultConfig();
    config.trackedRoutes = ["/", "/pricing"];

    writeConfig(cwd, config);

    expect(configExists(cwd)).toBe(true);
    expect(readConfig(cwd)).toEqual(config);
  });

  it("fills in missing fields from an older or hand-edited config file", () => {
    writeFileSync(join(cwd, "meshlytics.config.json"), JSON.stringify({ trackedRoutes: ["/"] }));

    const config = readConfig(cwd);

    expect(config.trackedRoutes).toEqual(["/"]);
    expect(config.params).toEqual(createDefaultConfig().params);
    expect(config.discoveredRoutes).toEqual([]);
  });
});

describe("planPath", () => {
  it("points at meshlytics.plan.json inside the given directory", () => {
    expect(planPath(cwd)).toBe(join(cwd, "meshlytics.plan.json"));
  });
});
