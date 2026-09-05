# Contributing to Meshlytics

## Setup

```
pnpm install
pnpm build
pnpm test
```

Node 18+ and pnpm are required (this repo uses pnpm workspaces).

## Project structure

This is a pnpm monorepo. Each `packages/*` folder is an independently
publishable package; `examples/*` are minimal sample apps used to
exercise the CLI and adapters manually; `apps/*` holds larger internal
apps (docs site, playground). This repo is open source only — the
proprietary Meshlytics Cloud platform lives in a separate, private
repository and has no code here. See the root
[README](./README.md#repository-layout) for the full layout and how
the packages relate to each other.

The core pipeline is:

```
Framework Adapter → Route Discovery → Application Model
  → Instrumentation Planner → Instrumentation Generator → SDK
```

`@meshlytics/discovery`, `@meshlytics/instrumentation`, and
`@meshlytics/schema` each own one stage of that pipeline in isolation;
`@meshlytics/engine` wires them together for the CLI. When adding a
new framework, prefer extending `@meshlytics/discovery` (detection +
route scanning) and adding a new `packages/adapters/<framework>`
(runtime pageview tracking) over special-casing logic inside the CLI.

## Making changes

- Add or update tests next to the code you change
  (`packages/<name>/src/**/*.test.ts`, run with `pnpm --filter <package> test`).
- Run `pnpm typecheck` before opening a PR.
- Keep scoped `@meshlytics/*` packages framework-agnostic where
  possible; framework-specific code belongs in `packages/adapters/*`.
- If you're adding a new framework adapter, open an issue first to
  agree on the public API — see the "planned" adapters'
  `README.md` for what's expected.

## Commit / PR style

Small, focused PRs are easier to review than large ones. Explain the
*why* in the PR description, not just the *what*.
