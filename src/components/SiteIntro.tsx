import { useEffect, useRef, useState, type CSSProperties } from "react";
import { isIntroPending, releaseIntro } from "@/lib/intro";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

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
/* The name as the logo sets it: DURALL, with SYSTEMS under its last three
 * letters, each letter traced from the logo in the logo's own units (the
 * mark above is its first 234 of them). The name starts at 286 and runs to
 * the logo's edge at 1200; DURALL is the first six letters. */
const NAME: readonly (readonly [x: number, y: number, w: number, h: number, d: string])[] = [
  [
    286,
    0,
    146,
    106,
    "M286 0.5L286 106L411.5 106L432 90.5L432 16.5L412.5 0.5ZM312 21.5L401.5 21.5L405.5 25.5L405.5 81.5L400.5 85L312.5 85L312 84.5Z",
  ],
  [
    450,
    0,
    134,
    106,
    "M450.5 0.5L450.5 89.5L451 90.5L469.5 105.5L471.5 106L563 106L583.5 90L583.5 0L558.5 0L557 0.5L557 81L552 85L482 85L479 83L477 80.5L477 0.5L475.5 0L451.5 0Z",
  ],
  [
    602,
    0,
    155,
    106,
    "M602 0.5L602 106L627.5 106L628 105.5L628 76.5L630 75.5L685.5 75.5L719.5 106L755.5 106L723 76.5L723.5 75.5L735.5 75.5L737 75L753 62.5L757 58.5L757 16.5L737 0.5L735.5 0L602.5 0ZM628.5 22.5L629.5 21.5L725 21.5L729 24L730 25.5L730 50L726.5 54L724 54L629.5 54L628.5 53.5Z",
  ],
  [
    775,
    0,
    155,
    106,
    "M775 0.5L775 105.5L775 106L801 106L801 76.5L802 75.5L803 75.5L902.5 75.5L903 76.5L903 106L929.5 106L929.5 16.5L910 0.5L908.5 0L775.5 0ZM801 22.5L802 21.5L898 21.5L902 24L903 25.5L903 53L902.5 54L901.5 54L802 54L801 53Z",
  ],
  [
    948,
    0,
    120,
    106,
    "M948 0L948 89.5L948.5 91L968.5 106L1068 106L1068 86L1067.5 85L979.5 85L975 82L974.5 81L974.5 0.5L973.5 0Z",
  ],
  [
    1086,
    0,
    114,
    106,
    "M1086 0.5L1086 89.5L1087 91L1107 106L1199.5 106L1199.5 85L1118 85L1113 81L1113 0.5L1111.5 0L1087.5 0Z",
  ],
  [
    775,
    142,
    52,
    38,
    "M775 142.5L775 158.5L781.5 165L816.5 165L818 166.5L818 170.5L815.5 172.5L786 172.5L783.5 169L775.5 169L775 170.5L775 174.5L781.5 180L819.5 180L827 174.5L827 163L820 157L786.5 157L785 156.5L784 155.5L784 150.5L784.5 149.5L815.5 149.5L818.5 152.5L826.5 152.5L827 151.5L827 148L821 142.5L819.5 142L775.5 142Z",
  ],
  [
    834,
    142,
    47,
    38,
    "M881 142.5L880.5 142L872 142L872 159.5L870.5 161.5L845.5 161.5L843.5 159.5L843.5 142L835 142L834 143.5L834 163L841.5 169L853 169L853.5 170.5L853.5 180L863 180L863 169L874 169L881 163.5Z",
  ],
  [
    888,
    142,
    53,
    38,
    "M888 142.5L888 158.5L895 164.5L928.5 164.5L930 165L931 166.5L931 170.5L930 172L928.5 172.5L900.5 172L898.5 172L896.5 169L888.5 169L888 170.5L888 174L894.5 180L933 180L940.5 174.5L940.5 163.5L933.5 157L900 157L897.5 155L897.5 150.5L898.5 149.5L929 149.5L931 150.5L932 152.5L940.5 152.5L940.5 147.5L933.5 142L889 142Z",
  ],
  [
    947,
    142,
    57,
    38,
    "M947.5 143L947.5 148.5L948.5 149.5L969 149.5L970 150L970 179.5L971 180L979.5 180L980 179.5L980 150.5L980.5 149.5L1002.5 149.5L1003.5 148L1003.5 143L1002.5 142L948.5 142Z",
  ],
  [
    1010,
    142,
    48,
    38,
    "M1010 142.5L1010 176.5L1015 180L1053.5 180L1058 176.5L1058 173.5L1057.5 172.5L1020.5 172.5L1019.5 171.5L1019.5 165.5L1020.5 164.5L1058 164.5L1058 158.5L1057.5 157L1020.5 157L1019.5 156.5L1019.5 150.5L1020.5 149.5L1057.5 149.5L1058 148L1058 143L1057.5 142L1011 142Z",
  ],
  [
    1064,
    142,
    83,
    38,
    "M1064.5 142.5L1064.5 179.5L1065 180L1073.5 180L1074 179.5L1074 150.5L1075 149.5L1099 149.5L1101 151L1101 179.5L1102 179.5L1110.5 179.5L1110.5 151.5L1112 149.5L1136.5 149.5L1138 152L1138 179.5L1138.5 180L1146.5 180L1147 179.5L1147 148L1146.5 147L1140 142L1109 142L1106.5 143.5L1103 142L1065.5 142Z",
  ],
  [
    1154,
    142,
    46,
    38,
    "M1154 142.5L1154 158.5L1160.5 164.5L1162 165L1194.5 165L1196 165L1197 166.5L1197 170.5L1196 172L1194.5 172.5L1166.5 172L1164.5 172L1162.5 169L1154.5 169L1154 170.5L1154 175L1161.5 180L1199 180L1200 179.5L1200 158.5L1199.5 157L1165.5 157L1163.5 155.5L1163.5 150.5L1164.5 149.5L1195 149.5L1197 150.5L1197.5 152.5L1199.5 152.5L1199.5 151.5L1199.5 142L1154.5 142Z",
  ],
];
const NAME_X = 286;
const NAME_W = 914;
const NAME_H = 180;

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

        {/* The font size sets how far apart the letters start (`intro-char`). */}
        <div className="intro-name relative mt-[clamp(1.5rem,2.6vw,2.25rem)] aspect-[914/180] h-[clamp(2.35rem,4.15vw,3.85rem)] text-[clamp(1rem,1.7vw,1.375rem)]">
          {NAME.map(([x, y, w, h, d], i) => {
            // Each word gathers on its own middle; SYSTEMS a beat after DURALL.
            const word = i < 6 ? { n: i - 2.5, lag: 0 } : { n: i - 9, lag: 140 };
            const style = {
              left: `${((x - NAME_X) / NAME_W) * 100}%`,
              top: `${(y / NAME_H) * 100}%`,
              width: `${(w / NAME_W) * 100}%`,
              height: `${(h / NAME_H) * 100}%`,
              "--n": word.n,
              "--lag": `${word.lag}ms`,
            } as CSSProperties;
            return (
              <svg
                key={i}
                viewBox={`${x} ${y} ${w} ${h}`}
                className="intro-char absolute"
                style={style}
              >
                <path d={d} fill="currentColor" fillRule="evenodd" />
              </svg>
            );
          })}
        </div>
      </div>
    </div>
  );
}
