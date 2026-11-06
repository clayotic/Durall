import type { SectionSpec } from "@/admin/form/spec";
import type { PageKey } from "@/content/types";
import {
  area,
  cta,
  ctaBand,
  group,
  iconItems,
  image,
  lines,
  link,
  list,
  number,
  paragraphs,
  photo,
  seo,
  strings,
  text,
  twoTone,
} from "./build";

/**
 * Every page's edit form, section by section in the order they appear on the
 * page. The descriptions say where each one is, in the words someone
 * looking at the site would use.
 */

const SEO: SectionSpec = {
  id: "seo",
  title: "Search & Sharing",
  description: "How the page appears in Google results and when a link to it is shared.",
  fields: [seo()],
};

/** The full-width photographic opening (About, Partners, Projects). */
const photoHero = (description: string): SectionSpec => ({
  id: "opening",
  title: "Opening (Hero)",
  description,
  fields: [
    photo("opening.photo", "Background photograph"),
    lines("opening.heading", "Heading"),
    area("opening.body", "Text", { rows: 3 }),
  ],
});
export const PAGE_FORMS: Record<PageKey, SectionSpec[]> = {
  home: [
    {
      id: "hero",
      title: "Opening (Hero)",
      description: "The full-screen photograph and heading at the top of the home page.",
      fields: [
        photo("hero.photo", "Background photograph"),
        text("hero.heading", "Heading"),
        area("hero.body", "Text", { rows: 3 }),
        cta("hero.primary", "First button"),
        cta("hero.secondary", "Second button"),
      ],
    },
    {
      id: "philosophy",
      title: "Philosophy",
      description: "“Luxury is never applied” — the section under the hero.",
      fields: [
        twoTone("philosophy.heading"),
        paragraphs("philosophy.paragraphs"),
        cta("philosophy.link", "Link"),
        photo("philosophy.photo", "Photograph"),
      ],
    },
    {
      id: "projects",
      title: "Projects",
      description:
        "The heading over the project cards. Which projects appear is set per project: open a project and switch on “Show on the home page”.",
      fields: [lines("projects.heading", "Heading"), area("projects.lede", "Text", { rows: 3 })],
    },
    {
      id: "insights",
      title: "Insights",
      description:
        "The heading and photograph over the latest articles. The four newest published articles appear here (a pinned one first).",
      fields: [
        text("insights.heading", "Heading"),
        photo("insights.photo", "Photograph", {
          hint: "The large picture beside the newest article.",
        }),
      ],
    },
    SEO,
  ],

  about: [
    photoHero("The full-width photograph and heading at the top of the About page."),
    {
      id: "story",
      title: "About Durall",
      description: "The year Durall began, two figures under it, and the story beside them.",
      fields: [
        text("story.eyebrow", "Small heading"),
        text("story.heading", "Heading"),
        list<{ label: string; value: string }>(
          "story.facts",
          "Figures",
          [text("value", "Figure"), text("label", "Label")],
          (item) => (item.label ? `${item.value} ${item.label}` : ""),
          { create: () => ({ value: "", label: "" }), max: 4 },
        ),
        area("story.lead", "Opening", { rows: 2 }),
        area("story.emphasis", "Line in navy", { rows: 2, hint: "Follows the opening." }),
        area("story.body", "Rest of the story", { rows: 6 }),
      ],
    },
    {
      id: "approach",
      title: "Our Approach",
      description: "The animated diagram: four capabilities joining into the Durall mark.",
      fields: [
        text("approach.eyebrow", "Title above the diagram"),
        lines("approach.heading", "Heading"),
        area("approach.body", "Text", { rows: 3 }),
        iconItems("approach.capabilities", "Capabilities", { fixed: true }),
        photo("approach.mark", "Centre mark"),
        photo("approach.drawing", "Drawing"),
        text("approach.outcomeTitle", "Outcome heading"),
        area("approach.outcomeBody", "Outcome text", { rows: 2 }),
      ],
    },
    {
      id: "philosophy",
      title: "Philosophy",
      description: "The heading, text and three principles under the hero.",
      fields: [
        text("philosophy.heading", "Heading"),
        area("philosophy.body", "Text", { rows: 4 }),
        text("philosophy.emphasis", "Bold line"),
        cta("philosophy.link", "Link"),
        iconItems("philosophy.features", "Principles", { fixed: true }),
        photo("philosophy.photo", "Photograph"),
      ],
    },
    {
      id: "meets",
      title: "Where Architecture Meets Engineering",
      fields: [
        text("meets.heading", "Heading"),
        paragraphs("meets.paragraphs"),
        photo("meets.photo", "Photograph"),
      ],
    },
    SEO,
  ],

  projects: [
    photoHero("The full-width photograph and heading at the top of the Projects page."),
    {
      id: "labels",
      title: "Portfolio Labels",
      description:
        "The words around the featured project and the grid. The projects themselves are edited under Projects.",
      fields: [
        text("featured.exploreLabel", "Featured project link"),
        text("grid.sort", "Sort button"),
        text("grid.view", "Card link"),
        text("grid.empty", "When a filter has no projects"),
      ],
    },
    {
      id: "cta",
      title: "Closing Band",
      description: "The navy band at the foot of the page.",
      fields: ctaBand("cta"),
    },
    {
      id: "detail",
      title: "Project Pages",
      description: "Labels and the closing band shared by every project’s own page.",
      fields: [
        text("detail.heroPrefix", "Before the location in the hero"),
        text("detail.info", "Facts heading"),
        text("detail.intro", "Introduction heading"),
        text("detail.gallery", "Gallery heading"),
        text("detail.plates", "After the photograph count"),
        text("detail.scope", "Scope heading"),
        text("detail.system", "System heading"),
        text("detail.experience", "Experience heading"),
        text("detail.next", "Next project label"),
        group("", "Closing band", ctaBand("detail.cta")),
      ],
    },
    SEO,
  ],

  partners: [
    photoHero("The full-width photograph and heading at the top of the Partners page."),
    {
      id: "practices",
      title: "Architects & Design Practices",
      description:
        "The words around the world map and the practices' logos. The map marks each practice's country by itself; the practices are edited under Partners.",
      fields: [
        text("practices.eyebrow", "Small heading"),
        text("practices.heading", "Heading"),
        area("practices.lead", "Text", { rows: 3 }),
        area("practices.note", "Smaller text", { rows: 2 }),
        text("practices.tagline", "Line under the logos"),
      ],
    },
    SEO,
  ],

  insights: [
    {
      id: "intro",
      title: "Opening",
      description:
        "The heading above the list of articles. The articles are edited under Insights.",
      fields: [text("intro.title", "Heading"), area("intro.lede", "Text", { rows: 3 })],
    },
    {
      id: "films",
      title: "Films",
      description:
        "The band of films under the lead story. It appears once an insight set to Film is published with a YouTube or Vimeo link.",
      fields: [
        text("films.heading", "Heading"),
        area("films.lede", "Text", { rows: 2 }),
        text("films.notes", "Link to the film's own page"),
      ],
    },
    {
      id: "index",
      title: "All Insights",
      description: "The full list under the films, and its filters.",
      fields: [
        text("index.heading", "Heading"),
        text("index.allTopics", "“All topics” filter"),
        text("index.allFormats", "“All” format filter"),
        text("index.articles", "Articles filter"),
        text("index.films", "Films filter"),
        text("index.empty", "When a filter finds nothing"),
        text("index.showAll", "Link that clears the filters"),
      ],
    },
    {
      id: "labels",
      title: "Card Words",
      description: "The small words on every article and film card.",
      fields: [
        text("labels.article", "Article label"),
        text("labels.film", "Film label"),
        text("labels.read", "Read link"),
        text("labels.watch", "Watch link"),
        text("labels.play", "Play button (read aloud by screen readers)"),
      ],
    },
    { id: "cta", title: "Closing Band", fields: ctaBand("cta") },
    {
      id: "article",
      title: "Article Pages",
      description: "The words around an article that is not a part of the series.",
      fields: [
        text("article.backLabel", "Back link"),
        text("article.moreHeading", "“More” heading"),
        text("article.contents", "Heading over the list of sections"),
        text("article.share", "Share heading"),
        text("article.copyLink", "Copy-link button"),
        text("article.copied", "Message once the link is copied"),
      ],
    },
    {
      id: "article-cta",
      title: "Closing Band of Articles",
      description: "The navy band at the foot of every article.",
      fields: ctaBand("article.cta"),
    },
    SEO,
  ],

  careers: [
    {
      id: "opening",
      title: "Opening (Hero)",
      description: "The photograph and heading at the top of the Careers page.",
      fields: [
        photo("opening.photo", "Background photograph"),
        lines("opening.heading", "Heading"),
        area("opening.body", "Text", { rows: 3 }),
      ],
    },
    {
      id: "roles",
      title: "Current Openings",
      description:
        "The words around the list of roles. The roles themselves are edited under Careers; the team filters are made from them.",
      fields: [
        text("roles.eyebrow", "Small heading"),
        text("roles.heading", "Heading"),
        text("roles.allRoles", "Filter that shows every team"),
        group("roles.columns", "Column headings", [
          text("role", "Role"),
          text("team", "Team"),
          text("location", "Location"),
          text("type", "Type"),
        ]),
        text("roles.applyLabel", "Apply button"),
        text("roles.note", "Note under the list", { hint: "Leave empty to hide it." }),
        area("roles.empty", "When no role is open", {
          rows: 3,
          hint: "{email} is replaced with the careers email address.",
        }),
      ],
    },
    {
      id: "open",
      title: "Don’t See Your Role?",
      description:
        "The box under the list. Its button and link open an email to the careers address (Company & Contact).",
      fields: [
        text("open.heading", "Heading"),
        area("open.body", "Text", { rows: 2 }),
        text("open.action", "Button"),
        text("open.orWrite", "Words before the email address"),
      ],
    },
    SEO,
  ],

  contact: [
    {
      id: "intro",
      title: "Opening",
      fields: [text("intro.title", "Heading"), area("intro.lede", "Text", { rows: 3 })],
    },
    {
      id: "map",
      title: "Map Card",
      description:
        "The labels on the head office's address under the form. The address itself is under Company & contact.",
      fields: [
        text("map.eyebrow", "Small heading"),
        text("map.directions", "Directions button"),
        text("map.openInMaps", "Maps button"),
      ],
    },
    {
      id: "form",
      title: "Enquiry Form",
      description: "Messages sent with this form arrive under Enquiries.",
      fields: [
        text("formHeading", "Heading over the form"),
        group("form.name", "Name field", [
          text("label", "Label"),
          text("placeholder", "Example text"),
        ]),
        group("form.email", "Email field", [
          text("label", "Label"),
          text("placeholder", "Example text"),
        ]),
        group("form.subject", "Subject field", [
          text("label", "Label"),
          text("placeholder", "Example text"),
        ]),
        group("form.message", "Message field", [
          text("label", "Label"),
          text("placeholder", "Example text"),
        ]),
        text("form.submit", "Send button"),
        text("form.sending", "While sending"),
        text("form.sentHeading", "After sending"),
        text("form.sentAgain", "“Send another” button"),
        text("detailsHeading", "Heading over the email and phone"),
      ],
    },
    SEO,
  ],
};

