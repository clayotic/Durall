import { useState } from "react";
import { imageOf } from "@/content/render";
import type { PartnerDoc, PartnersPage } from "@/content/types";
import { PartnerLogo } from "./marks";

/* The dotted world map is 1400 × 474 of its own units. This is the part of
 * it the phone shows (Portugal to Thailand), and where things fall on it:
 * Durall in Mumbai, and each partner by the country it is listed under. A
 * country not listed here simply has no pin. Positions sit on the map's
 * 5-unit grid of dots. */
const VIEW = "630 32 490 221";
const MUMBAI = { x: 922.5, y: 207.5 };
const PLACES: readonly [RegExp, number, number][] = [
  [/portugal/i, 677.5, 142.5],
  [/switzerland/i, 727.5, 117.5],
  [/austria/i, 742.5, 117.5],
  [/italy/i, 737.5, 132.5],
  [/belgium/i, 712.5, 107.5],
  [/israel/i, 807.5, 162.5],
  [/thailand/i, 1002.5, 222.5],
];

/** Each partner's pin. Partners sharing a country are stepped apart along a
 *  diagonal so each has a dot of its own. */
function pins(partners: readonly PartnerDoc[]) {
  const shared = new Map<number, number>();
  return partners.map((partner) => {
    const place = PLACES.findIndex(([country]) => country.test(partner.country));
    if (place < 0) return null;
    const [, x, y] = PLACES[place]!;
    const nth = shared.get(place) ?? 0;
    shared.set(place, nth + 1);
    const step = [0, -7, 7][nth % 3]!;
    return { x: x + step, y: y + step };
  });
}

/**
 * "International systems" on a phone: the part of the world map the
 * partners are in, the partner cards as a two-column grid to tap, and the
 * closing statement. Tapping a partner draws its line to Mumbai on the map
 * and names it underneath.
 */
export function InternationalNetworkMobile({
  content,
  partners,
}: {
  content: PartnersPage["network"];
  partners: readonly PartnerDoc[];
}) {
  const [active, setActive] = useState(0);
  const at = pins(partners);
  const shown = partners[active];
  const pin = at[active];
  // The line bows upward on its way to Mumbai.
  const arc = pin
    ? `M${pin.x} ${pin.y}Q${(pin.x + MUMBAI.x) / 2} ${Math.min(pin.y, MUMBAI.y) - 36} ${MUMBAI.x} ${MUMBAI.y}`
    : "";

  return (
    <div className="flex flex-col gap-8 px-5 py-14 md:hidden">
      <div>
        <p className="flex items-center gap-3.5 font-display text-xs font-semibold tracking-[0.16em] text-slate uppercase">
          {content.eyebrow}
          <span aria-hidden="true" className="h-px w-10 bg-navy/40" />
        </p>
        <h2 className="mt-[1.125rem] font-display text-[2.125rem] leading-[1.08] font-medium tracking-[-0.02em] text-navy">
          {content.heading}
        </h2>
        <p className="mt-[1.125rem] font-display text-base leading-[1.6] text-slate">
          {content.body}
        </p>
      </div>

      <div>
        <svg
          viewBox={VIEW}
          role="img"
          aria-label="Map of partner countries, each linked to Durall in Mumbai"
          className="block h-auto w-full"
        >
          <image
            href={imageOf(content.map).src}
            x="0"
            y="0"
            width="1400"
            height="474"
            opacity="0.9"
          />
          {at.map((point, index) =>
            point ? (
              <circle
                key={partners[index]!.id}
                cx={point.x}
                cy={point.y}
                r="3.6"
                fill="#050834"
                fillOpacity="0.35"
              />
            ) : null,
          )}
          {pin ? (
            // Re-made for each partner, which is what draws the line afresh.
            <g key={shown?.id}>
              <path
                className="draw-once"
                pathLength={1}
                d={arc}
                fill="none"
                stroke="#050834"
                strokeWidth="1.7"
              />
              <circle className="ring-out" cx={pin.x} cy={pin.y} r="5.6" fill="#050834" />
              <circle cx={pin.x} cy={pin.y} r="5.6" fill="#050834" />
            </g>
          ) : null}
          <rect x={MUMBAI.x - 5.6} y={MUMBAI.y - 5.6} width="11.2" height="11.2" fill="#050834" />
          <text
            x={MUMBAI.x + 14}
            y={MUMBAI.y - 3}
            fill="#050834"
            fontSize="14"
            fontWeight="600"
            letterSpacing="1.7"
            className="font-display uppercase"
          >
            Durall · Mumbai
          </text>
        </svg>
        {shown ? (
          <p
            aria-live="polite"
            className="mt-2.5 flex items-baseline justify-between gap-3 overflow-hidden border-t border-navy/12 pt-2.5 font-display text-xs"
          >
            <span
              key={shown.id}
              className="label-roll font-semibold tracking-[0.12em] text-navy uppercase"
            >
              {shown.name}
            </span>
            <span key={`${shown.id}-from`} className="label-roll tracking-[0.06em] text-slate">
              {shown.country} → India
            </span>
          </p>
        ) : null}
      </div>

      <ul className="grid grid-cols-2 gap-2.5">
        {partners.map((partner, index) => {
          const on = index === active;
          return (
            <li key={partner.id} className="flex">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={on}
                className={`flex min-h-[10.5rem] w-full cursor-pointer flex-col gap-3.5 border px-3.5 py-4 text-left transition-[border-color,background-color] duration-[250ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue ${
                  on ? "border-navy bg-white" : "border-navy/12 bg-transparent"
                }`}
              >
                <span className="flex h-[1.875rem] items-center [&_img]:max-h-[1.625rem] [&_img]:max-w-full [&_img]:object-left">
                  <PartnerLogo mark={partner.mark} name={partner.name} logo={partner.logo} />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="font-display text-[0.6875rem] font-semibold tracking-[0.12em] text-slate uppercase">
                    {partner.country}
                  </span>
                  <span aria-hidden="true" className="h-px w-[1.125rem] bg-navy" />
                </span>
                <span className="font-display text-sm leading-[1.4] text-navy">
                  {partner.description}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-4 pt-1">
        <span aria-hidden="true" className="w-0.5 shrink-0 bg-navy" />
        <p className="font-display text-[1.0625rem] leading-[1.55] text-pretty text-navy">
          {content.quote}
        </p>
      </div>
    </div>
  );
}
