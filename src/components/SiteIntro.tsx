import { useEffect, useRef, useState, type CSSProperties } from "react";
import { isIntroPending, releaseIntro } from "@/lib/intro";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const WORDMARK = "DURALL SYSTEMS";
const MIDDLE = (WORDMARK.length - 1) / 2;

/* The mark at the head of the Durall Systems logo, 234 by 106: the D, and
 * the S that leans on it. Traced from the logo itself, so it is the same
 * mark, only in two pieces that can move. Each leaf is drawn in its own
 * slice of the one drawing, so anything laid across both lines up. */
const D = "M0 0H121V70.6L85.6 106H0Z";
const S = "M156.4 0H234V35.4L198.6 70.8V106H121V70.6L156.4 35.2Z";
const MARK_H = 106;
const LEAVES = [
  { id: "d", shape: D, viewBox: "0 0 121 106", side: "left-0" },
  { id: "s", shape: S, viewBox: "121 0 113 106", side: "right-0" },
] as const;
/* The setting-out lines: the mark's two sides and the line its halves
 * share, as shares of its width. */
const UPRIGHTS = [0, 121 / 234, 1] as const;

/* Where the fly-through is aimed: the middle of the D, the roomiest place in
 * the mark, with CLEAR of its units to the nearest edge on every side. */
const EYE = [53, 53] as const;
const CLEAR = 53;

/* However slow the hero image is, the reader is never held behind the
 * curtain longer than this, counted from the moment it first painted
 * (`__introAt`, set by the pre-paint script in __root.tsx). There is no
 * minimum to match it: the curtain waits for its own build to finish
 * playing instead, however late that started. */
const CAP_MS = 3200;

/* As long as the glass takes to clear (styles.css, `intro-unglaze`). */
const CLEAR_MS = 420;
const THROUGH_MS = 950;
const SKIP_MS = 360;

/**
 * Page-load opening: rails are drawn across the screen, the two halves of
 * the Durall mark slide in along them and meet, glass is wiped into them
 * and the name gathers underneath — then the glass clears, the page is
 * behind it, and the screen flies through the mark onto the page.
 *
 * The build is pure CSS (styles.css, "Site intro"), so it starts on the
 * very first paint instead of waiting for the JavaScript bundle. Script
 * only decides when to leave, runs the exit, and hands off to the page.
 *
 * On every full page load, never on a client-side navigation, never under
 * reduced motion, and any wheel, key or tap fades straight to the page.
 */
