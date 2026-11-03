import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { imageOf } from "@/content/render";
import { formatDate, type ArticleCard } from "@/content/select";
import type { ArticleSeries, InsightsPage } from "@/content/types";
import { ArrowLeft, ArrowRight } from "../ui";
import { two } from "./seriesBlocks";

export type SeriesIndexPart = ArticleCard & { series: ArticleSeries; headings: string[] };

/* A project's stages, enquiry to handover: the line the series is set out
 * along. A part sits at `series.at` (0 to 1) of the way. */
const STAGES = [
  "Enquiry",
  "Feasibility",
  "Mock-Up",
  "Scope & Quotation",
  "Engineering",
  "Procurement",
  "Production",
  "Installation",
  "Inspection & Handover",
];
const SERIES_NAME = "The Premium Glazing Series";
/** The part still to come: it has a place on the line and a row in the
 *  list, and nothing to read yet. */
const NEXT = {
  stage: "Installation",
  title: "From the factory floor to the site",
  excerpt:
    "Where design, engineering and manufacturing finally come together in the finished building.",
};

const EYEBROW = "font-display text-xs font-semibold tracking-[0.16em] uppercase";
const SQUARE =
  "flex size-12 cursor-pointer items-center justify-center border border-navy/30 text-navy transition-colors duration-300 hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";

/** The cover as a tile: a photograph, or a drawing on the blueprint ground. */
function Cover({
  part,
  sizes,
  className = "",
}: {
  part: SeriesIndexPart;
  sizes: string;
  className?: string;
}) {
  const drawing = part.series.opening === "drawing";
  return (
    <span
      className={`absolute inset-0 ${drawing ? "blueprint flex items-center justify-center" : ""}`}
    >
      <img
        draggable={false}
        {...imageOf(part.cover.image)}
        alt=""
        sizes={sizes}
        loading="lazy"
        decoding="async"
        // A drawing sits on the blueprint, so it takes no colour behind it.
        style={
          drawing
            ? undefined
            : { ...imageOf(part.cover.image).style, objectPosition: part.series.focus }
        }
        className={`${drawing ? "h-auto w-[92%]" : "h-full w-full object-cover"} ${className}`}
      />
    </span>
  );
}

/**
 * The Insights page while the series is running: what the series is, the
 * factory it is written from, the parts set out along a project's stages
 * with one of them opened up beside its picture, and the parts in order.
 */
