import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { can } from "@/admin/permissions";
import { fail, logActivity, requireMember, requireOwner } from "@/server/auth";
import { purgeContentCache } from "@/server/cache";
import { isSupabaseConfigured, serviceClient } from "@/server/supabase";
import { CannotUndo, undo, undoStates, type UndoState } from "@/server/undo";
import { idSchema, input } from "@/server/validate";

/** Enquiries from the site's two forms, and the activity log. */

export type Enquiry = {
  id: string;
  createdAt: string;
  source: "contact" | "home" | "about" | "partners" | "expertise";
  name: string;
  email: string;
  studio: string;
  projectType: string;
  subject: string;
  phone: string;
  location: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  notes: string;
};

type EnquiryRow = {
  id: string;
  created_at: string;
  source: Enquiry["source"];
  name: string;
  email: string;
  studio: string;
  project_type: string;
  subject: string;
  /** Absent until migration 0002 has run. */
  phone?: string;
  location?: string;
  message: string;
  status: Enquiry["status"];
  notes: string;
};

const enquiryOf = (row: EnquiryRow): Enquiry => ({
  id: row.id,
  createdAt: row.created_at,
  source: row.source,
  name: row.name,
  email: row.email,
  studio: row.studio,
  projectType: row.project_type,
  subject: row.subject,
  phone: row.phone ?? "",
  location: row.location ?? "",
  message: row.message,
  status: row.status,
  notes: row.notes,
});

export const listEnquiries = createServerFn({ method: "GET" }).handler(async () => {
  if (!isSupabaseConfigured()) return { enquiries: [] as Enquiry[] };
  const { db } = await requireMember("enquiries");
  const { data, error } = await db
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) fail(error.message, 500);
  return { enquiries: ((data ?? []) as EnquiryRow[]).map(enquiryOf) };
});

export const updateEnquiry = createServerFn({ method: "POST" })
  .inputValidator(
    input(
      z.object({
        id: idSchema,
        status: z.enum(["new", "read", "replied", "archived"]),
        notes: z.string().max(5000),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const session = await requireMember("enquiries");
    const { error } = await session.db
      .from("enquiries")
      .update({ status: data.status, notes: data.notes })
      .eq("id", data.id);
    if (error) fail(error.message, 500);
    return { ok: true };
  });

export const deleteEnquiry = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ id: idSchema })))
  .handler(async ({ data }) => {
    const session = await requireMember("enquiries");
    const { error } = await session.db.from("enquiries").delete().eq("id", data.id);
    if (error) fail(error.message, 500);
    await logActivity(session, "delete", "enquiry", data.id, "Deleted an enquiry");
    return { ok: true };
  });

export type ActivityEntry = {
  id: number;
  at: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  /**
   * For the owner, on a change to the site's content made in the last
   * fifteen days: whether it can be undone ("later": a newer change to the
   * same content has to be undone first), and until when.
   */
  undo?: { state: UndoState; until: string };
};

export const listActivity = createServerFn({ method: "GET" })
  .inputValidator(input(z.object({ limit: z.number().int().min(1).max(500) })))
  .handler(async ({ data }) => {
    if (!isSupabaseConfigured()) return { entries: [] as ActivityEntry[] };
    const { db, member } = await requireMember();
    let query = db.from("activity").select("*");
    // The whole team's log (who was invited, with which email) is for the
    // owner and admins; an editor sees their own changes.
    if (member.role === "editor") query = query.eq("user_id", member.id);
    const { data: rows, error } = await query.order("at", { ascending: false }).limit(data.limit);
    if (error) fail(error.message, 500);
    const entries = (rows ?? []).map((row: Record<string, unknown>): ActivityEntry => ({
      id: Number(row["id"]),
      at: String(row["at"]),
      userEmail: String(row["user_email"] ?? ""),
      action: String(row["action"]),
      entity: String(row["entity"]),
      entityId: String(row["entity_id"] ?? ""),
      summary: String(row["summary"] ?? ""),
    }));
    // Undo is the owner's alone; nobody else is told a change can be undone.
    // `undoReady` is false until the database has been given the table the
    // copies are kept in (migration 0004).
    if (member.role !== "owner") return { entries };
    let states: Awaited<ReturnType<typeof undoStates>> = null;
    try {
      states = await undoStates(
        serviceClient(),
        entries.map((entry) => entry.id),
      );
    } catch {
      // No service key on this server: no undo.
    }
    for (const entry of entries) {
      const state = states?.get(entry.id);
      if (state) entry.undo = state;
    }
    return { entries, undoReady: states !== null };
  });

/**
 * Undoes one change to the site's content: the rows it touched go back to
 * how they were before it. The owner only, and only for fifteen days.
 */
export const undoChange = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ id: z.number().int().positive() })))
  .handler(async ({ data }) => {
    const session = await requireOwner();
    const { data: line } = await session.db
      .from("activity")
      .select("entity, entity_id, summary")
      .eq("id", data.id)
      .maybeSingle();
    if (!line) fail("That change is no longer in the log.", 404);
    try {
      await undo(serviceClient(), session.db, data.id);
    } catch (error) {
      if (error instanceof CannotUndo) fail(error.message, 409);
      throw error;
    }
    const was = line as { entity: string; entity_id: string; summary: string };
    await logActivity(session, "undo", was.entity, was.entity_id, `Undid: ${was.summary}`);
    await purgeContentCache();
    return { ok: true };
  });

/** Unread enquiries, for the badge in the sidebar. */
export const countNewEnquiries = createServerFn({ method: "GET" }).handler(async () => {
  if (!isSupabaseConfigured()) return { count: 0 };
  const session = await requireMember();
  if (!can(session.member, "enquiries")) return { count: 0 };
  const { count, error } = await session.db
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  if (error) return { count: 0 };
  return { count: count ?? 0 };
});
