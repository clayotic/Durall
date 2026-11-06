import { createFileRoute } from "@tanstack/react-router";
import { listEnquiries } from "@/admin/api/inbox";
import { EnquiriesScreen } from "@/admin/screens/Enquiries";
import { ScreenSkeleton } from "@/admin/ui/controls";
import { ScreenError } from "@/admin/ui/overlay";

export const Route = createFileRoute("/admin/enquiries")({
  loader: () => listEnquiries(),
  head: () => ({ meta: [{ title: "Enquiries — Durall Admin" }] }),
  pendingComponent: ScreenSkeleton,
  errorComponent: ScreenError,
  component: Screen,
});

function Screen() {
  const { enquiries } = Route.useLoaderData();
  return <EnquiriesScreen enquiries={enquiries} />;
}
