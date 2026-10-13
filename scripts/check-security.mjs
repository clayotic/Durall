// What the site promises a browser, checked from outside. Run it against any
// address the site is served from, after a deploy or a change to src/server.ts:
//
//   node scripts/check-security.mjs https://durall.netlify.app
//
// It reads a few pages and fails loudly if a header is missing, if a script
// written into a page is not named in that page's policy (the browser would
// refuse to run it and the page would not start), or if the admin panel's
// pages could be kept by a cache.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const base = (process.argv[2] ?? "http://localhost:8080").replace(/\/$/, "");
const local = /\/\/(localhost|127\.0\.0\.1)/.test(base);

for (const path of ["/", "/contact", "/projects", "/admin/login", "/no-such-page"]) {
  const response = await fetch(base + path, { redirect: "manual" });
  const header = (name) => response.headers.get(name) ?? "";
  const policy = header("content-security-policy");
  // `vite dev` sends the policy as a report only, and allows framing.
  if (!(local && !policy)) {
    assert.ok(policy, `${path}: no Content-Security-Policy`);
    assert.equal(header("x-frame-options"), "DENY", `${path}: can be framed`);
    assert.match(policy, /frame-ancestors 'none'/, `${path}: can be framed`);
    assert.doesNotMatch(policy, /script-src[^;]*'unsafe-inline'/, `${path}: inline script allowed`);
  }
  assert.equal(header("x-content-type-options"), "nosniff", `${path}: no nosniff`);
  assert.ok(header("referrer-policy"), `${path}: no referrer policy`);
  if (path.startsWith("/admin")) {
    assert.match(header("cache-control"), /no-store/, `${path}: the panel can be cached`);
  }

  // Each script in the page, as a browser reads it: line endings as "\n",
  // NUL as U+FFFD. Its fingerprint has to be in the policy.
  const html = await response.text();
  const named = policy || header("content-security-policy-report-only");
  const scripts = html.matchAll(
    /<script(?![^>]*\ssrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g,
  );
  let count = 0;
  for (const [, body] of scripts) {
    const read = body.replace(/\r\n?/g, "\n").replaceAll("\0", "�");
    const print = createHash("sha256").update(read).digest("base64");
    assert.ok(named.includes(`'sha256-${print}'`), `${path}: a script is not in the policy`);
    count++;
  }
  console.log(`ok  ${path}  (${response.status}, ${count} scripts named)`);
}

// A request from another site to one of the server's functions is refused
// before the function is looked up, so any id will do.
const crossSite = await fetch(`${base}/_serverFn/${"0".repeat(64)}`, {
  method: "POST",
  headers: { origin: "https://example.com", "sec-fetch-site": "cross-site" },
});
assert.equal(crossSite.status, 403, "a cross-site call to a server function was not refused");
console.log("ok  cross-site calls to server functions are refused");
