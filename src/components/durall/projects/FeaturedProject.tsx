import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { useReveal, useClipReveal } from "@/lib/anim";
import { useReducedMotion } from "@/lib/motion-prefs";
import { ArrowRight } from "../ui";
import { imageOf, Lines } from "@/content/render";
import type { ProjectFeature } from "@/content/types";
import { transition } from "@/lib/motion-tokens";

const INTERVAL = 5000;

function AwardIcon() {
  return (
    <svg viewBox="0 0 20 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M10 1.5v9.5l8 4.5M10 11l-8 4.5M10 11v11.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function FeaturedProject({
  slug,
  feature: FEATURED,
  exploreLabel,
}: {
  slug: string;
  feature: ProjectFeature;
  exploreLabel: string;
}) {
  const FEATURED_GALLERY = FEATURED.gallery.map((photo) => ({
    image: imageOf(photo.image),
    alt: photo.alt,
  }));
  const reduced = useReducedMotion();
  const panelRef = useReveal<HTMLDivElement>({ selector: "[data-reveal]", y: 32, stagger: 0.08 });
  const mediaRef = useClipReveal<HTMLDivElement>();

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = FEATURED_GALLERY.length;
  const advance = useCallback(() => setActive((i) => (i + 1) % total), [total]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduced || paused) return;
    timer.current = setInterval(advance, INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [advance, paused, reduced]);

  const current = FEATURED_GALLERY[active] ?? FEATURED_GALLERY[0]!;

  return (
    <section
      // `--step` is the rise of the stepped line: the design's 78px at 1920.
      // Clipped sideways because that line runs on past both edges.
      className="relative overflow-x-clip bg-white pt-[clamp(2.5rem,4.6vw,5.5rem)] pb-[clamp(3.5rem,6vw,7.5rem)] [--step:clamp(3.5rem,4.06vw,4.875rem)] xl:pt-[calc(var(--step)*1.28)]"
    >
      <div className="shell relative grid grid-cols-1 items-stretch gap-[clamp(2rem,4vw,3.5rem)] xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)]">
        {/* The stepped hairline (Figma Vector 31). It comes in from the left
            edge of the page and passes behind the photograph; above the
            photograph it climbs out and runs on to the right edge, just
            under the opening. A short drop from it ends in a dot over the
            "Featured project" label. Each piece is placed against the
            column it belongs to (an absolutely placed grid item takes its
            grid area as its box), so they stay on the photograph's corner
            at every width. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 col-start-2 hidden xl:block"
        >
          <span className="absolute top-[calc(var(--step)*0.82)] right-full h-px w-screen bg-navy/16" />
          <svg
            viewBox="0 0 65 78"
            fill="none"
            preserveAspectRatio="none"
            className="absolute bottom-full left-[calc(var(--step)*0.94)] h-[var(--step)] w-[calc(var(--step)*0.83)] overflow-visible"
          >
            <path
              d="M0 78 65 0"
              stroke="var(--color-navy)"
              strokeOpacity="0.16"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="absolute -top-[var(--step)] left-[calc(var(--step)*1.77)] h-px w-screen bg-navy/16" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 col-start-1 hidden xl:block"
        >
          <span className="absolute top-[calc(var(--step)*0.82)] left-2 h-[calc(var(--step)*0.58)] w-px bg-navy/16" />
          <span className="absolute top-[calc(var(--step)*1.4)] left-2 size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c5c6d2]" />
        </div>

        <div
          ref={panelRef}
          className="min-w-0 xl:pt-[calc(var(--step)*1.56)] xl:pb-[clamp(2rem,4vw,5rem)]"
        >
          <p
            data-reveal
            className="font-display text-[clamp(0.875rem,1.15vw,1.25rem)] font-bold tracking-[0.125rem] text-accent-blue uppercase"
          >
            {FEATURED.eyebrow}
          </p>
          <div data-reveal className="mt-3 h-0.5 w-8 bg-accent-blue" />

          <p
            data-reveal
            className="mt-[clamp(2rem,3.4vw,4.3125rem)] font-display text-[0.75rem] font-bold tracking-[0.09375rem] text-slate uppercase"
          >
            {FEATURED.location}
          </p>
          <h2
            data-reveal
            className="mt-3 font-display text-[clamp(1.75rem,2.6vw,2.75rem)] leading-[1.1] font-medium tracking-[-0.0625rem] text-navy"
          >
            <Lines text={FEATURED.title.join("\n")} />
          </h2>
          <p data-reveal className="mt-5 font-body text-sm font-medium text-slate">
            {FEATURED.architect}
          </p>
          <div data-reveal className="mt-4 h-px w-8 bg-navy-14" />

          <p
            data-reveal
            className="mt-[clamp(1.25rem,1.8vw,1.5rem)] max-w-[34rem] font-body text-sm leading-relaxed text-slate"
          >
            {FEATURED.description}
          </p>

          <dl
            data-reveal
            className="mt-[clamp(1.75rem,2.6vw,2.5rem)] grid grid-cols-1 gap-x-[clamp(1.5rem,2.6vw,2.6875rem)] gap-y-6 sm:grid-cols-3 sm:divide-x sm:divide-navy-14"
          >
            {FEATURED.specs.map((spec, i) => (
              <div
                key={spec.label}
                className={`min-w-0 ${i > 0 ? "sm:pl-[clamp(1rem,1.8vw,1.75rem)]" : ""}`}
              >
                <dt className="font-display text-[0.625rem] font-bold tracking-eyebrow text-slate uppercase">
                  {spec.label}
                </dt>
                <dd className="mt-2 font-display text-[clamp(1rem,1.15vw,1.25rem)] leading-tight font-medium whitespace-pre-line text-navy">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          {FEATURED.award ? (
            <div
              data-reveal
              className="mt-[clamp(1.75rem,2.6vw,2.5rem)] border-t border-navy-14 pt-6"
            >
              <div className="flex items-start gap-4 text-navy">
                <span className="mt-0.5 text-navy/70">
                  <AwardIcon />
                </span>
                <div>
                  <p className="font-body text-xs font-bold text-navy">{FEATURED.award.name}</p>
                  <p className="mt-1 font-body text-xs text-slate">{FEATURED.award.year}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* The case study is a page of its own now; this used to point at
           * the grid below it. */}
          <div data-reveal className="mt-[clamp(1.75rem,2.6vw,2.5rem)]">
            <Link
              to="/projects/$slug"
              params={{ slug }}
              className="group relative inline-flex items-center gap-3 border-b border-accent-blue pb-1.5 font-display text-[clamp(0.75rem,0.9vw,1rem)] font-bold tracking-button text-accent-blue uppercase after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"
            >
              {exploreLabel}
              <span className="hover-arrow inline-flex">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        <div
          ref={mediaRef}
          className="relative min-w-0 overflow-hidden bg-mist"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            data-clip-inner
            className="relative aspect-[1153/721] w-full xl:h-full xl:aspect-auto"
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                draggable={false}
                key={current.image.src}
                {...current.image}
                alt={current.alt}
                sizes="(min-width: 80rem) 55vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0 }}
                transition={transition("cinematic", reduced)}
              />
            </AnimatePresence>
          </div>

          <div className="absolute bottom-[clamp(1rem,2vw,2.25rem)] left-[clamp(1rem,2.5vw,3rem)] flex items-center gap-4">
            <p className="font-display text-xs font-bold tracking-[0.0625rem] tabular-nums text-white">
              {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
            <div className="h-0.5 w-20 overflow-hidden bg-white/30">
              <motion.div
                className="h-0.5 bg-white"
                animate={{ width: `${((active + 1) / total) * 100}%` }}
                transition={transition("medium", reduced)}
              />
            </div>
            {/* Pause used to be wired only to onMouseEnter/onFocus on the
                wrapper — and the wrapper has no focusable children, so onFocus
                never fired. Keyboard and touch users had no way to stop a loop
                that runs indefinitely. */}
            {reduced ? null : (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                aria-label={paused ? "Resume the project gallery" : "Pause the project gallery"}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
              >
                {paused ? (
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                    <path d="M4 2.5l9 5.5-9 5.5V2.5Z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                    <path d="M4.5 2.5h2.5v11H4.5zM9 2.5h2.5v11H9z" fill="currentColor" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
