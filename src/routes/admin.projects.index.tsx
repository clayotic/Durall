import { createFileRoute } from "@tanstack/react-router";
import { listProjects } from "@/admin/api/content";
import { ProjectsList } from "@/admin/screens/Projects";
import { ScreenSkeleton } from "@/admin/ui/controls";
import { ScreenError } from "@/admin/ui/overlay";

export const Route = createFileRoute("/admin/projects/")({
  loader: () => listProjects(),
  head: () => ({ meta: [{ title: "Projects — Durall Admin" }] }),
  pendingComponent: ScreenSkeleton,
  errorComponent: ScreenError,
  component: Screen,
});

function Screen() {
  const { projects } = Route.useLoaderData();
  return <ProjectsList projects={projects} />;
}
