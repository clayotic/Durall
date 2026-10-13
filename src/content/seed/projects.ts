import { asset, photo, type ImageKey } from "../render";
import type { Fact, Photo, Plate, ProjectDoc, ProjectFeature } from "../types";

/* The ten projects in Durall's own write-ups (October 2026), in their order.
 * The facts, paragraphs and pull quotes are theirs, cross-checked so nothing
 * is over-claimed: a role, system, year or area appears only where the
 * write-up gives one, and "Durall Association" is their wording where the
 * part played is a contribution rather than a role. The pull quote is the
 * heading of each project's closing section (`experience.heading`), which
 * the /projects cards quote too.
 *
 * The ids of the seven projects that were already on the site are kept as
 * they were, old spellings included, so a later import updates those rows
 * instead of adding a second copy. */

const fact = (label: string, value: string): Fact => ({ label, value });

const plate = (key: ImageKey, alt: string, caption: string): Plate => ({
  ...photo(key, alt),
  caption,
});

/** No system is named for this project: the page leaves the section out. */
const noSystem = (hero: Photo): ProjectDoc["system"] => ({
  ...hero,
  title: [""],
  body: "",
  points: [],
});

/** How a project would read as the featured one; only Parikrama is, for now. */
const featureOf = (
  doc: Pick<ProjectDoc, "location" | "title" | "architect" | "description" | "hero">,
): ProjectFeature => ({
  eyebrow: "Featured Project",
  location: doc.location,
  title: doc.title,
  architect: doc.architect,
  description: doc.description,
  specs: [],
  award: null,
  gallery: [doc.hero],
  film: "",
});

const PARIKRAMA_HERO = photo(
  "parikramaPalms",
  "Parikrama House — the long dark elevation beneath coconut palms",
);

const GARDENS_HERO = photo(
  "gardensDusk",
  "House of Secret Gardens at dusk: a lawn court between its stone wings, a stair lit along one wall",
);

const MANDALA_HERO = photo(
  "mandalaDusk",
  "Mandala House at dusk: a lit bedroom framed in the white façade above a terrace",
);

const SENTOSA_HERO = photo(
  "sentosaShelves",
  "Sentosa House: sheer curtains across full-height glazing beside a wall of bookshelves",
);

const CHILTERN_HERO = photo(
  "chilternPond",
  "Chiltern House at dusk: a glazed bedroom under a glass canopy beside a lily pond",
);

const JUHU_HERO = photo(
  "juhuAerial",
  "Juhu House from above: white terraces, a pool and a garden among palms",
);

const RITZ_HERO = photo(
  "ritzAerial",
  "The Ritz-Carlton Maldives from the air: a ring of water villas in the lagoon off the island",
);

const PATINA_HERO = photo(
  "patinaPavilion",
  "Patina Maldives: a villa living room open through sliding glazing to its pool",
);

const CARMICHAEL_HERO = photo(
  "carmichaelSkyline",
  "Carmichael Residences rising above the trees and rooftops of Mumbai at dusk",
);

const VILLA_HERO = photo("heroParikrama", "");

