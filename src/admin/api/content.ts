import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { blankArticle, blankPartner, blankProject, blankRole } from "@/content/defaults";
import { withDefaults } from "@/content/merge";
import { isPageKey, PAGES } from "@/content/pages";
import { readingTimeOf } from "@/content/select";
import { SEED } from "@/content/seed";
import type {
  ArticleDoc,
  PageKey,
  PageMap,
  PartnerDoc,
  ProjectDoc,
  RoleDoc,
  SharedContent,
  SiteSettings,
} from "@/content/types";
import { ADMIN_LOGIN } from "@/admin/enabled";
import { can, type Member, type Section } from "@/admin/permissions";
import { currentMember, fail, logActivity, requireMember, requireOwner } from "@/server/auth";
import { purgeContentCache } from "@/server/cache";
import {
  databaseStore,
  holdsCurrentContent,
  markImported,
  seedStore,
  type ContentStore,
} from "@/server/store";
import { isSupabaseConfigured, serviceClient, supabaseConfig } from "@/server/supabase";
import { copyBefore, keepCopy, type Copy } from "@/server/undo";
import { docSchema, idSchema, input, parse, slugSchema } from "@/server/validate";

/**
 * Reading and saving content from the admin panel.
 *
 * Reads go through the signed-in member's session, so drafts are included;
 * before the database exists, or before the first import, they return the
 * bundled content and mark it read-only. Every save checks the member's
 * access to the section, is written through row-level security as that
 * member, lands in the activity log and purges the CDN copies of the site.
 */

type Session = NonNullable<Awaited<ReturnType<typeof currentMember>>>;

/* "Imported" means the database holds the site as it is now: an older copy
 * counts the same as none (server/store.ts). */
const isImported = holdsCurrentContent;

/** The store the panel reads from, and whether what it shows can be saved. */
async function adminStore(
  section?: Section,
): Promise<{ store: ContentStore; editable: boolean; member: Member | null }> {
  if (!isSupabaseConfigured()) {
    // Preview: the content in the code, read-only. Behind the sign-in where
    // the panel is locked, so the lock is not only the page in front of it.
    const session = ADMIN_LOGIN ? await currentMember() : null;
    if (ADMIN_LOGIN && !session) fail("Sign in to open the admin panel.", 401);
    return { store: seedStore, editable: false, member: session?.member ?? null };
  }
  const { db, member } = await requireMember(section);
  if (!(await isImported(db))) return { store: seedStore, editable: false, member };
  return { store: databaseStore(db), editable: true, member };
}

/**
 * After a save: its line in the log, the copy of what was there before it
 * (filed under that line, for the owner's undo: server/undo.ts), and the
 * CDN's copies of the site cleared.
 */
async function saved(
  session: Session,
  action: string,
  entity: string,
  id: string,
  summary: string,
  before: Copy | null,
) {
  const line = await logActivity(session, action, entity, id, summary);
  if (line !== null && before) {
    try {
      await keepCopy(serviceClient(), line, before);
    } catch (error) {
      // No service key: the change is saved, and simply cannot be undone.
      console.warn("[undo] copy not kept", error);
    }
  }
  await purgeContentCache();
}

/** "Deleted project “X”": the copy taken before the delete knows the name. */
function deleted(what: string, before: Copy | null, field: string): string {
  const data = (before?.rows[0] as { data?: Record<string, unknown> } | undefined)?.data;
  const name = typeof data?.[field] === "string" ? (data[field] as string).trim() : "";
  return name ? `Deleted ${what} "${name}"` : `Deleted ${what === "article" ? "an" : "a"} ${what}`;
}

function dbError(error: { message: string; code?: string } | null, what: string): void {
  if (!error) return;
  if (error.code === "23505") fail(`Another ${what} already uses that web address.`, 409);
  console.error(`[admin] ${what} write failed`, error);
  fail(`The ${what} could not be saved: ${error.message}`, 500);
}

/* ── Status ──────────────────────────────────────────────────────────────── */

/** Whether the database is connected and imported, for the dashboard's setup card. */
export const getContentStatus = createServerFn({ method: "GET" }).handler(async () => {
  if (!isSupabaseConfigured()) return { configured: false, imported: false };
  const { db } = await requireMember();
  return { configured: true, imported: await isImported(db) };
});

/* The images uploaded through the panel: files in the storage bucket, each
 * upload in its own folder, and a row in `media` for each. */
const UPLOADS = { bucket: "media", folder: "uploads" };

/**
 * Removes every uploaded image's files. Storage has no "empty this folder":
 * each upload's folder is listed and its files removed, a hundred folders
 * at a time, until none are left.
 */
