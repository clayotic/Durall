import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { imageOf } from "@/content/render";
import { formatDate, type ArticleCard } from "@/content/select";
import type { ArticleBlock, ArticleSeries, Photo } from "@/content/types";
import { ArrowLeft, ArrowRight } from "../ui";
import { headingId, SeriesBody, two } from "./seriesBlocks";

/** A part as the foot of another part's page needs it. */
export type SeriesPart = {
  slug: string;
  title: string;
  part: number;
  cover: Photo;
  opening: ArticleSeries["opening"];
};

type Article = ArticleCard & { body: ArticleBlock[]; series: ArticleSeries };

const EYEBROW = "font-display text-[0.6875rem] font-semibold tracking-[0.16em] uppercase";
const SERIES_NAME = "The Premium Glazing Series";

/** "Where this sits in a project": enquiry at one end, handover at the
 *  other, filled as far as this part's stage. */
function ProjectRail({ at, stage }: { at: number; stage: string }) {
  const mid = at > 0 && at < 1;
  return (
    <div className="flex flex-col gap-2 border-t border-navy/14 pt-3.5 lg:gap-2.5">
      <p className="font-display text-[0.625rem] font-semibold tracking-[0.14em] text-slate uppercase lg:text-[0.6875rem]">
        Where this sits in a project
      </p>
      <div
        role="img"
        aria-label={`${stage}, between enquiry and handover`}
        className="relative h-[3.75rem] w-full max-w-[32.5rem]"
      >
        <span className="absolute inset-x-0 top-[19px] h-px bg-navy/18" />
        <span
          style={{ width: `${at * 100}%` }}
          className="absolute top-[18px] left-0 h-[3px] bg-navy"
        />
        {Array.from({ length: 9 }, (_, index) => index / 8).map((x) =>
          x === at ? null : (
            <span
              key={x}
              style={{ left: `${x * 100}%` }}
              className="absolute top-[15px] size-2 -translate-x-1/2 border border-navy/30 bg-[#fdfdfb]"
            />
          ),
        )}
        <span
          style={{ left: `${at * 100}%` }}
          className="absolute top-[13px] size-3 -translate-x-1/2 rotate-45 bg-navy"
        />
        <span
          className={`absolute top-10 left-0 font-display text-[0.625rem] font-semibold tracking-[0.12em] uppercase ${
            at === 0 ? "text-navy" : "text-slate"
          }`}
        >
          Enquiry
        </span>
        {mid ? (
          <span
            style={{ left: `${at * 100}%` }}
            className="absolute top-10 -translate-x-1/2 bg-[#fdfdfb] px-1 font-display text-[0.625rem] font-semibold tracking-[0.12em] text-navy uppercase"
          >
            {stage}
          </span>
        ) : null}
        <span className="absolute top-10 right-0 font-display text-[0.625rem] font-semibold tracking-[0.12em] text-slate uppercase">
          Handover
        </span>
      </div>
    </div>
  );
}

/** The part's own contents, the entry being read marked as the page moves:
 *  the last heading to have passed two-fifths of the way down the window. */
function useReading(ids: readonly string[]) {
  const [reading, setReading] = useState(ids[0] ?? "");
  const key = ids.join(" ");
  useEffect(() => {
    const headings = key.split(" ").flatMap((id) => document.getElementById(id) ?? []);
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= line);
      setReading((passed.at(-1) ?? headings[0])?.id ?? "");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [key]);
  return reading;
}

