/**
 * Runtime entry point. Apps import `createClient` from here and pass it
 * the plan exported by the generated `meshlytics.instrumentation.ts`
 * (which only imports the `MeshlyticsPlan` type) — the "meshlytics" package is what
 * gets installed in the app, while `@meshlytics/sdk` stays an internal
 * implementation detail.
 */
export { createClient, memoryStorage } from "@meshlytics/sdk";
export type {
  EventTransport,
  MeshlyticsClient,
  MeshlyticsClientOptions,
  MeshlyticsStorage,
  StorageOption,
  MeshlyticsPlan,
  PageOptions,
  PlanRoute,
} from "@meshlytics/sdk";
