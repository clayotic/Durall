import type { ReactNode } from "react";
import { useSite } from "@/content/site";
import { SiteHeader } from "./SiteHeader";
import { PageIntro } from "./PageIntro";
import { DurallFooter } from "./DurallFooter";

/* What the two legal pages (/privacy, /terms) are set in. */

export const LINK =
  "text-navy underline decoration-navy/30 underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:decoration-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";
export const LIST = "space-y-2.5";
export const ITEM =
  "relative pl-6 before:absolute before:top-[0.8em] before:left-0 before:h-px before:w-3 before:bg-navy/40";

/** One numbered clause: its heading on the left, its text on the right, the
 * way the site sets a specification. The number is the browser's own count
 * of the clauses, so adding or moving one renumbers the rest. */
export function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-x-[clamp(2rem,6vw,7rem)] gap-y-4 border-t border-navy/10 py-[clamp(2rem,3.4vw,3.25rem)] [counter-increment:clause] lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
      <h2 className="flex gap-5 font-display text-[clamp(1.25rem,1.6vw,1.5rem)] leading-tight font-medium tracking-tight text-balance text-navy before:pt-[0.5em] before:text-[0.6875rem] before:leading-none before:font-bold before:tracking-eyebrow before:text-accent-blue before:tabular-nums before:content-[counter(clause,decimal-leading-zero)]">
        {title}
      </h2>
      <div className="max-w-[40rem] space-y-4 font-body text-[clamp(0.9375rem,1.05vw,1rem)] leading-relaxed text-pretty text-slate [&_strong]:font-medium [&_strong]:text-navy">
        {children}
      </div>
    </section>
  );
}

/** The clause each page ends on: where to write. The name, address and
 * email come from the site settings, so they are the footer's. */
export function ContactClause({ about }: { about: string }) {
  const { company, office, contact } = useSite().settings;
  const email = contact.details.find((detail) => detail.icon === "mail");
  return (
    <Clause title="Contact">
      <p>
        For any question {about}, write to us
        {email ? (
          <>
            {" "}
            at{" "}
            <a href={email.href} className={LINK}>
              {email.value}
            </a>
          </>
        ) : null}
        , or by post:
      </p>
      <address className="text-navy not-italic">
        {company.legalName}
        {office.lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>
    </Clause>
  );
}

/** The page round the clauses: the site's usual opening, with the date the
 * text was last changed where other pages carry an eyebrow. */
export function PolicyPage({
  updated,
  title,
  lede,
  children,
}: {
  updated: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <div className="relative bg-white font-body text-navy">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="scroll-mt-24">
        <PageIntro eyebrow={`Last updated ${updated}`} title={title} lede={lede} />
        <div className="shell pb-[clamp(4rem,8vw,8rem)] [counter-reset:clause]">{children}</div>
      </main>
      <DurallFooter />
    </div>
  );
}
