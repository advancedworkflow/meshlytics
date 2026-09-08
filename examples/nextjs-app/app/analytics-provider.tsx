"use client";

import { MeshlyticsProvider } from "@meshlytics/next";
import { meshlytics } from "./meshlytics-client";

/**
 * The client instance is created and consumed entirely inside this
 * client component. A Server Component (like the root layout) can
 * render this and pass it plain, serializable `children`, but it must
 * never import `meshlytics` itself and pass it down as a prop — that
 * object holds functions, and functions can't cross the server/client
 * boundary as props.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <MeshlyticsProvider client={meshlytics}>{children}</MeshlyticsProvider>;
}
