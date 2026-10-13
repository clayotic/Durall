# Admin panel

The site's content is edited at **/admin**. Pages, projects, articles,
careers, partners, images, navigation, contact details and settings are
all editable there, and enquiries from the site's forms arrive there.

> **Reconnected on 9 October 2026.** The database was switched off from
> 2 October while the site was rebuilt, so what it held was of the old site.
> The site now reads the database only once it holds the site as it is: the
> owner signs in and presses **Store the Current Site** on the Dashboard.
> That starts the database afresh. It deletes the pages, projects, articles,
> roles, partners and settings stored before, every image uploaded before
> and the activity log (and the enquiries, if the owner ticks that), then
> stores the current site. Nothing old is carried over; accounts are kept.
> Until then the site serves the content bundled in `src/content/seed`,
> exactly as before, and the panel is read-only. The rule is
> `holdsCurrentContent` in `src/server/store.ts`.
>
> After that, content is edited in the panel. A change made to
> `src/content/seed` in the code does not show on the site for anything the
> database already stores.

## Setting it up (once)

1. Create a free project at [supabase.com](https://supabase.com).
2. In its **SQL Editor**, run each file in `supabase/migrations/` in order
   (`0001_cms.sql`, then `0002_enquiry_phone_location.sql`, then
   `0003_section_access.sql`). Each is safe to run more than once, so a
   project set up earlier only needs the files it has not run yet.
3. **Authentication → Sign In / Providers:** switch off _Allow new users to sign up_.
4. **Authentication → URL Configuration:** set the Site URL to the live
   domain, and add `https://<your-domain>/admin/set-password` (plus
   `http://localhost:8080/admin/set-password` for development) to the
   Redirect URLs, so invitation and reset emails land in the panel.
5. **Authentication → Users → Add user:** create your own account. The
   first account becomes the **owner**.
6. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
   (Project Settings → API) to the Netlify site's environment variables, and
   to `.env.local` for development (see `.env.example`). Redeploy.
7. Sign in at `/admin` and press **Store the Current Site** on the
   Dashboard. Editing is switched on from then, and the site reads the
   database. On a database that already holds an older copy it deletes
   that copy first, uploads and activity log included.

Until step 7 the site shows the content bundled in `src/content/seed/`, and
`/admin` opens as a read-only preview.

## Accounts

- **Owner:** exactly one. Can do everything and is the only person who sees
  _Users & Access_, where they invite people, choose their access, disable or
  remove them, and can hand ownership to someone else.
- **Admin:** every content and settings section, no account management.
- **Editor:** only the sections the owner ticks. Both the site's server and
  the database's row-level security (0003) enforce this, including drafts,
  enquiries and each part of the site settings. Editors see only their own
  entries in the activity log.

There is no sign-up. People join by invitation email only.

## How it fits together

| Where                   | What                                                                        |
| ----------------------- | --------------------------------------------------------------------------- |
| `src/content/types.ts`  | The shape of all editable content                                           |
| `src/content/seed/`     | The content the site shipped with, and the fallback                         |
| `src/content/api.ts`    | What each public page loads (server functions)                              |
| `src/server/`           | Server-only: Supabase clients, the content store, sign-in checks, CDN cache |
| `src/admin/api/`        | The admin panel's server functions (every write checks the session)         |
| `src/admin/specs/`      | The edit forms, one list of fields per page                                 |
| `src/routes/admin*.tsx` | The admin screens                                                           |
| `supabase/migrations/`  | Tables, row-level security and the image bucket                             |

Public pages are cached at Netlify's CDN and purged on every save, so edits
are live within seconds. The admin panel, and anything with a session, is
never cached.

## Security

Checked on 9 October 2026 by attacking a local copy and reading the live site
and database from outside. What is in place:

- **Who can do what.** Every server function checks the session and the
  member's sections; the database's row-level security checks them again.
  With no session, a made-up token, a disabled account or an editor outside
  their sections, every protected function refuses.
- **Requests from other sites** to the server's functions are refused, and the
  session cookie cannot be read by scripts.
- **What a page may run** (`policyFor` in `src/server.ts`): only the site's own
  scripts. Injected markup, `onclick` handlers and `javascript:` links do not
  run. No page can be shown inside another site's frame.
- **Typed content is never HTML.** Text and links from the panel or the
  enquiry forms are escaped; links that are not web, mail, phone or site
  addresses go nowhere; a film can only be a YouTube or Vimeo player.
- **Limits** (`src/server/limit.ts`), per visitor address: 5 enquiries, 10
  sign-in tries and 3 reset emails in ten minutes. Sign-in is also limited per
  account.
- **Changing a password** signs that account out everywhere else.
- **Enquiries and other panel data** are never cached by a browser or the CDN.

Set in Supabase, not in this code, so check them after any change there:
sign-up is off, anonymous sign-in is off, and all three migrations have run.

## Still to do

- Two-step sign-in (TOTP) for the owner and admins; session time-outs.
- Version history and restore; draft previews on the site; scheduled
  publishing.
- An email notification for new enquiries.
- Update `maplibre-gl` (the contact map) to 6.4.1 or later. Its known hole
  (GHSA-jrc7-96c5-q579) is closed off here in two ways (`OfficeMap.tsx`, and
  the page policy), but the library itself is still the old version.
- `bun.lock` does not list every package in `package.json`, so a deploy can
  pick up newer versions than were tested. Regenerate the lockfile.
