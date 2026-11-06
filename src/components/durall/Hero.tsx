import { useEffect } from "react";
import { useHeroIntro } from "@/lib/anim";
import { prefersReducedMotion } from "@/lib/motion-prefs";
import { clamp01, ramp, smooth } from "@/lib/scene";
import { destination, imageOf } from "@/content/render";
import type { HomePage } from "@/content/types";
import { CtaButton } from "./ui";

/* The opening film, as its frames: the open room's glass sliding shut, 72
 * pictures after the still (which is the film's first frame). They are
 * taken from the original at equal steps of change in the picture, not of
 * time, so that equal steps of scroll move the glass equally
 * (scripts/hero-frames.py makes them and the still).
 *
 * They come in four files rather than one each, coarse to fine: every
 * `STEPS[0]`th frame, then the frames between at each finer step. Each file
 * is those frames' WebP files end to end. */
const COUNT = 72;
const STEPS = [8, 4, 2, 1];
const PACKS = Object.entries(
  import.meta.glob<string>("@/assets/hero-doors/*.bin", {
    eager: true,
    query: "?url",
    import: "default",
  }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

/** On an upright screen: the part of the picture kept in view, the same for
 *  the still and the film drawn over it. */
const PORTRAIT = "portrait:object-[88%_50%]";
/** How closely the film keeps up with the scroll: the share of the distance
 *  left that it covers each second, as an exponent. */
const FOLLOW = 9;
/** The stretch of the film's scroll over which the heading and buttons lift
 *  away, so the open room is seen clear before the page comes over it. */
const LIFT = { from: 0.5, to: 0.95 };
/** Left alone at the top, the glass slides in a little and back again: how
 *  long it waits (ms), how long it takes (ms) and how far it goes (of the film). */
const HINT = { every: 6000, length: 2800, reach: 0.14 };

/**
 * The opening film, played by the scroll.
 *
 * The opening keeps a stretch of scroll to itself (its bottom margin, set in
 * styles.css) and the film runs across it: scrolling down slides the doors
 * shut, scrolling back opens them, and where the scroll stops they stop.
 * After that stretch the page comes up over the room as it always has.
 *
 * It is drawn frame by frame on a canvas over the still rather than played
 * as a video: a video cannot be run backwards, is slow to be sent to an
 * exact frame, and may be refused altogether (a phone saving power, a tab in
 * the background). A picture drawn on a canvas has none of that. Between
 * two frames it shows a mix of both, so a slow scroll moves the glass
 * smoothly rather than in steps; at rest it is always one whole frame.
 *
 * The frames are asked for once the page has loaded, at low priority, one
 * file after another: four requests instead of 72, each of which can take
 * a second to start on a slow connection. The first file holds every
 * eighth frame, so the glass can travel its whole way on that alone, and
 * gets finer as the rest arrive. Each frame is decoded before it is drawn,
 * so the scroll never waits on it. Until the first file has come, and where
 * there is no such stretch (a short window, reduced motion, a data saver),
 * there is only the still and the page scrolls over it.
 *
 * A phone held upright sees only a narrow cut of the room, so still and
 * film are both set to the right of the picture there (`PORTRAIT`), where
 * a door is. It also skips the last file (every other frame), half the
 * download; the mix between frames covers the difference at that size.
 */
function useHeroFilm(sectionRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = section?.querySelector<HTMLCanvasElement>("[data-hero-film]");
    const context = canvas?.getContext("2d");
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (!section || !canvas || !context || prefersReducedMotion() || saving) return;
    const copy = section.querySelector<HTMLElement>("[data-hero-copy]");
    const tint = section.querySelector<HTMLElement>("[data-hero-tint]");
    const cue = section.querySelector<HTMLElement>("[data-hero-cue]");

    const count = COUNT;
    /** Frame `n` of the film once it has arrived; 0 is the still, under the canvas. */
    const frames: (HTMLImageElement | undefined)[] = [];
    const addresses: string[] = [];
    let runway = 0; // the length of scroll the film is played across, in px
    let asked = false;
    let scrolled = 0; // how far through the film the scroll has it, 0 to 1
    let nudge = 0; // and how far the hint has it
    let drawn = -1;
    let frame = 0;
    let last = 0;
    let idleSince = performance.now();
    let timer = 0;
    let disposed = false;

    /** The frame nearest `n` that there is. */
    const nearest = (n: number) => {
      for (let d = 0; d <= count; d++) {
        if (n - d === 0 || frames[n - d]) return n - d;
        if (frames[n + d]) return n + d;
      }
      return 0;
    };

    const draw = (position: number) => {
      const at = clamp01(position) * count;
      const key = Math.round(at * 64);
      if (key === drawn) return;
      drawn = key;
      const below = Math.floor(at);
      const base = nearest(below);
      const next = frames[below + 1];
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
      const image = frames[base];
      if (image) context.drawImage(image, 0, 0, canvas.width, canvas.height);
      // Part-way to the next frame: that one over this, as far as it has got.
      if (base === below && next && at > below) {
        context.globalAlpha = at - below;
        context.drawImage(next, 0, 0, canvas.width, canvas.height);
      }
    };

    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      // The scroll, to the nearest whole frame, and the film easing after it.
      const goal = runway ? Math.round(clamp01(window.scrollY / runway) * count) / count : 0;
      scrolled += (goal - scrolled) * (1 - Math.exp(-dt * FOLLOW));
      if (Math.abs(goal - scrolled) < 0.0004) scrolled = goal;

      // The hint, while the page rests at the top with nothing over it.
      const resting =
        runway > 0 &&
        window.scrollY <= 2 &&
        !document.hidden &&
        !document.documentElement.classList.contains("intro-pending");
      let hint = 0;
      let hinting = false;
      if (!resting) idleSince = now;
      else if (now - idleSince > HINT.every) {
        const u = (now - idleSince - HINT.every) / HINT.length;
        if (u < 1) {
          hinting = true;
          hint = HINT.reach * Math.sin(Math.PI * u) ** 2;
        } else idleSince = now;
      }
      // Eased as well, so a scroll in the middle of it takes the glass over
      // from where it is instead of dropping it back open first.
      nudge += (hint - nudge) * (1 - Math.exp(-dt * 12));
      if (!hinting && nudge < 0.0004) nudge = 0;

      draw(Math.max(scrolled, nudge));
      const lift = smooth(ramp(scrolled, LIFT.from, LIFT.to));
      if (copy) {
        copy.style.opacity = (1 - lift).toFixed(3);
        copy.style.translate = `0 ${(-24 * lift).toFixed(2)}px`;
        copy.inert = lift > 0.95;
      }
      if (tint) tint.style.opacity = (1 - 0.7 * lift).toFixed(3);
      if (cue) cue.style.opacity = runway ? (1 - ramp(scrolled, 0, 0.08)).toFixed(3) : "0";

      // Still moving: go on. Settled at the top: come back when the hint is
      // due, or shortly, if something (the opening curtain) is in its way.
      window.clearTimeout(timer);
      if (scrolled !== goal || hinting || nudge > 0) frame = requestAnimationFrame(tick);
      else if (resting) timer = window.setTimeout(wake, HINT.every - (now - idleSince) + 20);
      else if (runway && window.scrollY <= 2) timer = window.setTimeout(wake, 500);
    };
    const wake = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const ask = async () => {
      asked = true;
      const small = window.matchMedia("(max-width: 47.999rem)").matches;
      const taken = new Set<number>();
      // One file at a time, so the photographs further down the page, on
      // screen by then, are never kept waiting behind several at once.
      for (const [i, step] of (small ? STEPS.slice(0, 3) : STEPS).entries()) {
        const part: number[] = [];
        for (let n = step; n <= count; n += step) if (!taken.has(n)) part.push(n);
        part.forEach((n) => taken.add(n));
        let file: ArrayBuffer;
        try {
          file = await (await fetch(PACKS[i] ?? "", { priority: "low" })).arrayBuffer();
        } catch {
          return;
        }
        if (disposed) return;
        const view = new DataView(file);
        let at = 0;
        for (const n of part) {
          if (at + 8 > file.byteLength) break;
          const end = at + 8 + view.getUint32(at + 4, true); // the RIFF header's size
          const address = URL.createObjectURL(
            new Blob([file.slice(at, end)], { type: "image/webp" }),
          );
          addresses.push(address);
          const image = new Image();
          image.src = address;
          image.decode().then(
            () => {
              if (disposed) return;
              frames[n] = image;
              drawn = -1;
              wake();
            },
            () => {},
          );
          at = end;
        }
      }
    };

    let loaded = document.readyState === "complete";
    const measure = () => {
      runway = parseFloat(getComputedStyle(section).marginBottom) || 0;
      if (runway && loaded && !asked) void ask();
      wake();
    };
    const onLoad = () => {
      loaded = true;
      measure();
    };

    measure();
    if (!loaded) window.addEventListener("load", onLoad, { once: true });
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", wake);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", wake);
      addresses.forEach((address) => URL.revokeObjectURL(address));
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (copy) {
        copy.style.opacity = "";
        copy.style.translate = "";
        copy.inert = false;
      }
      if (tint) tint.style.opacity = "";
      if (cue) cue.style.opacity = "";
    };
  }, [sectionRef]);
}

