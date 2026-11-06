import type { ReactNode } from "react";
import { useReveal } from "@/lib/anim";
import type { AboutPage } from "@/content/types";

/** The About page's section name: small, blue, with a short rule after it. */
export function AboutEyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-2.5 font-display text-[clamp(0.75rem,0.833vw,1rem)] font-bold tracking-[0.125em] text-accent-blue uppercase ${className}`}
    >
      {children}
      <span aria-hidden="true" className="h-px w-8 bg-accent-blue" />
    </p>
  );
}

/**
 * "About Durall", between the opening and Our Approach (Figma 1070:19): the
 * year Durall began with its two figures on the left, the story on the right.
 * On a phone the two stack.
 */
export function AboutStory({ content }: { content: AboutPage["story"] }) {
  const ref = useReveal<HTMLDivElement>({ selector: "[data-reveal]", y: 16 });

  return (
    <section
      aria-labelledby="story-heading"
      className="bg-white pt-14 max-lg:bg-[#fdfdfb] lg:pt-[clamp(2.5rem,3.9vw,4.7rem)]"
    >
      {/* px-5 below `lg`: the edge of Our Approach under it there. */}
      <div ref={ref} className="shell-about max-lg:px-5">
        <div data-reveal>
          <AboutEyebrow>{content.eyebrow}</AboutEyebrow>
        </div>
        <div className="grid gap-y-8 lg:max-w-[83.5rem] lg:grid-cols-[minmax(0,392fr)_minmax(0,820fr)] lg:gap-x-[clamp(2rem,6.46vw,7.75rem)]">
          <div className="min-w-0">
            <h2
              id="story-heading"
              data-reveal
              className="pt-[1.125rem] font-display text-[clamp(2.375rem,2.8vw,3.36rem)] leading-[1.04] font-light tracking-[-0.015em] text-balance text-navy"
            >
              {content.heading}
            </h2>
            <span
              data-reveal
              aria-hidden="true"
              className="mt-[1.375rem] flex w-14 items-center lg:mx-auto"
            >
              <span className="h-px grow bg-navy" />
              <span className="size-[5px] bg-navy" />
            </span>
            {content.facts.length ? (
              <dl data-reveal className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
                {content.facts.map((fact) => (
                  <div key={fact.label + fact.value} className="flex flex-col-reverse gap-1.5">
                    <dt className="font-display text-xs font-semibold tracking-[0.12em] text-slate uppercase">
                      {fact.label}
                    </dt>
                    <dd className="font-display text-[clamp(1.75rem,1.875vw,2.25rem)] leading-[1.28] font-light tracking-[-0.01em] text-navy">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          <p
            data-reveal
            className="min-w-0 font-display text-[clamp(1rem,0.967vw,1.16rem)] leading-[1.62] text-pretty text-slate lg:pt-1.5"
          >
            {content.lead} <span className="text-navy">{content.emphasis}</span> {content.body}
          </p>
        </div>
      </div>
    </section>
  );
}
