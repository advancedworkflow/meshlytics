import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createClient } from "meshlytics";
import { MeshlyticsProvider } from "@meshlytics/react-router";
import { App } from "./App";

const meshlytics = createClient({ debug: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MeshlyticsProvider client={meshlytics}>
        <App />
      </MeshlyticsProvider>
    </BrowserRouter>
  </StrictMode>,
);
