import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useReveal, useSectionIntro } from "@/lib/anim";
import { roleDetails } from "@/content/role-details";
import { topicKey } from "@/content/select";
import type { CareersPage, RoleDoc } from "@/content/types";
import { EYEBROW, HEADING, PAPER, SHELL } from "./styles";
import { ArrowRight, BUTTON } from "../ui";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";
const EMAIL_LINK = `text-navy underline underline-offset-4 hover:text-accent-blue ${FOCUS}`;
const CHIP = `inline-flex min-h-11 items-center border px-[1.125rem] font-display text-[0.8125rem] font-medium tracking-[0.09em] uppercase transition-colors duration-[var(--dur-short)] lg:min-h-[2.4375rem] ${FOCUS}`;
/* Role, team, location, type and the button: 760, 200, 200, 113 and 132px
 * of the design's 1405. */
const COLUMNS = "lg:grid lg:grid-cols-[minmax(0,760fr)_200fr_200fr_113fr_8.25rem] lg:gap-0";

/** A role's details: headings, paragraphs and lists, as elements. */
function RoleDetails({ text }: { text: string }) {
  return (
    <div className="mt-1 max-w-[46rem] space-y-3 pb-1 text-[0.9375rem] leading-[1.6] text-pretty text-slate">
      {roleDetails(text).map((block, index) =>
        block.kind === "list" ? (
          <ul key={index} className="list-disc space-y-1 pl-5 marker:text-navy/40">
            {block.items.map((item, at) => (
              <li key={at}>{item}</li>
            ))}
          </ul>
        ) : block.kind === "heading" ? (
          <h4
            key={index}
            className="pt-2 text-xs font-semibold tracking-[0.12em] text-navy uppercase"
          >
            {block.text}
          </h4>
        ) : (
          <p key={index}>{block.text}</p>
        ),
      )}
    </div>
  );
}

