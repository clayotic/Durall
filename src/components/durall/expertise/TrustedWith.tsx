import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useClipReveal, useReveal, useSectionIntro } from "@/lib/anim";
import { imageOf, Lines, linkTo } from "@/content/render";
import type { ExpertisePage, TrustedProject } from "@/content/types";
import { EYEBROW, HEADING, LEDE, SECTION_Y, SHELL } from "./styles";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const SMALL_CAPS = "font-display text-[0.8125rem] leading-none font-medium uppercase";
const two = (n: number) => String(n).padStart(2, "0");

/** A project with no photograph yet: the design's dashed frame, holding its
 * place until one is added in the admin panel. */
const EMPTY_FRAME = "border border-dashed border-white/30 bg-[#0d1147]";

function Thumb({ project }: { project: TrustedProject }) {
  const picture = project.thumb ?? project.photo;
  if (!picture)
    return <span aria-hidden="true" className={`block h-[42px] w-[60px] ${EMPTY_FRAME}`} />;
  return (
    <img
      draggable={false}
      {...imageOf(picture.image)}
      alt=""
      sizes="60px"
      loading="lazy"
      decoding="async"
      className="h-[42px] w-[60px] object-cover"
    />
  );
}

/* How a row opens and closes: one curve and one length for everything that
 * moves with it, so the row closing and the row opening read as one motion. */
const EASE = "duration-[var(--dur-medium)] ease-[var(--ease-reveal)] motion-reduce:transition-none";

/**
 * "Every site asks for something different.": the kinds of work as a list
 * that opens one at a time (on hover with a mouse, on tap or focus otherwise),
 * and beside it the photographs of the projects the open one was delivered on.
 *
 * From the design at 1920: the list 600px wide, the photograph 740 × 840,
 * 65px between them. Choosing a kind, a project in its list, or the arrows
 * on the photograph changes the picture; nothing moves by itself.
 *
 * A row opens by growing, not by appearing: its panel is a one-row grid
 * taken from `0fr` to `1fr` (the one way to animate to a height nobody has
 * measured), while the panel of the row that was open closes on the same
 * curve, so the list keeps its length and only the rows between the two
 * move. The title grows by `scale`, from the size it is always set at. The
 * photograph cross-fades: the new one comes up over the last, which stays
 * underneath until it is covered, so the frame is never empty.
 */
