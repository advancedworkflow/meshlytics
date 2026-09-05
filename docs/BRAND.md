# Brand

## Positioning

> Analytics instrumentation for modern web applications.

Or, shorter: **Analytics, automatically instrumented.**

"Mesh" is the connection between an app, its routes, its events, and
analytics data; "lytics" is the immediate analytics reference. It
reads as developer infrastructure, not a dashboard product, and it
leaves room to grow into a suite of components around one ecosystem
(engine, CLI, SDK, schema, adapters, and eventually a hosted cloud —
see [ARCHITECTURE.md](./ARCHITECTURE.md)).

## Visual direction

Dark developer infrastructure / AI-tooling aesthetic: sombre, very few
gradients, thin lines/connectors evoking a mesh, small dots for
events, clean and technical.

| Token       | Value     | Use                          |
| ----------- | --------- | ----------------------------- |
| Background  | `#08090D` | App background                |
| Surface     | `#11131A` | Cards, panels                 |
| Primary     | `#7C5CFF` | Intelligence / orchestration accent |
| Accent      | `#22D3A6` | Events flowing through the system |
| Text        | `#F5F5F7` | Primary text                  |
| Muted       | `#8B8F9D` | Secondary text                |

Fonts: **Geist** (UI), **Geist Mono** (code). Earlier drafts of this
palette used `#0B0D12` / `#F4F5F7` / `#7C5CFF` / `#24D6A5` / `#252936`
with Inter / IBM Plex Mono — the table above is the current one.

## Logo concept

A mesh of 4–6 nodes that reads as **Route → Event → Data**, not a
generic network glyph — the center node is the event, the surrounding
nodes are the sources/contexts feeding it:

```
      ┌────●────┐
      │    │    │
      ●────●────●
           │
           ●
```

## Wordmark

Horizontal `MESHLYTICS` (preferred for GitHub/npm) over a stacked
`MESH` / `LYTICS` treatment.

## Naming

All internal packages live under the `@meshlytics/*` scope; the single
package installed into an application is unscoped `meshlytics` (see
[ARCHITECTURE.md](./ARCHITECTURE.md#the-meshlytics-package-vs-meshlytics)).
Cloud stays a separate, later concern from the OSS core.
