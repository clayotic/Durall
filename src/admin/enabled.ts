/**
 * Three switches for the admin panel. They are separate so the panel can be
 * shown, and locked, without the site's content coming from the database.
 */

/**
 * The content database, connected or not.
 *
 * On: the panel saves to the database and the site reads from it, once the
 * database holds the site as it is now. Until the owner has imported that
 * (the Dashboard's button), or if what is stored is a copy from before the
 * site was rebuilt, the site keeps serving the bundled content in
 * src/content/seed and the panel is read-only: see `holdsCurrentContent` in
 * src/server/store.ts. So switching this on can never put an older copy of
 * the site in front of visitors.
 *
 * Off: every page is served from the bundled content, and nothing is read
 * from the content tables or written to them, by the site or by the panel.
 * The enquiry forms are not affected either way; they save to the database.
 *
 * Once the database is in use, a change made to src/content/seed no longer
 * shows on the site for anything already stored: it is edited in the panel.
 */
export const ADMIN_ENABLED: boolean = true;

/**
 * Whether /admin can be opened at all. `false`: it answers "page not found".
 */
export const ADMIN_VISIBLE: boolean = true;

/**
 * Whether the panel needs a sign-in while the content database is off (with
 * it on, the panel always does).
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
