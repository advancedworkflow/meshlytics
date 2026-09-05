/**
 * Generates a random id. Uses `crypto.randomUUID` where available
 * (Node 18+, all modern browsers) and falls back to a
 * timestamp + random suffix otherwise.
 */
export function generateId(prefix?: string): string {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${raw}` : raw;
}

export function generateSessionId(): string {
  return generateId("ses");
}

export function generateAnonymousId(): string {
  return generateId("anon");
}
