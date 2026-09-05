export { resolveRootDir } from "./scanner/index.js";
export { discoverApplication, detectFramework } from "./discovery/index.js";
export type { FrameworkInfo } from "./discovery/index.js";
export { analyzeRoutes } from "./analyzer/index.js";
export type { AnalyzedRoute } from "./analyzer/index.js";
export { buildApplicationModel } from "./model/index.js";
export { buildInstrumentationPlan } from "./planner/index.js";
export { generateInstrumentationModule } from "./generator/index.js";
