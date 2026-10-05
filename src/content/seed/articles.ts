import { photo } from "../render";
import type { ArticleDoc } from "../types";

/* Durall's Premium Glazing Series: four articles written by Durall
 * (October 2026), one for each stage a project passes through. The words are
 * theirs. The layout of each (which lines are set large, the paired
 * photographs, the diagrams) and the factory photographs follow Durall's
 * design for the series; the blocks are laid out by
 * components/durall/insights/SeriesArticle.tsx. */

const SERIES = "Premium Glazing Series";

const article = (
  doc: Pick<
    ArticleDoc,
    "id" | "slug" | "publishedAt" | "title" | "excerpt" | "cover" | "body" | "series"
  >,
): ArticleDoc => ({
  status: "published",
  pinned: false,
  format: "article",
  video: { url: "", duration: "" },
  category: SERIES,
  readingTime: "3 min read",
  ...doc,
});

export const ARTICLES_SEED: ArticleDoc[] = [
  article({
    id: "article-understanding-premium-glazing",
    slug: "understanding-premium-glazing",
    publishedAt: "2026-09-10",
    title: "Understanding Premium Glazing: What It Really Means & How Every Project Begins",
    excerpt:
      "Behind the clean architectural expression of glass is a process of design, engineering, manufacturing and installation that begins long before the glass reaches the site.",
    cover: photo("insightsYard", "Glass and frames staged outside Durall’s fabrication hall"),
    series: {
      part: 1,
      kicker: "Where it begins",
      at: 0.0,
      stage: "Enquiry",
      opening: "photo",
      openingLabel: "",
      openingNote: "",
      caption: "Glass and frames staged outside Durall’s fabrication hall",
      focus: "50% 40%",
      pull: "The result may look minimal. Achieving it is anything but.",
    },
    body: [
      {
        type: "lead",
        text: "What if the most important part of a glass system is the part you never see?",
      },
      {
        type: "paragraph",
        text: "The glass is visible. The views are visible. The slim frames are visible. But behind that clean architectural expression is a process of design, engineering, manufacturing and installation that begins long before the glass reaches the site.",
      },
      {
        type: "figures",
        items: [
          {
            label: "What you see",
            photo: photo(
              "insightsParikramaWide",
              "Parikrama, Murud House · SPASM Design Architects",
            ),
            caption: "Parikrama, Murud House · SPASM Design Architects",
          },
          {
            label: "What you don’t",
            photo: photo("insightsHall", "Inside Durall’s fabrication hall"),
            caption: "Inside Durall’s fabrication hall",
          },
        ],
      },
      { type: "heading", text: "What makes glazing “premium”?" },
      {
        type: "paragraph",
        text: "Premium glazing isn’t simply about expensive glass or slim aluminium profiles.",
      },
      {
        type: "paragraph",
        text: "It’s about how the entire system works together — from glass selection, aluminium profiles and hardware to structural performance, drainage, waterproofing, manufacturing accuracy, installation and long-term serviceability.",
      },
      {
        type: "statement",
        text: "The result may look minimal.",
        muted: "Achieving it is anything but.",
      },
      { type: "heading", text: "Why does modern architecture demand more?" },
      {
        type: "paragraph",
        text: "Today’s architecture calls for larger openings, more natural light, uninterrupted views and stronger connections between indoor and outdoor spaces.",
      },
      { type: "paragraph", text: "Glazing needs to support all of this while also:" },
      {
        type: "checks",
        items: [
          "Delivering thermal and acoustic comfort",
          "Resisting air and water infiltration",
          "Withstanding wind pressure",
          "Withstanding repeated operation",
          "Complementing the architecture rather than dominating it",
        ],
      },
      {
        type: "paragraph",
        text: "That is where premium glazing differs. Instead of choosing a product primarily around size or price, the process begins with the architecture, performance requirements and application.",
      },
      {
        type: "callout",
        text: "The goal isn’t simply to supply a window. It’s to deliver a complete glazing solution for the project.",
      },
      { type: "heading", text: "The project begins before the factory" },
      { type: "paragraph", text: "The factory is only one part of the journey." },
      {
        type: "paragraph",
        text: "Before production begins, teams need to understand the architect’s vision, client expectations, opening dimensions, system configuration, glass and aluminium requirements, hardware, structural conditions, waterproofing interfaces, timelines and commercial scope.",
      },
      { type: "paragraph", text: "From there, the project moves through a connected process:" },
      {
        type: "steps",
        items: [
          "Enquiry",
          "Feasibility",
          "Mock-Up",
          "Scope & Quotation",
          "Engineering",
          "Procurement",
          "Production",
          "Installation",
          "Inspection & Handover",
        ],
      },
      {
        type: "paragraph",
        text: "Every stage builds on the one before it. And the quality of the final installation often depends on how well those early decisions were understood, coordinated and documented.",
      },
      { type: "heading", text: "Built by people, not just products" },
      { type: "paragraph", text: "A premium glazing system is a cross-functional effort." },
      {
        type: "cards",
        items: [
          { title: "Sales & Business Development", body: "Establish the opportunity." },
          { title: "Design", body: "Translates architectural intent into a feasible system." },
          { title: "Procurement", body: "Manages materials." },
          { title: "Planning", body: "Coordinates the project." },
          { title: "Factory & Production", body: "Manufacture the components." },
          { title: "Quality Control", body: "Verifies them." },
          { title: "Project Delivery & Site Teams", body: "Bring the system together on site." },
          { title: "Finance & Accounts", body: "Keep the commercial side aligned." },
        ],
      },
      {
        type: "image",
        photo: photo(
          "insightsScreenCarried",
          "A finished screen moved across the hall by the factory team",
        ),
        caption: "A finished screen moved across the hall by the factory team",
      },
      {
        type: "paragraph",
        text: "No single department creates the final result. It is the coordination between people, processes and precision that turns an architectural requirement into a working glazing system.",
      },
      { type: "heading", text: "What premium glazing really means" },
      {
        type: "paragraph",
        text: "Premium glazing is ultimately about more than what you see. It’s about the decisions, engineering and precision behind what you see.",
      },
      {
        type: "paragraph",
        text: "This is the beginning of Durall’s Premium Glazing Series, where we’ll explore the journey in greater detail — from design and engineering to procurement, manufacturing, quality control and installation.",
      },
      { type: "closing", text: "Because great glazing is rarely just what you see." },
    ],
  }),
  article({
    id: "article-design-stage",
    slug: "what-happens-during-the-design-stage",
    publishedAt: "2026-09-17",
    title: "From Vision to Precision: What Happens During the Design Stage?",
    excerpt:
      "Before a glazing system is manufactured, it has to work on paper. This is where the design stage begins.",
    cover: photo(
      "insightsSection",
      "Section AA′ · Parikrama, Murud House · SPASM Design Architects",
    ),
    series: {
      part: 2,
      kicker: "Design & engineering",
      at: 0.5,
      stage: "Engineering",
      opening: "drawing",
      openingLabel: "It has to work on paper",
      openingNote: "SECTION AA′",
      caption: "Section AA′ · Parikrama, Murud House · SPASM Design Architects",
      focus: "50% 50%",
      pull: "A small error at the design stage can create bigger problems later.",
    },
    body: [
      { type: "lead", text: "Before a glazing system is manufactured, it has to work on paper." },
      { type: "paragraph", text: "A drawing may look like a simple set of lines and dimensions." },
      {
        type: "paragraph",
        text: "But behind it are decisions about glass, aluminium, hardware, structure, movement, installation and the way the system will eventually perform on site.",
      },
      { type: "paragraph", text: "This is where the Design Stage begins." },
      { type: "heading", text: "It starts with understanding the requirement" },
      {
        type: "paragraph",
        text: "Every project begins with understanding what the customer and architect want to achieve. The team studies the project requirements, architectural intent, opening dimensions, system configuration and expected performance before moving towards a final solution.",
      },
      {
        type: "callout",
        text: "The goal isn’t simply to draw what has been requested. It is to understand whether the proposed system can actually work.",
      },
      { type: "heading", text: "From architectural intent to engineering" },
      {
        type: "paragraph",
        text: "Once the requirements are understood, the design team works through the technical details.",
      },
      {
        type: "figures",
        items: [
          {
            label: "The intent",
            photo: photo(
              "insightsParikramaIntent",
              "Parikrama, Murud House · SPASM Design Architects",
            ),
            caption: "Parikrama, Murud House · SPASM Design Architects",
          },
          {
            label: "The engineering",
            photo: photo("insightsProfileCut", "A system profile, cut to show its section"),
            caption: "A system profile, cut to show its section",
          },
        ],
      },
      { type: "paragraph", text: "This includes evaluating:" },
      {
        type: "checks",
        items: [
          "Opening dimensions",
          "Panel sizes and configurations",
          "Glass requirements",
          "Aluminium profiles",
          "Hardware",
          "Structural conditions",
          "Drainage",
          "Installation constraints",
        ],
      },
      {
        type: "paragraph",
        text: "The architectural idea is then translated into detailed engineering information that can eventually be taken forward into production.",
      },
      { type: "heading", text: "Why precision matters here" },
      {
        type: "quote",
        text: "A small error at the design stage can create bigger problems later.",
      },
      {
        type: "paragraph",
        text: "That is why dimensions, materials, system configurations and other technical details need to be carefully checked before the project moves forward.",
      },
      {
        type: "paragraph",
        text: "The aim is to identify and resolve issues early — before they become manufacturing or installation problems. It also helps reduce material wastage and unnecessary rework later in the process.",
      },
      { type: "heading", text: "From drawing to approval" },
      {
        type: "paragraph",
        text: "The design isn’t considered complete simply because the drawings are ready. The drawings and technical details go through review and approval before production can begin.",
      },
      {
        type: "diagram",
        name: "approval",
        title: "",
        alt: "Drawings go to review; feedback can send them back for revision; once approved, the project moves to production",
      },
      {
        type: "paragraph",
        text: "Client or architect feedback may lead to revisions, making this stage an important part of getting the system right before it reaches the factory. Depending on the project’s complexity and approval cycle, the design stage can take several working days.",
      },
      { type: "heading", text: "When the design is ready" },
      {
        type: "paragraph",
        text: "Once the design is approved, the project moves closer to production. The required materials can be identified, quantities can be planned, and the information needed for manufacturing can be prepared.",
      },
      {
        type: "image",
        photo: photo(
          "insightsMachiningCentre",
          "Approved information, loaded at the machining centre",
        ),
        caption: "Approved information, loaded at the machining centre",
      },
      {
        type: "closing",
        text: "The drawing has now done its job: an architectural requirement has become an executable system.",
      },
      { type: "paragraph", text: "And that’s where the next stage begins." },
    ],
  }),
  article({
    id: "article-planning-every-material",
    slug: "how-durall-plans-every-material",
    publishedAt: "2026-09-24",
    title: "Before Production Begins: How Durall Plans Every Material",
    excerpt:
      "Before a single component enters production, there is another important question to answer: do we have everything we need to build it?",
    cover: photo(
      "insightsProfilesStaged",
      "Aluminium profiles staged for a project on the factory floor",
    ),
    series: {
      part: 3,
      kicker: "Procurement",
      at: 0.625,
      stage: "Procurement",
      opening: "photo",
      openingLabel: "",
      openingNote: "",
      caption: "Aluminium profiles staged for a project on the factory floor",
      focus: "50% 55%",
      pull: "Production doesn’t really begin when the machines start running. It begins with knowing exactly what needs to go into the system.",
    },
    body: [
      {
        type: "lead",
        text: "A project can have the perfect design. But without the right materials, nothing moves.",
      },
      {
        type: "paragraph",
        text: "Before a single component enters production, there is another important question to answer:",
      },
      { type: "statement", text: "Do we have everything", muted: "we need to build it?" },
      {
        type: "paragraph",
        text: "For a premium glazing project, material planning isn’t simply about ordering aluminium and glass. It is about understanding exactly what the project requires, what is already available, and what needs to be sourced — before production begins.",
      },
      { type: "heading", text: "It starts with the approved design" },
      {
        type: "paragraph",
        text: "Once the design department has completed the project drawings, the required materials are identified through the Material Take-Off (MTO) and Bill of Materials (BOM).",
      },
      {
        type: "paragraph",
        text: "These documents give the team a clear picture of what the project requires. The MTO and BOM are then shared with the Stores team, who check the available stock and identify what is already available.",
      },
      {
        type: "paragraph",
        text: "Whatever is missing moves to the Purchase team for procurement.",
      },
      {
        type: "diagram",
        name: "materials",
        title: "How a project’s materials are planned",
        alt: "Approved drawings lead to the MTO and BOM; Stores checks stock; what is available comes from stock, what is missing goes to Purchase; both feed production",
      },
      { type: "heading", text: "What gets planned?" },
      {
        type: "split",
        photo: photo("insightsProfile", "A system profile, the first item on every list"),
        caption: "A system profile, the first item on every list",
        intro: "Depending on the project, this can include:",
        items: [
          "Aluminium profiles",
          "Glass",
          "Hardware",
          "Accessories",
          "Other materials required for production",
        ],
      },
      {
        type: "paragraph",
        text: "The aim is to ensure that the right materials are available in the right quantities and with the required quality when production is ready to begin.",
      },
      { type: "heading", text: "When does procurement start?" },
      {
        type: "paragraph",
        text: "The material ordering process begins after the work order is received from the client.",
      },
      {
        type: "paragraph",
        text: "From there, the procurement timeline depends on the quantity required and where the material is being sourced from.",
      },
      {
        type: "bars",
        title: "Typical lead time for aluminium, after the work order",
        rows: [
          {
            label: "Aluminium profiles sourced from outside India",
            value: "Around three months",
            share: 1.0,
          },
          { label: "Locally sourced aluminium", value: "Around one month", share: 0.333 },
        ],
        ticks: ["0 months", "1 month", "2 months", "3 months"],
      },
      {
        type: "paragraph",
        text: "That difference makes planning an important part of the project — not something that happens at the last minute.",
      },
      { type: "heading", text: "From material planning to production" },
      {
        type: "paragraph",
        text: "Once the required materials are identified and sourced, they move through the next stages of the project.",
      },
      {
        type: "ticks",
        items: [
          "The right materials are available.",
          "The quantities are accounted for.",
          "The design information is ready.",
        ],
      },
      {
        type: "paragraph",
        text: "And the factory can begin its work with a clear understanding of what needs to be made.",
      },
      {
        type: "image",
        photo: photo("insightsProfileStock", "Profile stock beside the assembly tables"),
        caption: "Profile stock beside the assembly tables",
      },
      {
        type: "closing",
        text: "In premium glazing, production doesn’t really begin when the machines start running. It begins with knowing exactly what needs to go into the system.",
      },
      {
        type: "paragraph",
        text: "And once those materials are ready, the project moves to the factory floor — where the process of turning them into finished components begins.",
      },
    ],
  }),
  article({
    id: "article-when-manufacturing-begins",
    slug: "when-manufacturing-begins",
    publishedAt: "2026-10-01",
    title: "When Manufacturing Begins: From Material to Finished System",
    excerpt:
      "The drawings are approved. The materials are ready. This is where a glazing system starts to take physical form.",
    cover: photo("insightsAssemblyAbove", "Glazed units on the assembly tables, seen from above"),
    series: {
      part: 4,
      kicker: "Production",
      at: 0.75,
      stage: "Production",
      opening: "photo",
      openingLabel: "",
      openingNote: "",
      caption: "Glazed units on the assembly tables, seen from above",
      focus: "50% 50%",
      pull: "Precision in the factory is what makes performance possible on site.",
    },
    body: [
      {
        type: "lead",
        text: "The drawings are approved. The materials are ready. Now the factory gets to work.",
      },
      { type: "paragraph", text: "This is where a glazing system starts to take physical form." },
      {
        type: "paragraph",
        text: "But manufacturing isn’t simply about putting materials together. Every component has to follow the approved drawings and specifications, with precision maintained throughout the process.",
      },
      { type: "heading", text: "It starts with the material" },
      {
        type: "paragraph",
        text: "Once the required materials have been planned and sourced, they move into production against the approved project information.",
      },
      {
        type: "paragraph",
        text: "The factory works with the specifications established during the design and engineering stages, ensuring that what is manufactured matches what has been approved.",
      },
      {
        type: "statement",
        text: "Because at this stage, precision isn’t optional.",
        muted: "It’s the foundation of the finished system.",
      },
      { type: "heading", text: "From profile to component" },
      {
        type: "paragraph",
        text: "The manufacturing process moves through several connected stages:",
      },
      {
        type: "stages",
        caption: "Tap a stage — photographs from Durall’s factory floor",
        items: [
          {
            label: "Cutting",
            text: "Profiles are cut according to the required dimensions.",
            photo: photo("insightsCutting", "Cutting on the factory floor"),
          },
          {
            label: "Machining",
            text: "Machining follows the approved details.",
            photo: photo("insightsMachining", "Machining on the factory floor"),
          },
          {
            label: "Fabrication",
            text: "Components are fabricated against the approved drawings.",
            photo: photo("insightsFabrication", "Fabrication on the factory floor"),
          },
          {
            label: "Assembly",
            text: "Fabricated components are assembled to form the system.",
            photo: photo("insightsAssembly", "Assembly on the factory floor"),
          },
          {
            label: "Glazing",
            text: "The glass and fabricated components come together.",
            photo: photo("insightsGlazing", "Glazing on the factory floor"),
          },
          {
            label: "Inspection",
            text: "Completed systems are verified against the required specifications.",
            photo: null,
          },
          {
            label: "Packing",
            text: "Inspected systems are packed and prepared for the next stage.",
            photo: null,
          },
        ],
      },
      {
        type: "paragraph",
        text: "Each stage prepares the component for the next. Profiles are cut according to the required dimensions. Machining follows the approved details. Components are then fabricated and assembled to form the system.",
      },
      {
        type: "paragraph",
        text: "The process may look straightforward from the outside, but every stage needs to remain aligned with the approved drawings and specifications.",
      },
      { type: "heading", text: "Then comes the glass" },
      {
        type: "paragraph",
        text: "Once the components are ready, glazing brings another important part of the system together.",
      },
      {
        type: "paragraph",
        text: "The glass and fabricated components come together as part of the finished system, with the process continuing through inspection before the system is prepared for dispatch.",
      },
      {
        type: "quote",
        text: "The goal isn’t simply to make the components fit. It’s to ensure that the finished system reflects what was designed.",
      },
      { type: "heading", text: "Precision doesn’t stop at production" },
      { type: "paragraph", text: "Manufacturing doesn’t end when the system is assembled." },
      {
        type: "paragraph",
        text: "Inspection is an important part of the process, helping verify that the completed systems meet the required specifications before they leave the factory. Once the systems have been inspected, they are packed and prepared for the next stage of the project.",
      },
      {
        type: "image",
        photo: photo(
          "insightsGlassStaged",
          "Inspected glass units staged outside the hall, ready for the next stage",
        ),
        caption: "Inspected glass units staged outside the hall, ready for the next stage",
      },
      { type: "heading", text: "From drawing to reality" },
      {
        type: "paragraph",
        text: "A few stages earlier, the project existed as drawings, dimensions and material requirements. Now, those decisions have become physical components.",
      },
      {
        type: "paragraph",
        text: "And the next step is to take them from the factory floor to the site — where design, engineering and manufacturing finally come together in the finished building.",
      },
      {
        type: "closing",
        text: "Because precision in the factory is what makes performance possible on site.",
      },
    ],
  }),
];
