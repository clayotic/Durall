import { createFileRoute } from "@tanstack/react-router";
import { listRoles } from "@/admin/api/content";
import { CareersScreen } from "@/admin/screens/Lists";
import { ScreenSkeleton } from "@/admin/ui/controls";
import { ScreenError } from "@/admin/ui/overlay";

export const Route = createFileRoute("/admin/careers")({
  loader: () => listRoles(),
  head: () => ({ meta: [{ title: "Careers — Durall Admin" }] }),
  pendingComponent: ScreenSkeleton,
  errorComponent: ScreenError,
  component: Screen,
});

function Screen() {
  const { roles } = Route.useLoaderData();
  return <CareersScreen roles={roles} />;
}
