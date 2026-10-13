import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

/**
 * A speed bump for the three things a stranger can ask the server to do
 * over and over: send an enquiry, try a password, and have a reset email
 * sent. Server-only.
 */

/**
 * The address the request came from, as the host recorded it. Netlify sets
 * this header itself on every request. X-Forwarded-For is only the fallback
 * for other hosts and local work: the visitor can send that one too, and
 * give a different address with every request.
 */
export function clientAddress(): string {
  try {
    return (
      getRequestHeader("x-nf-client-connection-ip") ??
      getRequestIP({ xForwardedFor: true }) ??
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

// ponytail: counted per warm function instance, so a script spread over
// several instances gets a few times the limit. Move the count to a shared
// place (a database table, or Netlify's rate-limit rules) if that matters.
const recent = new Map<string, number[]>();

/** Counts this attempt, and says whether `key` has now made more than `limit` within `windowMs`. */
export function tooMany(key: string, limit: number, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const times = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  times.push(now);
  recent.set(key, times);
  if (recent.size > 5000) recent.clear();
  return times.length > limit;
}