function TeamChip({
  team,
  active,
  children,
}: {
  team: string | undefined;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      to="/careers"
      search={team ? { team } : {}}
      replace
      resetScroll={false}
      // Exact, or the router counts "no filter" as matching every team.
      activeOptions={{ exact: true }}
      aria-current={active ? "true" : undefined}
      className={`${CHIP} ${
        active ? "border-navy bg-navy text-white" : "border-navy/20 text-navy hover:border-navy"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * "Current openings.": the open roles as a list set in columns, with a
 * filter by team, and under it the open application for anyone whose role
 * is not listed.
 *
 * The team filter lives in the address (?team=workshop), so a filtered list
 * can be linked to and survives a reload.
 */
export function OpenRoles({
  content,
  open,
  roles,
  team,
  email,
}: {
  content: CareersPage["roles"];
  open: CareersPage["open"];
  roles: readonly RoleDoc[];
  /** The team in the address, as a key (see topicKey). */
  team: string | undefined;
  email: string;
}) {
  const headRef = useSectionIntro<HTMLDivElement>();
  const listRef = useReveal<HTMLUListElement>({ selector: ":scope > li", y: 20, stagger: 0.07 });
  const boxRef = useReveal<HTMLDivElement>({ y: 24 });

  const teams = [...new Set(roles.map((role) => role.team).filter(Boolean))];
  // A team nobody is hiring for any more: show everything rather than nothing.
  const current = teams.find((name) => topicKey(name) === team);
  const shown = current ? roles.filter((role) => role.team === current) : roles;
  const [emptyBefore = "", emptyAfter = ""] = content.empty.split("{email}");
  const { columns } = content;

  return (
    <section
      id="roles"
      aria-labelledby="roles-heading"
      className={`scroll-mt-24 ${PAPER} pt-[clamp(4rem,6.8vw,8.125rem)] pb-[clamp(4rem,6.25vw,7.5rem)]`}
    >
      <div className={SHELL}>
        <div ref={headRef}>
          <p data-anim className={`flex items-center gap-[1.125rem] ${EYEBROW} text-slate`}>
            <span aria-hidden="true" className="h-px w-14 bg-navy/40" />
            {content.eyebrow}
          </p>
          <h2
            id="roles-heading"
            data-anim="lines"
            className={`mt-[clamp(1.25rem,1.67vw,2rem)] ${HEADING} font-light text-navy`}
          >
            {content.heading}
          </h2>
          {teams.length > 1 ? (
            <nav
              data-anim
              aria-label="Filter roles by team"
              className="mt-6 flex flex-wrap gap-2 lg:-mt-[3px] lg:justify-end"
            >
              <TeamChip team={undefined} active={!current}>
                {content.allRoles}
              </TeamChip>
              {teams.map((name) => (
                <TeamChip key={name} team={topicKey(name)} active={name === current}>
                  {name}
                </TeamChip>
              ))}
            </nav>
          ) : null}
        </div>

        {roles.length === 0 ? (
          /* A reachable state: close every role in the admin panel and this
             is what the page shows. */
          <p className="mt-[clamp(2rem,3.3vw,4rem)] max-w-[40rem] border-t border-navy/14 pt-6 font-display text-[clamp(1rem,0.94vw,1.125rem)] leading-[1.56] text-pretty text-slate">
            {emptyBefore}
            <a href={`mailto:${email}`} className={EMAIL_LINK}>
              {email}
            </a>
            {emptyAfter}
          </p>
        ) : (
          <>
            {/* Column headings for the eye; each row names its own values
                for a screen reader. */}
            <div
              aria-hidden="true"
              className={`mt-[clamp(2rem,3.3vw,3.9375rem)] hidden pb-[1.125rem] font-display text-[0.6875rem] leading-none font-medium tracking-[0.16em] text-slate uppercase ${COLUMNS}`}
            >
              <span>{columns.role}</span>
              <span>{columns.team}</span>
              <span>{columns.location}</span>
              <span>{columns.type}</span>
            </div>
            <ul ref={listRef} className="mt-8 border-b border-navy/14 lg:mt-0">
              {shown.map((role) => (
                <li
                  key={role.id}
                  className={`border-t border-navy/14 pt-[clamp(1.5rem,1.67vw,2rem)] pb-[clamp(1.5rem,1.72vw,2.0625rem)] font-display ${COLUMNS}`}
                >
                  <div className="min-w-0 lg:pr-10">
                    <h3 className="text-[clamp(1.375rem,1.46vw,1.75rem)] leading-[1.21] tracking-[-0.018em] text-pretty text-navy">
                      {role.title}
                    </h3>
                    <p className="mt-2.5 text-[0.9375rem] leading-[1.47] text-pretty text-slate">
                      {role.summary}
                    </p>
                    {role.details ? (
                      <details className="group mt-2">
                        <summary
                          className={`inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-[0.8125rem] font-medium tracking-[0.09em] text-navy uppercase transition-colors duration-[var(--dur-short)] hover:text-accent-blue [&::-webkit-details-marker]:hidden ${FOCUS}`}
                        >
                          Job details
                          <ChevronDown
                            aria-hidden="true"
                            className="h-4 w-4 transition-transform duration-[var(--dur-short)] group-open:rotate-180 motion-reduce:transition-none"
                          />
                        </summary>
                        <RoleDetails text={role.details} />
                      </details>
                    ) : null}
                  </div>
                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[0.9375rem] text-slate lg:contents">
                    {(
                      [
                        [columns.team, role.team],
                        [columns.location, role.location],
                        [columns.type, role.type],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label} className="lg:pt-[0.6875rem]">
                        <dt className="sr-only">{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 lg:mt-0">
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(role.title)}`}
                      className={`${BUTTON.secondary} w-[8.25rem] px-0 lg:mt-px`}
                    >
                      {content.applyLabel}
                      <ArrowRight className="hover-arrow h-4 w-4 shrink-0" />
                      <span className="sr-only">: {role.title}</span>
                    </a>
                  </p>
                </li>
              ))}
            </ul>
            {content.note ? (
              <p className="mt-7 font-display text-[0.8125rem] text-slate">{content.note}</p>
            ) : null}
          </>
        )}

        <div
          ref={boxRef}
          className="mt-[clamp(2.5rem,3.9vw,4.6875rem)] flex flex-col gap-x-10 gap-y-8 bg-[#f3f3f0] px-[clamp(1.5rem,3.33vw,4rem)] pt-[clamp(2rem,3.07vw,3.6875rem)] pb-[clamp(2rem,3.65vw,4.375rem)] md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0">
            <h2 className="font-display text-[clamp(1.75rem,2.08vw,2.5rem)] leading-[1.15] font-light tracking-[-0.02em] text-navy">
              {open.heading}
            </h2>
            <p
              data-fx="words"
              className="mt-[1.1875rem] font-display text-[clamp(1rem,0.89vw,1.0625rem)] leading-[1.53] text-pretty text-slate"
            >
              {open.body}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-[1.125rem] md:items-center">
            <a href={`mailto:${email}`} className={`${BUTTON.primary} min-w-[13.125rem]`}>
              {open.action}
              <ArrowRight className="hover-arrow h-4 w-4 shrink-0" />
            </a>
            <p className="font-display text-sm text-slate">
              {open.orWrite}{" "}
              <a href={`mailto:${email}`} className={EMAIL_LINK}>
                {email}
              </a>
            </p>
            <p className="max-w-[22rem] font-display text-xs leading-relaxed text-pretty text-slate md:text-center">
              By sending an application you agree that we may use it to consider you for this and
              similar roles. See our{" "}
              <Link to="/privacy" className={EMAIL_LINK}>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