function Share({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("");
  useEffect(() => setAddress(window.location.href), []);
  const item =
    "inline-flex h-10 cursor-pointer items-center border border-navy/20 px-3.5 font-display text-[0.8125rem] text-navy transition-colors duration-300 hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";
  return (
    <div className="flex flex-col gap-3">
      <p className={`${EYEBROW} text-navy`}>Share</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={item}
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
        </button>
        <a
          className={item}
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <a
          className={item}
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(address)}`}
        >
          Email
        </a>
      </div>
    </div>
  );
}

/** One of the two tiles at the foot: the part before or the part after. */
function PartTile({ part, next }: { part: SeriesPart; next: boolean }) {
  const image = imageOf(part.cover.image);
  return (
    <Link
      to="/insights/$slug"
      params={{ slug: part.slug }}
      className={`group flex flex-col gap-[1.125rem] text-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-blue ${
        next ? "lg:items-end lg:text-right" : ""
      }`}
    >
      <span
        className={`relative block aspect-[7/4] w-full overflow-hidden lg:aspect-auto lg:h-[18.75rem] ${
          part.opening === "drawing" ? "blueprint flex items-center justify-center" : "bg-[#d5d5d5]"
        }`}
      >
        <img
          draggable={false}
          {...image}
          alt=""
          sizes="(min-width: 64rem) 45vw, 100vw"
          loading="lazy"
          decoding="async"
          className={`transition-transform duration-[1200ms] ease-out group-hover:scale-105 motion-reduce:transition-none ${
            part.opening === "drawing" ? "h-auto w-[88%]" : "h-full w-full object-cover"
          }`}
        />
      </span>
      <span className={`${EYEBROW} flex items-center gap-2.5 text-slate`}>
        {next ? null : <ArrowLeft className="h-3.5 w-3.5" />}
        {next ? "Next" : "Previous"} · Part {two(part.part)}
        {next ? <ArrowRight className="h-3.5 w-3.5" /> : null}
      </span>
      <span className="max-w-[34rem] font-display text-xl leading-[1.25] tracking-[-0.01em] lg:text-2xl">
        {part.title}
      </span>
    </Link>
  );
}

/**
 * One part of the Premium Glazing Series: the opening (title in two tones,
 * when it was published, where the part sits in a project, and its picture),
 * the part's contents beside the text, the text itself as laid-out blocks
 * (seriesBlocks.tsx), and the way on to the parts either side.
 *
 * The opening is set one of two ways: beside a tall framed photograph, or,
 * where the part's picture is a drawing, above it at full width on the
 * blueprint ground.
 */
export function SeriesArticle({
  article,
  parts,
}: {
  article: Article;
  parts: readonly SeriesPart[];
}) {
  const { series } = article;
  const drawing = series.opening === "drawing";
  const [lead, rest = ""] = article.title.split(/:(.*)/s);
  const headings = article.body.flatMap((block) => (block.type === "heading" ? [block.text] : []));
  const ids = headings.map(headingId);
  const reading = useReading(ids);
  const before = parts.find((part) => part.part === series.part - 1);
  const after = parts.find((part) => part.part === series.part + 1);
  const cover = imageOf(article.cover.image);
  const of = `Part ${two(series.part)} of ${two(parts.length)}`;

  const crumbs = (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap gap-x-2.5 gap-y-1 font-display text-[0.8125rem] text-slate"
    >
      <Link to="/insights" className="hover:text-navy">
        Insights
      </Link>
      <span aria-hidden="true">/</span>
      <span className="max-lg:hidden">{SERIES_NAME}</span>
      <span aria-hidden="true" className="max-lg:hidden">
        /
      </span>
      <span aria-current="page" className="text-navy">
        Part {two(series.part)}
      </span>
    </nav>
  );

  const title = (
    <>
      <p className={`${EYEBROW} flex items-center gap-3 text-slate lg:gap-3.5 lg:text-xs`}>
        <span className="text-navy">Part {two(series.part)}</span>
        <span aria-hidden="true" className="h-px w-6 bg-navy/35 lg:w-8" />
        {series.kicker}
      </p>
      <h1
        className={`font-display text-[2.125rem] leading-[1.06] font-light tracking-[-0.025em] text-navy ${
          drawing ? "lg:text-[4rem]" : "lg:text-[3.375rem]"
        }`}
      >
        {/* The design's pale grey, darkened to 3:1 on the paper. */}
        {rest ? `${lead}:` : lead}{" "}
        {rest ? <span className="text-[#868f97]">{rest.trim()}</span> : null}
      </h1>
      <p className="max-w-[38.75rem] font-display text-base leading-[1.6] text-slate lg:text-lg">
        {article.excerpt}
      </p>
    </>
  );

  const facts = (
    <div className="flex flex-col">
      {/* A phone has them on one line; from `lg` they are three columns. */}
      <p className="flex flex-wrap gap-x-3.5 gap-y-1 pb-4 font-display text-[0.8125rem] text-slate lg:hidden">
        <span className="text-navy">{formatDate(article.publishedAt)}</span>
        <span aria-hidden="true">·</span>
        {article.readingTime}
        <span aria-hidden="true">·</span>
        {of}
      </p>
      <dl className="grid grid-cols-3 border-t border-navy/14 max-lg:hidden">
        {(
          [
            ["Published", formatDate(article.publishedAt)],
            ["Reading time", article.readingTime],
            ["Series", of],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 py-3.5">
            <dt className="font-display text-[0.6875rem] font-semibold tracking-[0.14em] text-slate uppercase">
              {label}
            </dt>
            <dd className="font-display text-[0.9375rem] text-navy">{value}</dd>
          </div>
        ))}
      </dl>
      <ProjectRail at={series.at} stage={series.stage} />
    </div>
  );

  const picture = (
    <img
      draggable={false}
      {...cover}
      alt={article.cover.alt}
      sizes={drawing ? "90vw" : "(min-width: 64rem) 45vw, 100vw"}
      fetchPriority="high"
      decoding="async"
      style={drawing ? undefined : { objectPosition: series.focus }}
      className={drawing ? "h-auto w-[92%] max-w-[71.25rem]" : "h-full w-full object-cover"}
    />
  );
  const caption = (
    <figcaption className="font-display text-xs leading-[1.5] text-slate max-lg:px-5 lg:text-[0.8125rem]">
      {series.caption}
    </figcaption>
  );

  return (
    <article className="bg-[#fdfdfb] font-display text-navy">
      <header className="pt-[calc(var(--header-h)+1.75rem)] lg:pt-[calc(var(--header-h)+3.5rem)]">
        {drawing ? (
          <>
            <div className="shell flex flex-col gap-[1.125rem] lg:gap-7">
              {crumbs}
              <div className="grid gap-[1.125rem] lg:grid-cols-[minmax(0,700fr)_minmax(0,520fr)] lg:items-end lg:gap-x-[3.75rem]">
                <div className="flex flex-col gap-[1.125rem] lg:gap-[1.625rem]">{title}</div>
                {facts}
              </div>
            </div>
            <figure className="mt-6 flex flex-col gap-2.5 lg:shell lg:mt-14 lg:gap-3.5">
              <div className="blueprint relative flex h-56 items-center justify-center overflow-hidden sm:h-80 lg:h-[30rem]">
                {picture}
                {series.openingLabel ? (
                  <span className="absolute top-4 left-5 font-display text-[0.6875rem] font-semibold tracking-[0.16em] text-white/70 uppercase lg:top-[1.375rem] lg:left-6">
                    {series.openingLabel}
                  </span>
                ) : null}
                {series.openingNote ? (
                  <span className="absolute right-5 bottom-4 font-display text-[0.6875rem] tracking-[0.08em] text-white/55 lg:right-6 lg:bottom-5">
                    {series.openingNote}
                  </span>
                ) : null}
              </div>
              {caption}
            </figure>
          </>
        ) : (
          <div className="grid lg:shell lg:grid-cols-[minmax(0,560fr)_minmax(0,640fr)] lg:items-stretch lg:gap-x-[clamp(2.5rem,5.5vw,5rem)]">
            <div className="flex flex-col justify-between gap-[1.125rem] max-lg:px-5 lg:gap-10">
              <div className="flex flex-col gap-[1.125rem] lg:gap-7">
                {crumbs}
                {title}
              </div>
              {facts}
            </div>
            <figure className="mt-6 flex flex-col gap-2.5 lg:mt-4 lg:gap-3">
              <div className="relative aspect-[39/46] lg:aspect-[4/5]">
                {/* The hairline frame, set up and to the right of the photograph. */}
                <span
                  aria-hidden="true"
                  className="absolute -top-4 left-4 hidden h-full w-full border border-navy/22 lg:block"
                />
                <div className="absolute inset-0 overflow-hidden bg-[#d5d5d5]">{picture}</div>
              </div>
              {caption}
            </figure>
          </div>
        )}
      </header>

      {/* A phone has the contents as a fold above the text. */}
      {headings.length ? (
        <details className="group mx-5 mt-7 border-t border-b border-navy border-b-navy/14 lg:hidden">
          <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between font-display text-xs font-semibold tracking-[0.14em] text-navy uppercase [&::-webkit-details-marker]:hidden">
            In this part · {headings.length} sections
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-300 group-open:rotate-180"
            >
              <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </summary>
          <ol className="pb-3">
            {headings.map((heading, index) => (
              <li key={heading}>
                <a
                  href={`#${ids[index]}`}
                  className="flex min-h-10 items-center gap-3 font-display text-[0.9375rem] text-navy"
                >
                  <span
                    aria-hidden="true"
                    className="w-5 text-[0.6875rem] font-semibold text-slate"
                  >
                    {two(index + 1)}
                  </span>
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      <div className="shell mt-8 grid items-start lg:mt-24 lg:grid-cols-[minmax(0,280fr)_minmax(0,920fr)] lg:gap-x-[clamp(2.5rem,5.5vw,5rem)]">
        <aside className="sticky top-[calc(var(--header-h)+2rem)] flex flex-col gap-9 max-lg:hidden">
          {headings.length ? (
            <nav aria-label="In this part" className="flex flex-col gap-3.5">
              <p className={`${EYEBROW} text-navy`}>In this part</p>
              <ol className="border-l border-navy/14">
                {headings.map((heading, index) => {
                  const on = ids[index] === reading;
                  return (
                    <li key={heading} className="relative">
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-0 -left-0.5 w-[3px] transition-colors duration-300 ${
                          on ? "bg-navy" : "bg-transparent"
                        }`}
                      />
                      <a
                        href={`#${ids[index]}`}
                        aria-current={on ? "location" : undefined}
                        className={`flex items-baseline gap-2.5 py-[0.5625rem] pl-[1.125rem] font-display text-sm leading-[1.4] transition-colors duration-300 hover:text-navy ${
                          on ? "font-medium text-navy" : "text-slate"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="w-[1.125rem] shrink-0 text-[0.6875rem] font-semibold text-slate"
                        >
                          {two(index + 1)}
                        </span>
                        {heading}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}
          <Share title={article.title} />
        </aside>
        <SeriesBody blocks={article.body} />
      </div>

      <section
        aria-labelledby="continue-heading"
        className="mt-14 border-t border-navy/12 bg-[#f6f6f3] py-14 lg:mt-24 lg:pt-[5.5rem] lg:pb-28"
      >
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <h2
              id="continue-heading"
              className="font-display text-[1.875rem] leading-[1.08] font-light tracking-[-0.02em] lg:text-[2.75rem]"
            >
              Continue the series.
            </h2>
            <Link
              to="/insights"
              className="group inline-flex min-h-11 items-center gap-3 font-display text-[0.8125rem] font-semibold tracking-[0.12em] whitespace-nowrap text-navy uppercase"
            >
              All parts
              <ArrowRight className="hover-arrow h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-2">
            {before ? (
              <PartTile part={before} next={false} />
            ) : (
              <Link
                to="/insights"
                className="group flex min-h-[15rem] flex-col justify-between gap-[1.125rem] bg-navy p-7 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-blue lg:h-[18.75rem]"
              >
                <span className={`${EYEBROW} text-white/70`}>{SERIES_NAME}</span>
                <span className="max-w-[26rem] font-display text-2xl leading-[1.2] font-light lg:text-[1.875rem]">
                  {two(parts.length) === "04" ? "Four" : parts.length} parts, one system — from
                  enquiry to the factory floor.
                </span>
                <span className="inline-flex items-center gap-2.5 font-display text-xs font-semibold tracking-[0.14em] uppercase">
                  All parts
                  <ArrowRight className="hover-arrow h-4 w-4" />
                </span>
              </Link>
            )}
            {after ? <PartTile part={after} next /> : null}
          </div>
        </div>
      </section>
    </article>
  );
}
