import { imageOf } from "@/content/render";
import type { PartnerDoc, PartnersPage } from "@/content/types";
import { at, useSeen } from "@/lib/seen";
import { FrameEdges } from "./LeadingPracticesMobile";
import { PartnerLogo } from "./marks";

/** Seconds between one partner's frame starting to draw and the next's. */
const STEP = 0.12;

/**
 * "International systems" on a phone: the dotted world map the desktop page
 * sets behind its logos, here a picture of its own; the partners as a
 * two-column grid; and the closing statement.
 *
 * It arrives the way the practices section under it does: the map is
 * uncovered left to right behind a dark bar, then each partner is framed in
 * turn before its logo and words come in (`seq` in styles.css; lib/seen.ts
 * starts each part when it is on screen). Nothing here is to be tapped.
 */
export function InternationalNetworkMobile({
  content,
  partners,
}: {
  content: PartnersPage["network"];
  partners: readonly PartnerDoc[];
}) {
  const rootRef = useSeen<HTMLDivElement>(0.2);

  return (
    <div ref={rootRef} className="flex flex-col gap-8 px-5 py-14 md:hidden">
      <div className="seq">
        <p
          className="seq-fade flex items-center gap-3.5 font-display text-xs font-semibold tracking-[0.16em] text-slate uppercase"
          style={at(0.05)}
        >
          {content.eyebrow}
          <span aria-hidden="true" className="h-px w-10 bg-navy/40" />
        </p>
        <h2
          className="seq-rise mt-[1.125rem] font-display text-[2.125rem] leading-[1.08] font-medium tracking-[-0.02em] text-navy"
          style={at(0.15, 0.9)}
        >
          {content.heading}
        </h2>
        <p
          data-fx="words"
          className="mt-[1.125rem] font-display text-base leading-[1.6] text-slate"
        >
          {content.body}
        </p>
      </div>

      {/* The whole map, in the room the old one took. */}
      <div className="seq relative aspect-[490/221] overflow-hidden">
        <img
          draggable={false}
          {...imageOf(content.map)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-[1.2] object-contain brightness-50 select-none"
        />
        {/* The cover, with the dark bar on its leading edge. */}
        <span
          aria-hidden="true"
          className="seq-slide absolute inset-0 border-l-4 border-navy bg-[#fdfdfb]"
          style={at(0.2)}
        />
      </div>

      <ul className="seq grid grid-cols-2 gap-2.5">
        {partners.map((partner, index) => {
          const from = 0.1 + index * STEP;
          return (
            <li
              key={partner.id}
              className="relative flex min-h-[10.5rem] flex-col gap-3.5 px-3.5 py-4"
            >
              <FrameEdges from={from} />
              <span
                className="seq-rise relative flex h-[1.875rem] items-center [&_img]:max-h-[1.625rem] [&_img]:max-w-full [&_img]:object-left"
                style={at(from + 0.5)}
              >
                <PartnerLogo mark={partner.mark} name={partner.name} logo={partner.logo} />
              </span>
              <span className="relative flex flex-col gap-1.5">
                <span
                  className="seq-rise font-display text-[0.6875rem] font-semibold tracking-[0.12em] text-slate uppercase"
                  style={at(from + 0.6)}
                >
                  {partner.country}
                </span>
                <span
                  aria-hidden="true"
                  className="seq-x h-px w-[1.125rem] origin-left bg-navy"
                  style={at(from + 0.65, 0.4)}
                />
              </span>
              <span
                className="seq-rise relative font-display text-sm leading-[1.4] text-navy"
                style={at(from + 0.7)}
              >
                {partner.description}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-4 pt-1">
        <span aria-hidden="true" className="w-0.5 shrink-0 bg-navy" />
        <p
          data-fx="words"
          className="font-display text-[1.0625rem] leading-[1.55] text-pretty text-navy"
        >
          {content.quote}
        </p>
      </div>
    </div>
  );
}
