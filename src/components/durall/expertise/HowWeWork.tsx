import { useEffect, useRef } from "react";
import { loadGsap, markAnimReady, useSectionIntro } from "@/lib/anim";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion-prefs";
import { clamp01, ramp, useSceneProgress } from "@/lib/scene";
import { imageOf, Lines } from "@/content/render";
import type { ExpertisePage } from "@/content/types";
import { PAPER, SHELL } from "./styles";

const FOOT =
  "font-display text-[0.6875rem] leading-none font-medium tracking-[0.18em] text-slate uppercase";

/* Where five columns do not fit side by side and motion is welcome, the row
 * is held on screen and the page's own scroll carries it sideways. Keep in
 * step with the `max-lg:motion-safe:` classes below. */
const PIN_QUERY = "(max-width: 63.999rem) and (prefers-reduced-motion: no-preference)";

/**
 * "Concept to commissioning, under one roof.": the stages side by side, each
 * a number on a rule, a name, a line, a sentence and a tall picture.
 *
 * At 1920 the five columns are 249px wide on a 289px pitch, with a hairline
 * in each gap. The rows are shared between the columns (subgrid), so the
 * pictures line up however the text above them wraps.
 *
 * The row is one journey from 01 to 05, and the scroll is what makes it:
 * a line runs along the rule from each number to the next, and as it reaches
 * a stage that stage's number appears and its words rise in. Scrolling back
 * runs it backwards.
 *
 * From `lg` all five are on screen and the journey plays while the numbers
 * cross the middle of the window, the pictures being uncovered left to right
 * as they come up beneath.
 *
 * Below `lg` five do not fit. The page scrolls normally down to the row;
 * there the row holds (sticky, see lib/scene.ts) and the same scroll moves
 * it sideways, one pixel across for each pixel down, playing the journey as
 * each stage arrives. When the fifth stage is in, the row lets go and the
 * page carries on down. Under reduced motion nothing is held: the row is a
 * plain sideways scroller, as it was.
 */
