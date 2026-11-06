import type { AnyRouter } from "@tanstack/react-router";

/**
 * Photographs loaded ahead of the reader.
 *
 * First every photograph on the page that is open, not only those near the
 * screen: a lazy image starts loading only as the reader scrolls toward it,
 * and from a far server that is a second or more of empty frame each time.
 * Then the other pages', so a page opens with them already there: every one
 * on the main pages, and the opening photograph of each project and article
 * (the rest of those load the moment one is opened). Opening another page
 * pauses this until that page's own are in.
 *
 * Another page's photographs are fetched as that page would ask for them:
 * its markup is read (the CDN's copy) and each image keeps its own `srcset`
 * and `sizes`, so the browser picks the same file for this screen that the
 * page will, and skips those its classes hide at this width (a section's
 * phone or desktop version). About 6 MB on a computer and 9 MB on a phone,
 * once; the browser keeps them after that. Nothing extra is fetched for a
 * reader who has asked to save data, or on a 2G connection.
 */

type Connection = { saveData?: boolean; effectiveType?: string };

/** How many of another page's photographs are fetched at a time. */
const AT_ONCE = 4;
/** The longest the open page is waited for (ms). */
const PATIENCE_MS = 20_000;

/** Work the open page is still doing that should come first (the home film). */
let held: Promise<unknown>[] = [];
export function holdWarming(work: Promise<unknown>) {
  held.push(work.catch(() => {}));
}

/* Tailwind's breakpoints (rem), and the order its display classes come in
 * the stylesheet: plain, the max-* ones from the widest down, then the
 * min-width ones from the narrowest up. A later one that applies wins. */
const BREAKPOINTS: Record<string, number> = { sm: 40, md: 48, lg: 64, xl: 80, "2xl": 96 };
const ORDER = [
  "",
  "max-2xl",
  "max-xl",
  "max-lg",
  "max-md",
  "max-sm",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
];
const DISPLAY =
  /^(?:(max-)?(sm|md|lg|xl|2xl):)?(hidden|block|inline|inline-block|flex|inline-flex|grid|inline-grid|contents|table|flow-root)$/;

/** Whether the display classes on `element` and around it leave it shown at this width. */
function displayed(element: Element | null): boolean {
  for (let node = element; node; node = node.parentElement) {
    if (node.hasAttribute("hidden")) return false;
    let rank = -1;
    let hidden = false;
    for (const token of node.classList) {
      const match = DISPLAY.exec(token);
      if (!match) continue;
      const [, max = "", breakpoint = "", value] = match;
      const at = ORDER.indexOf(breakpoint ? max + breakpoint : "");
      if (at < rank) continue;
      if (breakpoint) {
        const rem = BREAKPOINTS[breakpoint];
        if (!matchMedia(max ? `(width < ${rem}rem)` : `(width >= ${rem}rem)`).matches) continue;
      }
      rank = at;
      hidden = value === "hidden";
    }
    if (hidden) return false;
  }
  return true;
}

const within = (work: Promise<unknown>) =>
  Promise.race([work, new Promise((resolve) => setTimeout(resolve, PATIENCE_MS))]);

const arrived = (image: HTMLImageElement) =>
  image.complete
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });

/** Every photograph shown on the open page, once the page's own film work
 * is done (holdWarming); resolves once they are in. The lazy ones still load
 * as they near the screen meanwhile. */
async function openPage() {
  const work = held;
  held = [];
  await within(Promise.all(work));
  const images = [...document.querySelectorAll("img")].filter(
    (image) => image.getClientRects().length > 0,
  );
  for (const image of images) if (image.loading === "lazy") image.loading = "eager";
  await within(Promise.all(images.map(arrived)));
}

/** One of another page's photographs, as that page would ask for it here. */
const fetchLike = (source: Element) =>
  new Promise<void>((resolve) => {
    const srcset = source.getAttribute("srcset");
    const src = source.getAttribute("src");
    if (!srcset && !src) return resolve();
    const image = new Image();
    image.fetchPriority = "low";
    image.decoding = "async";
    image.onload = image.onerror = () => resolve();
    // `sizes` first: with `srcset` set before it, a wrong size may be picked.
    const sizes = source.getAttribute("sizes");
    if (sizes) image.sizes = sizes;
    if (srcset) image.srcset = srcset;
    if (src) image.src = src;
  });

const text = (path: string) =>
  fetch(path, { priority: "low" })
    .then((response) => (response.ok ? response.text() : ""))
    .catch(() => "");

/** Starts loading photographs ahead; returns what stops it. */
export function warmImages(router: AnyRouter): () => void {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  if (connection?.saveData || connection?.effectiveType?.includes("2g")) return () => {};

  let stopped = false;
  /** Settles once the open page's own photographs are in. */
  let gate: Promise<unknown>;
  let opened: (() => void) | undefined;

  const start = () => {
    const done = opened; // this page's, even if another opens meanwhile
    void openPage().then(() => done?.());
  };
  gate = within(new Promise<void>((resolve) => (opened = resolve)));
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });

  // Another page opened: its photographs come before the rest.
  const offBefore = router.subscribe("onBeforeNavigate", (event) => {
    if (!event.pathChanged) return;
    gate = within(new Promise<void>((resolve) => (opened = resolve)));
  });
  const offRendered = router.subscribe("onRendered", (event) => {
    if (!event.pathChanged) return;
    // Two frames: one for the page to commit, one for its effects.
    requestAnimationFrame(() => requestAnimationFrame(start));
  });

  void (async () => {
    await gate;
    const paths = [...(await text("/sitemap.xml")).matchAll(/<loc>([^<]+)<\/loc>/g)].flatMap(
      ([, loc = ""]) => {
        try {
          return [new URL(loc).pathname];
        } catch {
          return [];
        }
      },
    );
    const main = paths.filter((path) => path.split("/").filter(Boolean).length <= 1);
    const pages = [
      ...main.map((path) => [path, "img"] as const),
      // A project's or an article's opening photograph is the one it asks for first.
      ...paths
        .filter((path) => !main.includes(path))
        .map((path) => [path, 'img[fetchpriority="high"]'] as const),
    ];
    const done = new Set<string>();
    for (const [path, selector] of pages) {
      await gate;
      if (stopped) return;
      if (path === window.location.pathname) continue; // its own are in already
      const html = await text(path);
      if (stopped) return;
      const images = [
        ...new DOMParser().parseFromString(html, "text/html").querySelectorAll(selector),
      ].filter((image) => {
        const key = `${image.getAttribute("srcset")}|${image.getAttribute("src")}`;
        if (done.has(key) || !displayed(image)) return false;
        done.add(key);
        return true;
      });
      for (let i = 0; i < images.length; i += AT_ONCE) {
        await gate;
        if (stopped) return;
        await Promise.all(images.slice(i, i + AT_ONCE).map(fetchLike));
      }
    }
  })();

  return () => {
    stopped = true;
    window.removeEventListener("load", start);
    offBefore();
    offRendered();
  };
}
