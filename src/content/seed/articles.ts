import { photo } from "../render";
import type { ArticleBlock, ArticleDoc } from "../types";

/* Durall's Premium Glazing Series: four articles written by Durall
 * (October 2026), one for each stage a project passes through. The words are
 * theirs; only the typing slips in the manuscript were corrected. The covers
 * are project photographs, since the manuscript came without pictures. */

const heading = (text: string): ArticleBlock => ({ type: "heading", text });
const para = (text: string): ArticleBlock => ({ type: "paragraph", text });
const list = (...items: string[]): ArticleBlock => ({ type: "list", items });

const SERIES = "Premium Glazing Series";

const article = (
  doc: Pick<ArticleDoc, "id" | "slug" | "publishedAt" | "title" | "excerpt" | "cover" | "body">,
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
    cover: photo(
      "patinaSuite",
      "A villa interior open through sliding glazing to a deck, a hammock and the ocean",
    ),
    body: [
      para("What if the most important part of a glass system is the part you never see?"),
      para(
        "The glass is visible. The views are visible. The slim frames are visible. But behind that clean architectural expression is a process of design, engineering, manufacturing and installation that begins long before the glass reaches the site.",
      ),
      heading("What Makes Glazing “Premium”?"),
      para("Premium glazing isn’t simply about expensive glass or slim aluminium profiles."),
      para(
        "It’s about how the entire system works together — from glass selection, aluminium profiles and hardware to structural performance, drainage, waterproofing, manufacturing accuracy, installation and long-term serviceability. The result may look minimal.",
      ),
      para("Achieving it is anything but."),
      heading("Why Does Modern Architecture Demand More?"),
      para(
        "Today’s architecture calls for larger openings, more natural light, uninterrupted views and stronger connections between indoor and outdoor spaces.",
      ),
      para(
        "Glazing needs to support all of this while also delivering thermal and acoustic comfort, resisting air and water infiltration, withstanding wind pressure and repeated operation, and complementing the architecture rather than dominating it.",
      ),
      para("That is where premium glazing differs."),
      para(
        "Instead of choosing a product primarily around size or price, the process begins with the architecture, performance requirements and application.",
      ),
      para("The goal isn’t simply to supply a window."),
      para("It’s to deliver a complete glazing solution for the project."),
      heading("The Project Begins Before the Factory"),
      para("The factory is only one part of the journey."),
      para(
        "Before production begins, teams need to understand the architect’s vision, client expectations, opening dimensions, system configuration, glass and aluminium requirements, hardware, structural conditions, waterproofing interfaces, timelines and commercial scope.",
      ),
      para("From there, the project moves through a connected process:"),
      para(
        "Enquiry → Feasibility → Mock-Up → Scope & Quotation → Engineering → Procurement → Production → Installation → Inspection & Handover",
      ),
      para("Every stage builds on the one before it."),
      para(
        "And the quality of the final installation often depends on how well those early decisions were understood, coordinated and documented.",
      ),
      heading("Built by People, Not Just Products"),
      para("A premium glazing system is a cross-functional effort."),
      para(
        "Sales & Business Development establish the opportunity. Design translates architectural intent into a feasible system. Procurement manages materials. Planning coordinates the project. Factory & Production manufacture the components. Quality Control verifies them. Project Delivery & Site Teams bring the system together on site, while Finance & Accounts keep the commercial side aligned.",
      ),
      para("No single department creates the final result."),
      para(
        "It is the coordination between people, processes and precision that turns an architectural requirement into a working glazing system.",
      ),
      heading("What Premium Glazing Really Means"),
      para("Premium glazing is ultimately about more than what you see."),
      para(
        "It’s about the decisions, engineering and precision behind what you see. This is the beginning of Durall’s Premium Glazing Series, where we’ll explore the journey in greater detail — from design and engineering to procurement, manufacturing, quality control and installation.",
      ),
      para("Because great glazing is rarely just what you see."),
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
      "gardensPavilion",
      "A glass-walled dining room at the end of a stone colonnade, open to the lawn",
    ),
    body: [
      para("Before a glazing system is manufactured, it has to work on paper."),
      para("A drawing may look like a simple set of lines and dimensions."),
      para(
        "But behind it are decisions about glass, aluminium, hardware, structure, movement, installation and the way the system will eventually perform on site.",
      ),
      para("This is where the Design Stage begins."),
      heading("It Starts With Understanding the Requirement"),
      para(
        "Every project begins with understanding what the customer and architect want to achieve. The team studies the project requirements, architectural intent, opening dimensions, system configuration and expected performance before moving towards a final solution.",
      ),
      para("The goal isn’t simply to draw what has been requested."),
      para("It is to understand whether the proposed system can actually work."),
      heading("From Architectural Intent to Engineering"),
      para(
        "Once the requirements are understood, the design team works through the technical details.",
      ),
      para("This includes evaluating:"),
      list(
        "Opening dimensions",
        "Panel sizes and configurations",
        "Glass requirements",
        "Aluminium profiles",
        "Hardware",
        "Structural conditions",
        "Drainage",
        "Installation constraints",
      ),
      para(
        "The architectural idea is then translated into detailed engineering information that can eventually be taken forward into production.",
      ),
      heading("Why Precision Matters Here"),
      para("A small error at the design stage can create bigger problems later."),
      para(
        "That is why dimensions, materials, system configurations and other technical details need to be carefully checked before the project moves forward.",
      ),
      para(
        "The aim is to identify and resolve issues early — before they become manufacturing or installation problems.",
      ),
      para("It also helps reduce material wastage and unnecessary rework later in the process."),
      heading("From Drawing to Approval"),
      para("The design isn’t considered complete simply because the drawings are ready."),
      para(
        "The drawings and technical details go through review and approval before production can begin.",
      ),
      para(
        "Client or architect feedback may lead to revisions, making this stage an important part of getting the system right before it reaches the factory.",
      ),
      para(
        "Depending on the project’s complexity and approval cycle, the design stage can take several working days.",
      ),
      heading("When the Design Is Ready"),
      para("Once the design is approved, the project moves closer to production."),
      para(
        "The required materials can be identified, quantities can be planned, and the information needed for manufacturing can be prepared.",
      ),
      para(
        "The drawing has now done its job: an architectural requirement has become an executable system. And that’s where the next stage begins.",
      ),
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
      "carmichaelFacade",
      "Timber screens between deep floor bands on a tower façade, the city beyond",
    ),
    body: [
      para(
        "A project can have the perfect design. But without the right materials, nothing moves.",
      ),
      para(
        "Before a single component enters production, there is another important question to answer: Do we have everything we need to build it?",
      ),
      para(
        "For a premium glazing project, material planning isn’t simply about ordering aluminium and glass. It is about understanding exactly what the project requires, what is already available, and what needs to be sourced — before production begins.",
      ),
      heading("It Starts With the Approved Design"),
      para(
        "Once the design department has completed the project drawings, the required materials are identified through the Material Take-Off (MTO) and Bill of Materials (BOM).",
      ),
      para(
        "These documents give the team a clear picture of what the project requires. The MTO and BOM are then shared with the Stores team, who check the available stock and identify what is already available.",
      ),
      para("Whatever is missing moves to the Purchase team for procurement."),
      heading("What Gets Planned?"),
      para("Depending on the project, this can include:"),
      list(
        "Aluminium profiles",
        "Glass",
        "Hardware",
        "Accessories",
        "Other materials required for production",
      ),
      para(
        "The aim is to ensure that the right materials are available in the right quantities and with the required quality when production is ready to begin.",
      ),
      heading("When Does Procurement Start?"),
      para(
        "The material ordering process begins after the work order is received from the client.",
      ),
      para(
        "From there, the procurement timeline depends on the quantity required and where the material is being sourced from.",
      ),
      para(
        "For example, aluminium profiles sourced from outside India can take around three months to arrive, while locally sourced aluminium can take around one month.",
      ),
      para(
        "That difference makes planning an important part of the project — not something that happens at the last minute.",
      ),
      heading("From Material Planning to Production"),
      para(
        "Once the required materials are identified and sourced, they move through the next stages of the project.",
      ),
      para("The right materials are available."),
      para("The quantities are accounted for."),
      para("The design information is ready."),
      para(
        "And the factory can begin its work with a clear understanding of what needs to be made.",
      ),
      para(
        "Because in premium glazing, production doesn’t really begin when the machines start running.",
      ),
      para("It begins with knowing exactly what needs to go into the system."),
      para(
        "And once those materials are ready, the project moves to the factory floor — where the process of turning them into finished components begins.",
      ),
    ],
  }),
  article({
    id: "article-when-manufacturing-begins",
    slug: "when-manufacturing-begins",
    publishedAt: "2026-10-01",
    title: "When Manufacturing Begins: From Material to Finished System",
    excerpt:
      "The drawings are approved. The materials are ready. This is where a glazing system starts to take physical form.",
    cover: photo(
      "chilternLiving",
      "A living room open to a reflecting pool at dusk, its tall glazing slid aside",
    ),
    body: [
      para("The drawings are approved. The materials are ready. Now the factory gets to work."),
      para("This is where a glazing system starts to take physical form."),
      para(
        "But manufacturing isn’t simply about putting materials together. Every component has to follow the approved drawings and specifications, with precision maintained throughout the process.",
      ),
      heading("It Starts With the Material"),
      para(
        "Once the required materials have been planned and sourced, they move into production against the approved project information.",
      ),
      para(
        "The factory works with the specifications established during the design and engineering stages, ensuring that what is manufactured matches what has been approved.",
      ),
      para("Because at this stage, precision isn’t optional."),
      para("It’s the foundation of the finished system."),
      heading("From Profile to Component"),
      para("The manufacturing process moves through several connected stages:"),
      para("Cutting → Machining → Fabrication → Assembly → Glazing → Inspection → Packing"),
      para("Each stage prepares the component for the next."),
      para(
        "Profiles are cut according to the required dimensions. Machining follows the approved details. Components are then fabricated and assembled to form the system. The process may look straightforward from the outside, but every stage needs to remain aligned with the approved drawings and specifications.",
      ),
      heading("Then Comes the Glass"),
      para(
        "Once the components are ready, glazing brings another important part of the system together.",
      ),
      para(
        "The glass and fabricated components come together as part of the finished system, with the process continuing through inspection before the system is prepared for dispatch.",
      ),
      para("The goal isn’t simply to make the components fit."),
      para("It’s to ensure that the finished system reflects what was designed."),
      heading("Precision Doesn’t Stop at Production"),
      para("Manufacturing doesn’t end when the system is assembled."),
      para(
        "Inspection is an important part of the process, helping verify that the completed systems meet the required specifications before they leave the factory. Once the systems have been inspected, they are packed and prepared for the next stage of the project.",
      ),
      heading("From Drawing to Reality"),
      para(
        "A few stages earlier, the project existed as drawings, dimensions and material requirements.",
      ),
      para("Now, those decisions have become physical components."),
      para(
        "And the next step is to take them from the factory floor to the site — where design, engineering and manufacturing finally come together in the finished building.",
      ),
      para("Because precision in the factory is what makes performance possible on site."),
    ],
  }),
];
