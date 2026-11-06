import { useEffect, useRef, useState, type RefObject } from "react";
import { Pause, Play } from "lucide-react";
import { isIntroPending } from "@/lib/intro";
import { heroCover, loadGsap, markAnimReady, playAfterIntro, splitToLines } from "@/lib/anim";
import { Lines } from "@/content/render";
import { prefersReducedMotion } from "@/lib/motion-prefs";
import { holdWarming } from "@/lib/warm-images";
import { LANDING } from "./motion";
import type { ProjectsPage } from "@/content/types";
import { cutOf, ownFilm, UPRIGHT } from "@/content/video";
import type { ProjectDetail } from "./data";

/** How many full turns each odometer column makes before it lands. */
const TURNS = [1, 2, 3, 3, 4];

/**
 * One column of the rolling figure: the digits it passes through, stacked,
 * ending on the digit it shows. Server-rendered already resting on that last
 * digit, so the figure reads correctly with JavaScript off or motion reduced.
 */
function OdometerColumn({ digit, turns }: { digit: number; turns: number }) {
  const sequence: number[] = [];
  for (let turn = 0; turn < turns; turn += 1) for (let d = 0; d < 10; d += 1) sequence.push(d);
  for (let d = 0; d <= digit; d += 1) sequence.push(d);
  const rest = ((sequence.length - 1) / sequence.length) * -100;

  return (
    <span className="relative block h-[1em] overflow-hidden">
      <span
        data-odometer-strip
        className="block"
        style={{ transform: `translate3d(0, ${rest}%, 0)` }}
      >
        {sequence.map((d, index) => (
          <span key={index} className="block h-[1em] leading-none">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

function Odometer({ value, unit }: { value: number; unit?: string | undefined }) {
  const digits = String(value).split("").map(Number);
  return (
    <p className="flex items-start font-display leading-none font-light tracking-[-0.04em] text-white">
      <span className="sr-only">
        {value}
        {unit ? ` ${unit === "m²" ? "square metres" : unit}` : null}
      </span>
      <span aria-hidden="true" className="flex text-[clamp(3.5rem,9vw,8.5rem)]">
        {digits.map((digit, index) => (
          <OdometerColumn key={index} digit={digit} turns={TURNS[index % TURNS.length]!} />
        ))}
      </span>
      {unit ? (
        <span
          aria-hidden="true"
          data-hero-rise
          className="mt-[0.35em] ml-2 text-[clamp(1rem,1.8vw,1.75rem)] leading-none"
        >
          {unit}
        </span>
      ) : null}
    </p>
  );
}

/** Less motion or less data asked for: the photograph stays. */
const holdsBack = () =>
  prefersReducedMotion() ||
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/**
 * A project's short silent loop over the opening photograph: its `-loop`
 * cut, and `-loop-phone` on an upright screen. It starts once the page has
 * loaded, so the first screen does not wait behind it. The photograph stays
 * until the loop is really moving (its time has advanced, which a `playing`
 * event alone does not promise on every browser), and comes back while the
 * loop stops to buffer. It pauses when the page has covered the opening. A
 * missing cut never plays; the photograph stays. `held` is the visitor's
 * pause button (ProjectHero). The page's other photographs wait until it can
 * play through (lib/warm-images): it is what the opening is showing, and on
 * a slow line they would otherwise share the line with it.
 */
function HeroLoop({
  film,
  held,
  videoRef: ref,
  onRunning,
}: {
  film: string;
  held: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  onRunning: (running: boolean) => void;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || holdsBack()) return;
    holdWarming(
      new Promise((resolve) => {
        video.addEventListener("canplaythrough", resolve, { once: true });
        // Every source failed (a film without its loop cut): nothing to wait for.
        video.lastElementChild?.addEventListener("error", resolve, { once: true });
      }),
    );
  }, [ref]);

  useEffect(() => {
    const video = ref.current;
    if (!video || holdsBack()) return;
    if (held) {
      video.pause();
      return;
    }
    // React leaves `muted` out of the server's markup; a browser only lets a
    // muted video start by itself.
    video.muted = true;
    // The opening stays in the window behind the page that slides over it,
    // so whether it can be seen is read from the scroll.
    let on: boolean | null = null;
    const check = () => {
      const next = window.scrollY < window.innerHeight * 0.9;
      if (next === on) return;
      on = next;
      if (on) void video.play().catch(() => {});
      else video.pause();
    };
    const start = () => {
      check();
      window.addEventListener("scroll", check, { passive: true });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.removeEventListener("scroll", check);
      video.pause();
    };
  }, [held, ref]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onTimeUpdate={(event) => {
        if (!shown && event.currentTarget.currentTime > 0.2) setShown(true);
      }}
      onWaiting={() => setShown(false)}
      onPlaying={() => onRunning(true)}
      onPause={() => onRunning(false)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[var(--dur-long)] motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}
    >
      <source src={cutOf(film, "loop-phone")} media={UPRIGHT} />
      <source src={cutOf(film, "loop")} />
    </video>
  );
}

/**
 * The arrival.
 *
 *   1. When the page is reached by navigation, or reloaded, the photograph is
 *      uncovered from the bottom edge up. On a first visit the site's own
 *      opening has just parted over it, so that step is skipped rather than
 *      doubled.
 *   2. The photograph settles out of a 110% overscan across two and a half
 *      seconds — the reference's slow, heavy landing.
 *   3. The title rises line by line out of its masks, then the eyebrow and
 *      architect behind it.
 *   4. The built area rolls into place column by column, each column making a
 *      different number of turns, so the figure lands left to right.
 *
 * Scrolling on, the page slides up over the photograph, which pushes in and
 * darkens underneath it (lib/anim heroCover).
 *
 * A project with a film of its own has its short silent loop come up over
 * the photograph (HeroLoop); the full film, with sound, plays further down
 * in The Experience.
 */
export function ProjectHero({
  project,
  labels,
}: {
  project: ProjectDetail;
  labels: ProjectsPage["detail"];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const film = ownFilm(project.film);
  const loopRef = useRef<HTMLVideoElement>(null);
  // Null until the loop first runs (never, under reduced motion); then
  // whether it is running.
  const [running, setRunning] = useState<boolean | null>(null);
  const [held, setHeld] = useState(false);

  const toggleLoop = () => {
    const video = loopRef.current;
    if (!video) return;
    setHeld(!video.paused);
    // Straight from the press, which a browser that refused to start the
    // loop by itself requires.
    if (video.paused) void video.play().catch(() => {});
  };

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    if (!section || !title || prefersReducedMotion()) return;
    let cancelled = false;
    let dispose = () => {};
    const withCurtain = !isIntroPending();

    void (async () => {
      const { gsap } = await loadGsap();
      if (cancelled || !sectionRef.current) return;
      const split = await splitToLines(title, "project-hero-line");
      if (cancelled) {
        split.revert();
        return;
      }

      const q = <E extends Element = HTMLElement>(selector: string) =>
        Array.from(section.querySelectorAll<E & HTMLElement>(selector));
      const [curtain] = q("[data-hero-curtain]");
      const [counter] = q("[data-hero-counter]");
      const [photo] = q("[data-hero-photo]");
      const strips = q("[data-odometer-strip]");
      const rise = q("[data-hero-rise]");

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: LANDING },
      });
      /* The lines are only put back together when the width changes and the
       * title has to wrap again. Doing it as the reveal finished repainted
       * the title as new text four seconds after load, and that repaint was
       * what the browser reported as the page's largest paint. */
      const reflow = () => {
        if (tl.progress() === 1) split.revert();
      };
      window.addEventListener("resize", reflow);
      // Everything the pre-paint class held back is now held by the timeline.
      gsap.set([title, curtain, ...q("[data-hero-hold]")].filter(Boolean), { opacity: 1 });

      const lead = withCurtain ? 0.45 : 0.1;
      if (withCurtain && curtain && counter) {
        tl.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 1.4 }, 0).fromTo(
          counter,
          { yPercent: -100 },
          { yPercent: 0, duration: 1.4 },
          0,
        );
      }
      if (photo) tl.fromTo(photo, { scale: 1.1 }, { scale: 1, duration: 2.6 }, 0);
      tl.fromTo(
        split.inners,
        { yPercent: 125 },
        { yPercent: 0, duration: 1.3, stagger: 0.1 },
        lead + 0.1,
      ).fromTo(
        rise,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.08 },
        lead + 0.35,
      );
      strips.forEach((strip, index) => {
        const count = strip.childElementCount;
        // `y: 0` clears the resting offset GSAP reads back out of the inline
        // transform, which would otherwise stack on top of the tween.
        tl.fromTo(
          strip,
          // Starts a digit below the mask, so the figure rolls up into view
          // rather than sitting at zero first.
          { y: 0, yPercent: (1 / count) * 100 },
          { yPercent: ((count - 1) / count) * -100, duration: 2.4, ease: "expo.inOut" },
          lead + 0.25 + index * 0.12,
        );
      });

      const stopCover = heroCover(gsap, section);

      markAnimReady();
      playAfterIntro(tl, () => cancelled);

      dispose = () => {
        window.removeEventListener("resize", reflow);
        tl.kill();
        stopCover();
        split.revert();
      };
    })();

    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  const figure = project.figure ? (
    <div data-hero-hold data-anim-hide className="shrink-0 md:text-right">
      <p
        data-hero-rise
        className="mb-2 font-display text-[0.6875rem] font-bold tracking-[0.2em] text-white/70 uppercase"
      >
        {project.figure.label}
      </p>
      <Odometer value={project.figure.value} unit={project.figure.unit} />
    </div>
  ) : null;

  return (
    <section
      ref={sectionRef}
      data-hero-pin
      className="relative flex h-[100svh] min-h-[34rem] items-end overflow-hidden bg-navy text-white"
    >
      <div data-hero-curtain data-anim-hide className="absolute inset-0 overflow-hidden">
        <div data-hero-counter className="absolute inset-0">
          <div data-hero-media className="absolute inset-0">
            <div data-hero-photo className="relative h-full w-full">
              <img
                draggable={false}
                {...project.hero.image}
                alt={project.hero.alt}
                // On a screen taller than wide the landscape photograph is
                // cropped to the full height, so it is drawn about twice the
                // screen's height wide; asking by width alone fetched a file
                // a size too small on phones.
                sizes="(max-aspect-ratio: 1/1) 190vh, 100vw"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
              {film ? (
                <HeroLoop film={film} held={held} videoRef={loopRef} onRunning={setRunning} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-navy/75 via-navy/15 to-navy/35"
      />
      {/* Behind the clear header: a pale sky left the white wordmark and
          links at under 2:1. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[26%] bg-linear-to-b from-navy/70 to-transparent"
      />
      {/* Deepens as the page slides over the opening (lib/anim heroCover). */}
      <div
        data-hero-dim
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-navy opacity-0"
      />

      <div className="shell relative flex w-full flex-col gap-8 pb-[clamp(2rem,5vh,3.5rem)] md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p
            data-hero-rise
            data-anim-hide
            className="font-display text-[0.6875rem] font-bold tracking-[0.2em] text-white/70 uppercase"
          >
            {labels.heroPrefix} · {project.location}
          </p>
          <h1
            ref={titleRef}
            data-anim-hide
            className="mt-4 font-display text-[clamp(2.75rem,7.4vw,7.5rem)] leading-[0.94] font-light tracking-[-0.035em]"
          >
            {/* The breaks sit directly in the heading: wrapped in a span
                each, the line split treats the span as one unbreakable word
                and the break inside it stops applying while the title rises. */}
            <Lines text={project.title.join("\n")} />
          </h1>
          <p data-hero-rise data-anim-hide className="mt-5 font-body text-sm text-white/75">
            {project.architect}
          </p>
        </div>

        {film ? (
          <div className="flex shrink-0 flex-col gap-[clamp(1rem,3vh,2rem)] md:items-end">
            {/* Moving for more than five seconds beside the text: it can be
                stopped. */}
            {running !== null ? (
              <button
                type="button"
                onClick={toggleLoop}
                aria-label={running ? "Pause the film" : "Play the film"}
                className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-[var(--dur-short)] hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:-mr-3 md:ml-0"
              >
                {running ? (
                  <Pause aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Play aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            ) : null}
            {figure}
          </div>
        ) : (
          figure
        )}
      </div>
    </section>
  );
}