export const PROJECTS_SEED: ProjectDoc[] = [
  {
    id: "project-parikrama-murud-house",
    slug: "parikrama-house",
    status: "published",
    order: 0,
    nextSlug: "",
    placeholder: false,
    name: "Parikrama House",
    title: ["Parikrama", "House"],
    location: "Nandgaon, Maharashtra",
    architect: "SPASM Design Architects",
    year: 2021,
    categories: ["Residential"],
    description:
      "Parikrama House by SPASM Design Architects in Nandgaon, Maharashtra: a 750 sq. m residence in a coconut grove, with Durall Systems as window consultant.",
    figure: { label: "Built area", value: 750, unit: "m²" },
    hero: PARIKRAMA_HERO,
    card: null,
    facts: [
      fact("Architect", "SPASM Design Architects"),
      fact("Location", "Nandgaon, Maharashtra, India"),
      fact("Completed", "2021"),
      fact("Area", "750 m²"),
      fact("Photography", "Javier Callejas, Umang Shah"),
      fact("Durall’s Role", "Window Consultant"),
      fact("Glazing", "Panoramah! systems"),
      fact("Recognition", "RIBA International Award for Excellence 2026"),
    ],
    intro: {
      heading: "A house designed as a journey.",
      paragraphs: [
        "Set within a coconut grove in Nandgaon, Maharashtra, Parikrama House is a 750 sq. m residence by SPASM Design Architects that explores the relationship between architecture, landscape and movement.",
        "The house is organised around the idea of a parikrama — a continuous journey through and around a space. Its linear arrangement places living, dining and sleeping spaces along a carefully choreographed path, maintaining a constant connection with the surrounding landscape.",
        "Granite walls and expansive full-height glazing form the defining material language of the residence. The large glass openings allow the interior to remain visually connected to the tropical landscape while supporting natural ventilation and changing views throughout the day.",
      ],
    },
    plates: [
      plate(
        "parikramaPavilion",
        "The living pavilion under its cantilevered roof",
        "The living pavilion — roof plane cantilevered over glass and stone",
      ),
      plate(
        "parikramaVeranda",
        "The veranda with its stone floor and timber soffit",
        "The veranda — stone floor, timber soffit, sliding glass pockets open",
      ),
      plate(
        "parikramaGarden",
        "A view through the house to the garden",
        "Looking through the house to the garden",
      ),
      plate(
        "parikramaGrove",
        "The long elevation of the house in a coconut grove",
        "The long elevation set within the coconut grove",
      ),
      plate(
        "parikramaBedroom",
        "A bedroom opening onto the garden",
        "The bedroom held against the garden",
      ),
      plate(
        "parikramaSteps",
        "Steps and tropical planting along the veranda",
        "Steps and planting along the veranda edge",
      ),
      plate(
        "parikramaDining",
        "The dining pavilion open to the hills",
        "The dining pavilion open to the hills",
      ),
      plate("parikramaPalms", "The house beneath the palms", "The house beneath the palms"),
    ],
    scope: {
      ...photo("parikramaVerandaOpen", "The veranda with its sliding glass pockets fully open"),
      heading: "Where the house opens, Durall enters.",
      paragraphs: [
        "Durall Systems contributed as the window consultant, supporting the project’s high-performance minimal glazing approach. The result is a system of large movable glass openings designed to recede visually and allow the landscape to remain the dominant element.",
      ],
      facts: [fact("Role", "Window Consultant"), fact("Glazing", "Panoramah! systems")],
    },
    system: {
      ...photo(
        "parikramaPavilionOpen",
        "The living pavilion’s sliding glass panel open to the grove",
      ),
      title: ["Panoramah!", "systems"],
      body: "The glazing at Parikrama House is by Panoramah! systems: large movable glass openings, in a high-performance minimal glazing approach, designed to recede visually so that the landscape remains the dominant element.",
      points: [
        "Panoramah! systems",
        "Large movable glass openings",
        "High-performance minimal glazing",
      ],
    },
    experience: {
      ...photo("parikramaBedroomEvening", "The bedroom against the garden in evening light"),
      heading: "Where glass disappears, the landscape becomes architecture.",
      body: "Parikrama was recently recognised with the RIBA International Award for Excellence 2026, adding to its architectural significance.",
    },
    inPortfolio: false,
    home: {
      show: true,
      title: "Parikrama House",
      subtitle: "Nandgaon — SPASM Design Architects",
      image: asset("homeParikrama"),
    },
    isFeatured: true,
    feature: {
      eyebrow: "Featured Project",
      location: "Nandgaon, Maharashtra",
      title: ["Parikrama", "House"],
      architect: "SPASM Design Architects",
      description:
        "Set within a coconut grove in Nandgaon, Maharashtra, Parikrama House explores the relationship between architecture, landscape and movement. The house is organised around the idea of a parikrama — a continuous journey through and around a space.",
      specs: [
        fact("Typology", "Residence"),
        fact("Architect", "SPASM Design Architects"),
        fact("Durall’s Role", "Window Consultant"),
      ],
      award: { name: "RIBA International Award for Excellence", year: "2026" },
      gallery: [
        photo("projectFeatured", "Parikrama House — the pavilion under its cantilevered roof"),
        PARIKRAMA_HERO,
        photo("parikramaGrove", "The long elevation of Parikrama House in a coconut grove"),
        photo("parikramaPavilion", "The living pavilion of Parikrama House"),
        photo("parikramaDining", "The dining pavilion of Parikrama House, open to the hills"),
        photo("parikramaBedroom", "A bedroom of Parikrama House opening onto the garden"),
      ],
      film: "https://youtu.be/BGThbrrtnVY",
    },
  },
  {
    id: "project-house-of-secret-gardens",
    slug: "house-of-secret-gardens",
    status: "published",
    order: 1,
    nextSlug: "",
    placeholder: false,
    name: "House of Secret Gardens",
    title: ["House of", "Secret Gardens"],
    location: "Ahmedabad, Gujarat",
    architect: "SPASM Design",
    year: 2018,
    categories: ["Residential"],
    description:
      "House of Secret Gardens by SPASM Design in Ahmedabad: a 14,500 sq. ft sandstone residence organised around gardens and courtyards, with glazing systems by Durall.",
    figure: { label: "Built area", value: 14500, unit: "sq ft" },
    hero: GARDENS_HERO,
    card: null,
    facts: [
      fact("Architect", "SPASM Design"),
      fact("Location", "Ahmedabad, Gujarat, India"),
      fact("Completed", "2018"),
      fact("Area", "14,500 sq. ft"),
      fact("Photography", "Umang Shah, Photographix, Edmund Sumner, Javier Callejas"),
      fact("Durall’s Role", "Glazing systems"),
      fact("Systems", "60 mm and 38 mm glazing systems"),
    ],
    intro: {
      heading: "A stone house organised around its gardens.",
      paragraphs: [
        "The House of Secret Gardens is a 14,500 sq. ft private residence in Ahmedabad designed by SPASM Design. Conceived around a cross-shaped plan, the house is organised around a series of gardens, courtyards and water bodies that bring landscape deep into the living spaces.",
        "Dhrangadhra sandstone forms the monolithic exterior of the residence, while large glazed openings create moments of openness within the heavy stone structure. The contrast between the solid stone envelope and transparent glazing allows the house to balance privacy, shade, natural light and connection with its gardens.",
      ],
    },
    plates: [
      plate("gardensDusk", GARDENS_HERO.alt, "The lawn court at dusk"),
      plate(
        "gardensStair",
        "A stone stair rising beside a lily pond towards the planted roof",
        "The stair and lily pond below the planted roof",
      ),
      plate(
        "gardensWindow",
        "A glazed room seen through a square opening in the stone wall, a curved stair inside",
        "A glazed room framed by the sandstone wall",
      ),
      plate(
        "gardensPavilion",
        "A glass-walled dining room at the end of a stone colonnade, open to the lawn",
        "The glazed dining room at the end of the colonnade",
      ),
      plate(
        "gardensBedroom",
        "A bedroom with a timber ceiling and a full-length glass wall onto the garden",
        "A bedroom along its full-length glass wall",
      ),
      plate(
        "gardensGlass",
        "The living room’s glass wall under a roof overgrown with bougainvillea, across the lawn",
        "The living room’s glass wall under the planted roof",
      ),
      plate(
        "gardensSwing",
        "A swing bed in a stone court under a slatted skylight, beside a bare tree",
        "The swing court under its slatted skylight",
      ),
      plate(
        "heroCareers",
        "The living room at dusk, open to the terrace through a wide timber-framed opening",
        "The living room open to the terrace at dusk",
      ),
    ],
    scope: {
      ...photo(
        "gardensGlassClose",
        "Full-height glass wall of the living room under a roof overgrown with bougainvillea",
      ),
      heading: "Glazing for a house of stone.",
      paragraphs: [
        "Durall Systems supplied the glazing systems for the project, with the project documentation identifying Durall Systems India and Panoramah Windows under windows.",
      ],
      facts: [
        fact("Role", "Glazing systems"),
        fact("Windows", "Durall Systems India / Panoramah Windows"),
      ],
    },
    system: {
      ...photo(
        "gardensPavilion",
        "The glass-walled dining room at the end of a stone colonnade, open to the lawn",
      ),
      title: ["60 mm and", "38 mm glazing", "systems"],
      body: "Durall has documented the use of its 60 mm and 38 mm glazing systems on the House of Secret Gardens.",
      points: ["60 mm glazing system", "38 mm glazing system", "Panoramah Windows"],
    },
    experience: {
      ...photo(
        "gardensBedroom",
        "A bedroom with a timber ceiling and a full-length glass wall onto the garden",
      ),
      heading: "A monolithic stone residence shaped by gardens, light and expansive glazing.",
      body: "The glazing allows the gardens, water and changing natural light to become an integral part of the interior experience, while maintaining the clean architectural language of the residence.",
    },
    inPortfolio: true,
    home: {
      show: false,
      title: "House of Secret Gardens",
      subtitle: "Ahmedabad — SPASM Design",
      image: asset("gardensDusk"),
    },
    isFeatured: false,
    feature: featureOf({
      location: "Ahmedabad, Gujarat",
      title: ["House of", "Secret Gardens"],
      architect: "SPASM Design",
      description:
        "A 14,500 sq. ft private residence in Ahmedabad, organised around a series of gardens, courtyards and water bodies that bring landscape deep into the living spaces.",
      hero: GARDENS_HERO,
    }),
  },
  {
    id: "project-project-bangalore",
    slug: "mandala-house",
    status: "published",
    order: 2,
    nextSlug: "",
    placeholder: false,
    name: "Mandala House",
    title: ["Mandala", "House"],
    location: "Bengaluru",
    architect: "WOW Architects | Warner Wong Design",
    year: null,
    categories: ["Residential"],
    description:
      "Mandala House by WOW Architects | Warner Wong Design in Bengaluru, for which Durall delivered the façade, glazing systems and window solutions.",
    figure: null,
    hero: MANDALA_HERO,
    card: null,
    facts: [
      fact("Architect", "WOW Architects | Warner Wong Design"),
      fact("Location", "Bengaluru, India"),
      fact("Durall’s Role", "Façade, glazing systems and window solutions"),
    ],
    intro: {
      heading: "Traditional principles in a contemporary house.",
      paragraphs: [
        "Mandala House in Bengaluru explores the relationship between traditional Indian principles and contemporary residential architecture.",
        "Designed by WOW Architects | Warner Wong Design, the residence was conceived around the family’s desire for a contemporary home that remained connected to Indian traditions. Its architecture uses courtyards, dramatic openings, natural light and layered spaces to create a strong relationship between the interior and exterior.",
        "Glazing plays an important role in this experience. Large openings bring daylight deep into the residence while maintaining visual continuity between different spaces.",
      ],
    },
    plates: [
      plate("mandalaDusk", MANDALA_HERO.alt, "A bedroom framed in the façade at dusk"),
      plate(
        "mandalaDining",
        "The dining pavilion, open on both sides to a courtyard tree",
        "The dining pavilion, open through to the courtyard",
      ),
      plate(
        "mandalaLiving",
        "The living room, glazed on two sides, under a crystal ceiling light",
        "The living room, glazed on two sides",
      ),
      plate(
        "mandalaPool",
        "Two white wings of the house either side of a pool court",
        "The pool court between the two wings",
      ),
      plate(
        "mandalaNight",
        "The house at night across the pool, its rooms lit behind full-height glazing",
        "The garden front at night",
      ),
    ],
    scope: {
      ...photo("mandalaLiving", "The living room of Mandala House, glazed on two sides"),
      heading: "Façade, glazing and windows.",
      paragraphs: [
        "For Mandala House, Durall delivered the façade, glazing systems and window solutions, enabling expansive openings while maintaining clean sightlines and supporting the architectural intent of the residence.",
      ],
      facts: [fact("Role", "Façade, glazing systems and window solutions")],
    },
    system: noSystem(MANDALA_HERO),
    experience: {
      ...photo("mandalaDining", "The dining pavilion of Mandala House, open to a courtyard tree"),
      heading:
        "Glazing becomes part of the architecture, shaping how light and space are experienced.",
      body: "The project demonstrates how glazing can function as more than a transparent surface — it can influence light, openness, movement and the way spaces are experienced.",
    },
    inPortfolio: true,
    home: {
      show: false,
      title: "Mandala House",
      subtitle: "Bengaluru — WOW Architects",
      image: asset("mandalaDusk"),
    },
    isFeatured: false,
    feature: featureOf({
      location: "Bengaluru",
      title: ["Mandala", "House"],
      architect: "WOW Architects | Warner Wong Design",
      description:
        "A contemporary home that remains connected to Indian traditions, using courtyards, dramatic openings, natural light and layered spaces.",
      hero: MANDALA_HERO,
    }),
  },
  {
    id: "project-sentosa-house",
    slug: "sentosa-house",
    status: "published",
    order: 3,
    nextSlug: "",
    placeholder: false,
    name: "Sentosa House",
    title: ["Sentosa", "House"],
    location: "Singapore",
    architect: "Studio MK27",
    year: 2020,
    categories: ["Residential", "International"],
    description:
      "Sentosa House by Studio MK27 in Singapore: a 930 sq. m residence with minimal window frames and glazing about six metres high, with glazing by Durall Systems.",
    figure: { label: "Built area", value: 930, unit: "m²" },
    hero: SENTOSA_HERO,
    card: null,
    facts: [
      fact("Architecture & Interiors", "Studio MK27"),
      fact("Location", "Singapore"),
      fact("Completed", "2020"),
      fact("Area", "930 m²"),
      fact("Photography", "Jovian Lim"),
      fact("Durall’s Role", "Glazing systems"),
    ],
    intro: {
      heading: "An existing house, precisely redefined.",
      paragraphs: [
        "Sentosa House is a 930 sq. m residence in Singapore designed by Studio MK27. The project focuses on carefully redefining an existing house through a series of precise architectural interventions.",
        "One of its defining elements is the use of minimal window frames with large glass panes. In the living room, the glazing reaches approximately six metres in height, creating a strong visual connection between the interior and the surrounding landscape.",
      ],
    },
    plates: [
      plate("sentosaShelves", SENTOSA_HERO.alt, "Sheer curtains and the wall of bookshelves"),
      plate(
        "sentosaLounge",
        "Lounge chairs in afternoon light filtered through bamboo and curtains",
        "Afternoon light through the bamboo patio",
      ),
      plate(
        "sentosaLiving",
        "The double-height living room, its tall glazing behind sheer curtains",
        "The living room, where the glazing rises about six metres",
      ),
      plate(
        "sentosaBedroom",
        "A bedroom with a timber wall and a glazed corner veiled by sheer curtains",
        "The bedroom, its glazed corner behind sheer curtains",
      ),
      plate("sentosaShadow", "Palm shadows cast on a sheer curtain", "Palm shadows on the curtain"),
    ],
    scope: {
      ...photo(
        "sentosaBedroom",
        "A bedroom of Sentosa House with a glazed corner veiled by sheer curtains",
      ),
      heading: "Precision-engineered glazing.",
      paragraphs: [
        "Durall Systems contributed its precision-engineered glazing to the project, supporting the architectural intention of creating large, uninterrupted connections between interior spaces and the tropical landscape.",
      ],
      facts: [fact("Role", "Glazing systems")],
    },
    system: noSystem(SENTOSA_HERO),
    experience: {
      ...photo(
        "sentosaLiving",
        "The double-height living room of Sentosa House, its tall glazing behind sheer curtains",
      ),
      heading:
        "Large panes of glass dissolve the boundary between the home and its tropical landscape.",
      body: "The architecture deliberately extends the experience of the interior into the garden. A bamboo-filled inner patio filters sunlight, while the large glazed openings allow natural light and landscape views to become part of the living spaces.",
    },
    inPortfolio: true,
    home: {
      show: false,
      title: "Sentosa House",
      subtitle: "Singapore — Studio MK27",
      image: asset("sentosaShelves"),
    },
    isFeatured: false,
    feature: featureOf({
      location: "Singapore",
      title: ["Sentosa", "House"],
      architect: "Studio MK27",
      description:
        "A 930 sq. m residence in Singapore: an existing house carefully redefined through a series of precise architectural interventions.",
      hero: SENTOSA_HERO,
    }),
  },
  {
    id: "project-chiltron-house",
    slug: "chiltern-house",
    status: "published",
    order: 4,
    nextSlug: "",
    placeholder: false,
    name: "Chiltern House",
    title: ["Chiltern", "House"],
    location: "Singapore",
    architect: "WOW Architects | Warner Wong Design",
    year: 2013,
    categories: ["Residential", "International"],
    description:
      "Chiltern House by WOW Architects | Warner Wong Design in Singapore: raw concrete, timber and landscape, with large-format glazing by Durall Systems.",
    figure: { label: "Built area", value: 493, unit: "m²" },
    hero: CHILTERN_HERO,
    card: null,
    facts: [
      fact("Architect", "WOW Architects | Warner Wong Design"),
      fact("Location", "Singapore"),
      fact("Completed", "2013"),
      fact("Area", "493 m²"),
      fact("Photography", "Aaron Pocock"),
      fact("Durall’s Role", "Large-format glazing"),
    ],
    intro: {
      heading: "Raw concrete, timber, landscape and light.",
      paragraphs: [
        "Located on Chiltern Drive in Singapore, Chiltern House is a residential project by WOW Architects | Warner Wong Design that brings together raw concrete, timber, landscape and carefully positioned openings.",
        "The house is organised around light, ventilation and views. Its elevated structure allows light and air to move through the lower levels, while tall windows and long horizontal openings establish a continuous relationship between the living spaces and the surrounding landscape.",
      ],
    },
    plates: [
      plate("chilternPond", CHILTERN_HERO.alt, "The bedroom beside the lily pond at dusk"),
      plate(
        "chilternLiving",
        "The living room open to a reflecting pool at dusk, its tall glazing slid aside",
        "The living room open to the pool at dusk",
      ),
      plate(
        "chilternPool",
        "The pool terrace under a slatted canopy, the glazed living room behind, at dusk",
        "The pool terrace under its slatted canopy",
      ),
      plate(
        "chilternBedroom",
        "A bedroom with a long horizontal window onto a roof pond and the city beyond",
        "The bedroom’s long horizontal window",
      ),
      plate(
        "chilternLounge",
        "A sitting room with raw concrete walls and a long window onto trees",
        "The sitting room and its long window",
      ),
      plate(
        "chilternCorner",
        "A glass corner reflecting the sky above a planted court",
        "A glass corner over the planted court",
      ),
      plate(
        "chilternStudy",
        "A study with a full-width window opening onto a roof garden",
        "The study, open to the roof garden",
      ),
    ],
    scope: {
      ...photo(
        "chilternBedroom",
        "A bedroom of Chiltern House with a long horizontal window onto a roof pond",
      ),
      heading: "Large-format glazing.",
      paragraphs: [
        "Durall Systems contributed large-format glazing to the project, supporting expansive openings designed to maximise natural daylight, frame views and maintain minimal visual lines between the interior and exterior.",
      ],
      facts: [fact("Role", "Large-format glazing")],
    },
    system: noSystem(CHILTERN_HERO),
    experience: {
      ...photo(
        "chilternLiving",
        "The living room of Chiltern House open to a reflecting pool at dusk",
      ),
      heading:
        "Large-format glazing brings light, landscape and architecture into one continuous experience.",
      body: "The result is an architecture where the glazing remains visually restrained, allowing the materiality of the concrete, timber and surrounding landscape to define the experience.",
    },
    inPortfolio: true,
    home: {
      show: true,
      title: "Chiltern House",
      subtitle: "Singapore — WOW Architects",
      image: asset("homeChiltern"),
    },
    isFeatured: false,
    feature: featureOf({
      location: "Singapore",
      title: ["Chiltern", "House"],
      architect: "WOW Architects | Warner Wong Design",
      description:
        "A house on Chiltern Drive that brings together raw concrete, timber, landscape and carefully positioned openings.",
      hero: CHILTERN_HERO,
    }),
  },
  {
    id: "project-juhu-house",
    slug: "juhu-house",
    status: "published",
    order: 5,
    nextSlug: "",
    placeholder: false,
    name: "Juhu House",
    title: ["Juhu", "House"],
    location: "Mumbai",
    architect: "Ernesto Bedmar",
    year: null,
    categories: ["Residential"],
    description:
      "Juhu House by Ernesto Bedmar in Mumbai: a residence characterised by expansive glazing, to which Durall Systems contributed.",
    figure: null,
    hero: JUHU_HERO,
    card: null,
    facts: [
      fact("Architect", "Ernesto Bedmar"),
      fact("Location", "Mumbai, India"),
      fact("Durall Association", "Expansive glazing"),
    ],
    intro: {
      heading: "Openness, natural light and the surroundings.",
      paragraphs: [
        "Juhu House explores openness, natural light and the relationship between the home and its surroundings. The residence is characterised by expansive glazing that allows the surrounding environment to become part of the living experience.",
      ],
    },
    plates: [
      plate("juhuAerial", JUHU_HERO.alt, "The house, pool and garden from above"),
      plate(
        "juhuCourt",
        "A court under a slatted timber roof, light falling in stripes on a white wall",
        "The court under its slatted timber roof",
      ),
      plate(
        "juhuGlazing",
        "Double-height glazing framing the pool and palms from the living room",
        "Double-height glazing onto the pool",
      ),
      plate(
        "juhuLiving",
        "The living room behind full-height glazing, the garden and palms beyond",
        "The living room and its wall of glass",
      ),
      plate(
        "juhuTerrace",
        "A roof terrace with a timber pergola, looking over the neighbourhood",
        "The roof terrace",
      ),
      plate(
        "juhuShutters",
        "Timber shutters folded back along the stepped white façade",
        "Timber shutters along the garden façade",
      ),
      plate(
        "juhuDusk",
        "The house at dusk, its rooms lit behind a stone boundary wall",
        "Dusk, from the stone boundary wall",
      ),
    ],
    scope: {
      ...photo(
        "juhuLiving",
        "The living room of Juhu House behind full-height glazing, the garden beyond",
      ),
      heading: "Expansive glazing.",
      paragraphs: [
        "Durall Systems has documented Juhu House as a project featuring its contribution to the expansive glazing system. The project reflects Durall’s approach to creating architectural openings that remain visually restrained while allowing light, views and space to take precedence.",
      ],
      facts: [fact("Durall Association", "Expansive glazing")],
    },
    system: noSystem(JUHU_HERO),
    experience: {
      ...photo("juhuDusk", "Juhu House at dusk, its rooms lit behind a stone boundary wall"),
      heading: "Expansive glazing allows the surroundings to become part of the living experience.",
      body: "The large glazed openings create a sense of continuity between the interior and exterior, bringing natural light and views deeper into the residence while maintaining a clean and restrained architectural language.",
    },
    inPortfolio: true,
    home: {
      show: true,
      title: "Juhu House",
      subtitle: "Mumbai — Ernesto Bedmar",
      image: asset("homeJuhu"),
    },
    isFeatured: false,
    feature: featureOf({
      location: "Mumbai",
      title: ["Juhu", "House"],
      architect: "Ernesto Bedmar",
      description:
        "A residence characterised by expansive glazing that allows the surrounding environment to become part of the living experience.",
      hero: JUHU_HERO,
    }),
  },
  {
    id: "project-ritz-carlton-maldives",
    slug: "ritz-carlton-maldives",
    status: "published",
    order: 6,
    nextSlug: "",
    placeholder: false,
    name: "The Ritz-Carlton, Fari Islands",
    title: ["The Ritz-Carlton", "Fari Islands"],
    location: "Fari Islands, Maldives",
    architect: "Kerry Hill Architects",
    year: 2021,
    categories: ["Hospitality", "International"],
    description:
      "The Ritz-Carlton Maldives, Fari Islands by Kerry Hill Architects: a resort of circular villas for which Durall supplied and executed the aluminium window systems.",
    figure: { label: "Completed", value: 2021, unit: "" },
    hero: RITZ_HERO,
    card: null,
    facts: [
      fact("Architect", "Kerry Hill Architects"),
      fact("Location", "Fari Islands, Maldives"),
      fact("Completed", "2021"),
      fact("Photography", "Christopher Cypert"),
      fact("Durall’s Role", "Supplied and executed aluminium window systems"),
    ],
    intro: {
      heading: "A resort shaped by the Indian Ocean.",
      paragraphs: [
        "The Ritz-Carlton Maldives, Fari Islands is a luxury resort designed by Kerry Hill Architects, located within the Fari Islands archipelago in the Maldives.",
        "The architecture is shaped around its relationship with the surrounding Indian Ocean. Its circular villas and restrained architectural language create a strong connection between the built environment and the island landscape.",
      ],
    },
    plates: [
      plate("ritzAerial", RITZ_HERO.alt, "The ring of water villas off the island"),
      plate(
        "ritzVilla",
        "A circular water villa at dusk, its bedroom open to the lagoon",
        "A water villa, open to the lagoon at dusk",
      ),
      plate(
        "ritzRing",
        "The ring of water villas in the lagoon, seen from high above",
        "The water villas from above",
      ),
      plate(
        "ritzBedroom",
        "A bedroom with its sliding glazing drawn back to the infinity pool and the sea",
        "A bedroom, its glazing drawn back to the sea",
      ),
      plate(
        "ritzBeach",
        "A bedroom looking through a wide opening to palms and the beach",
        "A beach villa bedroom opening onto the sand",
      ),
      plate(
        "ritzShore",
        "Beach villas behind the tree line along the shore",
        "Beach villas along the shore",
      ),
      plate(
        "ritzGarden",
        "A circular beach villa and its pool among the island’s palms",
        "A beach villa among the island’s palms",
      ),
      plate(
        "ritzDeck",
        "A daybed on a villa deck at sunset, beside the infinity pool",
        "Sunset from a villa deck",
      ),
      plate(
        "ritzSpa",
        "The circular spa pavilion at the centre of the ring of water villas",
        "The spa pavilion within the ring",
      ),
      plate(
        "ritzEvening",
        "A villa interior lit at evening behind its pool",
        "Evening, across the pool",
      ),
      plate(
        "ritzPool",
        "A curved pool deck under a villa’s louvred roof, the bedroom open alongside",
        "The curved pool deck of a beach villa",
      ),
    ],
    scope: {
      ...photo(
        "ritzBedroom",
        "A villa bedroom at the Ritz-Carlton Maldives, its sliding glazing drawn back to the sea",
      ),
      heading: "Aluminium window systems, supplied and executed.",
      paragraphs: [
        "For the project, Durall Systems supplied and executed the aluminium window systems, contributing to the large glazed openings that connect the interiors with the surrounding landscape.",
      ],
      facts: [fact("Role", "Supplied and executed aluminium window systems")],
    },
    system: noSystem(RITZ_HERO),
    experience: {
      ...photo(
        "ritzEvening",
        "A villa at the Ritz-Carlton Maldives lit at evening behind its pool",
      ),
      heading:
        "Glazing frames the Indian Ocean, keeping the landscape at the centre of the experience.",
      body: "Expansive glazing plays an important role in this relationship, framing views of the ocean and allowing the surrounding landscape to remain central to the guest experience.",
    },
    inPortfolio: true,
    home: {
      show: true,
      title: "The Ritz-Carlton",
      subtitle: "Fari Islands — Kerry Hill Architects",
      image: asset("homeRitz"),
    },
    isFeatured: false,
    feature: featureOf({
      location: "Fari Islands, Maldives",
      title: ["The Ritz-Carlton", "Fari Islands"],
      architect: "Kerry Hill Architects",
      description:
        "A luxury resort in the Fari Islands archipelago, its circular villas shaped around their relationship with the Indian Ocean.",
      hero: RITZ_HERO,
    }),
  },
  {
    id: "project-patina",
    slug: "patina-maldives",
    status: "published",
    order: 7,
    nextSlug: "",
    placeholder: false,
    name: "Patina Maldives",
    title: ["Patina", "Maldives"],
    location: "Fari Islands, Maldives",
    architect: "Studio MK27",
    year: 2021,
    categories: ["Hospitality", "International"],
    description:
      "Patina Maldives by Studio MK27 in the Fari Islands: a 34,500 m² resort where expansive glazing, documented by Panoramah!, opens the interiors to the ocean.",
    figure: { label: "Built area", value: 34500, unit: "m²" },
    hero: PATINA_HERO,
    card: null,
    facts: [
      fact("Architecture", "Studio MK27 — Marcio Kogan"),
      fact("Location", "Fari Islands, Maldives"),
      fact("Completed", "2021"),
      fact("Area", "34,500 m²"),
      fact("Photography", "Georg Roske"),
      fact("Durall Association", "Contribution to the project’s glazing solution"),
      fact("Panoramah! System", "Project documented by Panoramah!"),
    ],
    intro: {
      heading: "Architecture, nature and social life.",
      paragraphs: [
        "Patina Maldives is a hospitality project by Studio MK27, designed around a strong connection between architecture, nature and social interaction.",
        "The resort is composed of spaces that move between private and public, enclosed and open, creating a sequence of different atmospheres across the island. Natural materials, vegetation, light and transparency are central to the architectural experience.",
      ],
    },
    plates: [
      plate("patinaPavilion", PATINA_HERO.alt, "A villa living room, open to its pool"),
      plate(
        "patinaSuite",
        "A villa interior open to a deck, a hammock and the Indian Ocean",
        "A villa open to its deck and the ocean",
      ),
      plate(
        "patinaWaterVillas",
        "Water villas on the horizon across the sea",
        "Water villas on the horizon",
      ),
      plate(
        "patinaVillaPool",
        "A villa’s pool and timber deck set in tropical planting",
        "A villa’s pool and deck",
      ),
      plate(
        "patinaBeach",
        "A beach house with a brick screen wall behind palms and a sand court",
        "A beach house behind the palms",
      ),
      plate(
        "patinaIsland",
        "The island from above: villas among the trees between two beaches",
        "The island from above",
      ),
      plate(
        "patinaBar",
        "A bar and dining room under a timber ceiling with woven pendant lights",
        "The bar, under woven pendants",
      ),
      plate(
        "patinaLounge",
        "A lounge with a timber ceiling and long windows onto the beach",
        "The lounge",
      ),
      plate(
        "patinaRestaurant",
        "A restaurant counter in dark timber under pendant lamps",
        "The restaurant counter",
      ),
      plate(
        "patinaTerrace",
        "A shaded terrace with a hammock, looking into palms",
        "A shaded terrace among the palms",
      ),
      plate(
        "patinaShore",
        "A beach villa and its pool from above, beside the surf",
        "A beach villa at the water’s edge",
      ),
    ],
    scope: {
      ...photo(
        "patinaSuite",
        "A villa at Patina Maldives open to its deck, a hammock and the Indian Ocean",
      ),
      heading: "A contribution to the glazing solution.",
      paragraphs: [
        "Durall Systems has publicly identified its contribution to Patina Maldives through its work with Panoramah!, highlighting the project’s expansive glazing and the role of precision engineering in creating seamless connections between interior and exterior.",
      ],
      facts: [
        fact("Durall Association", "Contribution to the project’s glazing solution"),
        fact("Panoramah! System", "Project documented by Panoramah!"),
      ],
    },
    system: noSystem(PATINA_HERO),
    experience: {
      ...photo("patinaBeach", "A beach house at Patina Maldives behind palms and a sand court"),
      heading:
        "Architecture dissolves into the landscape through light, transparency and expansive glazing.",
      body: "Expansive glazing allows the boundary between the interior and the surrounding landscape to become visually minimal. The result is a series of spaces where ocean views, natural light and tropical surroundings become part of the architecture.",
    },
    inPortfolio: true,
    home: {
      show: true,
      title: "Patina Maldives",
      subtitle: "Fari Islands — Studio MK27",
      image: asset("homePatina"),
    },
    isFeatured: false,
    feature: featureOf({
      location: "Fari Islands, Maldives",
      title: ["Patina", "Maldives"],
      architect: "Studio MK27",
      description:
        "A hospitality project designed around a strong connection between architecture, nature and social interaction.",
      hero: PATINA_HERO,
    }),
  },
  {
    id: "project-carmichael-residences",
    slug: "carmichael-residences",
    status: "published",
    order: 8,
    nextSlug: "",
    placeholder: false,
    name: "Carmichael Residences",
    title: ["Carmichael", "Residences"],
    location: "Mumbai",
    architect: "Skidmore, Owings & Merrill (SOM)",
    year: 2022,
    categories: ["Residential"],
    description:
      "Carmichael Residences by SOM in Mumbai: a 21-storey residential tower for which Durall engineered and delivered custom operable wooden sliding screens.",
    figure: { label: "Built area", value: 17500, unit: "m²" },
    hero: CARMICHAEL_HERO,
    card: null,
    facts: [
      fact("Architecture", "Skidmore, Owings & Merrill (SOM)"),
      fact("Location", "Mumbai, India"),
      fact("Completed", "2022"),
      fact("Building", "21 storeys / 70 m"),
      fact("Area", "17,500 m²"),
      fact("Photography", "Studio Recall"),
      fact("Durall’s Role", "Custom operable wooden sliding screen systems"),
    ],
    intro: {
      heading: "A tower designed for Mumbai’s climate.",
      paragraphs: [
        "Carmichael Residences is a high-end residential development in Mumbai designed by Skidmore, Owings & Merrill (SOM). The project creates a vertical residential environment closely connected to the greenery and character of Carmichael Road.",
        "The building uses a combination of deep overhangs, greenery, high-performance operable glazing and sliding wooden screens to respond to Mumbai’s tropical climate.",
      ],
    },
    plates: [
      plate(
        "carmichaelScreens",
        "An apartment interior with sliding timber screens across full-height glazing, a figure reading in a chair",
        "Sliding timber screens across the glazing",
      ),
      plate("carmichaelSkyline", CARMICHAEL_HERO.alt, "The tower above Carmichael Road"),
      plate(
        "carmichaelFacade",
        "Timber screens between deep floor bands on the tower’s façade, the city beyond",
        "The façade: timber screens between deep floor bands",
      ),
      plate(
        "heroProjects",
        "The upper floors of the tower, timber-toned panels between deep white floor bands",
        "The upper floors above the city",
      ),
    ],
    scope: {
      ...photo(
        "carmichaelScreens",
        "Sliding timber screens across full-height glazing in an apartment at Carmichael Residences",
      ),
      heading: "Custom operable wooden sliding screens.",
      paragraphs: [
        "Durall Systems is listed by SOM as one of the project’s collaborators. Durall specifically engineered and delivered the custom operable wooden sliding screen systems, using precision-engineered tracks designed to integrate with the architecture.",
      ],
      facts: [fact("Role", "Custom operable wooden sliding screen systems")],
    },
    system: noSystem(CARMICHAEL_HERO),
    experience: {
      ...photo(
        "carmichaelFacade",
        "Timber screens between deep floor bands on the façade of Carmichael Residences",
      ),
      heading: "Designed to breathe, open and adapt to the climate of Mumbai.",
      body: "The fully operable glazing supports natural ventilation and views towards the Arabian Sea, while the sliding wooden screens allow residents to control privacy, shade and connection to the outdoors.",
    },
    inPortfolio: true,
    home: {
      show: false,
      title: "Carmichael Residences",
      subtitle: "Mumbai — SOM",
      image: asset("carmichaelSkyline"),
    },
    isFeatured: false,
    feature: featureOf({
      location: "Mumbai",
      title: ["Carmichael", "Residences"],
      architect: "Skidmore, Owings & Merrill (SOM)",
      description:
        "A vertical residential environment closely connected to the greenery and character of Carmichael Road.",
      hero: CARMICHAEL_HERO,
    }),
  },
  {
    /* Written and ready, but a draft: there are no photographs of it yet.
     * Give it a hero and a gallery, then publish. */
    id: "project-villa-in-the-sky",
    slug: "villa-in-the-sky",
    status: "draft",
    order: 9,
    nextSlug: "",
    placeholder: false,
    name: "Villa in the Sky",
    title: ["Villa in", "the Sky"],
    location: "Mumbai",
    architect: "Abraham John Architects",
    year: 2011,
    categories: ["Residential"],
    description:
      "Villa in the Sky by Abraham John Architects in Mumbai: a 3,500 sq. ft penthouse for which Durall executed the sliding window systems and skylight glazing.",
    figure: { label: "Built area", value: 3500, unit: "sq ft" },
    hero: VILLA_HERO,
    card: null,
    facts: [
      fact("Architecture", "Abraham John Architects"),
      fact("Location", "Mumbai, India"),
      fact("Year", "2011"),
      fact("Area", "3,500 sq. ft"),
      fact("Status", "Completed"),
      fact("Durall’s Role", "Sliding window systems and skylight glazing"),
    ],
    intro: {
      heading: "Two apartments, one house in the sky.",
      paragraphs: [
        "Villa in the Sky is a luxury penthouse in Mumbai designed by Abraham John Architects. The project was created by combining two existing apartments into a contemporary residence designed around an open-plan layout and its seaside location.",
        "The design focuses on integrating indoor and outdoor spaces while making the most of the site’s views and climate. A large glass-walled media room overlooks the ocean, while a wooden deck, skylight and garden terrace extend the living experience outdoors.",
      ],
    },
    plates: [],
    scope: {
      ...VILLA_HERO,
      heading: "Sliding windows and skylight glazing.",
      paragraphs: [
        "Durall Systems has publicly documented its contribution to the residence, having executed the sliding window systems and skylight glazing. The sliding windows maximise natural light and frame uninterrupted views, while the skylight brings daylight deeper into the living spaces.",
      ],
      facts: [fact("Role", "Sliding window systems and skylight glazing")],
    },
    system: noSystem(VILLA_HERO),
    experience: {
      ...VILLA_HERO,
      heading: "Glazing opens the penthouse to the sky, the sea and the light.",
      body: "",
    },
    inPortfolio: true,
    home: {
      show: false,
      title: "Villa in the Sky",
      subtitle: "Mumbai — Abraham John Architects",
      image: asset("heroParikrama"),
    },
    isFeatured: false,
    feature: featureOf({
      location: "Mumbai",
      title: ["Villa in", "the Sky"],
      architect: "Abraham John Architects",
      description:
        "A luxury penthouse made by combining two apartments into a contemporary residence designed around an open plan and its seaside location.",
      hero: VILLA_HERO,
    }),
  },
];
