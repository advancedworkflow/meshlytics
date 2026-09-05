/**
 * Plain, zero-dependency mirrors of the shapes defined (and validated)
 * in `@meshlytics/schema`. Runtime code that ships to the browser
 * (the SDK, framework adapters) imports these instead of the zod
 * package so client bundles stay small.
 */

export type Framework = "next" | "unknown";
export type RouterKind = "app" | "pages" | "unknown";

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface MeshEvent {
  name: string;
  timestamp: string;
  route?: string;
  routeParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  utm?: UtmParams;
  referrer?: string;
  properties?: Record<string, unknown>;
  sessionId?: string;
  anonymousId?: string;
}

export const BUILTIN_EVENTS = {
  PAGE_VIEW: "page_view",
  ROUTE_ENTER: "route_enter",
  ROUTE_LEAVE: "route_leave",
} as const;

export type BuiltinEventName =
  (typeof BUILTIN_EVENTS)[keyof typeof BUILTIN_EVENTS];
