import { Suspense } from "react";
import { AnalyticsProvider } from "./analytics-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Suspense>
      </body>
    </html>
  );
}
