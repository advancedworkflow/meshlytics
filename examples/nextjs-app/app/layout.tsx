import { Suspense } from "react";
import { MeshlyticsProvider } from "@meshlytics/next";
import { meshlytics } from "./meshlytics-client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <MeshlyticsProvider client={meshlytics}>{children}</MeshlyticsProvider>
        </Suspense>
      </body>
    </html>
  );
}
