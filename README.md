# Meshlytics

Analytics instrumentation for modern web applications.

Meshlytics automatically discovers your application's routes,
understands its structure, and generates analytics instrumentation
without forcing you to manually wire tracking calls throughout your
codebase.

```
npx meshlytics init
```

## Why Meshlytics?

Analytics should not require developers to manually scatter tracking
calls across an application. Meshlytics analyzes your project and
builds an instrumentation model from your existing application
structure.

```
Your application
       │
       ▼
 Route discovery
       │
       ▼
 Application model
       │
       ▼
 Instrumentation plan
       │
       ▼
 Generated analytics
       │
       ▼
 Analytics backend
```

## What it does

- 🔎 Discovers application routes
- 🧠 Understands route parameters
- 🔗 Detects query parameters
- 📊 Generates page and navigation events
- 🧩 Supports framework-specific adapters
- ⚡ Provides a lightweight runtime SDK
- 🔌 Sends events to any compatible analytics backend
- 🛠️ Keeps instrumentation configuration in your codebase

## Quick start

```
npm install -D meshlytics
```

Initialize Meshlytics:

```
npx meshlytics init
```

Scan your application:

```
npx meshlytics scan
```

Choose what to track by editing `meshlytics.config.json` (or pass
`--all` to track every discovered route), then generate the
instrumentation:

```
npx meshlytics instrument
```

## Example

Meshlytics can discover:

```
/
/pricing
/login
/dashboard
/dashboard/projects
/dashboard/projects/[id]
/checkout
```

`meshlytics.config.json` is where you choose what gets tracked, and
how:

```json
{
  "trackedRoutes": ["/", "/pricing", "/dashboard", "/checkout"],
  "params": {
    "routeParams": true,
    "queryParams": false,
    "utmParams": true,
    "referrer": true
  }
}
```

`meshlytics instrument` turns that into an instrumentation plan and a
generated `meshlytics.instrumentation.ts` your app imports once, near
its root.

## Architecture

Meshlytics is built around a framework-independent application model,
not framework-specific code paths:

```
Framework Adapter
       ↓
Route Discovery
       ↓
Application Model
       ↓
Instrumentation Plan
       ↓
Generator
       ↓
SDK
       ↓
Analytics API
```

## CLI

```
meshlytics init          Detect your framework, scaffold config
meshlytics scan          Discover routes, save them to the config
meshlytics inspect       Show what's currently tracked
meshlytics instrument    Build the plan, generate the SDK bootstrap
meshlytics generate      Regenerate the bootstrap from an existing plan
meshlytics doctor        Check your project is set up correctly
```

```
meshlytics init
       │
       ▼
meshlytics scan
       │
       ▼
   Routes detected
       │
       ▼
meshlytics inspect
       │
       ▼
   Developer selects
       │
       ▼
meshlytics instrument
       │
       ▼
Instrumentation generated
```

## Packages

| Package                     | Description                                     |
| ---------------------------- | ------------------------------------------------ |
| `meshlytics`                 | CLI (`npx meshlytics ...`) and the runtime entry point your app imports |
| `@meshlytics/engine`         | Core analysis and instrumentation pipeline        |
| `@meshlytics/discovery`      | Framework and route discovery                     |
| `@meshlytics/instrumentation`| Instrumentation code generation                   |
| `@meshlytics/schema`         | Shared event and instrumentation-plan schemas (zod) |
| `@meshlytics/core`           | Zero-dependency shared types and primitives       |
| `@meshlytics/sdk`            | Runtime analytics client (re-exported by `meshlytics`) |
| `@meshlytics/next`           | Next.js App Router adapter                        |
| `@meshlytics/react`          | Framework-agnostic React bindings                 |

`meshlytics` is the only package meant to be installed directly in an
application (`npm install -D meshlytics`); the `@meshlytics/*` scoped
packages are its internal building blocks, published separately so
they can be reused (an editor extension, a CI check, a future
non-Node runtime) without pulling in the CLI.

## Supported frameworks

Currently:

- Next.js (App Router)
- React

Planned — see `packages/adapters/*/README.md`:

- React Router
- Vue
- Nuxt
- SvelteKit
- Remix

## Philosophy

Meshlytics is not another analytics dashboard. It is the
instrumentation layer between your application and your analytics
infrastructure:

```
Your app → Meshlytics → Any analytics backend
```

```
                 MESHLYTICS

Application ────────┐
Routes ─────────────┤
Actions ────────────┤
Identity ───────────┼──→ Events ──→ Analytics
Context ────────────┤
Parameters ─────────┘
```

## Open source

This repository — the engine, the SDK, the CLI, and every framework
adapter — is and stays open source (MIT). A separate, proprietary
Meshlytics Cloud repository may eventually provide a hosted platform
on top of it:

- Event ingestion
- Analytics API
- Dashboards
- Funnels
- Session analysis
- Conversion tracking
- Data exploration

That hosted layer lives outside this repo and is not required to use
any of the packages here — point the SDK's `endpoint`/`transport` at
whatever backend you want, ours or otherwise.

## Repository layout

```
meshlytics/
├── apps/            docs site, internal playground
├── packages/        engine, discovery, instrumentation, schema, core, sdk, cli, adapters
├── examples/        minimal per-framework sample apps
├── docs/            architecture and brand reference docs
└── tests/           cross-package fixtures, integration and e2e suites
```

## Contributing

```
pnpm install
pnpm build
pnpm test
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