/** The sections that appear on more than one page. */
/* Sections of the Insights page that only an article outside the series
 * brings onto the site: the list under the series with its filters and card
 * words, and the words round such an article's own page. */
const FOR_PLAIN_ARTICLES = new Set(["index", "labels", "article"]);

/**
 * A page's form, for the site as it stands. Sections that would change
 * nothing a visitor can see are left out, so the form is the page:
 *
 * - Insights: while every article is a part of the series, the list, card
 *   and article words for plain articles are not on the site. The films
 *   band is drawn only when there is no series at all, and a film to show.
 *
 * `articles` is every article, drafts included: someone writing a plain
 * article sees its words before it is published. Without it (the reader
 * may not open Insights) nothing is left out.
 */
export function pageForm(
  key: PageKey,
  articles?: readonly { inSeries: boolean; film: boolean }[],
): SectionSpec[] {
  const sections = PAGE_FORMS[key];
  if (key !== "insights" || !articles) return sections;
  const plain = articles.some((article) => !article.inSeries);
  const films =
    articles.every((article) => !article.inSeries) && articles.some((article) => article.film);
  return sections.filter(
    (section) =>
      (plain || !FOR_PLAIN_ARTICLES.has(section.id)) && (films || section.id !== "films"),
  );
}

export const SHARED_FORM: SectionSpec[] = [
  {
    id: "process",
    title: "Process",
    description: "“Concept to commissioning” — the five stages on the home page.",
    fields: [
      twoTone("process.heading"),
      area("process.lede", "Text", { rows: 2 }),
      list<{ title: string }>(
        "process.stages",
        "Stages",
        [
          text("title", "Stage"),
          area("body", "Text", { rows: 3 }),
          photo("photo", "Photograph"),
          text("caption", "Line on the photograph (home page)"),
        ],
        (item) => item.title,
        { fixed: true, hint: "The scrolling scene is paced for five stages." },
      ),
      cta("process.link", "Link"),
    ],
  },
  {
    id: "enquiryBand",
    title: "Enquiry Band",
    description:
      "“Let’s frame the view.” — the navy band with the enquiry form and a slideshow of every published project, at the foot of Home and Partners. Messages sent with it arrive under Enquiries.",
    fields: [
      text("enquiryBand.heading", "Heading"),
      text("enquiryBand.lede", "Text"),
      group("enquiryBand.fields.name", "Name field", [
        text("label", "Label"),
        text("placeholder", "Example text"),
      ]),
      group("enquiryBand.fields.email", "Email field", [
        text("label", "Label"),
        text("placeholder", "Example text"),
      ]),
      group("enquiryBand.fields.phone", "Phone field", [
        text("label", "Label"),
        text("placeholder", "Example text"),
      ]),
      group("enquiryBand.fields.location", "Location field", [
        text("label", "Label"),
        text("placeholder", "Example text"),
      ]),
      group("enquiryBand.fields.message", "Message field", [
        text("label", "Label"),
        text("placeholder", "Example text"),
      ]),
      text("enquiryBand.submit", "Send button"),
      text("enquiryBand.sending", "While sending"),
      group("enquiryBand.subscribe", "Subscribe tick box", [
        text("label", "Label"),
        area("note", "Line beneath it", { rows: 2 }),
      ]),
      text("enquiryBand.sentHeading", "After sending"),
      text("enquiryBand.sentAgain", "“Send another” button"),
      text("enquiryBand.viewProject", "Button on each slide"),
    ],
  },
];
