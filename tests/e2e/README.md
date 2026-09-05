# tests/e2e

Runs the built `meshlytics` binary as a subprocess against a real
sample app (e.g. `examples/nextjs-app`) and asserts on its stdout and
the files it writes (`meshlytics.config.json`, `meshlytics.plan.json`,
`meshlytics.instrumentation.ts`). None yet — add one per CLI command
as the CLI's output format stabilizes.