async function removeUploadedFiles() {
  const storage = serviceClient().storage.from(UPLOADS.bucket);
  // ponytail: 50 rounds of 100 folders. More uploads than that and the
  // owner is told to run it again, rather than this running unbounded.
  for (let round = 0; round < 50; round++) {
    const { data: folders, error } = await storage.list(UPLOADS.folder, { limit: 100 });
    if (error) fail(`The old uploads could not be listed: ${error.message}`, 500);
    // Only an upload's own folder (its id), never anything else in the bucket.
    const own = (folders ?? []).filter((folder) => /^[0-9a-f-]{36}$/.test(folder.name));
    if (!own.length) return;
    for (const folder of own) {
      const path = `${UPLOADS.folder}/${folder.name}`;
      const { data: files, error: listError } = await storage.list(path);
      if (listError) fail(`The old uploads could not be listed: ${listError.message}`, 500);
      const { error: removeError } = await storage.remove(
        (files ?? []).map((file) => `${path}/${file.name}`),
      );
      if (removeError) fail(`An old upload could not be removed: ${removeError.message}`, 500);
    }
  }
  fail("There are more old uploads than one run removes. Run it again.", 500);
}

/**
 * Starts the database afresh from the site exactly as it is in the code: the
 * owner's first step after connecting it, and again after the site was
 * rebuilt while the database was switched off. Nothing stored before is
 * carried over. The pages, projects, articles, roles, partners and settings
 * are replaced by the site's own; the images uploaded before and the
 * activity log are deleted, and the enquiries too if asked. Accounts stay,
 * or nobody could sign in.
 *
 * Refuses once the database is current unless asked to overwrite, since
 * from then on the database is where the real content lives. Overwriting a
 * current database puts the content back to the code's and clears nothing
 * else.
 */
export const importSiteContent = createServerFn({ method: "POST" })
  .inputValidator(
    input(z.object({ overwrite: z.boolean(), enquiries: z.boolean().default(false) })),
  )
  .handler(async ({ data }) => {
    const session = await requireOwner();
    const { db, member } = session;
    const fresh = !(await isImported(db));
    if (!fresh && !data.overwrite) {
      fail("The site's content is already in the database.", 409);
    }
    // Clearing uploads, the log and enquiries is beyond what a member may
    // do through row-level security: it takes the server's own key.
    if (fresh && !supabaseConfig().serviceKey) {
      fail("The server needs its Supabase service key to clear what was stored before.", 503);
    }
    const by = member.id;
    const at = new Date().toISOString();
    const lists: [string, { id: string }[]][] = [
      ["projects", SEED.projects.map((p) => projectRow(p, by))],
      ["articles", SEED.articles.map((a) => articleRow(a, by))],
      ["career_roles", SEED.roles.map((r) => roleRow(r, by))],
      ["partners", SEED.partners.map((p) => partnerRow(p, by))],
    ];
    for (const [table, rows] of lists) {
      // What is not on the site goes first: an older entry under another id
      // may hold the web address one of these needs.
      const keep = `(${rows.map((row) => JSON.stringify(row.id)).join(",")})`;
      const { error: gone } = await db.from(table).delete().not("id", "in", keep);
      dbError(gone, "content");
      const { error } = await db.from(table).upsert(rows);
      dbError(error, "content");
    }
    const keys = `(${PAGES.map((page) => JSON.stringify(page.key)).join(",")})`;
    const { error: strays } = await db.from("pages").delete().not("key", "in", keys);
    dbError(strays, "content");
    const { error: pages } = await db.from("pages").upsert(
      PAGES.map((page) => ({
        key: page.key,
        content: SEED.pages[page.key],
        updated_by: by,
        updated_at: at,
      })),
    );
    dbError(pages, "content");
    if (fresh) {
      // The site's own content uses no uploaded image, so none is in use.
      await removeUploadedFiles();
      const service = serviceClient();
      const { error: media } = await service.from("media").delete().lte("created_at", at);
      dbError(media, "old uploads");
      const { error: log } = await service.from("activity").delete().lte("at", at);
      dbError(log, "activity log");
      if (data.enquiries) {
        const { error: inbox } = await service.from("enquiries").delete().lte("created_at", at);
        dbError(inbox, "enquiries");
      }
    }
    // Last, because this row's date is what says the database is current
    // (holdsCurrentContent): if a step above fails, the site stays on the
    // bundled content and this can simply be run again.
    const { error: settings } = await db.from("settings").upsert([
      { key: "shared", content: SEED.shared, updated_by: by, updated_at: at },
      { key: "site", content: SEED.settings, updated_by: by, updated_at: at },
    ]);
    dbError(settings, "content");
    markImported(true);
    // Storing the whole site is not a change to undo.
    await saved(session, "import", "site", "", "Stored the current site in the database", null);
    return { ok: true };
  });

