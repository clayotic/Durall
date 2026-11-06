import type { SiteSettings } from "../types";

/* The email and phones are the client's (November 2026); applications go to
 * the same address until the client gives a separate one. Change them in the
 * admin panel (Company & contact). */
export const SETTINGS_SEED: SiteSettings = {
  company: {
    name: "Durall Systems",
    legalName: "Durall Systems India Pvt. Ltd.",
    tagline: "Enveloping Luxury",
  },
  contact: {
    details: [
      {
        icon: "mail",
        label: "Email",
        value: "info@durallsystems.com",
        href: "mailto:info@durallsystems.com",
        note: "For project enquiries and technical drawings.",
      },
      {
        icon: "phone",
        label: "Phone",
        value: "+91 93222 42166",
        href: "tel:+919322242166",
        note: "Weekdays, 9:30 to 18:00 IST.",
      },
      {
        icon: "phone",
        label: "Phone",
        value: "+91 89767 42427",
        href: "tel:+918976742427",
        note: "",
      },
    ],
    responseNote: "A member of the Durall engineering team will respond within two working days.",
    careersEmail: "info@durallsystems.com",
  },
  office: {
    name: "Durall Systems India Pvt. Ltd.",
    lines: [
      "Kolivery Village, P and T Colony",
      "Vakola, Santacruz East",
      "Mumbai, Maharashtra 400098, India",
    ],
    plusCode: "3VC7+6M3",
    lng: 72.8641719,
    lat: 19.0705125,
    note: "Visits by appointment.",
    directions: "https://www.google.com/maps/dir/?api=1&destination=19.0705125%2C72.8641719",
    googleMaps:
      "https://www.google.com/maps/search/?api=1&query=Durall%20Systems%20India%20Pvt%20Ltd%2C%203VC7%2B6M3%20Mumbai",
  },
  header: {
    items: [
      { label: "Home", fullLabel: "", href: "/", visible: true },
      { label: "About Us", fullLabel: "", href: "/about", visible: true },
      { label: "Projects", fullLabel: "", href: "/projects", visible: true },
      {
        label: "Partners",
        fullLabel: "Partners / International Systems",
        href: "/partners",
        visible: true,
      },
      { label: "Insights", fullLabel: "", href: "/insights", visible: true },
      { label: "Career", fullLabel: "", href: "/careers", visible: true },
    ],
    cta: { label: "Contact Us", href: "/contact" },
  },
  footer: {
    blurb:
      "Premium aluminium window, door and façade systems — designed, engineered, fabricated and installed in India.",
    columns: [
      {
        title: "Explore",
        links: [
          { label: "Projects", href: "/projects" },
          { label: "Partners", href: "/partners" },
          { label: "About", href: "/about" },
          { label: "Insights", href: "/insights" },
          { label: "Careers", href: "/careers" },
        ],
      },
    ],
    officeHeading: "Head Office",
    contactHeading: "Talk to Us",
    hours: "Weekdays, 9:30–18:00 IST · Visits by appointment",
    // The Facebook address is the share link Durall gave; the page's own
    // address would be better once known. Sharing codes were left off the
    // Instagram and Pinterest ones.
    social: [
      { label: "LinkedIn", href: "https://www.linkedin.com/company/durall-systems-pvt-ltd/" },
      { label: "Instagram", href: "https://www.instagram.com/durallsystems" },
      { label: "Facebook", href: "https://www.facebook.com/share/19LX47mxNY/" },
      { label: "Pinterest", href: "https://www.pinterest.com/durallsystemsofficial/" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
    backToTop: "Back to Top",
  },
  seo: {
    shareImage: "/og-durall.jpg",
    shareImageAlt: "Parikrama House, Nandgaon — the long dark house beneath coconut palms",
  },
  behaviour: {
    loadingScreen: true,
    pageTransition: true,
  },
  notFound: {
    heading: "Page not found",
    body: "The page you're looking for doesn't exist or has been moved.",
    action: "Go home",
  },
};
