import { createFileRoute } from "@tanstack/react-router";
import { AccountScreen } from "@/admin/screens/Account";
import { ScreenError } from "@/admin/ui/overlay";

export const Route = createFileRoute("/admin/account")({
  head: () => ({ meta: [{ title: "My Account — Durall Admin" }] }),
  errorComponent: ScreenError,
  component: AccountScreen,
});
