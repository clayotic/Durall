import { useEffect, useRef } from "react";
import { loadGsap, useReveal, useSectionIntro } from "@/lib/anim";
import { prefersReducedMotion } from "@/lib/motion-prefs";
import { clamp01, ramp, smooth, useSceneProgress } from "@/lib/scene";
import { imageOf, Lines } from "@/content/render";
import type { ExpertisePage } from "@/content/types";
import { EYEBROW, HEADING, NUMERAL, PAPER, SHELL } from "./styles";

/* The held scene runs where the steps sit beside the drawing and motion is
 * welcome; everywhere else the section is simply its finished self. Keep in
 * step with the `lg:motion-safe:` classes below. */
const SCENE_QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

/**
 * "Decided on paper, not on site.": four steps on the left, and the
 * photograph filling the right half of the screen from `lg` up (under the
 * text below that). There used to be a drawing of a sliding door's sill
 * over a smaller photograph; the client asked for the drawing to go and the
 * photograph to take half the screen.
 *
 * From `lg` the section holds on screen for a little over a screen of
 * scrolling, and that distance plays it: the four steps appear one after
 * another while the photograph settles out of an overscan. It is sticky
 * rather than a scripted pin (see lib/scene.ts). Where the section is taller
 * than the window it holds with its foot on the foot of the window, which
 * only ever puts its top padding out of sight.
 */
export function InTheDetail({ content }: { content: ExpertisePage["detail"] }) {
  const introRef = useSectionIntro<HTMLDivElement>();
  const stepsRef = useReveal<HTMLOListElement>({ selector: "li", y: 16, stagger: 0.08 });
  const sceneRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<HTMLDivElement>(null);

  // Where the held block sticks: at the top of the window when it fits,
  // otherwise higher, by as much as it overruns the window.
  useEffect(() => {
    const hold = holdRef.current;
    if (!hold) return;
    const place = () =>
      hold.style.setProperty(
        "--hold-top",
        `${Math.min(0, window.innerHeight - hold.offsetHeight)}px`,
      );
    place();
    const observer = new ResizeObserver(place);
    observer.observe(hold);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, []);

  /* What the scene writes to: each step's two cells (the row itself belongs
   * to the reveal above), and the photograph's wrapper. Opacity and
   * transform only. */
  const parts = () => {
    const hold = holdRef.current;
    return {
      steps: Array.from(hold?.querySelectorAll<HTMLElement>("[data-detail-step] > *") ?? []),
      photo: hold?.querySelector<HTMLElement>("[data-detail-photo]") ?? null,
    };
  };

  useSceneProgress(
    sceneRef,
    (progress) => {
      const scene = sceneRef.current;
      const hold = holdRef.current;
      if (!scene || !hold) return;
      // The scene's own distance is what is left once the block has
      // scrolled up to where it holds.
      const lead = Math.max(0, hold.offsetHeight - window.innerHeight);
      const extra = scene.offsetHeight - hold.offsetHeight;
      const range = scene.offsetHeight - window.innerHeight;
      const held = extra > 0 ? clamp01((progress * range - lead) / extra) : 1;

      const { steps, photo } = parts();
      const count = steps.length / 2;
      steps.forEach((cell, at) => {
        const index = Math.floor(at / 2);
        const from = (index / count) * 0.82;
        const lit = index === 0 ? 1 : smooth(ramp(held, from, from + 0.16));
        cell.style.opacity = String(lit);
        cell.style.transform = `translate3d(${(1 - lit) * 10}px, 0, 0)`;
      });
      if (photo) photo.style.transform = `scale(${1.14 - 0.14 * smooth(ramp(held, 0, 0.9))})`;
    },
    {
      query: SCENE_QUERY,
      onLeaveQuery: () => {
        const { steps, photo } = parts();
        [...steps, photo].forEach((el) => {
          if (!el) return;
          el.style.opacity = "";
          el.style.transform = "";
        });
      },
    },
  );

  return (
    // `clip`, not `hidden`: a hidden overflow would make the section a scroll
    // container, and the block inside could no longer stick to the window.
    <section id="detail" className={`relative scroll-mt-24 overflow-clip ${PAPER}`}>
      <div ref={sceneRef}>
        <div
          ref={holdRef}
          className="relative mx-auto max-w-[120rem] lg:min-h-[min(55.21vw,66.25rem)] lg:motion-safe:sticky lg:motion-safe:top-[var(--hold-top,0px)]"
        >
          <div className={`${SHELL} relative z-10`}>
            <div className="pt-[clamp(4rem,7.3vw,8.75rem)] pb-[clamp(2.5rem,4.4vw,5.25rem)] lg:max-w-[42.7%]">
              <div ref={introRef}>
                <p data-anim className={`${EYEBROW} text-slate`}>
                  {content.eyebrow}
                </p>
                <h2
                  data-anim="lines"
                  className={`mt-[clamp(1.25rem,1.67vw,2rem)] ${HEADING} font-medium text-navy`}
                >
                  <Lines text={content.heading} />
                </h2>
                <p
                  data-anim
                  className="mt-[clamp(1.25rem,2.1vw,2.5rem)] max-w-[32.5rem] font-display text-[clamp(1rem,1.04vw,1.25rem)] leading-[1.55] text-pretty text-slate"
                >
                  {content.body}
                </p>
              </div>

              {/* On the paper, so the drawing's lines stop at its edge. */}
              <ol ref={stepsRef} className={`mt-[clamp(2.5rem,4.7vw,5.625rem)] ${PAPER}`}>
                {content.steps.map((step, index) => (
                  <li
                    key={step.title}
                    data-detail-step
                    // As drawn: each rule sits close under the step before it.
                    className={`grid grid-cols-[clamp(3.5rem,6.25vw,7.5rem)_minmax(0,1fr)] ${
                      index > 0
                        ? "border-t border-navy/12 pt-[1.0625rem] pb-[0.4375rem]"
                        : "pb-[1.5625rem]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`font-display text-[1.875rem] leading-none font-light tabular-nums ${NUMERAL}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 pt-[0.4375rem]">
                      <span className="block font-display text-sm leading-[1.3] font-medium tracking-[0.2em] text-navy uppercase">
                        {step.title}
                      </span>
                      <span className="mt-2 block max-w-[27rem] font-display text-[clamp(0.9375rem,0.83vw,1rem)] leading-[1.44] text-slate">
                        {step.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* The right half of the screen from `lg`, the block's full height. */}
          <div className="relative aspect-[4/5] w-full overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-1/2">
            <div data-detail-photo className="h-full w-full">
              <img
                draggable={false}
                {...imageOf(content.photo.image)}
                alt={content.photo.alt}
                sizes="(min-width: 120rem) 960px, (min-width: 64rem) 50vw, 100vw"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
        {/* The scene's length: how far the page scrolls while the block holds. */}
        <div aria-hidden="true" className="hidden h-[110vh] lg:motion-safe:block" />
      </div>
    </section>
  );
}
