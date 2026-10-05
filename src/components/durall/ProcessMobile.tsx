import { useEffect, useRef, useState } from "react";
import { destination, type imageOf, TwoToneText } from "@/content/render";
import type { SharedContent } from "@/content/types";
import { useReducedMotion } from "@/lib/motion-prefs";
import { ArrowLeft, ArrowRight, CtaButton } from "./ui";

export type ProcessStageView = {
  num: string;
  title: string;
  body: string;
  caption: string | undefined;
  image: ReturnType<typeof imageOf>;
  alt: string;
};

/**
 * "Concept to commissioning" below the desktop breakpoint, where there is
 * no room for the desktop's side-by-side scene: the five stages as a rail
 * to tap, one tall photograph that changes with the stage, and a card over
 * its foot with that stage's name and sentence.
 *
 * It plays through the stages by itself, six seconds each, counted by the
 * line along the photograph's foot (`stage-timer` in styles.css: the stage
 * changes when that line has run its length, so pausing the line is pausing
 * the stages). It only runs while the section is on screen, never under
 * reduced motion, and has a pause button. A swipe on the photograph, the
 * arrows and the rail all change the stage directly.
 */
export function ProcessMobile({
  content,
  stages,
}: {
  content: SharedContent["process"];
  stages: readonly ProcessStageView[];
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const swipeFrom = useRef<number | null>(null);

  const count = stages.length;
  const last = count - 1;
  const go = (index: number) => setActive(((index % count) + count) % count);
  const stage = stages[active]!;
  const playing = !paused && !reduced && onScreen;

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(!!entry?.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(viewer);
    return () => io.disconnect();
  }, []);

  return (
    <div className="py-14 lg:hidden">
      <div className="px-5">
        <h2 className="font-display text-[2.375rem] leading-[1.06] font-light tracking-[-0.015em] text-navy">
          {/* The design's pale grey, darkened to 3:1 on the paper. */}
          <TwoToneText value={content.heading} mutedClassName="text-[#868f97]" />
        </h2>
        <p className="mt-[1.125rem] font-display text-base leading-[1.6] text-slate">
          {content.lede}
        </p>
      </div>

      {/* The rail: a square per stage, filled up to the one showing. */}
      <div className="relative mx-5 mt-9 h-[3.875rem]">
        <span aria-hidden="true" className="absolute inset-x-[7px] top-[7px] h-px bg-navy/16" />
        <span
          aria-hidden="true"
          style={{ scale: `${active / last} 1` }}
          className="absolute inset-x-[7px] top-1.5 h-[3px] origin-left bg-navy transition-[scale] duration-700 ease-[cubic-bezier(.65,0,.25,1)] motion-reduce:transition-none"
        />
        <ol aria-label="Stages" className="relative flex justify-between">
          {stages.map((item, index) => {
            const on = index === active;
            const done = index < active;
            return (
              <li key={item.num}>
                <button
                  type="button"
                  onClick={() => go(index)}
                  aria-current={on ? "step" : undefined}
                  aria-label={`${item.num} ${item.title}`}
                  className={`flex min-h-11 min-w-11 cursor-pointer flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue ${
                    index === 0 ? "items-start" : index === last ? "items-end" : "items-center"
                  }`}
                >
                  <span
                    className={`block size-[15px] border transition-[background-color,border-color,rotate,scale] duration-[400ms] motion-reduce:transition-none ${
                      on
                        ? "scale-90 rotate-45 border-navy bg-navy"
                        : done
                          ? "border-navy bg-navy"
                          : "border-navy/30 bg-[#fdfdfb]"
                    }`}
                  />
                  {/* Slate for the stages not showing: the design's paler
                      grey is under 3:1 on the paper at this size. */}
                  <span
                    className={`font-display text-[0.625rem] leading-none font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors duration-300 ${
                      on ? "text-navy" : "text-slate"
                    }`}
                  >
                    {item.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* The photograph: every stage's stacked, the one showing faded in and
          easing back from a slight enlargement for as long as it shows. */}
      <div
        ref={viewerRef}
        onPointerDown={(event) => {
          swipeFrom.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (swipeFrom.current === null) return;
          const travelled = event.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (travelled < -40) go(active + 1);
          else if (travelled > 40) go(active - 1);
        }}
        onPointerCancel={() => {
          swipeFrom.current = null;
        }}
        className="relative mt-[1.375rem] aspect-[39/40] max-h-[34rem] w-full touch-pan-y overflow-hidden bg-navy select-none"
      >
        {stages.map((item, index) => (
          <img
            key={item.num}
            draggable={false}
            {...item.image}
            alt={index === active ? item.alt : ""}
            aria-hidden={index === active ? undefined : true}
            sizes="100vw"
            loading="lazy"
            decoding="async"
            style={{ transitionDuration: "900ms, 7000ms" }}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,scale] ease-out motion-reduce:scale-100 motion-reduce:transition-none ${
              index === active ? "scale-100 opacity-100" : "scale-110 opacity-0"
            }`}
          />
        ))}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[6.875rem] bg-linear-to-b from-navy/45 to-navy/0"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[11.875rem] bg-linear-to-b from-navy/0 to-navy/78"
        />
        <p className="absolute top-5 left-5 overflow-hidden font-display text-[0.6875rem] leading-none font-semibold tracking-[0.16em] text-white uppercase">
          <span key={active} className="label-roll block">
            Stage {stage.num} — {stage.title}
          </span>
        </p>
        {stage.caption ? (
          <p className="absolute right-5 bottom-[3.875rem] max-w-[9.375rem] text-right font-display text-[0.6875rem] leading-[1.45] tracking-[0.04em] text-white/85">
            <span key={active} className="label-roll block">
              {stage.caption}
            </span>
          </p>
        ) : null}
        <p
          aria-hidden="true"
          className="absolute bottom-[3.625rem] left-4 flex items-baseline gap-2 font-display text-white"
        >
          <span
            key={active}
            className="label-roll block text-[7rem] leading-[0.8] font-light tracking-[-0.04em] tabular-nums"
          >
            {stage.num}
          </span>
          <span className="text-sm font-medium tracking-[0.1em] text-white/70">
            / {String(count).padStart(2, "0")}
          </span>
        </p>
        {/* Runs its length in the time a stage is shown, then the next. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-white/22">
          {reduced ? null : (
            <div
              key={active}
              onAnimationEnd={() => go(active + 1)}
              style={{ animationPlayState: playing ? "running" : "paused" }}
              className="stage-timer h-full origin-left bg-white"
            />
          )}
        </div>
      </div>

      {/* The card over the photograph's foot. */}
      <div className="relative mx-5 -mt-11 border border-navy/12 bg-[#fdfdfb] px-[1.375rem] pt-[1.625rem] pb-5">
        <span aria-hidden="true" className="absolute -top-px -left-px h-0.5 w-14 bg-navy" />
        {/* Announced when the visitor changes the stage, not each time it
            changes by itself. */}
        <div aria-live={playing ? "off" : "polite"} className="flex min-h-32 flex-col gap-3">
          <h3 className="overflow-hidden font-display text-[1.875rem] leading-[1.1] tracking-[-0.01em] text-navy">
            <span key={active} className="label-roll block">
              {stage.title}
            </span>
          </h3>
          <p
            key={active}
            className="label-roll font-display text-[0.9375rem] leading-[1.6] text-pretty text-slate"
          >
            {stage.body}
          </p>
        </div>
        <div className="mt-3.5 flex items-center justify-between border-t border-navy/10 pt-3.5">
          {reduced ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              aria-label={paused ? "Play the stages automatically" : "Pause the stages"}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-slate uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
            >
              <span className="flex size-7 items-center justify-center border border-navy/25 text-navy">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path
                    d={paused ? "M2 1l7 4-7 4z" : "M2 1h2v8H2zM6 1h2v8H6z"}
                    fill="currentColor"
                  />
                </svg>
              </span>
              {paused ? "Play" : "Pause"}
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous stage"
              className="hover-lift flex size-11 cursor-pointer items-center justify-center border border-navy/30 text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
            >
              <ArrowLeft />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next stage"
              className="hover-lift flex size-11 cursor-pointer items-center justify-center bg-navy text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* The button across the full width, its arrow at the far end. */}
      <div className="px-5 pt-7 [&>a]:flex [&>a]:w-full [&>a]:justify-between">
        <CtaButton {...destination(content.link.href)}>{content.link.label}</CtaButton>
      </div>
    </div>
  );
}
