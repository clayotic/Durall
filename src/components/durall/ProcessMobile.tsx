import { useEffect, useRef, useState } from "react";
import { destination, type imageOf, TwoToneText } from "@/content/render";
import type { SharedContent } from "@/content/types";
import { useReducedMotion } from "@/lib/motion-prefs";
import { clamp01, ramp, smooth, useSceneProgress } from "@/lib/scene";
import { scrollToY } from "@/lib/scroll-lock";
import { CtaButton } from "./ui";

export type ProcessStageView = {
  num: string;
  title: string;
  body: string;
  caption: string | undefined;
  image: ReturnType<typeof imageOf>;
  alt: string;
};

/* The scene runs below the desktop breakpoint wherever the window is tall
 * enough to hold it whole; on anything shorter (a phone on its side) the
 * section is simply laid out and the rail changes the stage. Keep in step
 * with the `[@media(min-height:31rem)]` classes below and with the snap rule
 * in styles.css. */
const SCENE_QUERY = "(max-width: 63.999rem) and (min-height: 31rem)";

/* Scene pacing, as fractions of the section's scroll: a short hold on
 * arrival, a longer one on the last stage, an equal share for each stage
 * between them (the same shape as the desktop scene in Process.tsx). */
const LEAD_IN = 0.04;
const LEAD_OUT = 0.1;
/** Where stage `index` of `count` sits in the section's scroll, 0 to 1. */
const shareOf = (index: number, count: number) =>
  LEAD_IN + (index / Math.max(1, count - 1)) * (1 - LEAD_IN - LEAD_OUT);
/** How far past half-way between two stages the scroll must go before the
 *  words change to the next, so resting near the middle cannot flicker. */
const SWITCH = 0.52;

