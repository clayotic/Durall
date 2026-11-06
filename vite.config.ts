// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

/* TanStack Start lists a page's scripts in its HTML for the browser to ask
 * for at once, but only the ones its chunks import directly, not what those
 * import in turn. The browser found each further level only once the level
 * above had arrived: a round trip each, over a second apiece from a far
 * server. This adds, to every list in the manifest it builds them from,
 * each chunk the listed ones need, however deep, so all of a page's scripts
 * are asked for together. The page loads all of them before it runs either
 * way; nothing more is downloaded.
 *
 * GSAP, Lenis and SplitType are imported once a page has started, by every
 * public page (lib/anim.ts, SmoothScroll.tsx), so they are asked for with
 * the page as well instead of a round trip after it.
 *
 * It reads the chunks from the browser's build, which Start builds before
 * the server's, and rewrites the manifest's module in the server's build:
 * changing the chunks' own lists does not reach Start's plugin. */
const MOTION = /\/node_modules\/(gsap|lenis|split-type)\//;

function preloadWholeTree(): Plugin {
  /** "/assets/a.js" → every chunk it imports, and they import, as the same. */
  let needs = new Map<string, Set<string>>();
  let motion: string[] = [];
  return {
    name: "durall:preload-whole-tree",
    generateBundle(_options, bundle) {
      if (this.environment.name !== "client") return;
      const imports = new Map<string, string[]>();
      motion = [];
      for (const file of Object.values(bundle)) {
        if (file.type !== "chunk") continue;
        imports.set(
          `/${file.fileName}`,
          file.imports.map((name) => `/${name}`),
        );
        if (MOTION.test(file.facadeModuleId ?? "")) motion.push(`/${file.fileName}`);
      }
      const tree = (path: string, seen: Set<string>) => {
        for (const next of imports.get(path) ?? []) {
          if (seen.has(next)) continue;
          seen.add(next);
          tree(next, seen);
        }
        return seen;
      };
      needs = new Map([...imports.keys()].map((path) => [path, tree(path, new Set())]));
    },
    transform(code, id) {
      if (!id.includes("tanstack-start-manifest") || needs.size === 0) return null;
      const LIST = /preloads:\s*\[([^\]]*)\]/g;
      const listed = (list: string) =>
        [...list.matchAll(/"([^"]+)"/g)].map(([, path = ""]) => path);
      const whole = (paths: string[]) =>
        new Set(paths.flatMap((path) => [path, ...(needs.get(path) ?? [])]));
      // The root's are in every page's head already, and the head does not
      // drop repeats, so a page's own list leaves them out.
      const rootAt = code.indexOf("preloads", code.indexOf("__root__"));
      const rootList = new RegExp(LIST.source).exec(code.slice(rootAt))?.[1] ?? "";
      const root = whole([...listed(rootList), ...motion]);
      return code.replace(LIST, (_, list: string, at: number) => {
        const paths =
          at === rootAt ? [...root] : [...whole(listed(list))].filter((path) => !root.has(path));
        return `preloads:[${paths.map((path) => JSON.stringify(path)).join(",")}]`;
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // The admin panel's loaders and loading states import its API, form
    // kit and editors. Left in the route files they ship in the entry bundle
    // of every public page, so for /admin they are split out with the screen.
    router: {
      codeSplittingOptions: {
        splitBehavior: ({ routeId }: { routeId: string }) =>
          routeId.startsWith("/admin")
            ? [["loader"], ["component"], ["pendingComponent"], ["errorComponent"]]
            : undefined,
      },
    },
  },
  // Target Netlify Functions instead of the default Cloudflare Workers preset.
  nitro: {
    preset: "netlify",
  },
  // Lets the local server be shared through an ngrok tunnel (`ngrok http 8080`).
  // Vite refuses requests for any hostname it doesn't know, and a tunnel's is
  // new each time; a leading dot allows every subdomain.
  vite: {
    plugins: [preloadWholeTree()],
    server: { allowedHosts: [".ngrok-free.app", ".ngrok-free.dev", ".ngrok.app"] },
    preview: { allowedHosts: [".ngrok-free.app", ".ngrok-free.dev", ".ngrok.app"] },
  },
});
