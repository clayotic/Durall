import { Link } from "@tanstack/react-router";
import { blankPartner, blankRole } from "@/content/defaults";
import type { PartnerDoc, RoleDoc } from "@/content/types";
import { savePartners, saveRoles } from "@/admin/api/content";
import { FieldControl } from "@/admin/form/fields";
import type { FieldSpec } from "@/admin/form/spec";
import { SaveBar, useEditor } from "@/admin/lib/editor";
import { PRACTICE_FIELDS, ROLE_FIELDS } from "@/admin/specs/collections";
import { Card, Notice, PageHeader } from "@/admin/ui/controls";

/* Careers and Partners: short lists edited and saved as a whole. */

const INLINE_LINK = "admin-focus rounded font-medium text-accent-blue hover:underline";

export function CareersScreen({ roles }: { roles: RoleDoc[] }) {
  const editor = useEditor(
    roles,
    async (list) => (await saveRoles({ data: { roles: list } })).roles,
  );
  const open = editor.draft.filter((role) => role.open).length;
  const spec: FieldSpec = {
    kind: "list",
    path: "",
    label: "Roles",
    fields: ROLE_FIELDS,
    itemTitle: ((role: RoleDoc) =>
      `${role.title || "Untitled role"}${role.open ? "" : " (closed)"}`) as (item: never) => string,
    create: () => blankRole(),
    addLabel: "Add Role",
    max: 50,
  };
  return (
    <>
      <SaveBar
        title="Careers"
        dirty={editor.dirty}
        saving={editor.saving}
        editable={editor.editable}
        onSave={() => void editor.submit()}
        onDiscard={() => void editor.discard()}
      />
      <PageHeader
        title="Careers"
        description={`${open} open ${open === 1 ? "role" : "roles"} on the Careers page. Close a role to hide it without deleting it; with none open, the page says so and invites people to write anyway.`}
      />
      <div className="grid gap-5">
        <Notice>
          The page’s headings and texts are under{" "}
          <Link to="/admin/pages/$page" params={{ page: "careers" }} className={INLINE_LINK}>
            Pages → Careers
          </Link>
          ; the address applications go to is under{" "}
          <Link to="/admin/company" className={INLINE_LINK}>
            Company &amp; Contact
          </Link>
          .
        </Notice>
        <Card>
          <fieldset disabled={!editor.editable}>
            <FieldControl
              spec={spec}
              value={editor.draft}
              onChange={(next) => editor.setDraft(next as RoleDoc[])}
            />
          </fieldset>
        </Card>
      </div>
    </>
  );
}

/**
 * The architects and design practices on the Partners page. The partner
 * brands' list ("International Systems") was taken off the site; those rows
 * stay in the database untouched, but are no longer shown or edited.
 */
export function PartnersScreen({ partners }: { partners: PartnerDoc[] }) {
  const editor = useEditor(
    partners.filter((p) => p.kind === "practice"),
    async (practices: PartnerDoc[]) =>
      (await savePartners({ data: { kind: "practice", items: practices } })).items,
  );

  const spec: FieldSpec = {
    kind: "list",
    path: "practices",
    label: "Architects & design practices",
    fields: PRACTICE_FIELDS,
    itemTitle: ((item: PartnerDoc) =>
      `${item.name || "Untitled"}${item.visible ? "" : " (hidden)"}`) as (item: never) => string,
    create: () => blankPartner("", "practice"),
    addLabel: "Add Practice",
    max: 40,
  };

  return (
    <>
      <SaveBar
        title="Partners"
        dirty={editor.dirty}
        saving={editor.saving}
        editable={editor.editable}
        onSave={() => void editor.submit()}
        onDiscard={() => void editor.discard()}
      />
      <PageHeader
        title="Partners"
        description="The architects and design practices on the Partners page, in the order they appear. Each one's country is marked on the world map above the logos."
      />
      <Card>
        <fieldset disabled={!editor.editable}>
          <FieldControl
            spec={spec}
            value={editor.draft}
            onChange={(next) => editor.setDraft(next as PartnerDoc[])}
          />
        </fieldset>
      </Card>
    </>
  );
}
