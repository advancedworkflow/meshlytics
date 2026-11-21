# @meshlytics/instrumentation

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

- b223b98: Match page views against the plan's route patterns (`[id]`, `[...slug]`, `[[...slug]]`) instead of exact paths, and extract `routeParams`.

  When a plan is configured, `page()` now only emits for tracked routes, reports the route pattern (e.g. `/projects/[id]`) rather than the concrete URL, and only sends the parameters the plan enables. Previously, any path not matching exactly (including every dynamic route) bypassed the plan and sent all parameters.

  The generated `meshlytics.instrumentation.ts` now also lists discovered-but-untracked routes as `excludedRoutes`, so an untracked page like `/projects/new` is no longer counted under a tracked `/projects/[id]`. Re-run `meshlytics instrument` to pick this up.

### Patch Changes

- Updated dependencies [5c5cfae]
  - @meshlytics/schema@0.1.0
