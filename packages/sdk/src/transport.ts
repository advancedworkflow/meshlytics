import type { MeshEvent } from "@meshlytics/core";
import type { EventTransport } from "./types.js";

/** Sends events to a JSON HTTP endpoint (an ingestion API, a serverless function, ...). */
export function createFetchTransport(endpoint: string): EventTransport {
  return async (event: MeshEvent) => {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    });
  };
}

/** Default transport used when neither `endpoint` nor `transport` is configured. */
export const noopTransport: EventTransport = () => {};
