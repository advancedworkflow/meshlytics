import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "meshlytics";
import { MeshlyticsProvider } from "@meshlytics/react";
import { App } from "./App";

const meshlytics = createClient({ debug: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MeshlyticsProvider client={meshlytics}>
      <App />
    </MeshlyticsProvider>
  </StrictMode>,
);
