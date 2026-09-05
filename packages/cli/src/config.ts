import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Route, RouteParamConfig } from "@meshlytics/schema";

export const CONFIG_FILE = "meshlytics.config.json";
export const PLAN_FILE = "meshlytics.plan.json";
export const OUTPUT_FILE = "meshlytics.instrumentation.ts";

export interface MeshlyticsConfig {
  version: 1;
  /** Route paths the developer has opted into tracking. Edit this by hand, or re-run `scan --all`. */
  trackedRoutes: string[];
  params: RouteParamConfig;
  /** Cached result of the last `meshlytics scan`, used by `inspect` and `instrument`. */
  discoveredRoutes: Route[];
}

const DEFAULT_CONFIG: MeshlyticsConfig = {
  version: 1,
  trackedRoutes: [],
  params: {
    routeParams: true,
    queryParams: false,
    utmParams: true,
    referrer: true,
  },
  discoveredRoutes: [],
};

export function configPath(cwd: string): string {
  return join(cwd, CONFIG_FILE);
}

export function planPath(cwd: string): string {
  return join(cwd, PLAN_FILE);
}

export function outputPath(cwd: string): string {
  return join(cwd, OUTPUT_FILE);
}

export function configExists(cwd: string): boolean {
  return existsSync(configPath(cwd));
}

export function readConfig(cwd: string): MeshlyticsConfig {
  if (!configExists(cwd)) return { ...DEFAULT_CONFIG };
  const raw = readFileSync(configPath(cwd), "utf8");
  return { ...DEFAULT_CONFIG, ...JSON.parse(raw) } as MeshlyticsConfig;
}

export function writeConfig(cwd: string, config: MeshlyticsConfig): void {
  writeFileSync(configPath(cwd), JSON.stringify(config, null, 2) + "\n", "utf8");
}

export function createDefaultConfig(): MeshlyticsConfig {
  return { ...DEFAULT_CONFIG };
}
