import { createContext, useContext, useEffect, useRef } from "react";
import type { MeshlyticsClient } from "@meshlytics/sdk";

const MeshlyticsContext = createContext<MeshlyticsClient | null>(null);

export interface MeshlyticsProviderProps {
  client: MeshlyticsClient;
  /** Track a page_view on mount and on every `popstate` (back/forward). Defaults to true. */
  trackPageviews?: boolean;
  children?: React.ReactNode;
}

export function MeshlyticsProvider({
  client,
  trackPageviews = true,
  children,
}: MeshlyticsProviderProps) {
  const clientRef = useRef(client);
  clientRef.current = client;

  useEffect(() => {
    if (!trackPageviews || typeof window === "undefined") return;

    const emitPageview = () =>
      clientRef.current.page({
        route: window.location.pathname,
        referrer: document.referrer,
      });

    emitPageview();
    window.addEventListener("popstate", emitPageview);
    return () => window.removeEventListener("popstate", emitPageview);
  }, [trackPageviews]);

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
