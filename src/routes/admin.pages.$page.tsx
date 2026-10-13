import { createFileRoute, notFound } from "@tanstack/react-router";
import { listArticles, loadPage, loadShared, savePage, saveShared } from "@/admin/api/content";
import { SectionedEditor } from "@/admin/screens/SectionedEditor";
import { pageForm, SHARED_FORM } from "@/admin/specs/pages";
import { ScreenSkeleton } from "@/admin/ui/controls";
import { isPageKey, PAGES } from "@/content/pages";
import type { PageKey, PageMap, SharedContent } from "@/content/types";

/** One page's editor, or the shared sections ("shared"). */
export const Route = createFileRoute("/admin/pages/$page")({
  loader: async ({ params }) => {
    if (params.page === "shared") {
      const { shared } = await loadShared();
      return { kind: "shared" as const, content: shared };
    }
    if (!isPageKey(params.page)) throw notFound();
    // The Insights form depends on which articles there are (pageForm). A
    // member without access to Insights gets the whole form instead.
    const [{ page }, articles] = await Promise.all([
      loadPage({ data: params.page }),
      params.page === "insights"
        ? listArticles().then(
            (list) =>
              list.articles.map((article) => ({
                inSeries: Boolean(article.series),
                film: article.format === "video",
              })),
            () => undefined,
          )
        : undefined,
    ]);
    return { kind: "page" as const, key: params.page, content: page, articles };
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.page === "shared" ? "Shared Sections" : (PAGES.find((p) => p.key === params.page)?.label ?? "Page")} — Durall Admin`,
      },
    ],
  }),
  pendingComponent: ScreenSkeleton,
  component: PageEditor,
});

function PageEditor() {
  const data = Route.useLoaderData();
  if (data.kind === "shared") {
    return (
      <SectionedEditor<SharedContent>
        key="shared"
        title="Shared Sections"
        description="Edited here once, shown on every page that carries them."
        back={{ to: "/admin/pages", label: "All pages" }}
        sections={SHARED_FORM}
        initial={data.content}
        save={async (content) => (await saveShared({ data: { content } })).shared}
      />
    );
  }
  const key: PageKey = data.key;
  const page = PAGES.find((p) => p.key === key)!;
  return (
    <SectionedEditor<PageMap[PageKey]>
      key={key}
      title={`${page.label} Page`}
      back={{ to: "/admin/pages", label: "All pages" }}
      sections={pageForm(key, data.articles)}
      initial={data.content}
      viewPath={page.path}
      save={async (content) => (await savePage({ data: { key, content } })).page}
    />
  );
}
