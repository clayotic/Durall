import { useReveal, useSplitLines } from "@/lib/anim";
import type { PartnerDoc, PartnersPage } from "@/content/types";
import { Interactive } from "../ui";
import { LeadingPracticesMobile } from "./LeadingPracticesMobile";
import { PracticeLogo } from "./marks";
import { PracticesMap } from "./PracticesMap";

/**
 * "Architects & Design Practices": the heading, the practices' logos with
 * their countries over the dotted world map that marks where they work
 * from, and the closing line.
 *
 * It took the place of the "International Systems" section, which the
 * client removed with its partner brands; the world map that sat faintly
 * behind those logos stays, now marking where the architects are. The
 * drawing of a house that stood beside the heading, and the line of
 * description under each practice, went at the same time.
 */
export function LeadingPractices({
  content,
  practices,
}: {
  content: PartnersPage["practices"];
  practices: readonly PartnerDoc[];
}) {
  const headingRef = useSplitLines<HTMLHeadingElement>();
  const introRef = useReveal<HTMLDivElement>({ selector: "[data-reveal]", y: 16 });
  const mapRef = useReveal<HTMLDivElement>({ y: 24 });
  const gridRef = useReveal<HTMLUListElement>({ selector: "[data-cell]", y: 32, stagger: 0.08 });
  const closingRef = useReveal<HTMLDivElement>({ y: 16 });

  return (
    <section
      id="practices"
      className="relative overflow-hidden bg-white max-md:bg-[#fdfdfb] md:pt-[clamp(3.5rem,8vw,7.5rem)] md:pb-[clamp(3.5rem,8vw,7.5rem)]"
    >
      {/* On a phone the section is laid out differently altogether; the
          three blocks after this are for `md` and up. */}
      <LeadingPracticesMobile content={content} practices={practices} />
      <div ref={introRef} className="shell-about relative min-w-0 max-md:hidden">
        <p
          data-reveal
          className="flex items-center gap-2.5 font-display text-[0.625rem] font-bold tracking-eyebrow text-accent-blue uppercase"
        >
          {content.eyebrow}
          <span aria-hidden="true" className="h-0 w-6 border-t border-accent-blue/60" />
        </p>
        {/* 1.105, not the design's 1.2: split into lines for the reveal, each
            line carries 0.1em of padding whose negative margins only
            partly collapse, which puts that back between the lines. */}
        <h2
          ref={headingRef}
          className="mt-[clamp(1rem,1.7vw,1.75rem)] max-w-[14ch] font-display text-[clamp(1.75rem,2.59vw,2.75rem)] leading-[1.105] font-normal tracking-section text-balance text-navy"
        >
          {content.heading}
        </h2>
        <span
          aria-hidden="true"
          className="mt-[clamp(0.5rem,1vw,1rem)] block h-0 w-[2.3rem] border-t-2 border-accent-blue"
        />
        <p
          data-reveal
          data-fx="words"
          className="mt-[clamp(1rem,1.6vw,1.625rem)] max-w-[28rem] font-display text-[clamp(0.75rem,0.754vw,0.875rem)] leading-[1.56] text-slate"
        >
          {content.lead}
        </p>
        <p
          data-reveal
          data-fx="words"
          className="mt-[clamp(0.625rem,0.82vw,0.875rem)] max-w-[28rem] font-display text-[clamp(0.6875rem,0.645vw,0.75rem)] leading-[1.56] text-slate/80"
        >
          {content.note}
        </p>
      </div>

      {/* The logos stand over the map, as the partner logos once did: both
          share one grid cell, so the map is centred behind them at any width. */}
      <div className="shell-about mt-[clamp(2rem,4vw,3.5rem)] grid items-center max-md:hidden">
        <div ref={mapRef} className="[grid-area:1/1]">
          <PracticesMap practices={practices} />
        </div>
        <ul
          ref={gridRef}
          className="relative grid grid-cols-1 gap-y-[clamp(2rem,4vw,3rem)] [grid-area:1/1] sm:grid-cols-2 lg:grid-cols-4"
        >
          {practices.map((practice) => (
            <li key={practice.id} data-cell className="min-w-0">
              <Interactive
                lift={-4}
                scale={1.01}
                className="flex min-w-0 flex-col items-center px-[clamp(0.75rem,1.5vw,2rem)] text-center"
              >
                <span className="flex min-h-[clamp(2.5rem,3.5vw,3rem)] items-center justify-center">
                  <PracticeLogo mark={practice.mark} name={practice.name} logo={practice.logo} />
                </span>
                <span className="mt-[clamp(0.875rem,1.8vw,1.5rem)] font-display text-[0.625rem] font-bold tracking-eyebrow text-slate uppercase">
                  {practice.country}
                </span>
              </Interactive>
            </li>
          ))}
        </ul>
      </div>

      <div
        ref={closingRef}
        className="shell-about mt-[clamp(2.5rem,5vw,4.5rem)] text-center max-md:hidden"
      >
        <p className="font-display text-[clamp(0.5625rem,0.75vw,0.6875rem)] font-bold tracking-eyebrow text-navy uppercase">
          {content.tagline}
        </p>
        <span
          aria-hidden="true"
          className="mx-auto mt-2 block h-0 w-[clamp(1.5rem,2.5vw,2rem)] border-t-2 border-accent-blue"
        />
      </div>
    </section>
  );
}
