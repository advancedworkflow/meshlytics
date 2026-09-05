# tests/integration

Cross-package tests that exercise the pipeline end-to-end
(`@meshlytics/discovery` → `@meshlytics/engine` → `@meshlytics/instrumentation`)
against the fixtures in `../fixtures`, without going through the CLI
process itself. Package-local unit tests live next to their source
(e.g. `packages/discovery/src/*.test.ts`) — put a test here only when
it spans more than one package.
