import { BUILTIN_EVENTS, type MeshEvent } from "@meshlytics/core";
import { createIdentity } from "./identity.js";
import { createRouteMatcher, normalizePathname } from "./match.js";
import { createFetchTransport, noopTransport } from "./transport.js";
import type { MeshlyticsClient, MeshlyticsClientOptions, PageOptions } from "./types.js";

export function createClient(options: MeshlyticsClientOptions = {}): MeshlyticsClient {
  const transport =
    options.transport ??
    (options.endpoint ? createFetchTransport(options.endpoint) : noopTransport);

  const identity = createIdentity({
    storage: options.storage,
    sessionTimeoutMs: options.sessionTimeoutMs,
  });
  const matchRoute = options.plan ? createRouteMatcher(options.plan.routes, options.plan.excludedRoutes) : undefined;

  type EventBody = Omit<MeshEvent, "sessionId" | "anonymousId" | "userId">;

  /** Stamps identity at send time, so a session that expired between two events rolls over. */
  function emit(body: EventBody): void {
    const event: MeshEvent = {
      ...body,
      sessionId: identity.sessionId(),
      anonymousId: identity.anonymousId(),
      userId: identity.userId(),
    };
    if (options.debug) {
      // eslint-disable-next-line no-console
      console.log("[meshlytics]", event.name, event);
    }
    void transport(event);
  }

  return {
    track(name, properties) {
      emit({
        name,
        timestamp: new Date().toISOString(),
        properties,
      });
    },

    page(pageOptions: PageOptions = {}) {
      const pathname =
        pageOptions.route ?? (typeof location !== "undefined" ? location.pathname : undefined);

      // No plan: nothing to enforce, forward what the caller gave us.
      if (!matchRoute) {
        emit({
          name: BUILTIN_EVENTS.PAGE_VIEW,
          timestamp: new Date().toISOString(),
          route: pathname,
          queryParams: pageOptions.queryParams,
          utm: pageOptions.utm,
          referrer: pageOptions.referrer,
          properties: pageOptions.properties,
        });
        return;
      }

      // With a plan, only tracked routes emit, and only the parameters
      // the plan enables for that route leave the browser.
      const match = pathname === undefined ? undefined : matchRoute(normalizePathname(pathname));
      if (!match) {
        if (options.debug) {
          // eslint-disable-next-line no-console
          console.log("[meshlytics] page_view skipped, route not in plan:", pathname);
        }
        return;
      }

      const { params } = match.route;
      const hasRouteParams = Object.keys(match.params).length > 0;

      emit({
        name: BUILTIN_EVENTS.PAGE_VIEW,
        timestamp: new Date().toISOString(),
        // The route pattern, never the concrete URL: ids only travel in
        // routeParams, and only when the plan allows it.
        route: match.route.path,
        routeParams: params.routeParams && hasRouteParams ? match.params : undefined,
        queryParams: params.queryParams ? pageOptions.queryParams : undefined,
        utm: params.utmParams ? pageOptions.utm : undefined,
        referrer: params.referrer ? pageOptions.referrer : undefined,
        properties: pageOptions.properties,
      });
    },

    identify(id, traits) {
      identity.setUserId(id);
      emit({
        name: "identify",
        timestamp: new Date().toISOString(),
        properties: { id, traits },
      });
    },

    reset() {
      identity.reset();
    },

    setStorage(storage) {
      identity.setStorage(storage);
    },
  };
}
