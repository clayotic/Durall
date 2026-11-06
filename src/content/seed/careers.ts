import type { RoleDoc } from "../types";

/* The roles open on the site; changed in the admin panel (Careers). Close
 * them all and the page shows its "nothing open right now" state. */
export const ROLES_SEED: RoleDoc[] = [
  {
    id: "role-1",
    order: 0,
    open: true,
    title: "Junior Architect – 2 Openings",
    team: "Architecture",
    location: "Mumbai",
    type: "Full time",
    summary:
      "We are looking for a motivated and detail-oriented junior architect to join our team. The candidate will assist in architectural design, preparation of drawings, and project documentation while working closely with senior architects.",
    details: [
      "Required Qualifications:",
      "- Bachelor of Architecture (B.Arch.)",
      "- Minimum 1–3 years of professional experience.",
      "- Strong design sensibility with a sound understanding of technical drawings and construction details.",
      "- Good communication and teamwork skills.",
      "Technical Skills:",
      "- Proficiency in AutoCAD, SketchUp, SolidWorks, Revit and 3D rendering tools",
      "- Familiarity with Adobe Creative Suite (Photoshop, InDesign, Illustrator)",
      "Pay:",
      "Competitive salary based on experience and portfolio.",
      "₹35,000 – ₹60,000 per month",
    ].join("\n"),
  },
];
