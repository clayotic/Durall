import { IMAGES } from "@/assets/images";
import type { PartnerDoc } from "@/content/types";

/**
 * A point inside each country a practice may be listed under, as
 * [latitude, longitude]: where its dot goes. A practice whose country is not
 * here simply has no dot (add the country here to give it one).
 */
const PLACES: Record<string, readonly [number, number]> = {
  "united states": [39.8, -98.6],
  canada: [56.1, -106.3],
  mexico: [23.6, -102.5],
  brazil: [-10.3, -53.2],
  "united kingdom": [54, -2],
  netherlands: [52.1, 5.3],
  belgium: [50.5, 4.5],
  france: [46.2, 2.2],
  germany: [51.2, 10.5],
  switzerland: [46.8, 8.2],
  austria: [47.5, 14.6],
  italy: [41.9, 12.6],
  spain: [40.5, -3.7],
  portugal: [39.4, -8.2],
  israel: [31, 34.9],
  "united arab emirates": [24, 54],
  "south africa": [-30.6, 22.9],
  india: [21, 78],
  "sri lanka": [7.9, 80.8],
  maldives: [3.2, 73.2],
  thailand: [15.9, 101],
  malaysia: [4.2, 102],
  singapore: [1.35, 103.8],
  indonesia: [-2.5, 118],
  china: [35.9, 104.2],
  "hong kong": [22.3, 114.2],
  japan: [36.2, 138.3],
  australia: [-25.3, 133.8],
};

/** Other names the same countries go by. */
const ALSO: Record<string, string> = {
  usa: "united states",
  us: "united states",
  "united states of america": "united states",
  america: "united states",
  uk: "united kingdom",
  england: "united kingdom",
  britain: "united kingdom",
  "great britain": "united kingdom",
  holland: "netherlands",
  ceylon: "sri lanka",
  uae: "united arab emirates",
  dubai: "united arab emirates",
};

/* The map (src/assets/partners-world-map.svg, 1400 × 474) is drawn plate
 * carrée. Fitted to six coastline points (the tips of Africa, South America
 * and India, Dakar, Recife and the west of Alaska), a point lands within a
 * couple of the map's dots of where it should. */
const left = (longitude: number) => ((3.2332 * longitude + 700.83) / 1400) * 100;
const top = (latitude: number) => ((264.39 - 3.2706 * latitude) / 474) * 100;

/** One dot per place, however many practices share it, named as the first of them names it. */
function placesOf(practices: readonly PartnerDoc[]) {
  const places = new Map<string, { name: string; left: number; top: number }>();
  for (const practice of practices) {
    for (const part of practice.country.split(/[/,&]/)) {
      const name = part.trim();
      const key = ALSO[name.toLowerCase()] ?? name.toLowerCase();
      const at = PLACES[key];
      if (!at || places.has(key)) continue;
      places.set(key, { name, left: left(at[1]), top: top(at[0]) });
    }
  }
  return [...places.values()];
}

/**
 * The dotted world map with a mark on each country the practices work from.
 * Decorative: the list under it names every practice and its country.
 */
export function PracticesMap({
  practices,
  className = "",
}: {
  practices: readonly PartnerDoc[];
  className?: string;
}) {
  const map = IMAGES.partnersWorldMap;
  return (
    <div aria-hidden="true" className={`relative aspect-[1400/474] ${className}`}>
      <img
        draggable={false}
        src={map.src}
        width={map.width}
        height={map.height}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full opacity-35 select-none"
      />
      {placesOf(practices).map((place) => (
        <span
          key={place.name}
          className="absolute"
          style={{ left: `${place.left}%`, top: `${place.top}%` }}
        >
          <span className="absolute size-[clamp(0.5rem,0.7vw,0.75rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue ring-[clamp(3px,0.35vw,5px)] ring-accent-blue/20" />
          <span
            className={`absolute top-0 -translate-y-1/2 font-display text-[0.625rem] font-bold tracking-eyebrow whitespace-nowrap text-navy uppercase max-md:hidden ${
              place.left > 80 ? "right-[clamp(0.75rem,1vw,1rem)]" : "left-[clamp(0.75rem,1vw,1rem)]"
            }`}
          >
            {place.name}
          </span>
        </span>
      ))}
    </div>
  );
}
