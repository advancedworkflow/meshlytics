import { BUILTIN_EVENTS, generateAnonymousId, generateSessionId, type MeshEvent } from "@meshlytics/core";
import { createFetchTransport, noopTransport } from "./transport.js";
import type {
  MeshlyticsClient,
  MeshlyticsClientOptions,
  MeshlyticsPlan,
  PageOptions,
  PlanRoute,
} from "./types.js";

function matchPlanRoute(plan: MeshlyticsPlan | undefined, path: string): PlanRoute | undefined {
  return plan?.routes.find((route) => route.path === path);
}

export function createClient(options: MeshlyticsClientOptions = {}): MeshlyticsClient {
  const transport =
    options.transport ??
    (options.endpoint ? createFetchTransport(options.endpoint) : noopTransport);

  const sessionId = generateSessionId();
  const anonymousId = generateAnonymousId();

  function emit(event: MeshEvent): void {
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
        sessionId,
        anonymousId,
      });
    },

    page(pageOptions: PageOptions = {}) {
      const route = pageOptions.route ?? (typeof location !== "undefined" ? location.pathname : undefined);
      const planRoute = matchPlanRoute(options.plan, route ?? "");

      emit({
        name: BUILTIN_EVENTS.PAGE_VIEW,
        timestamp: new Date().toISOString(),
        route,
        queryParams: planRoute?.params.queryParams === false ? undefined : pageOptions.queryParams,
        utm: planRoute?.params.utmParams === false ? undefined : pageOptions.utm,
        referrer: planRoute?.params.referrer === false ? undefined : pageOptions.referrer,
        properties: pageOptions.properties,
        sessionId,
        anonymousId,
      });
    },

    identify(id, traits) {
      emit({
        name: "identify",
        timestamp: new Date().toISOString(),
        properties: { id, traits },
        sessionId,
        anonymousId,
      });
    },
  };
}
