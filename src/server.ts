import "./lib/error-capture";

import { createHash } from "node:crypto";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { supabaseConfig } from "./server/supabase";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return errorPage();
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/* Public pages and content responses mark themselves cacheable at the CDN
 * (server/cache.ts). The admin panel, errors and anything that sets a
 * cookie never may: those are rewritten here, at the one place every
 * response passes through, so no route can opt them in by accident. And a
 * response that never asked to be cached (the panel's own data, enquiries
 * among it) says so outright, so no browser or proxy keeps a copy.
 *
 * Every response also leaves with the same few instructions to the browser:
 * never show this site inside another site's frame (a button in the admin
 * panel cannot be dressed up as something else and clicked), take each file
 * as the type it is sent as, and tell other sites no more than the site's
 * name about where a visitor came from. */
function finished(request: Request, response: Response): Response {
  const path = new URL(request.url).pathname;
  const cacheable =
    request.method === "GET" &&
    response.status === 200 &&
    !path.startsWith("/admin") &&
    !response.headers.has("set-cookie");
  const headers = new Headers(response.headers);
  if (!cacheable || !headers.has("cache-control")) {
    headers.delete("netlify-cdn-cache-control");
    headers.delete("netlify-cache-tag");
    headers.set("cache-control", "private, no-store");
  }
  // Not under `vite dev`, where an editor's preview may show the site in a frame.
  if (import.meta.env.PROD) headers.set("x-frame-options", "DENY");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * What a page may load and run, for the browser to enforce (its Content
 * Security Policy). The site's own files, and the few outside services it
 * uses: the typefaces, the contact map's tiles, films from YouTube and
 * Vimeo, and the images uploaded through the admin panel.
 *
 * Scripts are the point of it. The only ones written into a page are the
 * server's own (the opening sequence's first step and the page's data), and
 * each is named here by its fingerprint, so those run and nothing else
 * inline does: not a script slipped in through a library, not an `onclick`
 * in injected markup, not a `javascript:` link. The contact map's library
 * has had exactly that kind of hole (see OfficeMap.tsx).
 *
 * A new outside service (analytics, a chat widget, another video host) has
 * to be added here or the browser will refuse it. `vite dev` sends the same
 * policy as a report only, so a refusal shows in the console there first.
 */
function policyFor(html: string): string {
  const fingerprints = [
    ...html.matchAll(
      /<script(?![^>]*\ssrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map(([, body = ""]) => {
    // The fingerprint is of the script as the browser reads it, and reading
    // HTML changes two things: line endings become "\n", and a NUL (the
    // router's page ids carry them) becomes U+FFFD.
    const read = body.replace(/\r\n?/g, "\n").replaceAll("\0", "\uFFFD");
    return `'sha256-${createHash("sha256").update(read).digest("base64")}'`;
  });
  const storage = (() => {
    try {
      return new URL(supabaseConfig().url ?? "").origin;
    } catch {
      return "";
    }
  })();
  return [
    "default-src 'self'",
    `script-src 'self' ${fingerprints.join(" ")}`,
    // Animation sets styles on elements directly, which only this allows.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${storage}`,
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://tiles.openfreemap.org ${storage}`,
    "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
    // The map draws on a worker it starts from a blob. Safari before 15.5
    // looks for that under the older name.
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/* A page is sent in one piece. Its body is a stream, and on Netlify a body
 * that arrived in two parts came out cut off after the first 2 KB: the
 * browser got part of the <head>, no body and no script, and showed a white
 * page. That was /admin, on the first request to each function instance —
 * the one time its loading placeholder (a separately loaded piece) is not
 * ready at once, so the rest of the page follows a moment later. Pages
 * written in a single burst came through whole on the same instances.
 *
 * Reading the body to its end here means there is no second part. Nothing
 * is lost by it: these pages are rendered whole before the first byte in
 * any case. And a stream that fails part-way now rejects here, into the
 * error page below, instead of leaving half a document.
 *
 * With the whole page in hand, this is also where its policy is written
 * (policyFor): the header has to name the scripts in this very page.
 *
 * To check the live site: request /admin a few dozen times at once and
 * compare the sizes; a cut response is about 2 KB against about 16. */
async function whole(response: Response): Promise<Response> {
  const html = (response.headers.get("content-type") ?? "").includes("text/html");
  if (!html || !response.body) return response;
  const page = await response.text();
  const headers = new Headers(response.headers);
  headers.set(
    import.meta.env.PROD ? "content-security-policy" : "content-security-policy-report-only",
    policyFor(page),
  );
  return new Response(page, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/* The pages of the site that stood on durallsystems.com before this one (a
 * small static site from 2015). Search engines and old links still hold
 * these addresses; each is sent on for good to the page that replaces it. */
const MOVED: Record<string, string> = {
  "/index.html": "/",
  "/index-2.html": "/",
  "/contact_full.html": "/contact",
  // The Expertise page was removed in November 2026; its five stages are on the home page.
  "/expertise": "/#process",
};

/**
 * Where a page request should go instead, if anywhere.
 *
 * - An address of the old site: its replacement.
 * - A page of the admin panel on the domain: the same page at the site's own
 *   netlify.app address, which Netlify serves directly. The domain reaches
 *   Netlify through the old host's server (November 2026), and sign-ins
 *   should not pass through it.
 * - The site's own netlify.app address, once the site has a domain of its
 *   own (Netlify's URL then names that domain): the same page there, so the
 *   site is not in search results under two names. Deploy previews, whose
 *   names carry "--", are left alone.
 */
function movedTo(request: Request): string | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  const moved = MOVED[url.pathname];
  if (moved) return new URL(moved + url.search, url).toString();
  // Pages only: the panel's own requests must not be bounced across sites.
  const page = (request.headers.get("accept") ?? "").includes("text/html");
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
    const site = process.env["SITE_NAME"];
    return page && site && !url.hostname.endsWith(".netlify.app")
      ? `https://${site}.netlify.app${url.pathname}${url.search}`
      : null;
  }
  const primary = process.env["URL"];
  if (!primary || !/^[^.]+\.netlify\.app$/.test(url.hostname) || url.hostname.includes("--")) {
    return null;
  }
  try {
    const home = new URL(primary);
    return page && !home.hostname.endsWith(".netlify.app")
      ? home.origin + url.pathname + url.search
      : null;
  } catch {
    return null;
  }
}

const errorPage = () =>
  new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const to = movedTo(request);
      if (to) return Response.redirect(to, 301);
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return finished(request, await whole(await normalizeCatastrophicSsrResponse(response)));
    } catch (error) {
      console.error(error);
      return finished(request, await whole(errorPage()));
    }
  },
};
