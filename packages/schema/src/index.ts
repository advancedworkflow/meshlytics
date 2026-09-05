import { z } from "zod";

/**
 * A single route discovered in the target application.
 */
export const RouteSchema = z.object({
  path: z.string(),
  file: z.string(),
  dynamicSegments: z.array(z.string()).default([]),
});
export type Route = z.infer<typeof RouteSchema>;

/**
 * Parameter capture toggles for a tracked route.
 */
export const RouteParamConfigSchema = z.object({
  routeParams: z.boolean().default(true),
  queryParams: z.boolean().default(false),
  utmParams: z.boolean().default(true),
  referrer: z.boolean().default(true),
});
export type RouteParamConfig = z.infer<typeof RouteParamConfigSchema>;

/**
 * A route the developer has opted into tracking, plus what to capture on it.
 */
export const TrackedRouteSchema = z.object({
  route: RouteSchema,
  params: RouteParamConfigSchema,
});
export type TrackedRoute = z.infer<typeof TrackedRouteSchema>;

/** Built-in event kinds Meshlytics can emit without custom code. */
export const BuiltinEventName = z.enum([
  "page_view",
  "route_enter",
  "route_leave",
]);
export type BuiltinEventName = z.infer<typeof BuiltinEventName>;

/**
 * The shape of an event once it leaves the SDK, regardless of who
 * defined it (built-in instrumentation or a custom `track()` call).
 */
export const MeshEventSchema = z.object({
  name: z.string(),
  timestamp: z.string().datetime(),
  route: z.string().optional(),
  routeParams: z.record(z.string(), z.string()).optional(),
  queryParams: z.record(z.string(), z.string()).optional(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),
  referrer: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
  sessionId: z.string().optional(),
  anonymousId: z.string().optional(),
});
export type MeshEvent = z.infer<typeof MeshEventSchema>;

/**
 * Snapshot of the application as understood by the Meshlytics engine:
 * framework, language, router, and every discovered route.
 */
export const ApplicationModelSchema = z.object({
  framework: z.enum(["next", "unknown"]),
  router: z.enum(["app", "pages", "unknown"]),
  typescript: z.boolean(),
  rootDir: z.string(),
  routes: z.array(RouteSchema),
});
export type ApplicationModel = z.infer<typeof ApplicationModelSchema>;

/**
 * The output of `meshlytics scan`: which routes to instrument and how.
 * This is what the SDK is configured from.
 */
export const InstrumentationPlanSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string().datetime(),
  application: ApplicationModelSchema,
  tracked: z.array(TrackedRouteSchema),
});
export type InstrumentationPlan = z.infer<typeof InstrumentationPlanSchema>;

export function parseInstrumentationPlan(input: unknown): InstrumentationPlan {
  return InstrumentationPlanSchema.parse(input);
}

export function parseMeshEvent(input: unknown): MeshEvent {
  return MeshEventSchema.parse(input);
}
