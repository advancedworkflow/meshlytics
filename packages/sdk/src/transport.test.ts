import { afterEach, describe, expect, it, vi } from "vitest";
import { createFetchTransport, noopTransport } from "./transport.js";
import type { MeshEvent } from "@meshlytics/core";

const event: MeshEvent = { name: "page_view", timestamp: "2026-09-06T12:00:00.000Z", route: "/" };

describe("createFetchTransport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POSTs the event as JSON to the configured endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await createFetchTransport("https://example.com/events")(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://example.com/events");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(init.keepalive).toBe(true);
    expect(JSON.parse(init.body)).toEqual(event);
  });

  it("propagates a rejected fetch instead of swallowing it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    await expect(createFetchTransport("https://example.com/events")(event)).rejects.toThrow(
      "network down",
    );
  });
});

describe("noopTransport", () => {
  it("does nothing and returns undefined", () => {
    expect(noopTransport(event)).toBeUndefined();
  });
});
