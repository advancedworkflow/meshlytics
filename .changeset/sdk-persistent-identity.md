---
"@meshlytics/sdk": minor
"@meshlytics/core": minor
"@meshlytics/schema": minor
"meshlytics": minor
---

Keep visitor identity consistent, make `identify()` stick, and store nothing on the device unless asked to.

- `anonymousId` and `sessionId` are now resolved per event from a storage instead of being fixed at client creation. Sessions roll over after 30 minutes of inactivity (`sessionTimeoutMs`).
- New `storage` option: `"memory"` (default — nothing written to the device, no consent needed), `"localStorage"`, `"sessionStorage"`, or any Web Storage–shaped object (e.g. a cookie adapter).
- New `setStorage()` to opt in once consent is given (keeps the ids already used on the page, and a returning visitor's stored ids win) or to opt out when it is withdrawn (wipes what was stored).
- `identify(id)` now adds `userId` to that event and every later one until `reset()`, keeping `anonymousId` so pre-login activity can be stitched to the user.
- New `reset()`, to call on logout.
- `MeshEvent` gains an optional `userId` field.

Storage failures (SSR, Safari private mode, quota) fall back to memory without throwing.
