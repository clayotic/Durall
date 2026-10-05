import { useEffect, useRef, useState } from "react";
import { iconOf } from "@/content/icons";
import { imageOf } from "@/content/render";
import type { AboutPage } from "@/content/types";
import { at, useSeen } from "@/lib/seen";

/* The pavilion, as the lines it is drawn with (350 × 200). Each is
 * [points or path, opacity of the line, its width, the order it is drawn in];
 * a polygon's entry starts with a number, a path's with "M". */
const SLAB = [
  ["150.0,70.8 298.8,133.3 199.6,175.0 50.8,112.5", 0.9, 1.3],
  ["298.8,133.3 199.6,175.0 199.6,179.9 298.8,138.2", 0.6, 1],
  ["50.8,112.5 199.6,175.0 199.6,179.9 50.8,117.4", 0.6, 1],
] as const;
const POSTS = ["M153.1 85.1V36.8", "M264.7 132V83.6", "M196.5 160.6V112.3", "M84.9 113.8V65.4"];
const MULLIONS = [
  "M103.5 121.6V73.2",
  "M122.1 129.4V81",
  "M140.7 137.2V88.8",
  "M159.3 145V96.6",
  "M177.9 152.8V104.5",
  "M247.7 139.1V90.8",
  "M230.6 146.3V97.9",
  "M213.6 153.5V105.1",
];
const ROOF = [
  ["146.9,6.0 314.3,76.3 202.7,123.2 35.3,52.9", 0.95, 1.3],
  ["314.3,76.3 202.7,123.2 202.7,128.1 314.3,81.3", 0.7, 1],
  ["35.3,52.9 202.7,123.2 202.7,128.1 35.3,57.8", 0.7, 1],
] as const;
const TREE = [
  ["M34 160V90", 0.6],
  ["M34 138L20 116", 0.45],
  ["M34 127l12-19", 0.45],
  ["M34 116L24 94", 0.45],
  ["M34 105l10-21", 0.45],
] as const;

/** Card height and the gap between cards, in px: the rail's ticks are set
 *  against them. */
const CARD = 76;
const GAP = 12;

/**
 * "Our approach" below the desktop breakpoint: the same idea as the
 * desktop diagram, turned to run down the page. Four inputs on a rail, the
 * rail running into the Durall mark, one line out of it, and the building
 * that results, drawn line by line.
 *
 * It is in three parts, and each plays when it comes on screen rather than
 * all at once when the section does: the section is taller than a phone,
 * and a single sequence would have drawn the building before anyone had
 * scrolled down to it. Under reduced motion everything is simply there.
 */
