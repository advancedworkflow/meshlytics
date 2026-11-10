# @meshlytics/react-router

React Router adapter for Meshlytics: automatic pageview tracking on
navigation, plus the same `useTrack()` / `useMeshlytics()` hooks as
[`@meshlytics/react`](../react).

## Usage

```tsx
import { BrowserRouter } from "react-router-dom";
import { createClient } from "meshlytics";
import { MeshlyticsProvider } from "@meshlytics/react-router";

const meshlytics = createClient({ debug: true });

function App() {
  return (
    <BrowserRouter>
      <MeshlyticsProvider client={meshlytics}>
        <Routes />
      </MeshlyticsProvider>
    </BrowserRouter>
  );
}
```

`MeshlyticsProvider` must be rendered inside a react-router `<Router>`
(`<BrowserRouter>`, `<HashRouter>`, or a data router's `<RouterProvider>`
tree) — it reads the current location from `useLocation()`.

## Why not `@meshlytics/react`?

`@meshlytics/react`'s provider tracks pageviews on `popstate`, which
only fires on browser back/forward — it misses programmatic
`navigate()` calls, which is how most react-router apps change routes.
This adapter reads `useLocation()` instead, so it fires on every route
change regardless of how it was triggered.
