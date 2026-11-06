import { photo } from "../../render";
import type { AboutPage } from "../../types";

export const ABOUT_SEED: AboutPage = {
  seo: {
    title: "About Durall — Engineering What Architecture Demands",
    description:
      "Durall brings architecture, engineering and precision fabrication together — coordinating systems, materials and specialist partners into aluminium envelopes built to endure.",
    image: null,
  },
  opening: {
    photo: photo("heroAbout", "Curved terrace and infinity pool facing the sea at sunset"),
    heading: "Engineering what\narchitecture\ndemands.",
    body: "Durall brings architecture, engineering and precision fabrication together to create aluminium systems shaped around the demands of each project.",
  },
  story: {
    eyebrow: "About Durall",
    heading: "Since 1992.",
    facts: [{ value: "10", label: "Architectural systems" }],
    lead: "Founded in 1992 by Mr. Manoj Sakharkar, Durall Systems has spent more than three decades working on one question:",
    emphasis:
      "how aluminium and glass can serve a building’s architecture rather than sit on top of it.",
    body: "Every system we deliver, from sunshades and decorative fins to curtain walls, skylights, louvers, screens and pergolas, starts with the architect’s intent. It is then resolved through engineering, material selection and careful detailing. That approach has brought us into projects with studios such as Studio MK27, WOW Architects, SPASM Architects and Ernesto Bedmar, on residences across India, Singapore and the Maldives. The aim has not changed since 1992: systems that read as part of the architecture, built to last.",
  },
  philosophy: {
    heading: "Luxury is never applied. It is engineered.",
    body: "Durall works alongside architects and developers long before a building becomes visible. Design intent, engineering tolerance and material performance are resolved together, before the first extrusion is cut.",
    emphasis: "The visible result is only the final expression of decisions made long before.",
    link: { label: "Our Approach", href: "#approach" },
    features: [
      {
        icon: "crosshair",
        title: "Precision",
        body: "Engineered tolerances ensure seamless performance.",
      },
      {
        icon: "layers",
        title: "Materiality",
        body: "Curated aluminium systems for strength, longevity and beauty.",
      },
      {
        icon: "shield-check",
        title: "Integrity",
        body: "Every connection is designed to last in real conditions.",
      },
    ],
    photo: photo(
      "aboutVilla",
      "A high-rise living room opening through full-height sliding glass to the city beyond",
    ),
  },
  meets: {
    heading: "Where architecture meets engineering.",
    paragraphs: [
      "Durall operates at the intersection of architectural intent and technical execution.",
      "We coordinate systems, materials and specialist partners to deliver solutions that perform as designed — beautifully, efficiently and for the long term.",
    ],
    photo: photo(
      "aboutLake",
      "A curved glass corridor under a timber ceiling, planted along one side",
    ),
  },
  approach: {
    eyebrow: "Our Approach",
    heading: "Intelligence\nthat brings\nit all together.",
    body: "We don’t manufacture every component. We ensure the right systems, materials and expertise come together in perfect balance.",
    capabilities: [
      {
        icon: "network",
        title: "Architectural Intent",
        body: "Design vision and performance goals",
      },
      {
        icon: "share-2",
        title: "System Partners",
        body: "Carefully selected international partners",
      },
      {
        icon: "bar-chart-3",
        title: "Materials & Finishes",
        body: "Quality, durability and aesthetic fit",
      },
      {
        icon: "users",
        title: "Specialist Expertise",
        body: "Engineering, detailing and project coordination",
      },
    ],
    mark: photo("aboutDurallMark", "Durall Systems"),
    drawing: photo("aboutLineHouse", "Line drawing of a completed Durall-glazed pavilion"),
    outcomeTitle: "Architecture Realized",
    outcomeBody: "Seamless integration that performs beautifully and stands the test of time.",
  },
};
