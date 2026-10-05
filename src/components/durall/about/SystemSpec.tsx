import { useReveal } from "@/lib/anim";
import { iconOf } from "@/content/icons";
import { imageOf } from "@/content/render";
import type { AboutPage } from "@/content/types";

export function SystemSpec({ content }: { content: AboutPage["spec"] }) {
  const METRICS = content.metrics;
  const wrapRef = useReveal<HTMLDivElement>({ y: 32, duration: 0.9 });

  return (
    <section className="bg-white pt-[clamp(2.5rem,5vw,4.5rem)]">
      <div ref={wrapRef} className="shell-about">
        <figure className="m-0">
          {/* The profile photograph runs to the card's edge; the other three
              cells carry their own padding. One row from `md`: on a tablet
              the same four cells as on a desktop, set a little tighter. */}
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-navy-14 md:grid-cols-[minmax(0,0.2fr)_minmax(0,0.18fr)_minmax(0,0.25fr)_minmax(0,0.37fr)] xl:grid-cols-[minmax(0,0.2fr)_minmax(0,0.16fr)_minmax(0,0.265fr)_minmax(0,0.375fr)]">
            <div className="relative min-w-0 overflow-hidden bg-paper">
              <div data-fx="zoom" data-fx-by="1.14" className="h-full w-full">
                <img
                  draggable={false}
                  {...imageOf(content.photo.image)}
                  alt={content.photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex min-w-0 flex-col justify-center p-6 md:px-[clamp(0.875rem,1.3vw,1.5rem)] md:py-5">
              <p className="flex items-baseline gap-1.5 font-display text-[clamp(2.25rem,3vw,3rem)] leading-none font-medium text-navy md:max-xl:text-[2rem]">
                {content.value}
                <span className="font-display text-sm font-bold text-navy">{content.unit}</span>
              </p>
              <p className="mt-4 font-display text-[0.625rem] font-bold tracking-eyebrow text-slate uppercase">
                {content.label}
              </p>
              <p className="mt-2 max-w-[10rem] font-body text-xs leading-snug text-slate">
                {content.note}
              </p>
            </div>

            <div className="flex min-w-0 items-center border-navy-14 p-4 md:border-l md:p-0">
              <img
                draggable={false}
                {...imageOf(content.drawing.image)}
                alt={content.drawing.alt}
                loading="lazy"
                decoding="async"
                className="w-full object-contain"
              />
            </div>

            <dl className="flex min-w-0 flex-col justify-center p-6 md:my-5 md:border-l md:border-navy-14 md:px-[clamp(0.875rem,2vw,2rem)] md:py-0 xl:my-6 xl:pr-[clamp(1.5rem,2.5vw,2.5rem)]">
              {METRICS.map(({ icon, label, value }, index) => {
                const Icon = iconOf(icon);
                return (
                  <div
                    key={label}
                    className={`flex items-center justify-between gap-4 py-2.5 ${
                      index < METRICS.length - 1 ? "border-b border-navy-14" : ""
                    }`}
                  >
                    <dt className="flex min-w-0 items-center gap-2 font-display text-[0.625rem] leading-[1.4] font-bold tracking-eyebrow text-navy uppercase">
                      <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                      {label}
                    </dt>
                    <dd className="shrink-0 font-body text-xs font-bold text-navy">{value}</dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 px-4 font-display text-[0.625rem] font-bold tracking-eyebrow text-slate uppercase">
            <span>{content.captionLeft}</span>
            <span>{content.captionRight}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