/* ── Settings and shared sections ───────────────────────────────────────── */

/** Which admin section owns each part of the site settings. */
const SETTINGS_PARTS = {
  header: "navigation",
  footer: "navigation",
  company: "company",
  contact: "company",
  office: "company",
  seo: "settings",
  behaviour: "settings",
  notFound: "settings",
} as const satisfies Record<keyof SiteSettings, Section>;

type SettingsPart = keyof typeof SETTINGS_PARTS;

export const loadSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { store, editable } = await adminStore();
  return { settings: await store.settings(), editable };
});

export const saveSettingsParts = createServerFn({ method: "POST" })
  .inputValidator(
    input(
      z.object({
        // partialRecord: zod 4's record with enum keys is exhaustive, and
        // would fill every part not sent with undefined, resetting the
        // other screens' settings and demanding access to all of them.
        parts: z.partialRecord(
          z.enum(Object.keys(SETTINGS_PARTS) as [SettingsPart, ...SettingsPart[]]),
          z.unknown(),
        ),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const names = (Object.keys(data.parts) as SettingsPart[]).filter(
      (name) => data.parts[name] !== undefined,
    );
    if (!names.length) fail("Nothing to save.");
    const session = await requireMember();
    for (const name of names) await requireMember(SETTINGS_PARTS[name]);
    // Only the parts sent are rewritten. The rest go back exactly as stored,
    // so the database can see which parts this save changed and check each
    // against the saver's sections (0003_section_access.sql).
    const { data: row, error: readError } = await session.db
      .from("settings")
      .select("content")
      .eq("key", "site")
      .maybeSingle();
    dbError(readError, "settings");
    const stored = ((row as { content?: unknown } | null)?.content ?? {}) as Record<
      string,
      unknown
    >;
    const content: Record<string, unknown> = { ...stored };
    for (const name of names) {
      content[name] = withDefaults(SEED.settings[name] as unknown, data.parts[name]);
    }
    const before = await copyBefore(session.db, { table: "settings", only: ["site"] });
    const { error } = await session.db.from("settings").upsert({
      key: "site",
      content,
      updated_by: session.member.id,
      updated_at: new Date().toISOString(),
    });
    dbError(error, "settings");
    await saved(
      session,
      "update",
      "settings",
      names.join(","),
      `Updated ${names.join(", ")}`,
      before,
    );
    return { settings: withDefaults(SEED.settings, content) };
  });

export const loadShared = createServerFn({ method: "GET" }).handler(async () => {
  const { store, editable } = await adminStore("pages");
  return { shared: await store.shared(), editable };
});

export const saveShared = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ content: docSchema })))
  .handler(async ({ data }) => {
    const session = await requireMember("pages");
    const next: SharedContent = withDefaults(SEED.shared, data.content);
    const before = await copyBefore(session.db, { table: "settings", only: ["shared"] });
    const { error } = await session.db.from("settings").upsert({
      key: "shared",
      content: next,
      updated_by: session.member.id,
      updated_at: new Date().toISOString(),
    });
    dbError(error, "shared sections");
    await saved(session, "update", "page", "shared", "Updated the shared sections", before);
    return { shared: next };
  });

/* ── Pages ───────────────────────────────────────────────────────────────── */

const pageKey = z.string().refine(isPageKey, "Unknown page") as unknown as z.ZodType<PageKey>;

export const loadPage = createServerFn({ method: "GET" })
  .inputValidator(input(pageKey))
  .handler(async ({ data: key }) => {
    const { store, editable } = await adminStore("pages");
    return { page: (await store.page(key)) as PageMap[PageKey], editable };
  });

export const savePage = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ key: pageKey, content: docSchema })))
  .handler(async ({ data }) => {
    const session = await requireMember("pages");
    const next = withDefaults(SEED.pages[data.key], data.content);
    const before = await copyBefore(session.db, { table: "pages", only: [data.key] });
    const { error } = await session.db.from("pages").upsert({
      key: data.key,
      content: next,
      updated_by: session.member.id,
      updated_at: new Date().toISOString(),
    });
    dbError(error, "page");
    const label = PAGES.find((page) => page.key === data.key)?.label ?? data.key;
    await saved(session, "update", "page", data.key, `Updated the ${label} page`, before);
    return { page: next as PageMap[PageKey] };
  });

/* ── Collections ─────────────────────────────────────────────────────────── */