export function HowWeWork({ content }: { content: ExpertisePage["process"] }) {
  const introRef = useSectionIntro<HTMLDivElement>();
  const reduced = useReducedMotion();
  /** As tall as the row plus the distance it travels sideways. */
  const trackRef = useRef<HTMLDivElement>(null);
  /** The part that holds, and the window the row slides behind. */
  const pinRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  /** The held row's journey, which the scroll below plays by hand. */
  const journeyRef = useRef<{ time: (t: number) => unknown; duration: () => number } | null>(null);
  /* Where the row holds, how far it travels, and how much of the journey
   * has played by the time it is held: every stage already on screen (one
   * and a bit on a phone, two and a bit on a tablet). */
  const held = useRef({ top: 0, travel: 0, lead: 1 });

  /** Puts the held row where the scroll says: how far across, how far through. */
  const place = () => {
    const track = trackRef.current;
    const list = listRef.current;
    if (!track || !list) return;
    const { top, travel, lead } = held.current;
    const from = track.getBoundingClientRect().top;
    const across = Math.min(travel, Math.max(0, top - from));
    list.style.translate = `${-across.toFixed(1)}px 0`;
    const journey = journeyRef.current;
    if (!journey) return;
    const arriving = ramp(from, window.innerHeight * 0.8, top);
    const through = travel ? clamp01(across / travel) : 0;
    journey.time(arriving * lead + through * (journey.duration() - lead));
  };
  const placeRef = useRef(place);
  placeRef.current = place;

  useSceneProgress(trackRef, () => placeRef.current(), {
    query: PIN_QUERY,
    onLeaveQuery: () => {
      if (listRef.current) listRef.current.style.translate = "";
    },
  });

  // How far the row has to travel, and where it holds: in the middle of the
  // window under the bar when it fits, otherwise with its foot on the
  // window's foot. Measured, because both change with the screen.
  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    const list = listRef.current;
    if (!track || !pin || !list) return;
    const media = window.matchMedia(PIN_QUERY);
    const measure = () => {
      const first = list.firstElementChild;
      const last = list.lastElementChild;
      if (!media.matches || !first || !last) {
        held.current = { top: 0, travel: 0, lead: 1 };
        track.style.removeProperty("--travel");
        return;
      }
      const start = first.getBoundingClientRect().left;
      const gutter = start - list.getBoundingClientRect().left;
      const pitch = (first.nextElementSibling?.getBoundingClientRect().left ?? 0) - start;
      const travel = Math.max(
        0,
        last.getBoundingClientRect().right - start + 2 * gutter - pin.clientWidth,
      );
      const bar =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
      const room = window.innerHeight - pin.offsetHeight;
      const top = Math.round(Math.min(Math.max(bar + 8, room / 2), room));
      const lead = pitch > 0 ? Math.max(1, (pin.clientWidth - gutter) / pitch + 0.1) : 1;
      held.current = { top, travel, lead };
      track.style.setProperty("--travel", `${Math.round(travel)}px`);
      track.style.setProperty("--pin-top", `${top}px`);
      placeRef.current();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    window.addEventListener("resize", measure);
    media.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      media.removeEventListener("change", measure);
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || prefersReducedMotion()) return;
    let dispose = () => {};
    let cancelled = false;

    void loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const stages = Array.from(list.querySelectorAll<HTMLElement>("[data-stage]"));
      const within = (stage: HTMLElement, selector: string) =>
        Array.from(stage.querySelectorAll<HTMLElement>(selector));
      const pictures = stages.flatMap((stage) => within(stage, "[data-clip-inner]"));
      const covered = { yPercent: 12, scale: 1.12, opacity: 0 };
      const uncovered = { yPercent: 0, scale: 1, opacity: 1, ease: "none" };

      /** One unit of the timeline per stage. */
      const journeyOf = (timeline: ReturnType<typeof gsap.timeline>, withPictures: boolean) => {
        stages.forEach((stage, index) => {
          timeline
            .fromTo(
              within(stage, "[data-stage-number]"),
              // From nothing, not from a faint number: a faint one fails
              // contrast for as long as it waits.
              { opacity: 0 },
              { opacity: 1, duration: 0.3, ease: "none" },
              index,
            )
            .fromTo(
              within(stage, "[data-stage-line]"),
              { scaleX: 0 },
              { scaleX: 1, duration: 1, ease: "none" },
              index,
            )
            .fromTo(
              within(stage, "[data-stage-copy]"),
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 },
              index + 0.05,
            );
          if (withPictures)
            timeline.fromTo(
              within(stage, "[data-clip-inner]"),
              covered,
              { ...uncovered, duration: 0.9 },
              index,
            );
        });
        return timeline;
      };

      // matchMedia reverts whichever of the two is not for the current width.
      const media = gsap.matchMedia();
      media.add("(min-width: 64rem)", () => {
        journeyOf(
          gsap.timeline({
            defaults: { ease: "power2.out" },
            // The scroll is its clock: from the numbers entering the lower
            // part of the window to their reaching its upper part.
            scrollTrigger: {
              trigger: list,
              start: "clamp(top 80%)",
              end: "clamp(top 22%)",
              scrub: 0.6,
            },
          }),
          false,
        );
        gsap.fromTo(pictures, covered, {
          ...uncovered,
          stagger: 0.35,
          scrollTrigger: {
            trigger: pictures[0]?.parentElement ?? list,
            start: "clamp(top 95%)",
            end: "clamp(top 45%)",
            scrub: 0.6,
          },
        });
      });
      media.add("(max-width: 63.999rem)", () => {
        // Held row: no trigger of its own. `place` plays it, with each
        // stage's picture uncovered in that stage's own turn.
        journeyRef.current = journeyOf(
          gsap.timeline({ paused: true, defaults: { ease: "power2.out" } }),
          true,
        );
        placeRef.current();
        return () => {
          journeyRef.current = null;
        };
      });
      markAnimReady();
      dispose = () => media.revert();
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, []);
  const count = content.stages.length;

  return (
    <section
      id="process"
      className={`${PAPER} scroll-mt-24 pt-[clamp(3.5rem,5.6vw,6.7rem)] pb-[clamp(2.5rem,3.02vw,3.625rem)]`}
    >
      <div className={SHELL}>
        <div ref={introRef}>
          <h2
            data-anim="lines"
            className="font-display text-[clamp(2.5rem,3.75vw,4.5rem)] leading-[1.056] font-medium tracking-[-0.025em] text-balance text-navy"
          >
            <Lines text={content.heading} />
          </h2>
          <p
            data-anim
            className="mt-[clamp(0.5rem,0.57vw,0.6875rem)] max-w-[20.7rem] font-display text-[clamp(1rem,0.94vw,1.125rem)] leading-[1.56] text-pretty text-slate"
          >
            {content.lede}
          </p>
        </div>

        <div
          ref={trackRef}
          className="mt-[clamp(2rem,2.24vw,2.6875rem)]"
          style={{ "--stages": count } as React.CSSProperties}
        >
          <div
            ref={pinRef}
            className="max-lg:motion-safe:sticky max-lg:motion-safe:top-[var(--pin-top,5rem)] max-lg:motion-safe:-mx-[clamp(1.25rem,max(3.75vw,22.5vw-10.5rem),16.125rem)] max-lg:motion-safe:overflow-x-clip"
          >
            <ol
              ref={listRef}
              // Only a sideways scroller under reduced motion, below `lg`;
              // there it has to be reachable by keyboard.
              tabIndex={reduced ? 0 : undefined}
              aria-label="How we work, stage by stage"
              className="-mx-[clamp(1.25rem,3.75vw,3rem)] grid snap-x snap-mandatory scroll-px-[clamp(1.25rem,3.75vw,3rem)] auto-cols-[min(72vw,16.5rem)] grid-flow-col grid-rows-[repeat(5,auto)] gap-x-10 overflow-x-auto overscroll-x-contain px-[clamp(1.25rem,3.75vw,3rem)] pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-blue lg:mx-0 lg:grid-flow-row lg:grid-cols-[repeat(var(--stages),minmax(0,1fr))] lg:overflow-visible lg:px-0 lg:pb-0 max-lg:motion-safe:mx-0 max-lg:motion-safe:snap-none max-lg:motion-safe:overflow-visible max-lg:motion-safe:px-[clamp(1.25rem,max(3.75vw,22.5vw-10.5rem),16.125rem)] max-lg:motion-safe:will-change-transform"
            >
              {content.stages.map((stage, index) => {
                const last = index === count - 1;
                return (
                  <li
                    key={stage.title}
                    data-stage
                    className="relative row-span-5 grid min-w-0 snap-start grid-rows-subgrid"
                  >
                    <div className="flex items-end gap-[1.25rem]">
                      <span
                        data-stage-number
                        className="font-display text-[1.875rem] leading-none font-light tracking-[-0.017em] text-navy tabular-nums"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`relative mb-[0.5625rem] h-px flex-1 bg-navy/18 ${last ? "" : "-mr-10"}`}
                      >
                        {/* The travelling line: it runs this rule on its way
                          to the next number, drawn by the scroll. Without
                          motion it is not there and the hairline stands. */}
                        <span
                          data-stage-line
                          className="absolute inset-x-0 -inset-y-px origin-left scale-x-0 bg-navy"
                        />
                      </span>
                    </div>
                    {/* The hairline in the gap before this column, from its name
                    to the foot of its picture. */}
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className="absolute top-[4.3125rem] bottom-0 -left-5 w-px bg-navy/8"
                      />
                    ) : null}
                    <h3
                      data-stage-copy
                      className="mt-[2.4375rem] font-display text-sm leading-[1.3] font-medium tracking-[0.2em] text-navy uppercase"
                    >
                      {stage.title}
                    </h3>
                    <p
                      data-stage-copy
                      className="mt-3 font-display text-[1.1875rem] leading-[1.37] text-navy"
                    >
                      {stage.summary}
                    </p>
                    <p
                      data-stage-copy
                      className="mt-4 max-w-[15rem] font-display text-[0.9375rem] leading-[1.53] text-slate"
                    >
                      {stage.body}
                    </p>
                    <div className="mt-[clamp(2rem,2.4vw,2.875rem)] aspect-[249/380] overflow-hidden bg-[#f4f4f1] max-lg:motion-safe:max-h-[max(9rem,calc(100svh-28rem))]">
                      <div data-clip-inner className="h-full w-full">
                        <img
                          draggable={false}
                          {...imageOf(stage.photo.image)}
                          alt={stage.photo.alt}
                          sizes="(min-width: 1024px) 14vw, 264px"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          {/* The held row's length: how far the page scrolls while it
              travels sideways. */}
          <div
            aria-hidden="true"
            className="hidden h-[var(--travel,0px)] max-lg:motion-safe:block"
          />
        </div>

        <div className="mt-[clamp(1.5rem,2.25vw,2.7rem)] flex flex-wrap items-center gap-x-7 gap-y-2">
          <p className={FOOT}>{content.footLeft}</p>
          <span
            aria-hidden="true"
            data-fx="rule"
            className="hidden h-px flex-1 bg-navy/18 sm:block"
          />
          <p className={FOOT}>{content.footRight}</p>
        </div>
      </div>
    </section>
  );
}
