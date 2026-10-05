import { useState, type ReactNode } from "react";
import { imageOf } from "@/content/render";
import type { ArticleBlock, Photo } from "@/content/types";

/* The pieces a series article is laid out from (types.ts, ArticleBlock).
 * Text runs in a 45rem column; photographs, grids and the stage viewer use
 * the full width of the article's column. On a phone everything is one
 * column and the grids fold to two across. */

export const two = (n: number) => String(n).padStart(2, "0");

const TEXT = "max-w-[45rem]";
const P = `${TEXT} font-display text-base leading-[1.72] lg:text-lg`;
const CAPTION = "font-display text-[0.8125rem] leading-[1.5] text-slate";
const LABEL = "font-display text-[0.6875rem] font-semibold tracking-[0.16em] text-navy uppercase";
const NUM = "font-display text-[0.6875rem] font-semibold tracking-[0.1em] text-slate";

function Picture({
  photo,
  sizes,
  className = "",
}: {
  photo: Photo;
  sizes: string;
  className?: string;
}) {
  return (
    <img
      draggable={false}
      {...imageOf(photo.image)}
      alt={photo.alt}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

const ZOOM =
  "transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none";

/* ── The two diagrams ─────────────────────────────────────────────────────
 * Boxes and arrows in ordinary layout rather than one fixed drawing, so
 * they run across on a wide screen and down on a phone without shrinking
 * the words. Each is one image to a screen reader, described by `alt`. */

function Box({
  children,
  note,
  tone = "line",
}: {
  children: ReactNode;
  note?: string;
  tone?: "line" | "solid" | "dashed";
}) {
  return (
    <span
      className={`flex min-h-[4.125rem] flex-1 flex-col items-center justify-center gap-1 border px-3 py-2 text-center font-display text-sm leading-tight ${
        tone === "solid"
          ? "border-navy bg-navy text-white"
          : tone === "dashed"
            ? "border-dashed border-navy text-navy"
            : "border-navy text-navy"
      }`}
    >
      {children}
      {note ? (
        <span className={`text-[0.6875rem] ${tone === "solid" ? "text-white/70" : "text-slate"}`}>
          {note}
        </span>
      ) : null}
    </span>
  );
}

/** Points along the row on a wide screen, down the column on a phone. */
function Arrow() {
  return (
    <svg
      width="26"
      height="10"
      viewBox="0 0 26 10"
      fill="none"
      className="mx-auto shrink-0 rotate-90 text-navy lg:mx-0 lg:rotate-0"
    >
      <path d="M0 5h24M20 1.5 24.5 5 20 8.5" stroke="currentColor" />
    </svg>
  );
}

function Diagram({ block }: { block: Extract<ArticleBlock, { type: "diagram" }> }) {
  const row = "flex flex-col gap-2 lg:flex-row lg:items-center";
  return (
    <figure
      role="img"
      aria-label={block.alt}
      className={`my-3 flex flex-col gap-[1.125rem] border border-navy/14 bg-white px-5 pt-6 pb-5 lg:px-7 lg:pt-[1.875rem] lg:pb-6 ${
        block.name === "approval" ? TEXT : ""
      }`}
    >
      {block.title ? <p className={LABEL}>{block.title}</p> : null}
      {block.name === "approval" ? (
        <>
          <div className={row}>
            <Box>Drawings &amp; technical details</Box>
            <Arrow />
            <Box>Review</Box>
            <Arrow />
            <Box tone="solid">Approved</Box>
            <Arrow />
            <Box tone="dashed">Production</Box>
          </div>
          {/* The way back: under the first two boxes on a wide screen. */}
          <p className="border-t border-dashed border-navy/60 pt-2 font-display text-xs text-slate lg:w-[46%]">
            Client or architect feedback → revisions
          </p>
        </>
      ) : (
        <div className={row}>
          <Box note="Design department">Approved drawings</Box>
          <Arrow />
          <Box note="What the project requires" tone="solid">
            MTO + BOM
          </Box>
          <Arrow />
          <Box note="Checks available stock">Stores team</Box>
          <Arrow />
          <span className="grid flex-1 grid-cols-2 gap-2 lg:grid-cols-1">
            <Box note="Taken from stock">Available</Box>
            <Box note="Sourced by Purchase team" tone="dashed">
              Missing
            </Box>
          </span>
          <Arrow />
          <Box>Production</Box>
        </div>
      )}
    </figure>
  );
}

/** Stages to tap through: the photograph of the one chosen, with its name
 *  and sentence over its foot. A stage without a photograph shows its
 *  number on the blueprint ground. */
function Stages({ block }: { block: Extract<ArticleBlock, { type: "stages" }> }) {
  const [active, setActive] = useState(0);
  const count = block.items.length;
  const stage = block.items[active]!;
  return (
    <figure className="my-4">
      <div className="relative aspect-[7/6] overflow-hidden bg-navy sm:aspect-[46/25]">
        {block.items.map((item, index) => (
          <div
            key={item.label}
            aria-hidden={index === active ? undefined : true}
            className={`absolute inset-0 transition-opacity duration-[600ms] ease-out motion-reduce:transition-none ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.photo ? (
              <Picture photo={item.photo} sizes="(min-width: 64rem) 60vw, 100vw" />
            ) : (
              <span className="blueprint flex h-full items-center justify-center font-display text-[7.5rem] font-light tracking-[-0.04em] text-white/85">
                {two(index + 1)}
              </span>
            )}
          </div>
        ))}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[10.625rem] bg-linear-to-b from-navy/0 to-navy/82"
        />
        <p
          aria-live="polite"
          className="absolute inset-x-5 bottom-[1.375rem] flex flex-col gap-1.5 font-display text-white lg:inset-x-[1.625rem]"
        >
          <span className="text-[0.6875rem] font-semibold tracking-[0.16em] text-white/75 uppercase">
            Stage {two(active + 1)} / {two(count)}
          </span>
          <span className="text-[1.375rem] leading-[1.2] lg:text-[1.75rem]">{stage.label}</span>
          <span className="text-sm leading-[1.5] text-white/85 lg:text-[0.9375rem]">
            {stage.text}
          </span>
        </p>
      </div>
      <div
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        className="flex overflow-x-auto border-b border-navy/14 [scrollbar-width:none] lg:grid [&::-webkit-scrollbar]:hidden"
      >
        {block.items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setActive(index)}
            aria-pressed={index === active}
            className={`flex min-h-11 shrink-0 cursor-pointer flex-col gap-1 border-t-2 px-3 py-3 text-left font-display text-[0.8125rem] transition-colors duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-blue ${
              index === active
                ? "border-navy text-navy"
                : "border-transparent text-slate hover:text-navy"
            }`}
          >
            <span className={NUM}>{two(index + 1)}</span>
            {item.label}
          </button>
        ))}
      </div>
      <figcaption className={`${CAPTION} pt-2.5`}>{block.caption}</figcaption>
    </figure>
  );
}

function Block({
  block,
  heading,
}: {
  block: ArticleBlock;
  /** For a heading: its number and the id its contents entry links to. */
  heading: { n: number; id: string | undefined };
}) {
  switch (block.type) {
    case "lead":
      return (
        <p
          data-fx="words"
          className={`${TEXT} font-display text-[1.375rem] leading-[1.42] font-light text-navy lg:text-[1.6875rem]`}
        >
          {block.text}
        </p>
      );
    case "paragraph":
      return <p className={`${P} text-[#3a3f55]`}>{block.text}</p>;
    case "heading":
      return (
        <h2
          id={heading.id}
          className={`${TEXT} mt-5 flex items-baseline gap-3.5 font-display text-[1.625rem] leading-[1.15] tracking-[-0.015em] text-navy lg:mt-[1.375rem] lg:gap-[1.125rem] lg:text-[2.125rem]`}
        >
          <span
            aria-hidden="true"
            className="shrink-0 text-[0.8125rem] font-semibold tracking-[0.1em] text-slate"
          >
            {two(heading.n)}
          </span>
          {block.text}
        </h2>
      );
    case "callout":
      return (
        <p data-fx="words" className={`${P} border-l-2 border-navy pl-5 text-navy`}>
          {block.text}
        </p>
      );
    case "statement":
      return (
        <p
          data-fx="words"
          className={`${TEXT} my-2 border-t-2 border-b border-navy border-b-navy/14 pt-[1.625rem] pb-6 font-display text-[1.875rem] leading-[1.12] font-light tracking-[-0.02em] text-navy lg:my-[1.375rem] lg:pt-9 lg:pb-[2.125rem] lg:text-[2.875rem]`}
        >
          {/* The design's pale grey, darkened to 3:1 on the paper. */}
          {block.text} <span className="text-[#868f97]">{block.muted}</span>
        </p>
      );
    case "quote":
      return (
        <blockquote
          className={`${TEXT} my-2 border-t-2 border-navy pt-6 font-display text-[1.5rem] leading-[1.25] font-light tracking-[-0.01em] text-navy lg:pt-7 lg:text-[1.875rem]`}
        >
          “{block.text}”
        </blockquote>
      );
    case "closing":
      return (
        <p
          data-fx="words"
          className={`${TEXT} bg-navy p-6 font-display text-xl leading-[1.4] font-light text-white lg:px-[2.125rem] lg:py-8 lg:text-[1.5625rem]`}
        >
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className={`${P} list-disc pl-5 text-[#3a3f55]`}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "figures":
      return (
        <div className="my-2.5 grid gap-[1.625rem] lg:my-[1.375rem] lg:grid-cols-2 lg:gap-7">
          {block.items.map((item) => (
            <figure key={item.label} className="flex flex-col gap-2.5 lg:gap-3">
              <p className="flex items-center gap-3">
                <span className={LABEL}>{item.label}</span>
                <span aria-hidden="true" className="h-px flex-1 bg-navy/18" />
              </p>
              <div className="group aspect-[7/5] overflow-hidden bg-[#d5d5d5] lg:aspect-[446/520]">
                <Picture
                  photo={item.photo}
                  sizes="(min-width: 64rem) 30vw, 100vw"
                  className={ZOOM}
                />
              </div>
              <figcaption className={CAPTION}>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      );
    case "image":
      return (
        <figure className="my-3 flex flex-col gap-3 lg:my-[1.125rem]">
          <div className="group aspect-[7/5] overflow-hidden bg-[#d5d5d5] lg:aspect-[2/1]">
            <Picture photo={block.photo} sizes="(min-width: 64rem) 60vw, 100vw" className={ZOOM} />
          </div>
          {block.caption ? <figcaption className={CAPTION}>{block.caption}</figcaption> : null}
        </figure>
      );
    case "checks":
      return (
        <ul
          className={`my-1 grid grid-cols-2 gap-2 lg:gap-2.5 ${
            block.items.length % 5 === 0 ? "lg:grid-cols-5" : "lg:grid-cols-4"
          }`}
        >
          {block.items.map((item, index) => (
            <li
              key={item}
              className="flex min-h-[5.375rem] flex-col justify-between gap-3 border border-navy/14 px-3 py-3.5 transition-colors duration-300 hover:border-navy hover:bg-white lg:min-h-28 lg:px-4 lg:py-[1.125rem]"
            >
              <span aria-hidden="true" className={NUM}>
                {two(index + 1)}
              </span>
              <span className="font-display text-sm leading-[1.35] text-navy lg:text-[0.9375rem]">
                {item}
              </span>
            </li>
          ))}
        </ul>
      );
    case "cards":
      return (
        <ol className="my-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2.5">
          {block.items.map((item, index) => (
            <li
              key={item.title}
              className="flex flex-col justify-between gap-4 border border-navy/14 px-[1.125rem] py-[1.125rem] transition-colors duration-300 hover:border-navy hover:bg-white lg:min-h-[9.375rem] lg:py-5"
            >
              <span aria-hidden="true" className={NUM}>
                {two(index + 1)}
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="font-display text-[1.0625rem] leading-[1.25] font-medium text-navy">
                  {item.title}
                </span>
                <span className="font-display text-sm leading-[1.5] text-slate">{item.body}</span>
              </span>
            </li>
          ))}
        </ol>
      );
    case "steps":
      // Across, on a line through the squares, from `lg`; down the page
      // beside a line on a phone.
      return (
        <div
          style={{ "--last": `calc(${100 / block.items.length}% - 0.5rem)` } as React.CSSProperties}
          className="relative my-1.5 border-y border-navy/14 py-2 pl-7 lg:my-3.5 lg:pt-[1.625rem] lg:pb-[1.375rem] lg:pl-0"
        >
          <span
            aria-hidden="true"
            className="absolute top-[1.625rem] bottom-[1.625rem] left-2 w-px bg-navy/30 lg:top-[3.8125rem] lg:right-[var(--last)] lg:bottom-auto lg:left-[0.3125rem] lg:h-px lg:w-auto lg:bg-navy"
          />
          <ol
            style={{ gridTemplateColumns: `repeat(${block.items.length}, minmax(0, 1fr))` }}
            className="lg:grid lg:gap-x-1.5"
          >
            {block.items.map((item, index) => (
              <li
                key={item}
                className="relative flex items-baseline gap-3.5 py-[0.5625rem] lg:flex-col lg:items-start lg:gap-3 lg:py-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-[0.9375rem] -left-[1.5625rem] size-[9px] bg-navy lg:hidden"
                />
                <span
                  aria-hidden="true"
                  className="w-[1.375rem] font-display text-[0.6875rem] font-semibold text-slate lg:w-auto lg:text-xs lg:tracking-[0.08em]"
                >
                  {two(index + 1)}
                </span>
                <span
                  aria-hidden="true"
                  className="relative z-[1] hidden size-[11px] bg-navy lg:block"
                />
                <span className="font-display text-base text-navy lg:text-[0.6875rem] lg:leading-[1.5] lg:font-semibold lg:tracking-[0.06em] lg:uppercase">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "ticks":
      return (
        <ul className={`${TEXT} my-1 border-t border-navy`}>
          {block.items.map((item) => (
            <li key={item} className="flex items-center gap-4 border-b border-navy/12 py-4">
              <span className="flex size-[1.625rem] shrink-0 items-center justify-center bg-navy">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6.5l2.6 2.5L10 3.5" stroke="#fff" strokeWidth="1.6" />
                </svg>
              </span>
              <span className="font-display text-lg font-light text-navy lg:text-[1.3125rem]">
                {item}
              </span>
            </li>
          ))}
        </ul>
      );
    case "split":
      return (
        <div className="my-2.5 grid items-center gap-6 lg:grid-cols-[minmax(0,380fr)_minmax(0,492fr)] lg:gap-12">
          <figure className="flex flex-col gap-2.5">
            <div className="aspect-[4/3] overflow-hidden bg-[#e6e6e3] lg:aspect-[19/23]">
              <Picture photo={block.photo} sizes="(min-width: 64rem) 26vw, 100vw" />
            </div>
            <figcaption className={CAPTION}>{block.caption}</figcaption>
          </figure>
          <div className="flex flex-col gap-3.5">
            <p className={`${P} text-[#3a3f55]`}>{block.intro}</p>
            <ol className="border-t border-navy">
              {block.items.map((item, index) => (
                <li
                  key={item}
                  className="flex items-baseline gap-4 border-b border-navy/12 py-[0.8125rem]"
                >
                  <span aria-hidden="true" className={`${NUM} w-[1.375rem]`}>
                    {two(index + 1)}
                  </span>
                  <span className="font-display text-lg text-navy">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      );
    case "bars":
      return (
        <figure
          className={`${TEXT} my-2.5 flex flex-col gap-[1.375rem] border border-navy/14 bg-white px-5 pt-6 pb-[1.375rem] lg:px-7 lg:pt-7`}
        >
          <figcaption className={LABEL}>{block.title}</figcaption>
          {block.rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-2.5">
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-display text-[0.9375rem] text-navy">{row.label}</span>
                <span className="font-display text-xs font-semibold tracking-[0.1em] whitespace-nowrap text-slate uppercase">
                  {row.value}
                </span>
              </p>
              <span aria-hidden="true" className="relative block h-3.5 bg-navy/6">
                <span
                  style={{ scale: `${row.share} 1` }}
                  className="absolute inset-0 origin-left bg-navy"
                />
              </span>
            </div>
          ))}
          <p aria-hidden="true" className="relative h-4 border-t border-navy/14 pt-2">
            {block.ticks.map((tick, index) => {
              const last = block.ticks.length - 1;
              return (
                <span
                  key={tick}
                  style={{ left: `${(index / last) * 100}%` }}
                  className={`absolute font-display text-[0.6875rem] whitespace-nowrap text-slate ${
                    index === 0 ? "" : index === last ? "-translate-x-full" : "-translate-x-1/2"
                  }`}
                >
                  {tick}
                </span>
              );
            })}
          </p>
        </figure>
      );
    case "diagram":
      return <Diagram block={block} />;
    case "stages":
      return <Stages block={block} />;
    case "video":
      return null;
  }
}

/** A heading's place in the contents: "what-makes-glazing-premium". */
export const headingId = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function SeriesBody({ blocks }: { blocks: readonly ArticleBlock[] }) {
  let headings = 0;
  return (
    <div className="flex min-w-0 flex-col gap-[1.125rem] lg:gap-[1.375rem]">
      {blocks.map((block, index) => {
        const heading =
          block.type === "heading"
            ? { n: ++headings, id: headingId(block.text) }
            : { n: 0, id: undefined };
        return <Block key={index} block={block} heading={heading} />;
      })}
    </div>
  );
}
