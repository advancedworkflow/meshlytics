# Architecture

Meshlytics connects an application's code (routes, actions, identity)
to whatever analytics backend it should feed:

```
                  YOUR APP
                     │
        ┌────────────┴────────────┐
        │                         │
      Routes                   Actions
        │                         │
        └──────────┬──────────────┘
                   ▼
             MESHLYTICS
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
       Events   Context   Identity
          │        │        │
          └────────┼────────┘
                   ▼
              Analytics API
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
     PostHog    Mixpanel    Cloud
```

Meshlytics is not a competitor to Google Analytics or PostHog — it's
the instrumentation layer *between* an application and any analytics
backend.

## Pipeline

Every CLI command that produces instrumentation runs the same
pipeline, implemented as separate stages so each can be tested, and
extended, independently:

```
Framework Adapter (detect)
       │
       ▼
Route Discovery        @meshlytics/discovery
       │
       ▼
Application Model       @meshlytics/schema (ApplicationModel)
       │
       ▼
Instrumentation Planner @meshlytics/engine (packages/engine/src/planner)
       │
       ▼
Instrumentation Generator @meshlytics/instrumentation
       │
       ▼
Generated Code / Config (meshlytics.instrumentation.ts)
       │
       ▼
SDK                      @meshlytics/sdk
       │
       ▼
Analytics API / backend of your choice
```

`@meshlytics/engine` (`packages/engine/src/{scanner,discovery,analyzer,model,planner,generator}`)
is the orchestrator: it doesn't implement route scanning or code
generation itself, it composes `@meshlytics/discovery` and
`@meshlytics/instrumentation`, which are published standalone so other
tools (editor extensions, CI checks) can use just the discovery or
generation step without the CLI.

## Why not framework-specific code paths?

```
Next.js → code specific to Next.js → code specific to something else
```

is a dead end for a multi-framework tool. Instead, discovery for each
framework normalizes into the same `ApplicationModel` /
`InstrumentationPlan` shapes (defined once, with zod, in
`@meshlytics/schema`), so the planner, generator, and SDK never need
to know which framework produced them. Adding a framework means
adding a discovery module and a thin runtime adapter — not touching
the planner or generator.

## Event shape

Every event — built-in (`page_view`) or custom (`track("checkout_started")`)
— normalizes to the same `MeshEvent` shape before it reaches a
transport, so a backend integration only needs to handle one format
regardless of what triggered the event.

## The `meshlytics` package vs. `@meshlytics/*`

`meshlytics` (unscoped) is the only package meant to be installed
directly into an application — it's both the CLI (`npx meshlytics ...`)
and the runtime entry point (`import { createClient } from "meshlytics"`,
re-exported from `@meshlytics/sdk`). The scoped `@meshlytics/*`
packages are internal building blocks, published separately so they
can be reused outside the CLI.
