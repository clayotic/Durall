import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { History, Undo2 } from "lucide-react";
import { undoChange, type ActivityEntry } from "@/admin/api/inbox";
import { changePassword, updateOwnName } from "@/admin/api/session";
import { useAdmin } from "@/admin/context";
import { ROLES, SECTIONS } from "@/admin/permissions";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Notice,
  PageHeader,
  TextInput,
} from "@/admin/ui/controls";
import { errorMessage, useConfirm, useToast } from "@/admin/ui/overlay";

const stamp = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 minutes ago", "yesterday", then the date. */
function ago(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(hours) < 1) return relative.format(Math.round(minutes), "minute");
  if (Math.abs(days) < 1) return relative.format(Math.round(hours), "hour");
  if (Math.abs(days) < 7) return relative.format(Math.round(days), "day");
  return stamp.format(new Date(iso));
}

export function ActivityList({
  entries,
  compact,
  onUndo,
  undoing,
}: {
  entries: ActivityEntry[];
  compact?: boolean;
  /** Given on the owner's Activity screen: puts an Undo beside each change that still has one. */
  onUndo?: (entry: ActivityEntry) => void;
  /** The change being undone right now, if any. */
  undoing?: number | null;
}) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={<History className="h-7 w-7" aria-hidden="true" />}
        title="Nothing yet"
        body="Every save, upload and sign-in is listed here, with who did it."
      />
    );
  }
  return (
    <ol className="grid">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-baseline gap-3 border-b border-navy/6 py-2.5 last:border-b-0"
        >
          <span
            className="w-24 shrink-0 text-xs text-slate tabular-nums"
            title={stamp.format(new Date(entry.at))}
          >
            {ago(entry.at)}
          </span>
          <span className="min-w-0 flex-1 text-sm text-navy">
            {entry.summary}
            {!compact ? <span className="text-slate"> — {entry.userEmail}</span> : null}
          </span>
          {onUndo && entry.undo ? (
            <span className="flex shrink-0 items-center gap-3 self-center">
              {entry.undo.state === "done" ? (
                <Badge>Undone</Badge>
              ) : entry.undo.state === "later" ? (
                <span className="text-xs text-slate">Undo the later change first</span>
              ) : (
                <>
                  <span className="hidden text-xs text-slate sm:inline">
                    until {day.format(new Date(entry.undo.until))}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onUndo(entry)}
                    busy={undoing === entry.id}
                    disabled={undoing != null}
                  >
                    <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Undo
                  </Button>
                </>
              )}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function ActivityScreen({
  entries,
  undoReady,
}: {
  entries: ActivityEntry[];
  /** For the owner: whether the database can keep the copies undo needs. Absent for everyone else. */
  undoReady?: boolean | undefined;
}) {
  const { member } = useAdmin();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [undoing, setUndoing] = useState<number | null>(null);
  const owner = member?.role === "owner";

  const undo = async (entry: ActivityEntry) => {
    const ok = await confirm({
      title: "Undo this change?",
      body: `“${entry.summary}” by ${entry.userEmail}. The content it changed goes back to how it was just before, on the live site.`,
      confirmLabel: "Undo Change",
      danger: true,
    });
    if (!ok) return;
    setUndoing(entry.id);
    try {
      await undoChange({ data: { id: entry.id } });
      toast({ tone: "success", title: "Change undone" });
      await router.invalidate();
    } catch (error) {
      toast({ tone: "error", title: "Not undone", body: errorMessage(error) });
    } finally {
      setUndoing(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Activity"
        description={
          owner && undoReady
            ? "The latest 200 changes, newest first. A change to the site’s content can be undone for 15 days; after that it stays."
            : "The latest 200 changes, newest first."
        }
      />
      {owner && undoReady === false ? (
        <div className="mb-5">
          <Notice tone="warning" title="Undo is not switched on yet">
            Run supabase/migrations/0004_undo.sql in the Supabase SQL editor. Changes made after
            that can be undone from here for 15 days.
          </Notice>
        </div>
      ) : null}
      <Card>
        {owner && undoReady ? (
          <ActivityList entries={entries} onUndo={undo} undoing={undoing} />
        ) : (
          <ActivityList entries={entries} />
        )}
      </Card>
    </>
  );
}

export function AccountScreen() {
  const { member, configured } = useAdmin();
  const toast = useToast();
  const [name, setName] = useState(member?.name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!configured || !member) {
    return (
      <>
        <PageHeader title="My Account" />
        <EmptyState
          title="Accounts need the database"
          body="Connect it, then sign in to see your account here."
        />
      </>
    );
  }
  const role = ROLES.find((r) => r.key === member.role)!;

  const saveName = async () => {
    setSavingName(true);
    try {
      await updateOwnName({ data: { name } });
      toast({ tone: "success", title: "Name saved" });
    } catch (reason) {
      toast({ tone: "error", title: "Not saved", body: errorMessage(reason) });
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    if (password.length < 10) return setError("Use at least 10 characters.");
    if (password !== String(data.get("again") ?? ""))
      return setError("The two passwords do not match.");
    setError(null);
    setSavingPassword(true);
    try {
      await changePassword({ data: { password } });
      form.reset();
      toast({ tone: "success", title: "Password changed" });
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <PageHeader title="My Account" description={member.email} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Profile">
          <div className="grid gap-5">
            <Field label="Name" hint="Shown in the activity log.">
              {({ id, describedBy }) => (
                <TextInput
                  id={id}
                  aria-describedby={describedBy}
                  value={name}
                  autoComplete="name"
                  onChange={(event) => setName(event.target.value)}
                />
              )}
            </Field>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate">Role</span>
              <Badge tone={member.role === "owner" ? "info" : "neutral"}>{role.label}</Badge>
              <span className="text-xs text-slate">{role.note}</span>
            </div>
            {member.role === "editor" ? (
              <p className="text-xs leading-relaxed text-slate">
                You can edit:{" "}
                {member.sections.map((s) => SECTIONS.find((x) => x.key === s)?.label).join(", ") ||
                  "nothing yet — ask the owner."}
              </p>
            ) : null}
            <div>
              <Button
                variant="primary"
                busy={savingName}
                disabled={!name.trim() || name === member.name}
                onClick={() => void saveName()}
              >
                Save Name
              </Button>
            </div>
          </div>
        </Card>
        <Card title="Password">
          <form onSubmit={savePassword} className="grid gap-5" noValidate>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={member.email}
              readOnly
              hidden
            />
            <Field label="New password" hint="At least 10 characters.">
              {({ id, describedBy }) => (
                <TextInput
                  id={id}
                  aria-describedby={describedBy}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                />
              )}
            </Field>
            <Field label="Repeat the password" error={error}>
              {({ id, describedBy, invalid }) => (
                <TextInput
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  name="again"
                  type="password"
                  autoComplete="new-password"
                />
              )}
            </Field>
            <div>
              <Button type="submit" variant="primary" busy={savingPassword}>
                {savingPassword ? "Saving…" : "Change Password"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