export function SeriesIndex({
  content,
  parts,
}: {
  content: InsightsPage["intro"];
  parts: readonly SeriesIndexPart[];
}) {
  // Opens on the newest part.
  const [selected, setSelected] = useState(parts.length - 1);
  const count = parts.length;
  const part = parts[selected]!;
  const go = (index: number) => setSelected((index + count) % count);
  const nextAt = STAGES.indexOf(NEXT.stage) / (STAGES.length - 1);
  const [first = "", second = ""] = content.title.split(/ (?=\S+ \S+$)/);

  return (
    <div className="bg-[#fdfdfb] font-display text-navy">
      <section className="shell grid grid-cols-1 items-end gap-6 pt-[calc(var(--header-h)+2rem)] lg:grid-cols-12 lg:gap-x-6 lg:pt-[calc(var(--header-h)+6rem)]">
        <h1 className="text-[2.75rem] leading-[1.02] font-light tracking-[-0.03em] text-balance lg:col-span-7 lg:text-[5.5rem]">
          {second ? (
            <>
              {first} <br className="max-lg:hidden" />
              {second}
            </>
          ) : (
            content.title
          )}
        </h1>
        <div className="flex flex-col gap-5 lg:col-span-4 lg:col-start-9">
          <p data-fx="words" className="text-base leading-[1.6] text-slate lg:text-[1.0625rem]">
            {content.lede}
          </p>
          <div className="flex flex-col gap-1.5 border-t border-navy/14 pt-4">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase">
              Now publishing — {SERIES_NAME}
            </p>
            <p className="text-sm leading-[1.55] text-slate">
              One glazing system, followed from the first enquiry to handover — a stage at a time.
            </p>
          </div>
        </div>
      </section>

      <figure className="shell mt-10 flex flex-col gap-3 lg:mt-[4.5rem]">
        <div className="relative h-56 overflow-hidden bg-navy sm:h-80 lg:h-[26.25rem]">
          <img
            draggable={false}
            {...imageOf({ kind: "asset", key: "insightsBanner" })}
            alt="Assembly tables and stacked aluminium profiles on Durall’s factory floor, a frame standing on one table"
            sizes="100vw"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <figcaption className="flex flex-wrap justify-between gap-x-6 gap-y-1 text-[0.8125rem] text-slate">
          <span>Durall’s fabrication hall</span>
          <span>Where every part of this series takes place</span>
        </figcaption>
      </figure>

      {/* The parts on the project's line. The line scrolls sideways on a
          phone, where nine stages do not fit across. */}
      <section aria-labelledby="route-heading" className="shell mt-14 lg:mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="route-heading" className={EYEBROW}>
            The series, stage by stage
          </h2>
          <p className="text-[0.8125rem] text-slate">Select a part to preview it</p>
        </div>
        <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="relative mx-[1.375rem] mt-2 h-[10.25rem] min-w-[52rem]">
            <span aria-hidden="true" className="absolute inset-x-0 top-24 h-px bg-navy/16" />
            <span
              aria-hidden="true"
              style={{ scale: `${part.series.at} 1` }}
              className="absolute inset-x-0 top-[5.9375rem] h-[3px] origin-left bg-navy transition-[scale] duration-[800ms] ease-[cubic-bezier(.65,0,.25,1)] motion-reduce:transition-none"
            />
            {STAGES.map((stage, index) => {
              const x = index / (STAGES.length - 1);
              const reached = x <= part.series.at;
              return (
                <span key={stage} aria-hidden="true">
                  <span
                    style={{ left: `${x * 100}%` }}
                    className={`absolute top-[5.75rem] size-[9px] -translate-x-1/2 border transition-colors duration-300 ${
                      reached ? "border-navy bg-navy" : "border-navy/30 bg-[#fdfdfb]"
                    }`}
                  />
                  <span
                    style={{ left: `${x * 100}%` }}
                    className={`absolute top-[7.625rem] w-24 text-[0.6875rem] leading-[1.6] font-semibold tracking-[0.06em] uppercase ${
                      index === 0
                        ? "-translate-x-[1.375rem] text-left"
                        : index === STAGES.length - 1
                          ? "-translate-x-[calc(100%-1.375rem)] text-right"
                          : "-translate-x-1/2 text-center"
                    } ${reached ? "text-navy" : "text-slate"}`}
                  >
                    {stage}
                  </span>
                </span>
              );
            })}
            {parts.map((item, index) => {
              const on = index === selected;
              return (
                <span key={item.slug}>
                  <span
                    aria-hidden="true"
                    style={{ left: `${item.series.at * 100}%` }}
                    className={`absolute top-11 h-12 w-px ${on ? "bg-navy" : "bg-navy/30"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setSelected(index)}
                    aria-pressed={on}
                    aria-label={`Part ${two(item.series.part)}: ${item.title.split(":")[0]}`}
                    style={{ left: `${item.series.at * 100}%` }}
                    className={`absolute top-0 flex size-11 -translate-x-1/2 cursor-pointer items-center justify-center border text-[0.8125rem] font-semibold transition-colors duration-300 hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue ${
                      on
                        ? "border-navy bg-navy text-white"
                        : "border-navy/30 bg-[#fdfdfb] text-navy"
                    }`}
                  >
                    {two(item.series.part)}
                  </button>
                </span>
              );
            })}
            <span aria-hidden="true">
              <span
                style={{ left: `${nextAt * 100}%` }}
                className="absolute top-11 h-12 w-px bg-navy/20"
              />
              <span
                style={{ left: `${nextAt * 100}%` }}
                className="absolute top-0 flex size-11 -translate-x-1/2 items-center justify-center border border-dashed border-navy/35 text-[0.8125rem] font-semibold text-slate"
              >
                {two(count + 1)}
              </span>
              <span
                style={{ left: `calc(${nextAt * 100}% + 2rem)` }}
                className="absolute top-[0.9375rem] text-[0.6875rem] font-semibold tracking-[0.12em] text-slate uppercase"
              >
                Next
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* The part chosen, opened up. */}
      <section
        aria-label="Selected part"
        className="shell mt-10 grid items-start gap-8 lg:mt-16 lg:grid-cols-[minmax(0,720fr)_minmax(0,488fr)] lg:gap-x-[4.5rem]"
      >
        <div className="flex flex-col gap-3.5">
          <div className="relative aspect-[7/5] lg:aspect-[18/13]">
            <span
              aria-hidden="true"
              className="absolute -top-3.5 -left-3.5 hidden h-full w-full border border-navy/22 lg:block"
            />
            <div className="absolute inset-0 overflow-hidden bg-[#d5d5d5]">
              {parts.map((item, index) => (
                <span
                  key={item.slug}
                  className={`absolute inset-0 transition-opacity duration-[800ms] ease-out motion-reduce:transition-none ${
                    index === selected ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Cover
                    part={item}
                    sizes="(min-width: 64rem) 55vw, 100vw"
                    className={`transition-transform duration-[1600ms] ease-out motion-reduce:transition-none ${
                      index === selected || item.series.opening === "drawing" ? "" : "scale-[1.06]"
                    }`}
                  />
                </span>
              ))}
              <span className="absolute top-5 left-5 bg-navy/72 px-3 py-2 text-[0.6875rem] font-semibold tracking-[0.14em] text-white uppercase">
                Part {two(part.series.part)} — {part.series.kicker}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate">{part.series.caption}</p>
        </div>

        <div className="flex flex-col gap-[1.625rem] lg:min-h-[35rem]">
          <div
            key={part.slug}
            aria-live="polite"
            className="label-roll flex flex-col gap-[1.375rem]"
          >
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.14em] text-slate uppercase">
              <span className="text-navy">Part {two(part.series.part)}</span>
              <span aria-hidden="true" className="h-px w-6 bg-navy/30" />
              {formatDate(part.publishedAt)}
              <span aria-hidden="true">·</span>
              {part.readingTime}
            </p>
            <h3 className="text-[1.75rem] leading-[1.12] tracking-[-0.015em] lg:text-[2.375rem]">
              {part.title}
            </h3>
            <p className="text-base leading-[1.6] text-slate lg:text-[1.0625rem]">{part.excerpt}</p>
            <p className="flex gap-[1.125rem]">
              <span aria-hidden="true" className="w-0.5 shrink-0 bg-navy" />
              <span className="text-lg leading-[1.45] lg:text-[1.1875rem]">
                “{part.series.pull}”
              </span>
            </p>
            <div className="flex flex-col gap-2.5">
              <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-slate uppercase">
                In this part
              </p>
              <ol className="border-t border-navy/10">
                {part.headings.map((heading, index) => (
                  <li
                    key={heading}
                    className="flex gap-4 border-b border-navy/10 py-[0.5625rem] text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="w-5 shrink-0 text-xs font-semibold text-slate"
                    >
                      {two(index + 1)}
                    </span>
                    {heading}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/insights/$slug"
              params={{ slug: part.slug }}
              className="group hover-lift inline-flex h-[3.375rem] items-center gap-3.5 bg-navy px-6 text-[0.8125rem] font-semibold tracking-[0.12em] text-white uppercase hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
            >
              Read part {two(part.series.part)}
              <ArrowRight className="hover-arrow h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <p
                aria-hidden="true"
                className="mr-2 text-[0.8125rem] font-semibold tracking-[0.06em]"
              >
                {two(part.series.part)} <span className="text-slate">/ {two(count)}</span>
              </p>
              <button
                type="button"
                onClick={() => go(selected - 1)}
                aria-label="Previous part"
                className={SQUARE}
              >
                <ArrowLeft />
              </button>
              <button
                type="button"
                onClick={() => go(selected + 1)}
                aria-label="Next part"
                className={SQUARE}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Every part, in order. */}
      <section aria-labelledby="all-parts-heading" className="shell mt-20 lg:mt-[8.5rem]">
        <div className="grid grid-cols-1 items-end gap-5 lg:grid-cols-12 lg:gap-x-6">
          <h2
            id="all-parts-heading"
            className="text-[2.125rem] leading-[1.05] font-light tracking-[-0.02em] lg:col-span-6 lg:text-[3.25rem]"
          >
            Read the series <br />
            {/* The design's pale grey, darkened to 3:1 on the paper. */}
            <span className="text-[#868f97]">in order.</span>
          </h2>
          <p className="text-base leading-[1.6] text-slate lg:col-span-4 lg:col-start-9">
            Each part picks up where the last one stopped — from what “premium” really means,
            through design and materials, to the factory floor.
          </p>
        </div>
        <ol className="mt-10 border-t border-navy lg:mt-12">
          {parts.map((item) => (
            <li key={item.slug}>
              <Link
                to="/insights/$slug"
                params={{ slug: item.slug }}
                className="group grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-navy/12 py-5 text-navy transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-blue lg:grid-cols-[4.5rem_13.5rem_minmax(0,1fr)_12.5rem_9.375rem_3rem] lg:gap-x-7 lg:py-[1.375rem]"
              >
                <span
                  aria-hidden="true"
                  className="text-2xl font-light tracking-[-0.02em] lg:text-[2rem]"
                >
                  {two(item.series.part)}
                </span>
                <span className="relative block aspect-[27/17] overflow-hidden bg-navy max-lg:col-start-2 max-lg:max-w-[13.5rem] lg:h-[8.5rem]">
                  <Cover
                    part={item}
                    sizes="14rem"
                    className="transition-transform duration-1000 ease-out group-hover:scale-[1.07] motion-reduce:transition-none"
                  />
                </span>
                <span className="flex flex-col gap-2 max-lg:col-start-2">
                  <span className="text-lg leading-[1.25] tracking-[-0.005em] lg:text-[1.375rem]">
                    {item.title}
                  </span>
                  <span className="max-w-[35rem] text-sm leading-[1.55] text-slate">
                    {item.excerpt}
                  </span>
                </span>
                <span className="flex flex-col gap-1.5 text-[0.6875rem] font-semibold tracking-[0.14em] text-slate uppercase max-lg:col-start-2">
                  Stage
                  <span className="text-[0.8125rem] font-medium tracking-[0.04em] text-navy normal-case">
                    {item.series.kicker}
                  </span>
                </span>
                <span className="flex gap-x-3 text-[0.8125rem] text-slate max-lg:col-start-2 lg:flex-col lg:gap-1.5">
                  <span className="text-navy">{formatDate(item.publishedAt)}</span>
                  {item.readingTime}
                </span>
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center border border-navy/30 transition-colors duration-300 group-hover:border-navy group-hover:bg-navy group-hover:text-white max-lg:hidden"
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
          <li className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-navy/12 py-5 text-slate lg:grid-cols-[4.5rem_13.5rem_minmax(0,1fr)_12.5rem_9.375rem_3rem] lg:gap-x-7 lg:py-[1.375rem]">
            <span
              aria-hidden="true"
              className="text-2xl font-light tracking-[-0.02em] lg:text-[2rem]"
            >
              {two(count + 1)}
            </span>
            <span className="flex aspect-[27/17] items-center justify-center border border-dashed border-navy/30 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase max-lg:col-start-2 max-lg:max-w-[13.5rem] lg:h-[8.5rem]">
              In preparation
            </span>
            <span className="flex flex-col gap-2 max-lg:col-start-2">
              <span className="text-lg leading-[1.25] lg:text-[1.375rem]">{NEXT.title}</span>
              <span className="max-w-[35rem] text-sm leading-[1.55]">{NEXT.excerpt}</span>
            </span>
            <span className="flex flex-col gap-1.5 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase max-lg:col-start-2">
              Stage
              <span className="text-[0.8125rem] font-medium tracking-[0.04em] normal-case">
                {NEXT.stage}
              </span>
            </span>
            <span className="text-[0.8125rem] max-lg:col-start-2">Coming soon</span>
          </li>
        </ol>
      </section>

      <section className="blueprint mt-20 py-20 text-white lg:mt-[8.5rem] lg:py-32">
        <div className="shell flex flex-col gap-7 lg:gap-9">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase">
            From part 01
          </p>
          <p className="max-w-[66.25rem] text-[2.25rem] leading-[1.08] font-light tracking-[-0.025em] lg:text-[4rem]">
            Because great glazing is rarely{" "}
            <span className="text-white/50">just what you see.</span>
          </p>
          <span aria-hidden="true" className="h-0.5 w-14 bg-white" />
        </div>
      </section>
    </div>
  );
}
