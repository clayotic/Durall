import { imageOf } from "@/content/render";
import type { PartnerDoc } from "@/content/types";

type Logo = NonNullable<PartnerDoc["logo"]>;

/* The typographic stand-ins drawn when a practice has no logo file, by the
 * `mark` stored with it. The admin panel offers these names. */
export const PRACTICE_MARKS = ["plain", "wow", "italic", "ecoid", "diamond", "solid"] as const;

/** A company's own logo file, at its tuned height. */
function OfficialLogo({ logo, name }: { logo: Logo; name: string }) {
  const { src, width, height } = imageOf(logo.image);
  return (
    <img
      draggable={false}
      src={src}
      width={width}
      height={height}
      alt={name}
      loading="lazy"
      decoding="async"
      style={{ height: `${logo.height}rem` }}
      className="w-auto max-w-[11.5rem] object-contain"
    />
  );
}

/** Typographic practice wordmarks. */
export function PracticeLogo({
  mark,
  name,
  logo,
}: {
  mark: string;
  name: string;
  logo: Logo | null;
}) {
  // Nomadic Resorts publishes its emblem without the name, so the name is set
  // beside it rather than leaving an unlabelled circle in the grid.
  if (logo && mark === "diamond") {
    return (
      <span className="inline-flex items-center gap-2.5">
        <OfficialLogo logo={logo} name="" />
        <span className="font-display text-[0.8125rem] font-bold tracking-[0.06em] text-navy uppercase">
          {name}
        </span>
      </span>
    );
  }
  if (logo) return <OfficialLogo logo={logo} name={name} />;
  switch (mark) {
    case "wow":
      return (
        <span className="font-display text-[clamp(1.125rem,1.5vw,1.5rem)] font-bold tracking-[0.05em] text-navy">
          WOW
        </span>
      );
    case "italic":
      return (
        <span className="font-serif text-[clamp(0.9375rem,1.15vw,1.125rem)] font-medium italic text-navy">
          {name}
        </span>
      );
    case "ecoid":
      return (
        <span className="inline-flex items-center gap-1.5 font-display text-[clamp(1rem,1.3vw,1.25rem)] font-medium tracking-[0.12em] text-navy">
          eco
          <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-navy" />
          id
        </span>
      );
    case "diamond":
      return (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rotate-45 border border-slate" />
          <span className="font-display text-[clamp(0.6875rem,0.9vw,0.8125rem)] font-bold tracking-eyebrow text-navy uppercase">
            {name}
          </span>
        </span>
      );
    case "solid":
      return (
        <span className="inline-flex items-center rounded-sm bg-navy px-3 py-1.5 font-display text-[clamp(0.625rem,0.85vw,0.75rem)] font-bold tracking-eyebrow text-white uppercase">
          {name}
        </span>
      );
    default:
      return (
        <span className="max-w-[9rem] text-center font-display text-[clamp(0.625rem,0.85vw,0.75rem)] font-bold tracking-eyebrow text-navy uppercase">
          {name}
        </span>
      );
  }
}
