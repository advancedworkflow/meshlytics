/**
 * Runtime entry point. Generated code (`meshlytics.instrumentation.ts`)
 * imports `createClient` from here — the "meshlytics" package is what
 * gets installed in the app, while `@meshlytics/sdk` stays an internal
 * implementation detail.
 */
export { createClient } from "@meshlytics/sdk";
export type {
  EventTransport,
  MeshlyticsClient,
  MeshlyticsClientOptions,
  MeshlyticsPlan,
  PageOptions,
  PlanRoute,
} from "@meshlytics/sdk";
