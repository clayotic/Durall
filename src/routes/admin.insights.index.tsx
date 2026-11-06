import { createFileRoute } from "@tanstack/react-router";
import { listArticles } from "@/admin/api/content";
import { ArticlesList } from "@/admin/screens/Articles";
import { ScreenSkeleton } from "@/admin/ui/controls";
import { ScreenError } from "@/admin/ui/overlay";

export const Route = createFileRoute("/admin/insights/")({
  loader: () => listArticles(),
  head: () => ({ meta: [{ title: "Insights — Durall Admin" }] }),
  pendingComponent: ScreenSkeleton,
  errorComponent: ScreenError,
  component: Screen,
});

function Screen() {
  const { articles } = Route.useLoaderData();
  return <ArticlesList articles={articles} />;
}
