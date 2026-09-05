"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { MeshlyticsClient } from "@meshlytics/sdk";

export interface MeshlyticsProviderProps {
  client: MeshlyticsClient;
  children?: React.ReactNode;
}

/**
 * Drop this once near the root layout. It fires a `page_view` event
 * every time the App Router route or its query string changes —
 * App Router doesn't expose a native route-change event, so we
 * re-run on every render of `usePathname`/`useSearchParams`.
 */
export function MeshlyticsProvider({ client, children }: MeshlyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    client.page({
      route: pathname,
      queryParams: Object.fromEntries(searchParams.entries()),
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()]);

  return children ?? null;
}
