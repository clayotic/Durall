import { createFileRoute } from "@tanstack/react-router";
import { listActivity } from "@/admin/api/inbox";
import { ActivityScreen } from "@/admin/screens/Account";
import { ScreenSkeleton } from "@/admin/ui/controls";
import { ScreenError } from "@/admin/ui/overlay";

export const Route = createFileRoute("/admin/activity")({
  loader: () => listActivity({ data: { limit: 200 } }),
  head: () => ({ meta: [{ title: "Activity — Durall Admin" }] }),
  pendingComponent: ScreenSkeleton,
  errorComponent: ScreenError,
  component: Screen,
});

function Screen() {
  const { entries, undoReady } = Route.useLoaderData();
  return <ActivityScreen entries={entries} undoReady={undoReady} />;
}
