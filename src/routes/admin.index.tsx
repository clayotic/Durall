import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/admin/screens/Dashboard";
import { ScreenError } from "@/admin/ui/overlay";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Durall Admin" }] }),
  errorComponent: ScreenError,
  component: Dashboard,
});
