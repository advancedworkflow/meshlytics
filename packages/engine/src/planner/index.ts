import type {
  ApplicationModel,
  InstrumentationPlan,
  RouteParamConfig,
  TrackedRoute,
} from "@meshlytics/schema";

const DEFAULT_PARAMS: RouteParamConfig = {
  routeParams: true,
  queryParams: false,
  utmParams: true,
  referrer: true,
};

/**
 * Builds an instrumentation plan from an application model and the
 * set of route paths the developer chose to track. Routes not in
 * `selectedPaths` are left out of the plan entirely.
 */
export function buildInstrumentationPlan(
  application: ApplicationModel,
  selectedPaths: string[],
  paramOverrides: Partial<RouteParamConfig> = {},
): InstrumentationPlan {
  const selected = new Set(selectedPaths);
  const params: RouteParamConfig = { ...DEFAULT_PARAMS, ...paramOverrides };

  const tracked: TrackedRoute[] = application.routes
    .filter((route) => selected.has(route.path))
    .map((route) => ({ route, params }));

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    application,
    tracked,
  };
}