function projectRow(doc: ProjectDoc, by: string) {
  return {
    id: doc.id,
    slug: doc.slug,
    status: doc.status,
    position: doc.order,
    data: doc,
    updated_by: by,
    updated_at: new Date().toISOString(),
  };
}

function articleRow(doc: ArticleDoc, by: string) {
  return {
    id: doc.id,
    slug: doc.slug,
    status: doc.status,
    published_at: doc.publishedAt || null,
    data: doc,
    updated_by: by,
    updated_at: new Date().toISOString(),
  };
}

function roleRow(doc: RoleDoc, by: string) {
  return {
    id: doc.id,
    position: doc.order,
    open: doc.open,
    data: doc,
    updated_by: by,
    updated_at: new Date().toISOString(),
  };
}

function partnerRow(doc: PartnerDoc, by: string) {
  return {
    id: doc.id,
    kind: doc.kind,
    position: doc.order,
    visible: doc.visible,
    data: doc,
    updated_by: by,
    updated_at: new Date().toISOString(),
  };
}

const newId = () => crypto.randomUUID();

/* Projects */

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { store, editable } = await adminStore("projects");
  return { projects: await store.projects(), editable };
});

export const saveProject = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ doc: docSchema })))
  .handler(async ({ data }) => {
    const session = await requireMember("projects");
    const doc: ProjectDoc = withDefaults(blankProject(), data.doc);
    doc.id ||= newId();
    doc.slug = parse(slugSchema, doc.slug);
    if (!doc.name.trim()) fail("Give the project a name.");
    // Only one project leads the portfolio: featuring this one takes the
    // flag off the others, so they are part of what this save changes.
    const others = doc.isFeatured
      ? (await databaseStore(session.db).projects()).filter((p) => p.isFeatured && p.id !== doc.id)
      : [];
    const before = await copyBefore(session.db, {
      table: "projects",
      only: [doc.id, ...others.map((other) => other.id)],
    });
    const { error } = await session.db.from("projects").upsert(projectRow(doc, session.member.id));
    dbError(error, "project");
    for (const other of others) {
      await session.db
        .from("projects")
        .update({ data: { ...other, isFeatured: false } })
        .eq("id", other.id);
    }
    await saved(session, "save", "project", doc.id, `Saved project "${doc.name}"`, before);
    return { doc };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ id: idSchema })))
  .handler(async ({ data }) => {
    const session = await requireMember("projects");
    const before = await copyBefore(session.db, { table: "projects", only: [data.id] });
    const { error } = await session.db.from("projects").delete().eq("id", data.id);
    dbError(error, "project");
    await saved(session, "delete", "project", data.id, deleted("project", before, "name"), before);
    return { ok: true };
  });

/* Articles */

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { store, editable } = await adminStore("insights");
  return { articles: await store.articles(), editable };
});

export const saveArticle = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ doc: docSchema, autoReadingTime: z.boolean() })))
  .handler(async ({ data }) => {
    const session = await requireMember("insights");
    const doc: ArticleDoc = withDefaults(blankArticle(), data.doc);
    doc.id ||= newId();
    doc.slug = parse(slugSchema, doc.slug);
    if (!doc.title.trim()) fail("Give the article a title.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.publishedAt)) fail("Choose a publication date.");
    if (data.autoReadingTime) doc.readingTime = readingTimeOf(doc);
    const before = await copyBefore(session.db, { table: "articles", only: [doc.id] });
    const { error } = await session.db.from("articles").upsert(articleRow(doc, session.member.id));
    dbError(error, "article");
    await saved(session, "save", "article", doc.id, `Saved article "${doc.title}"`, before);
    return { doc };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ id: idSchema })))
  .handler(async ({ data }) => {
    const session = await requireMember("insights");
    const before = await copyBefore(session.db, { table: "articles", only: [data.id] });
    const { error } = await session.db.from("articles").delete().eq("id", data.id);
    dbError(error, "article");
    await saved(session, "delete", "article", data.id, deleted("article", before, "title"), before);
    return { ok: true };
  });

/* Careers: the roles, saved as one list (they are few and edited together). */

export const listRoles = createServerFn({ method: "GET" }).handler(async () => {
  const { store, editable } = await adminStore("careers");
  return { roles: await store.roles(), editable };
});

export const saveRoles = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ roles: z.array(docSchema).max(100) })))
  .handler(async ({ data }) => {
    const session = await requireMember("careers");
    const roles = data.roles.map((raw, index) => {
      const role: RoleDoc = withDefaults(blankRole(), raw);
      role.id ||= newId();
      role.order = index;
      if (!role.title.trim()) fail(`Role ${index + 1} needs a title.`);
      return role;
    });
    const before = await copyBefore(session.db, { table: "career_roles" });
    await replaceList(
      session,
      "career_roles",
      roles.map((r) => roleRow(r, session.member.id)),
    );
    await saved(session, "update", "careers", "", `Updated open roles (${roles.length})`, before);
    return { roles };
  });

