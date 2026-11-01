import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isIntroPending } from "@/lib/intro";
import { heroCover, loadGsap, markAnimReady, playAfterIntro, splitToLines } from "@/lib/anim";
import { Lines } from "@/content/render";
import { prefersReducedMotion } from "@/lib/motion-prefs";
import { LANDING } from "./motion";
import type { ProjectsPage } from "@/content/types";
import { ownFilm } from "@/content/video";
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

/** Less motion or less data asked for: the film then waits for its play button. */
const holdsBack = () =>
  prefersReducedMotion() ||
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

const FILM_CONTROL =
  "flex h-11 items-center justify-center rounded-full transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

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
 * A project with a film of its own plays it here in the photograph's place:
 * the photograph is what arrives, and the film comes up over it, without
 * sound, once it is running, and stops when the page has covered the
 * opening. A visitor who asked for less motion or less data keeps the
 * photograph and is given the play button.
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
  const filmRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [running, setRunning] = useState(false);
  // Whether the film has started yet: until it has, the photograph shows.
  const [started, setStarted] = useState(false);
  // What the visitor last asked for with the play button. Until they press
  // it, the film plays unless held back.
  const [wanted, setWanted] = useState<boolean | null>(null);

  useEffect(() => {
    const el = filmRef.current;
    if (!el) return;
    if (!(wanted ?? !holdsBack())) {
      el.pause();
      return;
    }
    // The opening stays in the window, behind the page that slides over it,
    // so whether it can be seen is read from the scroll and not from where
    // it is: the film runs until the page has all but covered it.
    let on: boolean | null = null;
    const check = () => {
      const next = window.scrollY < window.innerHeight * 0.9;
      if (next === on) return;
      on = next;
      // A refusal (a browser saving power) leaves the photograph and the play button.
      if (on) void el.play().catch(() => {});
      else el.pause();
    };
    // Not before the page has loaded: the film streams megabytes, and the
    // photograph and the rest of the first screen should not wait behind it.
    const start = () => {
      check();
      window.addEventListener("scroll", check, { passive: true });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.removeEventListener("scroll", check);
    };
  }, [wanted]);

  const toggleFilm = () => {
    const el = filmRef.current;
    if (!el) return;
    setWanted(el.paused);
    // Straight from the press, which a browser that refused to start the
    // film by itself requires.
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
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
            {/* The entrance settles this wrapper, so the photograph and the
                film over it land as one. */}
            <div data-hero-photo className="relative h-full w-full">
              <img
                draggable={false}
                {...project.hero.image}
                alt={project.hero.alt}
                sizes="100vw"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
              {film ? (
                <video
                  ref={filmRef}
                  src={film}
                  muted={muted}
                  loop
                  playsInline
                  preload="none"
                  onPlay={() => setRunning(true)}
                  onPause={() => setRunning(false)}
                  onPlaying={() => setStarted(true)}
                  aria-label={`${project.name}: the film`}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[var(--dur-long)] motion-reduce:transition-none ${started ? "opacity-100" : "opacity-0"}`}
                />
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
            <div
              data-hero-rise
              data-anim-hide
              className="-ml-3.5 flex items-center gap-1 md:-mr-3 md:ml-0"
            >
              <button
                type="button"
                onClick={toggleFilm}
                aria-label={running ? "Pause the film" : "Play the film"}
                className={`${FILM_CONTROL} w-11`}
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                  <path
                    d={running ? "M4.5 2.5h2.5v11H4.5zM9 2.5h2.5v11H9z" : "M4 2.5l9 5.5-9 5.5V2.5Z"}
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setMuted((now) => !now)}
                className={`${FILM_CONTROL} gap-2 px-3 font-display text-[0.6875rem] font-bold tracking-[0.2em] uppercase`}
              >
                {muted ? (
                  <VolumeX aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Volume2 aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
                )}
                {muted ? "Unmute" : "Mute"}
              </button>
            </div>
            {figure}
          </div>
        ) : (
          figure
        )}
      </div>
    </section>
  );
}
