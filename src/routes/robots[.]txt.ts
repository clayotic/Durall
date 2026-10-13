import { createFileRoute } from "@tanstack/react-router";
import { siteOrigin } from "@/content/head";

/**
 * What crawlers may read: everything but the admin panel, and where the
 * sitemap is. Written per request rather than kept as a file, because the
 * sitemap's address has to carry the site's own domain.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteOrigin()}/sitemap.xml\n`,
          {
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "public, max-age=3600",
            },
          },
        ),
    },
  },
});
