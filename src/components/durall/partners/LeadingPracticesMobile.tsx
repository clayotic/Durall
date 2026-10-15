import type { PartnerDoc, PartnersPage } from "@/content/types";
import { at, useSeen } from "@/lib/seen";
import { PracticeLogo } from "./marks";
import { PracticesMap } from "./PracticesMap";

/** Seconds between one practice's frame starting to draw and the next's. */
const STEP = 0.14;

/** A cell's outline, drawn clockwise from its top-left corner: top, right,
 *  foot, left, each from the corner the last one ended in. `from` is when
 *  it starts, in seconds after its group comes on screen. */
export function FrameEdges({ from }: { from: number }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="seq-x absolute inset-x-0 top-0 h-px origin-left bg-navy/28"
        style={at(from, 0.35)}
      />
      <span
        aria-hidden="true"
        className="seq-y absolute inset-y-0 right-0 w-px origin-top bg-navy/28"
        style={at(from + 0.18, 0.35)}
      />
      <span
        aria-hidden="true"
        className="seq-x absolute inset-x-0 bottom-0 h-px origin-right bg-navy/28"
        style={at(from + 0.3, 0.35)}
      />
      <span
        aria-hidden="true"
        className="seq-y absolute inset-y-0 left-0 w-px origin-bottom bg-navy/28"
        style={at(from + 0.42, 0.35)}
      />
    </>
  );
}

/**
 * "Architects & Design Practices" on a phone. The world map, with the
 * practices' countries marked, is uncovered left to right behind a dark
 * bar, the way a sliding door opens; then each practice is framed in turn,
 * its outline drawn clockwise from the top-left corner before its logo and
 * country come in (`seq` in styles.css; lib/seen.ts starts each part when
 * it is on screen).
 */
export function LeadingPracticesMobile({
  content,
  practices,
}: {
  content: PartnersPage["practices"];
  practices: readonly PartnerDoc[];
}) {
  const rootRef = useSeen<HTMLDivElement>(0.2);

  return (
    <div ref={rootRef} className="flex flex-col gap-7 py-14 md:hidden">
      <div className="seq px-5">
        <p
          className="seq-fade flex items-center gap-3.5 font-display text-xs font-semibold tracking-[0.16em] text-slate uppercase"
          style={at(0.05)}
        >
          {content.eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-navy/40" />
        </p>
        <h2
          className="seq-rise mt-[1.125rem] font-display text-4xl leading-[1.1] font-medium tracking-[-0.02em] text-balance text-navy"
          style={at(0.15, 0.9)}
        >
          {content.heading}
        </h2>
        <span
          aria-hidden="true"
          className="seq-x mt-[1.125rem] block h-0.5 w-10 origin-left bg-navy"
          style={at(0.45, 0.8)}
        />
        <p
          data-fx="words"
          className="mt-[1.125rem] font-display text-base leading-[1.6] text-slate"
        >
          {content.lead}
        </p>
        <p
          className="seq-fade mt-2.5 font-display text-sm leading-[1.6] text-slate"
          style={at(0.65)}
        >
          {content.note}
        </p>
      </div>

      <div className="seq relative overflow-hidden px-5">
        <PracticesMap practices={practices} />
        {/* The cover, with the dark bar on its leading edge. */}
        <span
          aria-hidden="true"
          className="seq-slide absolute inset-0 border-l-4 border-navy bg-[#fdfdfb]"
          style={at(0.2)}
        />
      </div>

      <ul className="seq grid grid-cols-2 gap-2.5 px-5">
        {practices.map((practice, index) => {
          const from = 0.1 + index * STEP;
          return (
            <li
              key={practice.id}
              className="relative flex min-h-32 flex-col items-center justify-center gap-2.5 px-3 pt-6 pb-[1.375rem] text-center"
            >
              <span
                aria-hidden="true"
                className="seq-fade absolute inset-0 bg-white"
                style={at(from + 0.55)}
              />
              <FrameEdges from={from} />
              <span
                className="seq-rise relative flex h-10 items-center justify-center [&_img]:max-h-9 [&_img]:max-w-full"
                style={at(from + 0.5)}
              >
                <PracticeLogo mark={practice.mark} name={practice.name} logo={practice.logo} />
              </span>
              <span
                className="seq-rise relative font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-slate uppercase"
                style={at(from + 0.6)}
              >
                {practice.country}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="seq flex flex-col items-center gap-3 px-5 pt-2 text-center">
        <p
          className="seq-fade max-w-[17rem] font-display text-[0.6875rem] leading-[1.7] font-semibold tracking-[0.18em] text-balance text-navy uppercase"
          style={at(0.1)}
        >
          {content.tagline}
        </p>
        <span aria-hidden="true" className="h-0.5 w-[1.375rem] bg-navy" />
      </div>
    </div>
  );
}