/**
 * "Concept to commissioning" below the desktop breakpoint, where there is
 * no room for the desktop's side-by-side scene: the five stages as a rail,
 * one photograph for the stage showing, and a card over its foot with that
 * stage's name and sentence.
 *
 * All of it fits one screen, and that screen holds (sticky, see
 * lib/scene.ts) while the page scrolls on underneath. Everything in it is
 * tied straight to that scroll, so it moves exactly as the finger does and
 * stops where the finger stops: each photograph pushes the last one up out
 * of the frame, the rail fills, the line along the photograph's foot runs
 * the section's length, and the words fade out towards the half-way point
 * and come back as the next stage's. Nothing plays by itself.
 *
 * So that one flick cannot run through all five, each stage is a place the
 * scroll comes to rest (CSS scroll snapping, on touch screens; see
 * styles.css). That is the browser's own scrolling, not a script moving the
 * page: a flick lands on the next stage, a slow drag goes wherever it is
 * taken. While the page is resting among the stages the snapping is strict
 * (`stage-held` on the root element, set below), because the loose kind
 * lets a hard flick through; a flick past the first or the fifth lands
 * just clear of the section, and the page is free again.
 *
 * The rail and a swipe across the photograph also choose a stage; they
 * scroll the page to where that stage lives.
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
  const rootRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const swipeFrom = useRef<number | null>(null);
  const flow = useRef({ target: 0, started: false });

  const count = stages.length;
  const last = count - 1;
  const stage = stages[active]!;
  const all = (selector: string) =>
    Array.from(rootRef.current?.querySelectorAll<HTMLElement>(selector) ?? []);
  /** The section's scroll: its height less the held screen's. The snap
   *  points are placed by the same measure, so the two always agree (the
   *  window's own height changes as a phone's toolbar folds away). */
  const range = () => (rootRef.current?.offsetHeight ?? 0) - (stickRef.current?.offsetHeight ?? 0);

  useSceneProgress(
    rootRef,
    () => {
      const root = rootRef.current;
      if (!root) return;
      const length = range();
      const progress = length > 0 ? clamp01(-root.getBoundingClientRect().top / length) : 0;
      const raw = ramp(progress, LEAD_IN, 1 - LEAD_OUT) * last;

      const state = flow.current;
      if (!state.started || Math.abs(raw - state.target) > SWITCH) state.target = Math.round(raw);
      state.started = true;
      setActive(state.target);
      // Among the stages (a few pixels' grace either end): see above.
      document.documentElement.classList.toggle(
        "stage-held",
        progress > LEAD_IN - 0.003 && progress < 1 - LEAD_OUT + 0.003,
      );

      // Under reduced motion the scene still follows the scroll, but every
      // change is a switch: nothing travels.
      const at = reduced ? state.target : raw;
      all("[data-stage-frame]").forEach((frame, index) => {
        const off = Math.max(-1, Math.min(1, index - at));
        frame.style.translate = `0 ${(off * 100).toFixed(2)}%`;
        // The picture hangs back a little against its frame's travel.
        const img = frame.firstElementChild as HTMLElement | null;
        if (img) img.style.translate = `0 ${(-off * 30).toFixed(2)}%`;
      });
      const clear = reduced ? 1 : 1 - smooth(ramp(Math.abs(raw - state.target), 0.2, 0.48));
      all("[data-stage-fade]").forEach((el) => (el.style.opacity = clear.toFixed(3)));
      if (fillRef.current) fillRef.current.style.scale = `${(at / last).toFixed(4)} 1`;
      if (meterRef.current) meterRef.current.style.scale = `${progress.toFixed(4)} 1`;
    },
    {
      query: SCENE_QUERY,
      onLeaveQuery: () => {
        flow.current.started = false;
        document.documentElement.classList.remove("stage-held");
        all("[data-stage-frame]").forEach((frame) => {
          frame.style.translate = "";
          const img = frame.firstElementChild as HTMLElement | null;
          if (img) img.style.translate = "";
        });
        all("[data-stage-fade]").forEach((el) => (el.style.opacity = ""));
        if (fillRef.current) fillRef.current.style.scale = `${active / last} 1`;
      },
    },
  );

  useEffect(() => () => document.documentElement.classList.remove("stage-held"), []);

  // Where the scene is not running, the rail is filled by the stage chosen.
  useEffect(() => {
    if (!flow.current.started && fillRef.current)
      fillRef.current.style.scale = `${active / last} 1`;
  }, [active, last]);

  /* Choosing a stage: where the scene is running, the page is scrolled to
   * where that stage lives and the scene follows it there; otherwise the
   * stage is simply shown. */
  const go = (index: number) => {
    const target = Math.max(0, Math.min(last, index));
    const root = rootRef.current;
    if (!root || !window.matchMedia(SCENE_QUERY).matches) return setActive(target);
    const top =
      root.getBoundingClientRect().top + window.scrollY + range() * shareOf(target, count);
    // On a touch screen, the browser's own smooth scroll: it is the one
    // that knows about the snap points on the way.
    if (window.matchMedia("(pointer: coarse)").matches)
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    else scrollToY(top, { immediate: reduced });
  };

  return (
    <div className="lg:hidden">
      {/* Five stages: one screen of frame plus a little over half a screen
          of scroll for each change, and the two holds. */}
      <div ref={rootRef} className="relative [@media(min-height:31rem)]:h-[360svh]">
        {/* Where the scroll comes to rest: one place per stage. */}
        {stages.map((item, index) => (
          <span
            key={item.num}
            data-stage-snap
            aria-hidden="true"
            style={{ top: `calc((100% - 100svh) * ${shareOf(index, count)})` }}
            className="pointer-events-none absolute left-0 hidden h-px w-px snap-start snap-always [@media(min-height:31rem)]:block"
          />
        ))}
        {/* And where a flick out of the stages lands: the section just out
            of sight below, or just scrolled past. Only while `stage-held`. */}
        <span
          data-stage-exit
          aria-hidden="true"
          className="pointer-events-none absolute -top-[100svh] left-0 h-px w-px"
        />
        <span
          data-stage-exit
          aria-hidden="true"
          className="pointer-events-none absolute top-full left-0 h-px w-px"
        />
        <div
          ref={stickRef}
          className="flex flex-col pt-14 pb-6 [@media(min-height:31rem)]:sticky [@media(min-height:31rem)]:top-0 [@media(min-height:31rem)]:h-svh [@media(min-height:31rem)]:pt-[calc(var(--header-h)+0.625rem)] [@media(min-height:31rem)]:pb-3"
        >
          <div className="px-5">
            <h2 className="font-display text-[clamp(1.5rem,4.1svh,2.375rem)] leading-[1.06] font-light tracking-[-0.015em] text-navy">
              {/* The design's pale grey, darkened to 3:1 on the paper. */}
              <TwoToneText value={content.heading} mutedClassName="text-[#868f97]" />
            </h2>
            {/* Only where the window has the height to spare for it. */}
            <p className="mt-3 font-display text-[0.9375rem] leading-[1.55] text-slate [@media(min-height:31rem)_and_(max-height:51rem)]:hidden">
              {content.lede}
            </p>
          </div>

          {/* The rail: a square per stage, filled up to the one showing. */}
          <div className="relative mx-5 mt-[clamp(0.875rem,2.4svh,2rem)] h-[3.375rem] shrink-0">
            <span aria-hidden="true" className="absolute inset-x-[7px] top-[7px] h-px bg-navy/16" />
            <span
              ref={fillRef}
              aria-hidden="true"
              className="absolute inset-x-[7px] top-1.5 h-[3px] origin-left scale-x-0 bg-navy"
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

          {/* The photographs, one frame each, laid over one another until
              the scene sets them out as a strip. The viewer takes whatever
              height the screen has left. */}
          <div
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
            className="relative isolate mt-2.5 aspect-[39/40] max-h-[34rem] w-full touch-pan-y overflow-hidden bg-navy select-none [@media(min-height:31rem)]:aspect-auto [@media(min-height:31rem)]:max-h-none [@media(min-height:31rem)]:min-h-0 [@media(min-height:31rem)]:flex-1"
          >
            {stages.map((item, index) => (
              <div
                key={item.num}
                data-stage-frame
                className={`absolute inset-0 overflow-hidden will-change-transform ${
                  index === active ? "z-[1]" : ""
                }`}
              >
                <img
                  draggable={false}
                  {...item.image}
                  alt={index === active ? item.alt : ""}
                  aria-hidden={index === active ? undefined : true}
                  sizes="100vw"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover will-change-transform"
                />
              </div>
            ))}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[6.875rem] bg-linear-to-b from-navy/45 to-navy/0"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[11.875rem] max-h-[70%] bg-linear-to-b from-navy/0 to-navy/78"
            />
            <p
              data-stage-fade
              className="absolute top-4 left-5 z-[2] overflow-hidden font-display text-[0.6875rem] leading-none font-semibold tracking-[0.16em] text-white uppercase"
            >
              <span key={active} className="label-roll block">
                Stage {stage.num} — {stage.title}
              </span>
            </p>
            {stage.caption ? (
              <p
                data-stage-fade
                className="absolute right-5 bottom-[3.75rem] z-[2] max-w-[9.375rem] text-right font-display text-[0.6875rem] leading-[1.45] tracking-[0.04em] text-white/85"
              >
                <span key={active} className="label-roll block">
                  {stage.caption}
                </span>
              </p>
            ) : null}
            <p
              data-stage-fade
              aria-hidden="true"
              className="absolute bottom-[3.5rem] left-4 z-[2] flex items-baseline gap-2 font-display text-white"
            >
              <span
                key={active}
                className="label-roll block text-[clamp(4rem,12.5svh,7rem)] leading-[0.8] font-light tracking-[-0.04em] tabular-nums"
              >
                {stage.num}
              </span>
              <span className="text-sm font-medium tracking-[0.1em] text-white/70">
                / {String(count).padStart(2, "0")}
              </span>
            </p>
            {/* Runs the section's length with the scroll. */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 z-[2] hidden h-0.5 bg-white/22 [@media(min-height:31rem)]:block"
            >
              <div ref={meterRef} className="h-full origin-left scale-x-0 bg-white" />
            </div>
          </div>

          {/* The card over the photograph's foot. */}
          <div className="relative mx-5 -mt-11 shrink-0 border border-navy/12 bg-[#fdfdfb] px-5 pt-5 pb-3.5">
            <span aria-hidden="true" className="absolute -top-px -left-px h-0.5 w-14 bg-navy" />
            {/* Room for the longest sentence, so the photograph above does
                not change height from one stage to the next. */}
            <div data-stage-fade aria-live="polite" className="flex min-h-32 flex-col gap-2">
              <h3 className="overflow-hidden font-display text-[1.625rem] leading-[1.1] tracking-[-0.01em] text-navy">
                <span key={active} className="label-roll block">
                  {stage.title}
                </span>
              </h3>
              <p
                key={active}
                className="label-roll font-display text-[0.9375rem] leading-[1.5] text-pretty text-slate"
              >
                {stage.body}
              </p>
            </div>
            {/* What to do, for as long as there is a stage still to come,
                and where the visitor is. Only where the scene is running. */}
            <p
              aria-hidden="true"
              className="mt-2 hidden items-center gap-2.5 border-t border-navy/10 pt-3 font-display text-[0.6875rem] leading-none font-semibold tracking-[0.14em] text-slate uppercase [@media(min-height:31rem)]:flex"
            >
              <span
                className={`flex items-center gap-2.5 transition-opacity duration-500 motion-reduce:transition-none ${
                  active === last ? "opacity-0" : ""
                }`}
              >
                <span className="relative block h-4 w-px bg-navy/20">
                  <span className={`absolute inset-0 bg-navy ${reduced ? "" : "hero-cue-line"}`} />
                </span>
                Scroll for the next stage
              </span>
              <span className="ml-auto text-navy tabular-nums">
                {stage.num} / {String(count).padStart(2, "0")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* The button across the full width, its arrow at the far end. */}
      <div className="px-5 pt-5 pb-14 [&>a]:flex [&>a]:w-full [&>a]:justify-between">
        <CtaButton {...destination(content.link.href)}>{content.link.label}</CtaButton>
      </div>
    </div>
  );
}