/* Partners and practices, saved as one list per kind. */

export const listPartners = createServerFn({ method: "GET" }).handler(async () => {
  const { store, editable } = await adminStore("partners");
  return { partners: await store.partners(), editable };
});

export const savePartners = createServerFn({ method: "POST" })
  .inputValidator(
    input(
      z.object({
        kind: z.enum(["partner", "practice"]),
        items: z.array(docSchema).max(100),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const session = await requireMember("partners");
    const items = data.items.map((raw, index) => {
      const item: PartnerDoc = withDefaults(blankPartner(), raw);
      item.id ||= newId();
      item.kind = data.kind;
      item.order = index;
      if (!item.name.trim()) fail(`Entry ${index + 1} needs a name.`);
      return item;
    });
    const kind = { column: "kind", value: data.kind };
    const before = await copyBefore(session.db, { table: "partners", where: kind });
    await replaceList(
      session,
      "partners",
      items.map((p) => partnerRow(p, session.member.id)),
      kind,
    );
    const label = data.kind === "partner" ? "international partners" : "design practices";
    await saved(
      session,
      "update",
      "partners",
      data.kind,
      `Updated ${label} (${items.length})`,
      before,
    );
    return { items };
  });

/**
 * Saves a whole list: upserts what is there and deletes what was removed.
 * `scope` limits the delete to one kind in a shared table.
 */
async function replaceList(
  session: Session,
  table: string,
  rows: { id: string }[],
  scope?: { column: string; value: string },
) {
  const { db } = session;
  if (rows.length) {
    const { error } = await db.from(table).upsert(rows);
    dbError(error, "list");
  }
  let query = db.from(table).select("id");
  if (scope) query = query.eq(scope.column, scope.value);
  const { data: existing, error } = await query;
  dbError(error, "list");
  const keep = new Set(rows.map((row) => row.id));
  const gone = ((existing ?? []) as { id: string }[])
    .map((row) => row.id)
    .filter((id) => !keep.has(id));
  if (gone.length) {
    const { error: deleteError } = await db.from(table).delete().in("id", gone);
    dbError(deleteError, "list");
  }
}

/** Moves projects in the portfolio (and the "next project" sequence). */
export const reorderProjects = createServerFn({ method: "POST" })
  .inputValidator(input(z.object({ ids: z.array(idSchema).max(500) })))
  .handler(async ({ data }) => {
    const session = await requireMember("projects");
    const before = await copyBefore(session.db, { table: "projects" });
    for (const [position, id] of data.ids.entries()) {
      const { data: row, error } = await session.db
        .from("projects")
        .select("data")
        .eq("id", id)
        .maybeSingle();
      dbError(error, "project");
      if (!row) continue;
      const { error: updateError } = await session.db
        .from("projects")
        .update({ position, data: { ...(row as { data: object }).data, order: position } })
        .eq("id", id);
      dbError(updateError, "project");
    }
    await saved(session, "reorder", "project", "", "Reordered projects", before);
    return { ok: true };
  });

/**
 * Everything at once, for the screens that look across the whole site: the
 * media library's "where is this used" and the dashboard's checklist.
 */
export const loadAllContent = createServerFn({ method: "GET" }).handler(async () => {
  const { store, editable, member } = await adminStore();
  // Every member sees what the site shows; drafts, closed roles and hidden
  // partners only in the sections they were given.
  const visible = <T>(section: Section, items: T[], live: (item: T) => boolean) =>
    !member || can(member, section) ? items : items.filter(live);
  const [settings, shared, allProjects, allArticles, allRoles, allPartners, pageList] =
    await Promise.all([
      store.settings(),
      store.shared(),
      store.projects(),
      store.articles(),
      store.roles(),
      store.partners(),
      Promise.all(PAGES.map(async (page) => [page.key, await store.page(page.key)] as const)),
    ]);
  return {
    editable,
    settings,
    shared,
    pages: Object.fromEntries(pageList) as PageMap,
    projects: visible("projects", allProjects, (p) => p.status === "published"),
    articles: visible("insights", allArticles, (a) => a.status === "published"),
    roles: visible("careers", allRoles, (r) => r.open),
    partners: visible("partners", allPartners, (p) => p.visible),
  };
});

export type AllContent = Awaited<ReturnType<typeof loadAllContent>>;
