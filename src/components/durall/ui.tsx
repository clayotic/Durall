import type { ComponentType, CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Youtube, type LucideProps } from "lucide-react";
import type { Cta } from "@/content/types";

export function ArrowRight({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function ArrowLeft({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M13.5 8h-11M6.5 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * The line behind a project photograph on hover: the photograph's outline,
 * set up and to the left of it, its top-right corner cut at 45°. On hover or
 * keyboard focus of the card (a `group`) it draws itself, starting at its
 * foot and travelling up and across the top into the cut; on leaving it
 * runs back the same way. Under reduced motion it only fades in.
 *
 * Four straight pieces grown by `scale` one after another rather than a
 * dashed SVG stroke: transform only, and the same in every browser at every
 * size. The timings live with `.card-frame` in styles.css.
 *
 * Place it before the photograph inside a `relative` box of the same size.
 */
export function CardFrame() {
  return (
    <span aria-hidden="true" className="card-frame">
      <span data-edge="foot" />
      <span data-edge="left" />
      <span data-edge="top" />
      <span data-edge="cut" />
    </span>
  );
}

/**
 * Hover/tap micro-interaction wrapper.
 *
 * The movement runs as a compositor-only CSS transition on the two motion
 * tokens (see the micro-interaction layer in styles.css) rather than through
 * motion/react, which used to drag the library onto the critical path of
 * every page for what is a hover nudge. The per-instance distances travel as
 * custom properties because Tailwind cannot generate utilities for values
 * computed at runtime.
 */
export function Interactive({
  children,
  className,
  lift = -3,
  scale = 1.02,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
  as?: "div" | "article" | "li";
} & Omit<HTMLAttributes<HTMLElement>, "className" | "style" | "children">) {
  const Tag = as;

  return (
    // Two elements, deliberately. The outer one is what the reveal hooks
    // animate — `...rest` carries the `data-card` / `data-cell` marker they
    // select on, which an earlier implementation silently swallowed, so
    // `[data-card]` matched nothing and the staggered grid reveals on the
    // home page and both partners grids never actually ran.
    //
    // The hover lives on the inner one because GSAP claims an element's
    // transform by writing inline `transform`, `translate: none` and
    // `scale: none`, which a CSS hover on the same element cannot outrank.
    <Tag {...rest} className="min-w-0">
      <div
        className={`interactive h-full ${className ?? ""}`}
        style={{ "--lift": `${lift}px`, "--scale": scale } as CSSProperties}
      >
        {children}
      </div>
    </Tag>
  );
}

/* The three link primitives below take either `href` (an in-page anchor) or
 * `to` (a route). `to` renders a router <Link>: written as a plain anchor, a
 * cross-route href forces a full document reload, which is what three of
 * these call sites were doing. */
// Explicit `| undefined` rather than optional keys: the project runs with
// exactOptionalPropertyTypes, where forwarding a destructured optional prop
// is not the same as omitting it.
type Destination = {
  href?: string | undefined;
  to?: string | undefined;
  hash?: string | undefined;
};

function destinationProps({ href, to, hash }: Destination) {
  if (to) return { to, ...(hash ? { hash } : {}) } as const;
  return { href: href ?? "#" } as const;
}

/* The site's buttons, from the style sheet in the design file ("One system,
 * used everywhere"): 48px tall, 24px either side, square corners, 13px Space
 * Grotesk Medium tracked 1px, and a 16px arrow 16px after the label. Hover
 * and pressed take Navy 700. Exported as class strings because several
 * buttons are not links (form submits, the viewer's Close). */
const BUTTON_BASE =
  "group hover-lift inline-flex h-12 cursor-pointer items-center justify-center gap-4 px-6 font-display text-[0.8125rem] leading-none font-medium tracking-[0.077em] whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-progress disabled:opacity-80";

export const BUTTON = {
  /** Solid navy: one per view. */
  primary: `${BUTTON_BASE} bg-navy text-white hover:bg-navy-700 active:bg-navy-700 focus-visible:outline-accent-blue`,
  /** Navy outline. */
  secondary: `${BUTTON_BASE} border border-navy text-navy hover:bg-navy hover:text-white active:bg-navy-700 active:text-white focus-visible:outline-accent-blue`,
  /** The primary on a photograph or on navy: white, navy label. */
  inverted: `${BUTTON_BASE} bg-white text-navy hover:bg-[#f4f4f2] active:bg-[#dadbe3] focus-visible:outline-white`,
  /** The secondary on a photograph or on navy. */
  outlineLight: `${BUTTON_BASE} border border-white text-white hover:bg-white hover:text-navy active:bg-[#f4f4f2] active:text-navy focus-visible:outline-white`,
} as const;

/** The sheet's text link: label and arrow on a navy rule, 24px tall. The
 * pseudo-element brings the target up to 44px without moving the rule. */
export const TEXT_LINK =
  "group hover-lift relative inline-flex h-6 w-fit items-start gap-4 border-b border-navy font-display text-[0.8125rem] leading-[1.28] font-medium tracking-[0.077em] whitespace-nowrap text-navy uppercase after:absolute after:-inset-x-2 after:-inset-y-2.5 after:content-[''] hover:border-navy-700 hover:text-navy-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-blue";

export function CtaButton({
  children,
  variant = "primary",
  href,
  to,
  hash,
}: { children: ReactNode; variant?: keyof typeof BUTTON } & Destination) {
  const className = BUTTON[variant];
  const inner = (
    <>
      <span>{children}</span>
      <ArrowRight className="hover-arrow h-4 w-4 shrink-0" />
    </>
  );

  if (to) {
    return (
      <Link {...destinationProps({ to, hash })} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href ?? "#"} className={className}>
      {inner}
    </a>
  );
}

export function UnderlineLink({ children, href, to, hash }: { children: ReactNode } & Destination) {
  const inner = (
    <>
      {children}
      <ArrowRight className="hover-arrow h-4 w-4 shrink-0" />
    </>
  );

  if (to) {
    return (
      <Link {...destinationProps({ to, hash })} className={TEXT_LINK}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href ?? "#"} className={TEXT_LINK}>
      {inner}
    </a>
  );
}

/** The sheet's secondary button: it replaces the old "View More" pill. */
export function ViewMore({
  href,
  to,
  hash,
  label = "View More",
}: { label?: string } & Destination) {
  return (
    <CtaButton variant="secondary" href={href} to={to} hash={hash}>
      {label}
    </CtaButton>
  );
}

/* The icon set has no Pinterest mark, so this is Pinterest's own (the glyph
 * as published by Simple Icons, CC0). It is a solid mark where the others
 * are drawn in line, which is how Pinterest's logo is. */
function Pinterest({ strokeWidth: _line, ...props }: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </svg>
  );
}

const SOCIAL_MARKS: readonly [RegExp, ComponentType<LucideProps>][] = [
  [/linkedin/i, Linkedin],
  [/instagram/i, Instagram],
  [/facebook/i, Facebook],
  [/pinterest/i, Pinterest],
  [/youtube/i, Youtube],
];

/**
 * A social profile shown as its logo: a link when the profile's address has
 * been filled in, the bare logo until then. A name with no logo here stays
 * a word.
 */
export function SocialMark({ item, className = "" }: { item: Cta; className?: string }) {
  const Mark = SOCIAL_MARKS.find(([name]) => name.test(item.label))?.[1];
  const face = Mark ? <Mark aria-hidden="true" className="size-5" strokeWidth={1.5} /> : item.label;
  const box = `flex min-h-11 min-w-11 items-center justify-center ${className}`;
  return item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={Mark ? item.label : undefined}
      className={`${box} hover-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}
    >
      {face}
    </a>
  ) : (
    <span
      role={Mark ? "img" : undefined}
      aria-label={Mark ? item.label : undefined}
      className={box}
    >
      {face}
    </span>
  );
}
