# meshlytics

## 0.1.0

### Minor Changes

- 3155226: The generated `meshlytics.instrumentation.ts` now exports `meshlyticsPlan` instead of a ready-made `meshlytics` client.

  The generated client had no `endpoint` or `transport`, so its events went nowhere, and any option added by hand was lost on the next `meshlytics instrument`. Create the client in your own code instead:

  ```ts
  import { createClient } from "meshlytics";
  import { meshlyticsPlan } from "./meshlytics.instrumentation";

  export const meshlytics = createClient({
    plan: meshlyticsPlan,
    endpoint: "/api/events",
  });
  ```

  The generated file only imports the `MeshlyticsPlan` type, so it adds nothing to the bundle.

- 5c5cfae: Keep visitor identity consistent, make `identify()` stick, and store nothing on the device unless asked to.

  - `anonymousId` and `sessionId` are now resolved per event from a storage instead of being fixed at client creation. Sessions roll over after 30 minutes of inactivity (`sessionTimeoutMs`).
  - New `storage` option: `"memory"` (default — nothing written to the device, no consent needed), `"localStorage"`, `"sessionStorage"`, or any Web Storage–shaped object (e.g. a cookie adapter).
  - New `setStorage()` to opt in once consent is given (keeps the ids already used on the page, and a returning visitor's stored ids win) or to opt out when it is withdrawn (wipes what was stored).
  - `identify(id)` now adds `userId` to that event and every later one until `reset()`, keeping `anonymousId` so pre-login activity can be stitched to the user.
  - New `reset()`, to call on logout.
  - `MeshEvent` gains an optional `userId` field.

  Storage failures (SSR, Safari private mode, quota) fall back to memory without throwing.

- b223b98: Match page views against the plan's route patterns (`[id]`, `[...slug]`, `[[...slug]]`) instead of exact paths, and extract `routeParams`.

  When a plan is configured, `page()` now only emits for tracked routes, reports the route pattern (e.g. `/projects/[id]`) rather than the concrete URL, and only sends the parameters the plan enables. Previously, any path not matching exactly (including every dynamic route) bypassed the plan and sent all parameters.

  The generated `meshlytics.instrumentation.ts` now also lists discovered-but-untracked routes as `excludedRoutes`, so an untracked page like `/projects/new` is no longer counted under a tracked `/projects/[id]`. Re-run `meshlytics instrument` to pick this up.

### Patch Changes

- Updated dependencies [5c5cfae]
- Updated dependencies [b223b98]
  - @meshlytics/sdk@0.1.0
  - @meshlytics/schema@0.1.0
  - @meshlytics/engine@0.0.2
