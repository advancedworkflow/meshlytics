---
"@meshlytics/sdk": minor
"@meshlytics/instrumentation": minor
"meshlytics": minor
---

Match page views against the plan's route patterns (`[id]`, `[...slug]`, `[[...slug]]`) instead of exact paths, and extract `routeParams`.

When a plan is configured, `page()` now only emits for tracked routes, reports the route pattern (e.g. `/projects/[id]`) rather than the concrete URL, and only sends the parameters the plan enables. Previously, any path not matching exactly (including every dynamic route) bypassed the plan and sent all parameters.

The generated `meshlytics.instrumentation.ts` now also lists discovered-but-untracked routes as `excludedRoutes`, so an untracked page like `/projects/new` is no longer counted under a tracked `/projects/[id]`. Re-run `meshlytics instrument` to pick this up.
