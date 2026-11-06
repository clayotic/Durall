import { createFileRoute } from "@tanstack/react-router";
import { MediaScreen } from "@/admin/screens/Media";
import { ScreenError } from "@/admin/ui/overlay";

export const Route = createFileRoute("/admin/media")({
  head: () => ({ meta: [{ title: "Media — Durall Admin" }] }),
  errorComponent: ScreenError,
  component: MediaScreen,
});