export function Hero({ content }: { content: HomePage["hero"] }) {
  const { sectionRef, headingRef, imageRef } = useHeroIntro<
    HTMLElement,
    HTMLHeadingElement,
    HTMLDivElement
  >();
  useHeroFilm(sectionRef);
  const image = imageOf(content.photo.image);

  return (
    <section
      ref={sectionRef}
      id="top"
      data-hero-pin
      data-hero-runway
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-navy pb-[max(clamp(3rem,7vw,4rem),env(safe-area-inset-bottom))]"
    >
      <div data-hero-media className="absolute inset-0">
        {/* The intro settles this wrapper, so photograph and film move as one. */}
        <div ref={imageRef} className="absolute inset-0">
          <img
            draggable={false}
            {...image}
            alt={content.photo.alt}
            sizes="100vw"
            fetchPriority="high"
            decoding="async"
            className={`h-full w-full object-cover ${PORTRAIT}`}
          />
          {/* The film, drawn over the still by useHeroFilm. */}
          <canvas
            data-hero-film
            width={1600}
            height={1062}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${PORTRAIT}`}
          />
        </div>
      </div>
      <div
        data-hero-tint
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-navy/0 to-navy/70"
      />
      {/* Deepens as the page slides over the opening (lib/anim heroCover). */}
      <div
        data-hero-dim
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-navy opacity-0"
      />

      {/* Lifts away as the glass comes shut, so the room is seen clear
          (useHeroFilm). A layer of its own: the entrance and the scroll own
          the ones inside it. */}
      <div data-hero-copy className="relative">
        <div className="shell relative pt-[clamp(8rem,15vw,10rem)] lg:pt-[6rem]">
          <h1
            ref={headingRef}
            data-anim-hide
            className="max-w-[20ch] font-display text-[clamp(2.25rem,6.7vw,8rem)] leading-[0.94] font-medium tracking-hero text-balance text-white"
          >
            {content.heading}
          </h1>

          <div className="mt-[clamp(1.5rem,3vw,2rem)] grid grid-cols-1 items-end gap-[clamp(1.5rem,3vw,2rem)] border-t border-white/15 pt-[clamp(1.5rem,3vw,2rem)] md:grid-cols-[minmax(0,1fr)_auto]">
            <p
              data-hero-fade
              className="min-w-0 max-w-[24.5rem] flex-1 font-body text-[clamp(0.875rem,1.1vw,1rem)] leading-relaxed text-pretty text-white/72"
            >
              {content.body}
            </p>
            <div data-hero-fade className="flex flex-wrap gap-3.5">
              <CtaButton {...destination(content.primary.href)} variant="inverted">
                {content.primary.label}
              </CtaButton>
              <CtaButton {...destination(content.secondary.href)} variant="outlineLight">
                {content.secondary.label}
              </CtaButton>
            </div>
          </div>
        </div>
      </div>

      {/* Says the page answers to a scroll; gone once it has (useHeroFilm). */}
      <span
        data-hero-cue
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 pl-[0.2em] font-display text-[0.6875rem] leading-none font-medium tracking-[0.2em] text-white/75 uppercase opacity-0"
      >
        Scroll
        <span className="hero-cue-line -ml-[0.2em] h-3 w-px bg-white/75" />
      </span>
    </section>
  );
}
