---
"@meshlytics/instrumentation": minor
"meshlytics": minor
---

The generated `meshlytics.instrumentation.ts` now exports `meshlyticsPlan` instead of a ready-made `meshlytics` client.

The generated client had no `endpoint` or `transport`, so its events went nowhere, and any option added by hand was lost on the next `meshlytics instrument`. Create the client in your own code instead:

```ts
import { createClient } from "meshlytics";
import { meshlyticsPlan } from "./meshlytics.instrumentation";

export const meshlytics = createClient({ plan: meshlyticsPlan, endpoint: "/api/events" });
```

The generated file only imports the `MeshlyticsPlan` type, so it adds nothing to the bundle.
