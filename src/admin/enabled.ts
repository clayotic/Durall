/**
 * Three switches for the admin panel. They are separate so the panel can be
 * shown, and locked, without the site's content coming from the database.
 */

/**
 * The content database, connected or not.
 *
 * Off while the site is still being reworked: every page is served from the
 * bundled content in src/content/seed, so a change made in the code shows at
 * once instead of being overridden by an older copy saved in the database.
 * No page, project, article or setting is read from the database or written
 * to it, by the site or by the panel. The enquiry forms are not affected;
 * they keep saving to the database.
 *
 * Set this to `true` to connect the two again. Nothing else needs to change.
 */
export const ADMIN_ENABLED: boolean = false;

/**
 * Whether /admin can be opened at all. `false`: it answers "page not found".
 */
export const ADMIN_VISIBLE: boolean = true;

/**
 * Whether the panel needs a sign-in while the content database is off.
 *
 * On: /admin opens only for someone signed in to an active account. Signing
 * in uses the accounts kept in Supabase (its Auth and the `profiles` list)
 * and nothing else there. Once in, the panel is the read-only preview: every
 * screen, filled with the content in the code, and nothing can be saved.
 * Where the server has no Supabase keys nobody can sign in, and the panel
 * stays shut rather than opening unguarded.
 *
 * Off: the same preview, open to anyone who has the address.
 */
export const ADMIN_LOGIN: boolean = true;
