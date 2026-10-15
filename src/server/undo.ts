import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Undo for the owner. Server-only.
 *
 * Before a change to the site's content is written, the rows it may touch
 * are copied as they stand. The copy is kept beside the change's line in
 * the activity log (table `undo_copies`, migration 0004), and undoing the
 * change is putting those rows back exactly: restoring what was changed or
 * deleted, and removing what the change added.
 *
 * Copies are kept for UNDO_DAYS and then deleted, after which the change is
 * permanent. A database that has not been given the table yet simply has no
 * undo: every save works as before.
 */

/** How long a change can be undone. */
export const UNDO_DAYS = 15;
const WINDOW_MS = UNDO_DAYS * 86_400_000;

/** The tables whose changes can be undone, and the column that names a row in each. */
const KEY = {
  settings: "key",
  pages: "key",
  projects: "id",
  articles: "id",
  career_roles: "id",
  partners: "id",
} as const;
type Table = keyof typeof KEY;

/**
 * What a change may touch, as rows of one table: the rows named, or every
 * row where a column has a value, or (neither) the whole table.
 */
export type Reach = {
  table: Table;
  only?: string[];
  where?: { column: string; value: string };
};

type Row = Record<string, unknown>;
export type Copy = { reach: Reach; rows: Row[] };

/** Whether what came out of the database is a reach this code wrote. */
function isReach(value: unknown): value is Reach {
  if (typeof value !== "object" || value === null) return false;
  const reach = value as { table?: unknown; only?: unknown; where?: unknown };
  if (typeof reach.table !== "string" || !(reach.table in KEY)) return false;
  if (reach.only !== undefined && !Array.isArray(reach.only)) return false;
  return true;
}

function within(db: SupabaseClient, reach: Reach, columns = "*") {
  let query = db.from(reach.table).select(columns);
  if (reach.only) query = query.in(KEY[reach.table], reach.only);
  if (reach.where) query = query.eq(reach.where.column, reach.where.value);
  return query;
}

/**
 * The rows a change is about to touch, as they are now. Read as the member
 * making the change. Never fails the save it is for: without a copy the
 * change simply cannot be undone.
 */
export async function copyBefore(db: SupabaseClient, reach: Reach): Promise<Copy | null> {
  const { data, error } = await within(db, reach);
  if (error) {
    console.warn("[undo] no copy taken", error.message);
    return null;
  }
  return { reach, rows: (data ?? []) as unknown as Row[] };
}

/** Whether two changes could have touched the same rows. */
export function touches(a: Reach, b: Reach): boolean {
  if (a.table !== b.table) return false;
  if (a.only && b.only) return a.only.some((id) => b.only!.includes(id));
  if (a.where && b.where) {
    return a.where.column !== b.where.column || a.where.value === b.where.value;
  }
  return true;
}

/** Files the copy under the change's line in the log, and clears out old copies. */
export async function keepCopy(service: SupabaseClient, activityId: number, copy: Copy) {
  const { error } = await service
    .from("undo_copies")
    .insert({ activity_id: activityId, reach: copy.reach, rows: copy.rows });
  if (error) {
    // Before migration 0004 there is no table to keep it in.
    console.warn("[undo] copy not kept", error.message);
    return;
  }
  const { error: old } = await service
    .from("undo_copies")
    .delete()
    .lt("at", new Date(Date.now() - WINDOW_MS).toISOString());
  if (old) console.warn("[undo] old copies not cleared", old.message);
}

export type UndoState = "ready" | "later" | "done";

/**
 * For the lines of the log given (newest first), which can be undone:
 * "ready", or "later" when a newer change to the same rows has to be undone
 * first, or "done". `null` when the database has no undo yet.
 */
export async function undoStates(
  service: SupabaseClient,
  ids: number[],
): Promise<Map<number, { state: UndoState; until: string }> | null> {
  const { data, error } = await service
    .from("undo_copies")
    .select("activity_id, at, reach, undone_at")
    .gte("at", new Date(Date.now() - WINDOW_MS).toISOString())
    .order("at", { ascending: false });
  if (error) return null;
  const listed = new Set(ids);
  const states = new Map<number, { state: UndoState; until: string }>();
  const standing: Reach[] = [];
  for (const row of (data ?? []) as {
    activity_id: number;
    at: string;
    reach: unknown;
    undone_at: string | null;
  }[]) {
    if (!isReach(row.reach)) continue;
    const reach = row.reach;
    const state: UndoState = row.undone_at
      ? "done"
      : standing.some((newer) => touches(newer, reach))
        ? "later"
        : "ready";
    if (!row.undone_at) standing.push(reach);
    const id = Number(row.activity_id);
    if (listed.has(id)) {
      states.set(id, { state, until: new Date(Date.parse(row.at) + WINDOW_MS).toISOString() });
    }
  }
  return states;
}

/** Why a change cannot be undone, as a sentence for the owner. */
export class CannotUndo extends Error {}

/**
 * Undoes one change: puts the rows it touched back as they were, as the
 * owner (`db`, their own session, so the database's rules still apply), and
 * marks the copy used.
 */
export async function undo(service: SupabaseClient, db: SupabaseClient, activityId: number) {
  const { data, error } = await service
    .from("undo_copies")
    .select("*")
    .eq("activity_id", activityId)
    .maybeSingle();
  if (error) throw new CannotUndo("Undo is not switched on for this database yet.");
  const copy = data as {
    at: string;
    reach: unknown;
    rows: unknown;
    undone_at: string | null;
  } | null;
  if (!copy || Date.parse(copy.at) < Date.now() - WINDOW_MS) {
    throw new CannotUndo(
      `That change can no longer be undone: it is more than ${UNDO_DAYS} days old.`,
    );
  }
  if (copy.undone_at) throw new CannotUndo("That change has already been undone.");
  if (!isReach(copy.reach) || !Array.isArray(copy.rows)) {
    throw new CannotUndo("That change cannot be undone.");
  }
  const reach = copy.reach;
  const rows = copy.rows as Row[];

  const { data: newer, error: newerError } = await service
    .from("undo_copies")
    .select("reach")
    .gt("at", copy.at)
    .is("undone_at", null);
  if (newerError) throw new CannotUndo("That change cannot be undone right now.");
  if (
    ((newer ?? []) as { reach: unknown }[]).some((n) => isReach(n.reach) && touches(n.reach, reach))
  ) {
    throw new CannotUndo("A later change to the same content has to be undone first.");
  }

  // Rows the change added go; rows it changed or removed come back.
  const key = KEY[reach.table];
  const was = new Set(rows.map((row) => String(row[key])));
  const { data: now, error: readError } = await within(db, reach, key);
  if (readError) throw new CannotUndo(`The content could not be read: ${readError.message}`);
  const added = ((now ?? []) as unknown as Row[])
    .map((row) => String(row[key]))
    .filter((id) => !was.has(id));
  if (added.length) {
    const { error: gone } = await db.from(reach.table).delete().in(key, added);
    if (gone) throw new CannotUndo(`The change could not be undone: ${gone.message}`);
  }
  if (rows.length) {
    const { error: back } = await db.from(reach.table).upsert(rows);
    if (back) throw new CannotUndo(`The change could not be undone: ${back.message}`);
  }
  await service
    .from("undo_copies")
    .update({ undone_at: new Date().toISOString() })
    .eq("activity_id", activityId);
}