export function OurApproachMobile({ content }: { content: AboutPage["approach"] }) {
  const rootRef = useSeen<HTMLDivElement>();
  const railRef = useRef<HTMLDivElement>(null);
  // The rail's curve ends under the middle of the column, wherever that is.
  const [width, setWidth] = useState(350);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const sized = new ResizeObserver(() => setWidth(rail.clientWidth || 350));
    sized.observe(rail);
    return () => sized.disconnect();
  }, []);

  const count = content.capabilities.length;
  const railEnd = count * CARD + (count - 1) * GAP - 8; // where the rail leaves the last card
  const railHeight = railEnd + 68;
  const middle = width / 2;
  const rail = `M10 ${CARD / 2}V${railEnd}C10 ${railEnd + 38} ${middle} ${railEnd + 18} ${middle} ${railHeight}`;

  return (
    <div ref={rootRef} className="px-5 py-14 lg:hidden">
      <p className="font-display text-xs font-semibold tracking-[0.16em] text-navy uppercase">
        {content.eyebrow}
      </p>
      <h2 className="mt-[1.125rem] font-display text-[2.375rem] leading-[1.08] font-light tracking-[-0.01em] text-navy">
        {content.heading.replace(/\n/g, " ")}
      </h2>
      <span aria-hidden="true" className="mt-[1.125rem] flex w-14 items-center">
        <span className="h-px grow bg-navy" />
        <span className="size-[5px] bg-navy" />
      </span>
      <p className="mt-[1.125rem] font-display text-base leading-[1.6] text-slate">
        {content.body}
      </p>

      <div className="mx-auto mt-10 max-w-[26rem]">
        {/* The four inputs, on their rail. */}
        <div ref={railRef} className="seq relative" style={{ height: railHeight }}>
          <svg
            aria-hidden="true"
            width="100%"
            height={railHeight}
            viewBox={`0 0 ${width} ${railHeight}`}
            fill="none"
            className="absolute inset-0 overflow-visible"
          >
            <path
              className="seq-draw"
              pathLength={1}
              d={rail}
              stroke="#050834"
              strokeOpacity={0.3}
              style={at(0.6, 1.1)}
            />
            {[0, 1.4].map((delay) => (
              <path
                key={delay}
                className="seq-pulse"
                pathLength={1}
                d={rail}
                stroke="#050834"
                strokeWidth={2}
                strokeLinecap="round"
                style={at(2.2 + delay)}
              />
            ))}
            {content.capabilities.map((item, index) => {
              const y = CARD / 2 + index * (CARD + GAP);
              return (
                <g key={item.title}>
                  <path
                    className="seq-draw"
                    pathLength={1}
                    d={`M10 ${y}H30`}
                    stroke="#050834"
                    strokeOpacity={0.35}
                    style={at(0.45 + index * 0.1, 0.35)}
                  />
                  <circle
                    className="seq-fade"
                    cx={10}
                    cy={y}
                    r={3}
                    fill="#050834"
                    style={at(0.45 + index * 0.1)}
                  />
                </g>
              );
            })}
          </svg>
          <ul>
            {content.capabilities.map(({ icon, title, body }, index) => {
              const Icon = iconOf(icon);
              return (
                <li
                  key={title}
                  style={{ top: index * (CARD + GAP), height: CARD, ...at(0.05 + index * 0.1) }}
                  className="seq-rise absolute right-0 left-[1.875rem] flex items-center gap-3.5 border border-navy/12 bg-white px-4"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center border border-navy/14 text-navy">
                    <Icon aria-hidden="true" className="size-[1.125rem]" strokeWidth={1.4} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[0.6875rem] leading-tight font-semibold tracking-[0.12em] text-navy uppercase">
                      {title}
                    </span>
                    <span className="mt-[3px] block font-display text-sm leading-[1.35] text-slate">
                      {body}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* The mark they run into, and the one line out of it. */}
        <div className="seq">
          <div className="seq-pop relative mx-auto size-[12.5rem]" style={at(0.2)}>
            <span
              aria-hidden="true"
              className="seq-ring absolute inset-0 rounded-[3.5rem] border border-navy/28"
              style={at(1.1)}
            />
            <span className="absolute inset-[1.375rem] flex items-center justify-center rounded-[2.5rem] border border-navy/50 bg-white">
              <img
                draggable={false}
                {...imageOf(content.mark.image)}
                alt={content.mark.alt}
                loading="lazy"
                decoding="async"
                className="h-auto w-[7.375rem] object-contain"
              />
            </span>
          </div>
          <svg
            aria-hidden="true"
            width="14"
            height="76"
            viewBox="0 0 14 76"
            fill="none"
            className="mx-auto block overflow-visible"
          >
            <path
              className="seq-draw"
              pathLength={1}
              d="M7 0V70"
              stroke="#050834"
              strokeOpacity={0.55}
              style={at(0.8, 0.5)}
            />
            <path
              className="seq-pulse"
              pathLength={1}
              d="M7 0V70"
              stroke="#050834"
              strokeWidth={2}
              strokeLinecap="round"
              style={at(1.6, 1.4)}
            />
            <path
              className="seq-fade"
              d="M1 62l6 8 6-8"
              stroke="#050834"
              strokeOpacity={0.7}
              strokeWidth={1.2}
              style={at(1.2)}
            />
          </svg>
        </div>

        {/* What comes out: the building, drawn floor first, roof last. */}
        <div className="seq">
          <svg
            role="img"
            aria-label={content.drawing.alt}
            viewBox="0 0 350 200"
            fill="none"
            className="block h-auto w-full"
          >
            {SLAB.map(([points, opacity, weight], index) => (
              <polygon
                key={points}
                className="seq-draw"
                pathLength={1}
                points={points}
                fill={index ? "none" : "#050834"}
                fillOpacity={0.04}
                stroke="#050834"
                strokeOpacity={opacity}
                strokeWidth={weight}
                style={at(0, 1.1)}
              />
            ))}
            {POSTS.map((d) => (
              <path
                key={d}
                className="seq-draw"
                pathLength={1}
                d={d}
                stroke="#050834"
                strokeOpacity={0.85}
                strokeWidth={1.3}
                style={at(0.2, 1.1)}
              />
            ))}
            {MULLIONS.map((d) => (
              <path
                key={d}
                className="seq-draw"
                pathLength={1}
                d={d}
                stroke="#050834"
                strokeOpacity={0.45}
                style={at(0.45, 1.1)}
              />
            ))}
            <polygon
              className="seq-draw"
              pathLength={1}
              points="153.1,36.8 264.7,83.6 196.5,112.3 84.9,65.4"
              stroke="#050834"
              strokeOpacity={0.85}
              strokeWidth={1.2}
              style={at(0.2, 1.1)}
            />
            <polygon
              className="seq-fade"
              points="84.9,113.8 196.5,160.6 196.5,112.3 84.9,65.4"
              fill="#050834"
              fillOpacity={0.05}
              style={at(0.9)}
            />
            <polygon
              className="seq-fade"
              points="264.7,132.0 196.5,160.6 196.5,112.3 264.7,83.6"
              fill="#050834"
              fillOpacity={0.08}
              style={at(0.9)}
            />
            {ROOF.map(([points, opacity, weight], index) => (
              <polygon
                key={points}
                className="seq-draw"
                pathLength={1}
                points={points}
                fill={index ? "none" : "#fdfdfb"}
                stroke="#050834"
                strokeOpacity={opacity}
                strokeWidth={weight}
                style={at(0.6, 1.1)}
              />
            ))}
            {TREE.map(([d, opacity]) => (
              <path
                key={d}
                className="seq-draw"
                pathLength={1}
                d={d}
                stroke="#050834"
                strokeOpacity={opacity}
                style={at(0.7, 1.1)}
              />
            ))}
            <ellipse
              className="seq-draw"
              pathLength={1}
              cx={34}
              cy={94}
              rx={18}
              ry={30}
              stroke="#050834"
              strokeOpacity={0.35}
              style={at(0.7, 1.1)}
            />
            <path
              className="seq-draw"
              pathLength={1}
              d="M0 190L350 176"
              stroke="#050834"
              strokeOpacity={0.18}
              style={at(0, 1.1)}
            />
          </svg>
          <div
            className="seq-rise mt-3 flex flex-col items-center gap-2 text-center"
            style={at(1.1)}
          >
            <p className="font-display text-xs font-semibold tracking-[0.16em] text-navy uppercase">
              {content.outcomeTitle}
            </p>
            <p className="max-w-[18.75rem] font-display text-[0.9375rem] leading-[1.5] text-slate">
              {content.outcomeBody}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
