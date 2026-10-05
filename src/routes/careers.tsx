import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/durall/SiteHeader";
import { PhotoHero } from "@/components/durall/PhotoHero";
import { OpenRoles } from "@/components/durall/careers/OpenRoles";
import { DurallFooter } from "@/components/durall/DurallFooter";
import { seoHead } from "@/content/head";
import { fetchCareers } from "@/content/api";
import { useSite } from "@/content/site";

export const Route = createFileRoute("/careers")({
  // ?team=workshop: the list filtered to one team (see OpenRoles).
  validateSearch: (search: Record<string, unknown>): { team?: string } =>
    typeof search["team"] === "string" && /^[a-z0-9-]{1,80}$/.test(search["team"])
      ? { team: search["team"] }
      : {},
  loader: () => fetchCareers(),
  head: ({ loaderData }) => seoHead(loaderData?.page.seo),
  component: CareersPage,
});

function CareersPage() {
  const { page, roles } = Route.useLoaderData();
  const { team } = Route.useSearch();
  const email = useSite().settings.contact.careersEmail;
  const { opening } = page;

  return (
    <div className="relative bg-white font-body text-navy">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="scroll-mt-24">
        {/* The photograph is cut taller than this opening; 67% keeps the
            part the design frames in view (see heroCareers in images.ts). */}
        <PhotoHero
          content={opening}
          compact
          focus="50% 67%"
          wash={{ corners: true, left: 1, top: true }}
        />
        <OpenRoles content={page.roles} open={page.open} roles={roles} team={team} email={email} />
      </main>
      <DurallFooter />
    </div>
  );
}
