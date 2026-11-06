import { createFileRoute } from "@tanstack/react-router";
import { PagesIndex } from "@/admin/screens/PagesIndex";
import { ScreenError } from "@/admin/ui/overlay";

export const Route = createFileRoute("/admin/pages/")({
  head: () => ({ meta: [{ title: "Pages — Durall Admin" }] }),
  errorComponent: ScreenError,
  component: PagesIndex,
});
