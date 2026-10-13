import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { imageOf } from "./render";
import type { ArticleDoc, Seo, SiteSettings } from "./types";

/**
 * The site's public address. On the server that is Netlify's primary URL
 * for the site when there is one, so a preview deploy still names the real
 * address, and otherwise the address the request came in on.
 */
export const siteOrigin = createIsomorphicFn()
  .server(() => {
    const fixed = process.env["URL"];
    if (fixed) return fixed.replace(/\/+$/, "");
    try {
      return new URL(getRequestUrl()).origin;
    } catch {
      return "";
    }
  })
  .client(() => window.location.origin);

/** A site path as a full address: share images and canonical links are read
 * by crawlers, and several refuse to resolve a relative one. */
export function absoluteUrl(path: string) {
  return path.startsWith("/") ? siteOrigin() + path : path;
}

type Meta = {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
  /** Structured data for search engines, written out as a JSON-LD script. */
  "script:ld+json"?: Record<string, unknown>;
};

/* A contact detail still holding the placeholder the site shipped with is
 * not something to tell a search engine. */
const PLACEHOLDER = /example\.com|\+00|0000/;

/**
 * Who the site belongs to, for search engines: the company, where it is,
 * and its profiles elsewhere. Built from the site settings, so a change
 * made in the admin panel (an address, a new profile) is carried here.
 */
export function organizationLd(settings: SiteSettings | undefined): Record<string, unknown> {
  const origin = siteOrigin();
  if (!settings) return { "@context": "https://schema.org", "@type": "WebSite", url: origin };
  const { company, office, contact, footer } = settings;
  const detail = (icon: string) => {
    const found = contact.details.find((item) => item.icon === icon);
    return found && !PLACEHOLDER.test(`${found.value} ${found.href}`) ? found.value : undefined;
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: company.name,
        legalName: company.legalName,
        slogan: company.tagline,
        url: origin,
        logo: `${origin}/apple-touch-icon.png`,
        address: office.lines.join(", "),
        email: detail("mail"),
        telephone: detail("phone"),
        sameAs: footer.social
          .map((profile) => profile.href)
          .filter((href) => /^https?:/.test(href)),
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: company.name,
        url: origin,
        publisher: { "@id": `${origin}/#organization` },
      },
    ],
  };
}

/** An article, for search engines: what it is, when, and whose. */
export function articleLd(
  article: Pick<ArticleDoc, "slug" | "title" | "excerpt" | "publishedAt" | "cover">,
): Record<string, unknown> {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [absoluteUrl(imageOf(article.cover.image).src)],
    datePublished: article.publishedAt,
    mainEntityOfPage: `${origin}/insights/${article.slug}`,
    author: { "@id": `${origin}/#organization` },
    publisher: { "@id": `${origin}/#organization` },
  };
}

/**
 * A page's <head> from its SEO fields. The share image falls back to the
 * site-wide one declared in __root.tsx; a page with its own image
 * overrides it (the later tag wins).
 */
export function seoHead(
  seo: (Pick<Seo, "title" | "description"> & { image?: Seo["image"] }) | undefined,
  { type = "website", extra = [] }: { type?: "website" | "article"; extra?: Meta[] } = {},
): { meta: Meta[] } {
  if (!seo) return { meta: [] };
  const meta: Meta[] = [
    { title: seo.title },
    { name: "description", content: seo.description },
    { property: "og:title", content: seo.title },
    { property: "og:description", content: seo.description },
    { property: "og:type", content: type },
    { name: "twitter:card", content: "summary_large_image" },
    ...extra,
  ];
  if (seo.image) {
    const src = absoluteUrl(imageOf(seo.image.image).src);
    meta.push(
      { property: "og:image", content: src },
      { property: "og:image:alt", content: seo.image.alt },
      { name: "twitter:image", content: src },
    );
  }
  return { meta };
}