export function TrustedWith({ content }: { content: ExpertisePage["trusted"] }) {
  const introRef = useSectionIntro<HTMLDivElement>();
  const bodyRef = useReveal<HTMLDivElement>({ y: 24 });
  // The photograph settles out of a slight overscan as the frame arrives.
  const frameRef = useClipReveal<HTMLDivElement>({ scale: 1.1, shift: 8 });
  const [open, setOpen] = useState(0);
  const [shown, setShown] = useState(0);
  /* The kinds whose photographs are in the frame: the open one, and any the
   * pointer has been over, so a picture has started loading before its row
   * opens. And the picture that was showing before this one. */
  const [seen, setSeen] = useState([0]);
  const [under, setUnder] = useState("");
  const see = (index: number) => setSeen((had) => (had.includes(index) ? had : [...had, index]));

  const kind = content.kinds[open];
  const projects = kind?.projects ?? [];
  const project = projects[shown];
  const link = project?.href ? linkTo(project.href) : null;

  const show = (kindAt: number, at: number) => {
    setUnder(`${open}-${shown}`);
    see(kindAt);
    setOpen(kindAt);
    setShown(at);
  };
  const choose = (index: number) => show(index, 0);

  /* With a mouse the list opens on hover. Opening a row closes another and
   * moves the rows between, which can slide a different row under a pointer
   * that has not moved; so a row opens only after the pointer has rested on
   * it for a moment, and only if the pointer has really moved since the last
   * change. The last row hovered stays open. Touch has no hover and keeps
   * tap; the keyboard opens a row by focusing it. */
  const intent = useRef<{ index: number; timer: number } | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const changedAt = useRef<{ x: number; y: number } | null>(null);
  const cancelIntent = () => {
    if (intent.current) window.clearTimeout(intent.current.timer);
    intent.current = null;
  };
  useEffect(() => cancelIntent, []);

  const hover = (index: number, event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    see(index);
    pointer.current = { x: event.clientX, y: event.clientY };
    if (index === open || intent.current?.index === index) return;
    const last = changedAt.current;
    if (last && Math.hypot(event.clientX - last.x, event.clientY - last.y) < 4) return;
    cancelIntent();
    intent.current = {
      index,
      timer: window.setTimeout(() => {
        intent.current = null;
        changedAt.current = pointer.current;
        choose(index);
      }, 110),
    };
  };
  const step = (by: number) => show(open, (shown + by + projects.length) % projects.length);

  return (
    <section id="trusted" className={`scroll-mt-24 bg-navy text-white ${SECTION_Y}`}>
      <div className={SHELL}>
        <div
          ref={introRef}
          className="grid grid-cols-1 gap-y-6 lg:[grid-template-columns:minmax(0,842fr)_minmax(0,563fr)] lg:items-end"
        >
          <div className="min-w-0">
            <p data-anim className={`${EYEBROW} text-silver`}>
              {content.eyebrow}
            </p>
            <h2
              data-anim="lines"
              className={`mt-[clamp(1.25rem,1.67vw,2rem)] ${HEADING} font-light text-white`}
            >
              <Lines text={content.heading} />
            </h2>
          </div>
          <p
            data-anim
            data-fx="words"
            className={`max-w-[34rem] ${LEDE} text-silver lg:pb-[0.8vw]`}
          >
            {content.body}
          </p>
        </div>

        <div
          ref={bodyRef}
          className="mt-[clamp(2.5rem,5.4vw,6.45rem)] grid grid-cols-1 gap-x-[clamp(2rem,3.4vw,4.0625rem)] gap-y-10 lg:[grid-template-columns:minmax(0,600fr)_minmax(0,740fr)]"
        >
          <div className="min-w-0 border-b border-white/14">
            {content.kinds.map((item, index) => {
              const isOpen = index === open;
              return (
                <div
                  key={item.title}
                  className={`border-t transition-colors ${EASE} ${isOpen ? "border-white/55" : "border-white/14"}`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`trusted-${index}-head`}
                      aria-expanded={isOpen}
                      aria-controls={`trusted-${index}-panel`}
                      onClick={() => choose(index)}
                      onPointerMove={(event) => hover(index, event)}
                      onPointerLeave={cancelIntent}
                      onFocus={() => {
                        if (index !== open) choose(index);
                      }}
                      className={`flex w-full cursor-pointer items-center text-left transition-[color,min-height] ${EASE} ${FOCUS} ${
                        isOpen
                          ? "min-h-[5.375rem] text-white"
                          : "min-h-[4.9375rem] text-white/42 hover:text-white/75"
                      }`}
                    >
                      <span
                        className={`w-[clamp(2.5rem,3.25vw,3.875rem)] shrink-0 pt-1 tracking-[0.12em] tabular-nums ${SMALL_CAPS}`}
                      >
                        {two(index + 1)}
                      </span>
                      {/* Set at the open size (40px at 1920) and scaled to
                          the resting one (32px) while shut. */}
                      <span
                        className={`min-w-0 flex-1 origin-left font-display text-[clamp(1.625rem,2.08vw,2.5rem)] leading-[1.15] font-light tracking-[-0.02em] text-pretty transition-[scale] ${EASE} ${
                          isOpen ? "" : "scale-[0.82]"
                        }`}
                      >
                        {item.title}
                      </span>
                      {/* A plus whose upright turns into the bar and goes. */}
                      <span aria-hidden="true" className="relative ml-4 block size-3.5 shrink-0">
                        <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                        <span
                          className={`absolute inset-y-0 left-1/2 w-px bg-current transition-[rotate,opacity] ${EASE} ${
                            isOpen ? "rotate-90 opacity-0" : ""
                          }`}
                        />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`trusted-${index}-panel`}
                    role="region"
                    aria-labelledby={`trusted-${index}-head`}
                    // Shut, it is still laid out (that is what it grows
                    // from), so it is taken out of reach instead.
                    inert={!isOpen}
                    className={`grid transition-[grid-template-rows,opacity] ${EASE} ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="pb-[clamp(1.5rem,2.2vw,2.6rem)] pl-[clamp(2.5rem,3.25vw,3.875rem)]">
                        <p className="max-w-[29.5rem] font-display text-[clamp(0.9375rem,0.89vw,1.0625rem)] leading-[1.59] text-pretty text-silver">
                          {item.body}
                        </p>
                        {item.projects.length ? (
                          <>
                            <p className="mt-[clamp(1rem,1.15vw,1.375rem)] font-display text-[0.6875rem] leading-none font-medium tracking-[0.16em] text-white/55 uppercase">
                              {content.seenAt} · {two(item.projects.length)}{" "}
                              {item.projects.length === 1 ? "project" : "projects"}
                            </p>
                            <ul className="mt-[1.0625rem] grid grid-cols-1 gap-y-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-[repeat(2,minmax(0,15.625rem))]">
                              {item.projects.map((entry, at) => (
                                <li key={entry.name} className="min-w-0">
                                  <button
                                    type="button"
                                    aria-pressed={at === shown}
                                    onClick={() => show(index, at)}
                                    className={`group flex min-h-11 w-full cursor-pointer items-center gap-3.5 text-left ${FOCUS}`}
                                  >
                                    <span className="shrink-0">
                                      <Thumb project={entry} />
                                    </span>
                                    <span className="min-w-0">
                                      <span
                                        className={`block font-display text-[0.8125rem] leading-[1.38] underline underline-offset-2 ${
                                          at === shown
                                            ? "text-white decoration-white"
                                            : "text-white decoration-white/45 group-hover:decoration-white"
                                        }`}
                                      >
                                        {entry.name}
                                      </span>
                                      <span className="mt-0.5 block font-display text-xs text-white/55">
                                        {entry.place}
                                      </span>
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {project ? (
            <div
              role="group"
              aria-roledescription="carousel"
              aria-label={kind?.title}
              ref={frameRef}
              className="relative aspect-[740/840] min-w-0 overflow-hidden bg-[#0d1147]"
            >
              <div data-clip-inner className="absolute inset-0">
                {seen.flatMap((kindAt) =>
                  (content.kinds[kindAt]?.projects ?? []).map((entry, at) => {
                    const key = `${kindAt}-${at}`;
                    const current = kindAt === open && at === shown;
                    // The one showing on top, the one before it left whole
                    // beneath until it is covered, the rest faded away. A
                    // picture new to the frame starts from clear.
                    const layer = `absolute inset-0 transition-opacity duration-[var(--dur-medium)] motion-reduce:transition-none starting:opacity-0 ${
                      current
                        ? "z-[2] opacity-100"
                        : key === under
                          ? "z-[1] opacity-100"
                          : "opacity-0"
                    }`;
                    return entry.photo ? (
                      <img
                        draggable={false}
                        key={key}
                        {...imageOf(entry.photo.image)}
                        alt={current ? entry.photo.alt : ""}
                        aria-hidden={current ? undefined : true}
                        sizes="(min-width: 1024px) 39vw, 100vw"
                        loading="lazy"
                        decoding="async"
                        className={`h-full w-full object-cover ${layer}`}
                      />
                    ) : (
                      <div
                        key={key}
                        aria-hidden="true"
                        className={`flex items-center justify-center p-8 text-center ${EMPTY_FRAME} ${layer}`}
                      >
                        <span className={`${SMALL_CAPS} tracking-[0.16em] text-white/60`}>
                          Photo — {entry.name}
                        </span>
                      </div>
                    );
                  }),
                )}
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 z-[3] h-[16.7%] bg-linear-to-b from-navy/55 to-transparent"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 z-[3] h-[23.8%] bg-linear-to-b from-transparent to-navy/75"
              />

              {link && content.viewProject ? (
                "to" in link ? (
                  <Link
                    {...link}
                    className={`absolute top-[clamp(0.75rem,1.2vw,1.4rem)] right-[clamp(1rem,1.67vw,2rem)] z-[3] inline-flex min-h-11 items-center tracking-[0.14em] text-white underline underline-offset-4 ${SMALL_CAPS} ${FOCUS}`}
                  >
                    {content.viewProject}&nbsp;<span aria-hidden="true">↗</span>
                    <span className="sr-only">: {project.name}</span>
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={`absolute top-[clamp(0.75rem,1.2vw,1.4rem)] right-[clamp(1rem,1.67vw,2rem)] z-[3] inline-flex min-h-11 items-center tracking-[0.14em] text-white underline underline-offset-4 ${SMALL_CAPS} ${FOCUS}`}
                  >
                    {content.viewProject}&nbsp;<span aria-hidden="true">↗</span>
                    <span className="sr-only">: {project.name}</span>
                  </a>
                )
              ) : null}

              <div className="absolute inset-x-[clamp(1rem,1.67vw,2rem)] bottom-[clamp(1rem,1.56vw,1.875rem)] z-[3] flex items-end justify-between gap-4">
                <p aria-live="polite" className="min-w-0 pb-0.5">
                  <span className={`block tracking-[0.14em] text-white ${SMALL_CAPS}`}>
                    {project.name}
                  </span>
                  <span className="mt-3 block font-display text-sm leading-tight text-silver">
                    {project.credit}
                  </span>
                </p>
                {projects.length > 1 ? (
                  <div className="flex shrink-0 items-center gap-[1.125rem]">
                    <span className={`tracking-[0.12em] text-white tabular-nums ${SMALL_CAPS}`}>
                      {two(shown + 1)} / {two(projects.length)}
                    </span>
                    {(
                      [
                        [-1, "←", "Previous project"],
                        [1, "→", "Next project"],
                      ] as const
                    ).map(([by, glyph, name]) => (
                      <button
                        key={name}
                        type="button"
                        aria-label={name}
                        onClick={() => step(by)}
                        // 36px as drawn; the pseudo-element brings the
                        // target up to 44px for touch.
                        className={`relative flex size-9 cursor-pointer items-center justify-center border border-white/50 font-display text-[0.9375rem] text-white transition-colors duration-[var(--dur-short)] after:absolute after:-inset-1 hover:bg-white hover:text-navy ${FOCUS}`}
                      >
                        <span aria-hidden="true">{glyph}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