export function SiteIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !isIntroPending()) {
      releaseIntro();
      // The pre-paint script's safety net may still be fading the curtain
      // out; let it finish rather than cutting it off.
      const bailing = document.documentElement.classList.contains("intro-bailout");
      const t = window.setTimeout(() => setDone(true), bailing ? 450 : 0);
      return () => window.clearTimeout(t);
    }

    // The pre-paint script's safety net is only for a page whose script
    // never arrives. It has arrived; this component owns the curtain now.
    const w = window as Window & { __introSafety?: number; __introAt?: number };
    if (w.__introSafety) window.clearTimeout(w.__introSafety);
    const shownAt = w.__introAt ?? 0;

    lockScroll();
    window.scrollTo(0, 0);

    let exiting = false;
    let cancelled = false;
    let frame = 0;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const building = () => root.getAnimations({ subtree: true });

    const finish = () => {
      if (cancelled) return;
      document.documentElement.classList.remove("intro-pending");
      unlockScroll();
      setDone(true);
    };

    const exit = (skip = false) => {
      if (exiting || cancelled) return;
      exiting = true;
      removeListeners();
      // From here the page can be seen: anything whose entrance is not built
      // yet goes back to being held by the pre-paint class (styles.css).
      document.documentElement.classList.remove("intro-covered");

      const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
      const mark = q<HTMLElement>("[data-intro-mark]");
      const at = q<SVGGElement>("[data-window-at]");
      const zoom = q<SVGGElement>("[data-window-zoom]");
      const fit = q<SVGGElement>("[data-window-fit]");
      const built = building().every((animation) => animation.playState === "finished");

      // A skip wants the page now, and a mark that is not whole yet cannot
      // be opened as a window: either way the curtain simply lifts.
      if (skip || !built || !mark || !at || !zoom || !fit) {
        releaseIntro();
        const lift = root.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: SKIP_MS,
          easing: "cubic-bezier(0.33, 1, 0.68, 1)",
          fill: "forwards",
        });
        void lift.finished.then(finish, finish);
        return;
      }

      // Cut the mark out of the wall exactly where it stands, and find how
      // far the cut has to grow before the D alone covers the screen.
      const box = mark.getBoundingClientRect();
      const unit = box.height / MARK_H;
      const x = box.left + EYE[0] * unit;
      const y = box.top + EYE[1] * unit;
      at.setAttribute("transform", `translate(${x} ${y})`);
      fit.setAttribute("transform", `scale(${unit}) translate(${-EYE[0]} ${-EYE[1]})`);
      const reach = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      const full = (reach / (CLEAR * unit)) * 1.04;

      root.classList.add("is-opening");
      later(() => {
        root.classList.add("is-through");
        // The page's own entrance starts as the opening widens, so the
        // hero's heading is rising into view rather than finished behind it.
        later(releaseIntro, THROUGH_MS * 0.4);
        const from = performance.now();
        const step = (now: number) => {
          if (cancelled) return;
          const t = Math.min(1, Math.max(0, (now - from) / THROUGH_MS));
          // Growth compounds, as it does walking up to a doorway: each
          // moment multiplies the opening rather than adding to it.
          zoom.setAttribute("transform", `scale(${full ** (t ** 1.5)})`);
          if (t < 1) frame = requestAnimationFrame(step);
          else finish();
        };
        frame = requestAnimationFrame(step);
      }, CLEAR_MS);
    };

    const onSkip = () => exit(true);
    const onKey = (event: KeyboardEvent) => {
      // Let the skip link and assistive shortcuts through untouched.
      if (event.key === "Tab" || event.metaKey || event.ctrlKey || event.altKey) return;
      exit(true);
    };
    const removeListeners = () => {
      window.removeEventListener("wheel", onSkip);
      window.removeEventListener("touchstart", onSkip);
      window.removeEventListener("pointerdown", onSkip);
      window.removeEventListener("keydown", onKey);
    };
    window.addEventListener("wheel", onSkip, { passive: true });
    window.addEventListener("touchstart", onSkip, { passive: true });
    window.addEventListener("pointerdown", onSkip);
    window.addEventListener("keydown", onKey);

    // Leave once the page is genuinely ready and the mark has been built,
    // or at the cap, whichever comes first.
    const elapsed = () => performance.now() - shownAt;
    // The page's own opening picture.
    const hero = document.querySelector<HTMLImageElement>('main img[fetchpriority="high"]');
    const ready = Promise.all([
      document.fonts?.ready,
      hero?.decode ? hero.decode().catch(() => undefined) : undefined,
      Promise.allSettled(building().map((animation) => animation.finished)),
    ]);
    const cap = new Promise((r) => later(() => r(undefined), Math.max(0, CAP_MS - elapsed())));
    void Promise.race([ready, cap]).then(() => exit());

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      removeListeners();
      timers.forEach((t) => window.clearTimeout(t));
      if (!exiting) unlockScroll();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef} className="site-intro" aria-hidden="true">
      <div className="intro-wall absolute inset-0 bg-navy" />
      {/* The same wall with the mark cut out of it, placed and grown by the
          exit above. Far wider than any screen, so it still covers at its
          smallest. */}
      <svg className="intro-window absolute inset-0 h-full w-full">
        <g data-window-at>
          <g data-window-zoom>
            <g data-window-fit>
              <path
                fillRule="evenodd"
                className="fill-navy"
                d={`M-20000-20000H20000V20000H-20000Z${D}${S}`}
              />
              <path
                d={D + S}
                fill="none"
                stroke="#fff"
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </g>
        </g>
      </svg>

      <div
        data-intro-content
        className="absolute inset-0 flex flex-col items-center justify-center text-white"
      >
        <div data-intro-mark className="relative aspect-[234/106] h-[clamp(3.5rem,6.2vw,5.75rem)]">
          <span className="intro-rail intro-rail-x top-0" />
          <span className="intro-rail intro-rail-x bottom-0" />
          {UPRIGHTS.map((share, i) => (
            <span
              key={share}
              className="intro-rail intro-rail-y"
              style={{ left: `${share * 100}%`, "--d": `${i * 90}ms` } as CSSProperties}
            />
          ))}

          {LEAVES.map((leaf) => (
            <svg
              key={leaf.id}
              viewBox={leaf.viewBox}
              className={`intro-sash intro-sash-${leaf.id} absolute inset-y-0 h-full overflow-visible ${leaf.side}`}
            >
              <clipPath id={`intro-leaf-${leaf.id}`}>
                <path d={leaf.shape} />
              </clipPath>
              <path
                d={leaf.shape}
                fill="currentColor"
                fillOpacity="0.1"
                stroke="currentColor"
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
              />
              <g clipPath={`url(#intro-leaf-${leaf.id})`}>
                <rect
                  className="intro-glass"
                  x="-460"
                  y="-2"
                  width="460"
                  height="110"
                  fill="currentColor"
                />
              </g>
            </svg>
          ))}
        </div>

        {/* The left padding answers the tracking after the last letter, so
            the word sits on the mark's centre. */}
        <p className="intro-name mt-[clamp(1.5rem,2.6vw,2.25rem)] flex pl-[0.3125rem] font-display text-[clamp(1rem,1.7vw,1.375rem)] font-bold tracking-[0.3125rem] uppercase">
          {Array.from(WORDMARK).map((char, i) => (
            <span key={i} className="intro-char" style={{ "--n": i - MIDDLE } as CSSProperties}>
              {char === " " ? " " : char}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
