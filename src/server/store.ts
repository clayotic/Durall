import type { SupabaseClient } from "@supabase/supabase-js";
import { blankArticle, blankPartner, blankProject, blankRole } from "@/content/defaults";
import { withDefaults } from "@/content/merge";
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
import { isSupabaseConfigured, publicClient } from "./supabase";

/**
 * Where the site's content is read from. Server-only.
 *
 * Lists are returned whole — drafts included when the client is allowed to
 * see them — and the functions in content/api.ts decide what a visitor sees.
 */
export type ContentStore = {
  settings(): Promise<SiteSettings>;
  shared(): Promise<SharedContent>;
  page<K extends PageKey>(key: K): Promise<PageMap[K]>;
  projects(): Promise<ProjectDoc[]>;
  articles(): Promise<ArticleDoc[]>;
  roles(): Promise<RoleDoc[]>;
  partners(): Promise<PartnerDoc[]>;
};

/** The bundled content, exactly as it shipped. */
export const seedStore: ContentStore = {
  settings: async () => SEED.settings,
  shared: async () => SEED.shared,
  page: async (key) => SEED.pages[key],
  projects: async () => SEED.projects,
  articles: async () => SEED.articles,
  roles: async () => SEED.roles,
  partners: async () => SEED.partners,
};

type Row = { data: unknown } & Record<string, unknown>;

/* What a stored project is laid over. The project's film was added after the
 * site was stored, so a project saved before then takes it from the bundled
 * copy of the same project; once saved from the panel, the stored link (or
 * its absence) stands. */
function projectDefaults(id: string): ProjectDoc {
  const blank = blankProject();
  const film = SEED.projects.find((project) => project.id === id)?.film ?? "";
  return { ...blank, film };
}

async function rows(db: SupabaseClient, table: string, order: string): Promise<Row[]> {
  const { data, error } = await db.from(table).select("*").order(order, { ascending: true });
  if (error) throw error;
  return (data ?? []) as Row[];
}

async function one(db: SupabaseClient, table: string, key: string): Promise<unknown> {
  const { data, error } = await db.from(table).select("content").eq("key", key).maybeSingle();
  if (error) throw error;
  return (data as { content?: unknown } | null)?.content;
}

/**
 * Reads the database through the given client. The columns beside `data`
 * (slug, status, position…) are the source of truth for those fields, so a
 * document can never disagree with the row it is filed under.
 */
export function databaseStore(db: SupabaseClient): ContentStore {
  return {
    settings: async () => withDefaults(SEED.settings, await one(db, "settings", "site")),
    shared: async () => withDefaults(SEED.shared, await one(db, "settings", "shared")),
    page: async (key) => withDefaults(SEED.pages[key], await one(db, "pages", key)),
    projects: async () =>
      (await rows(db, "projects", "position")).map((row) => ({
        ...withDefaults(projectDefaults(String(row["id"])), row.data),
        id: String(row["id"]),
        slug: String(row["slug"]),
        status: row["status"] as ProjectDoc["status"],
        order: Number(row["position"]),
      })),
    articles: async () =>
      (await rows(db, "articles", "published_at")).map((row) => ({
        ...withDefaults(blankArticle(), row.data),
        id: String(row["id"]),
        slug: String(row["slug"]),
        status: row["status"] as ArticleDoc["status"],
      })),
    roles: async () =>
      (await rows(db, "career_roles", "position")).map((row) => ({
        ...withDefaults(blankRole(), row.data),
        id: String(row["id"]),
        order: Number(row["position"]),
        open: Boolean(row["open"]),
      })),
    partners: async () =>
      (await rows(db, "partners", "position")).map((row) => ({
        ...withDefaults(blankPartner(), row.data),
        id: String(row["id"]),
        kind: row["kind"] as PartnerDoc["kind"],
        order: Number(row["position"]),
        visible: Boolean(row["visible"]),
      })),
  };
}

/* The site was rebuilt while the database was switched off (2 to 9 October
 * 2026, when nothing could be saved to it), so a copy stored before then is
 * of the old site. The database counts as holding the site only if it was
 * imported after that began: the import writes the settings row last, and
 * that row's date is what is read here. Until then the site keeps serving
 * the bundled content and the panel stays read-only (it cannot save, so it
 * cannot move that date by accident), exactly as for a database that has
 * never been imported into. */
const CONTENT_SINCE = Date.parse("2026-10-06T00:00:00Z");

/** Whether the database holds the site as it is now, rather than nothing or an older copy. */
export async function holdsCurrentContent(db: SupabaseClient): Promise<boolean> {
  const { data, error } = await db
    .from("settings")
    .select("updated_at")
    .eq("key", "site")
    .maybeSingle();
  if (error) throw error;
  const at = (data as { updated_at?: string } | null)?.updated_at;
  return Boolean(at) && Date.parse(at as string) >= CONTENT_SINCE;
}

/* An empty or outdated database must not mean an empty or outdated website.
 * The answer is remembered briefly so a page load does not ask twice. */
let importedAt = 0;
let imported = false;

async function hasImported(db: SupabaseClient): Promise<boolean> {
  if (imported || Date.now() - importedAt < 30_000) return imported;
  imported = await holdsCurrentContent(db);
  importedAt = Date.now();
  return imported;
}

/** Forget the cached answer: called after an import. */
export function markImported(value: boolean) {
  imported = value;
  importedAt = Date.now();
}

/**
 * The public site's store: the database when it is configured and holds the
 * current site, the bundled content otherwise — and the bundled content
 * again, per call, if the database cannot be reached, so an outage degrades
 * to slightly stale content rather than an error page.
 */
export function contentStore(): ContentStore {
  if (!isSupabaseConfigured()) return seedStore;
  let db: SupabaseClient;
  try {
    db = publicClient();
  } catch (error) {
    console.error("[content] database client unavailable; serving bundled content", error);
    return seedStore;
  }
  const live = databaseStore(db);
  const guarded =
    <A extends unknown[], R>(pick: (store: ContentStore) => (...args: A) => Promise<R>) =>
    async (...args: A): Promise<R> => {
      try {
        if (!(await hasImported(db))) return await pick(seedStore)(...args);
        return await pick(live)(...args);
      } catch (error) {
        console.error("[content] database read failed; serving bundled content", error);
        return pick(seedStore)(...args);
      }
    };
  return {
    settings: guarded((s) => s.settings),
    shared: guarded((s) => s.shared),
    page: guarded((s) => s.page) as ContentStore["page"],
    projects: guarded((s) => s.projects),
    articles: guarded((s) => s.articles),
    roles: guarded((s) => s.roles),
    partners: guarded((s) => s.partners),
  };
}
