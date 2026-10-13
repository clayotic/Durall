# Durall Systems website

The public site and its admin panel, in one app.

- **Site:** TanStack Start (React, TypeScript), Tailwind CSS, GSAP.
- **Admin panel:** `/admin`. Content, images and accounts live in Supabase.
- **Hosting:** Netlify. A push to `main` builds and deploys.

## Run it locally

Node 22 and npm.

```sh
npm install
npm run dev
```

The site opens on `http://localhost:8080`. Without the keys below it runs on
the content bundled in `src/content/seed`, and `/admin` stays shut.

## Keys

Copy `.env.example` to `.env.local` and fill in the three Supabase values. The
same three go in the Netlify site's environment variables. `.env.local` is
never committed. The service key is for the server only: never put it in a
`VITE_` variable or in client code.

## Where things are

| Path                               | What                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `src/routes/`                      | One file per page; `admin*.tsx` are the panel's screens                  |
| `src/components/durall/`           | The site's sections                                                      |
| `src/content/`                     | Content types, the bundled content (`seed/`), what each page loads       |
| `src/admin/`                       | The admin panel: screens, forms, and its server functions (`api/`)       |
| `src/server/`                      | Server-only code: database access, sign-in checks, caching, rate limits  |
| `src/server.ts`                    | The one place every response passes through: redirects, security headers |
| `public/films/`                    | Films kept on the site, played in a project page's opening               |
| `supabase/migrations/`             | The database, to run in order in the Supabase SQL editor                 |
| `docs/admin-panel.md`              | Setting up and running the admin panel                                   |
| `docs/web-interface-guidelines.md` | The rules all interface work follows                                     |

## Checks before a push

```sh
npx tsc --noEmit
npm run lint
npm run build
```

After a deploy, check what the live site sends to browsers:

```sh
node scripts/check-security.mjs https://durall.netlify.app
```

## Adding an outside service

The site tells browsers exactly what a page may load (`policyFor` in
`src/server.ts`). Analytics, a chat widget, another video host or font source
will be refused by the browser until its address is added there. `npm run dev`
reports a refusal in the console without enforcing it, so check the console
after adding anything that loads from another site.
