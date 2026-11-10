import { createContext, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { MeshlyticsClient } from "@meshlytics/sdk";

const MeshlyticsContext = createContext<MeshlyticsClient | null>(null);

export interface MeshlyticsProviderProps {
  client: MeshlyticsClient;
  /** Track a page_view on mount and on every route change. Defaults to true. */
  trackPageviews?: boolean;
  children?: React.ReactNode;
}

/**
 * Render inside a `<BrowserRouter>` (or any react-router `<Router>`).
 * Uses `useLocation()` rather than `popstate` so pageviews fire on
 * programmatic `navigate()` calls too, not just back/forward.
 */
export function MeshlyticsProvider({
  client,
  trackPageviews = true,
  children,
}: MeshlyticsProviderProps) {
  const clientRef = useRef(client);
  clientRef.current = client;
  const location = useLocation();

  useEffect(() => {
    if (!trackPageviews) return;

    clientRef.current.page({
      route: location.pathname,
      queryParams: Object.fromEntries(new URLSearchParams(location.search)),
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackPageviews, location.pathname, location.search]);

  return <MeshlyticsContext.Provider value={client}>{children}</MeshlyticsContext.Provider>;
}

export function useMeshlytics(): MeshlyticsClient {
  const client = useContext(MeshlyticsContext);
  if (!client) {
    throw new Error("useMeshlytics() must be used within a <MeshlyticsProvider>.");
  }
  return client;
}

export function useTrack() {
  const client = useMeshlytics();
  return client.track.bind(client);
}
