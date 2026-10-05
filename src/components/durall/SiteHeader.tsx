import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { IMAGES } from "@/assets/images";
import { useSite } from "@/content/site";
import { ArrowRight, BUTTON, SocialMark } from "./ui";

/* The items come from the admin panel (Navigation). `fullLabel` is the
 * accessible name where it differs from what is drawn: "Partners /
 * International Systems" measures 251px at this type size, nearly four times
 * the next-widest item, so the bar shows "Partners" and the full name is
 * carried by the accessible name and by the mobile menu, where there is room
 * for it. WCAG 2.5.3 is satisfied because the accessible name contains the
 * visible label. */

/* Seven items and the button need about 800px beside the wordmark, so the
 * inline bar starts at 64rem/1024px and everything below it gets the menu.
 * Written out literally at each call site because Tailwind scans source
 * text and never sees a class name assembled at runtime. */

/* Pages that open on a dark full-width photograph. The server cannot see
 * what is under the bar, so this is its first guess at the ink; once the
 * page is running the bar reads it from the page itself (see `onDark`). */
const PHOTO_TOP = /^\/(about|partners|projects|expertise|careers)?$|^\/projects\/[^/]+$/;

/** Whether the nearest painted background behind `el` is a dark one. */
function onDark(el: Element | null | undefined): boolean {
  for (; el; el = el.parentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    // ponytail: reads rgb()/rgba() only, which is how every solid section
    // colour here computes. A tinted (color-mix) background is skipped and
    // its parent decides; parse those too if one ever sits under the bar.
    if (!bg.startsWith("rgb")) continue;
    const [r = 0, g = 0, b = 0, a = 1] = (bg.match(/[\d.]+/g) ?? []).map(Number);
    if (a > 0.5) return 0.299 * r + 0.587 * g + 0.114 * b < 128;
  }
  return false;
}

function isActive(pathname: string, href: string) {
  const [to = "/"] = href.split("#");
  if (to === "/") return pathname === "/";
  // `/insights/thermal-…` should still light up Insights.
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** A nav destination: a route, with a section hash when there is one. */
/* Nav links fetch their page as soon as they are on screen — the bar right
 * after load, the menu when it opens — so a click in the nav never waits. */
function linkTarget(href: string) {
  const [to = "/", hash] = href.split("#");
  return { to, ...(hash ? { hash } : {}), preload: "viewport" as const };
}

/**
 * The wordmark on the left and the pages and the contact button on the
 * right, on a bar of frosted glass that floats a little in from the edges
 * of the window (design: 1896 × 79 at 1920, 14px in from the sides and 17px
 * down). What is behind it shows through blurred, so the words on it read
 * whatever passes underneath. The glass is dark with white ink over a navy
 * section, pale with navy ink over the page.
 *
 * Over a page's opening photograph there is no bar at all: the wordmark and
 * the links stand on the picture in white, as the openings were designed,
 * and the glass arrives with the first section that slides over it.
 */
export function SiteHeader() {
  const { settings } = useSite();
  const items = settings.header.items.filter((item) => item.visible);
  // The page this header belongs to, not the one being navigated to: the
  // outgoing page's header is photographed for the page transition after the
  // location has already changed, and would otherwise show the destination
  // as active outside the reveal.
  const pathname = useRouterState({
    select: (s) => s.resolvedLocation?.pathname ?? s.location.pathname,
  });
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  /* `hidden` is the one thing scroll drives, and it flips a handful of times
   * across a whole page, so it is state rather than a direct DOM write — the
   * guard in the handler means a re-render only happens when the value
   * actually changes, not on every scroll event. */
  const [hidden, setHidden] = useState(false);
  /* Whether what is under the bar is dark. Each end is read on its own,
   * because a split section puts white under the wordmark and a photograph
   * under the links. */
  /* The first guess is made for the page this bar is being mounted on. That
   * is the router's current location, not `pathname` above: when a new
   * page's bar mounts, `pathname` still names the page being left, and the
   * bar used to start in that page's ink. */
  const router = useRouter();
  const opensOnPhoto = () => PHOTO_TOP.test(router.state.location.pathname);
  const [darkStart, setDarkStart] = useState(opensOnPhoto);
  const [darkEnd, setDarkEnd] = useState(opensOnPhoto);
  /* Whether the bar is over a page's opening (`data-hero-pin`), where it is
   * drawn without its glass. */
  const [onHero, setOnHero] = useState(opensOnPhoto);
  /* One glass for the whole bar: dark only where both ends are over
   * something dark, so a split section (the page under the wordmark, a
   * photograph under the links) gets the pale glass, on which navy reads
   * over either. Over the open menu and over an opening photograph there is
   * no glass at all: the menu, or the picture, is the bar's ground. On the
   * picture the white carries a soft navy halo, which is all that separates
   * it from a bright sky. */
  const bare = open || onHero;
  const dark = bare || (darkStart && darkEnd);
  const halo = onHero && !open;
  const ink = dark
    ? `text-white ${halo ? "[text-shadow:0_0_0.75rem_rgb(5_8_52/0.55)]" : ""}`
    : "text-navy";
  const glass = bare
    ? "border-transparent"
    : dark
      ? "border-white/15 bg-navy/50 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] backdrop-blur-[14px] backdrop-saturate-150"
      : "border-navy/10 bg-white/70 shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_0.5rem_2rem_rgb(5_8_52/0.07)] backdrop-blur-[14px] backdrop-saturate-150";

  /* The header overlays the heroes, so the pages underneath reserve its
   * height themselves. Publishing the measured value means they stay clear
   * of it however the bar resolves. styles.css carries a close static
   * default so the server-rendered layout does not jump when this runs. */
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.round(el.getBoundingClientRect().height)}px`,
      );
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    void document.fonts?.ready.then(publish);
    return () => ro.disconnect();
  }, []);

  /* Direction-aware hide.
   *
   * The header used to be `position: absolute`: it scrolled away at the top
   * of the hero and never came back, so on a 7,900px landing page there was
   * no navigation at all below the fold.
   *
   * That part is a comparison against `scrollY`, which is not a layout read.
   *
   * The ink is read from the page: one hit test under each end of the bar,
   * and a walk up to the nearest painted background only when what is under
   * it has changed. It runs again for each page, and when the page changes
   * height (content arriving late), since neither of those is a scroll. */
  useEffect(() => {
    let last = window.scrollY;
    const HIDE_AFTER = 400;
    // Ignore sub-pixel and rubber-band noise, so a hand resting on a
    // trackpad cannot flicker the bar.
    const THRESHOLD = 6;

    const under: (Element | undefined)[] = [];
    const hero = [false, false];
    let retry = 0;
    let tries = 0;
    const sample = () => {
      const y = (headerRef.current?.offsetHeight ?? 0) / 2;
      let blind = false;
      [0.2, 0.8].forEach((share, i) => {
        // The page only: not the bar itself, the menu or the loading screen.
        const hit = document
          .elementsFromPoint(window.innerWidth * share, y)
          .find((el) => el.closest("main, footer"));
        if (!hit) {
          blind = true;
          return;
        }
        if (hit === under[i]) return;
        under[i] = hit;
        (i ? setDarkEnd : setDarkStart)(onDark(hit));
        hero[i] = Boolean(hit.closest("[data-hero-pin]"));
        setOnHero(hero[0]! && hero[1]!);
      });
      /* While one page is opening over another (the circle reveal), the
       * browser is showing pictures of both and nothing in the page can be
       * hit, so there is nothing to read. Arriving on a page is not a
       * scroll, so nothing else would ask again: keep asking until the page
       * is there. Without this the bar kept the last page's ink until the
       * first scroll. */
      window.clearTimeout(retry);
      if (blind && tries++ < 60) retry = window.setTimeout(sample, 60);
    };

    const read = () => {
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) > THRESHOLD) {
        setHidden(delta > 0 && y > HIDE_AFTER);
        last = y;
      }
      sample();
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    const ro = new ResizeObserver(sample);
    ro.observe(document.body);
    return () => {
      window.clearTimeout(retry);
      window.removeEventListener("scroll", read);
      ro.disconnect();
    };
  }, [pathname]);

  const close = useCallback(() => setOpen(false), []);

  // The menu closes itself on navigation: the route changes under it
  // otherwise and it stays open over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    const inPanel = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      ).filter((el) => el.offsetParent !== null);
    // The Close button sits in the bar, outside the panel, and has to be in
    // the loop: without it the only way out by keyboard was Escape.
    const focusables = () => (toggle ? [toggle, ...inPanel()] : inPanel());

    inPanel()[0]?.focus();

    // The page behind is covered: take it out of reach of the keyboard and
    // of screen readers, not only out of sight.
    const behind = Array.from(document.querySelectorAll<HTMLElement>("main, footer"));
    behind.forEach((el) => (el.inert = true));

    // Rotated or resized into the desktop bar: the menu has no place there,
    // and would leave the page locked behind a panel nobody can see.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onDesktop = () => {
      if (desktop.matches) close();
    };
    desktop.addEventListener("change", onDesktop);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      // Focus stays inside the panel while it covers the page.
      const items = focusables();
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
      behind.forEach((el) => (el.inert = false));
      unlockScroll();
    };
  }, [open, close]);

  return (
    <>
      <header
        ref={headerRef}
        data-site-header
        data-hidden={hidden && !open ? "true" : "false"}
        data-hero-bar
        // The margin round the bar is the header's own padding, so its
        // measured height (`--header-h`) covers the gap above the bar too.
        // The page clicks through that margin.
        className="pointer-events-none fixed inset-x-0 top-0 z-50 px-[clamp(0.5rem,0.73vw,0.875rem)] pt-[clamp(0.5rem,0.89vw,1.0625rem)]"
      >
        {/* The bar: the same height and in the same place over every
            section, so nothing in it moves when the page starts to scroll. */}
        <div
          className={`pointer-events-auto mx-auto flex h-[clamp(3.5rem,4.11vw,4.9375rem)] w-full max-w-[118.5rem] items-center justify-between gap-4 border pr-[clamp(0.625rem,1.25vw,1.5rem)] pl-[clamp(0.875rem,1.61vw,1.9375rem)] transition-[background-color,border-color,box-shadow,backdrop-filter] duration-[var(--dur-short)] ease-[var(--ease-micro)] ${glass}`}
        >
          <Link
            to="/"
            aria-label={settings.company.name}
            translate="no"
            className={`flex min-h-11 shrink-0 items-center transition-colors duration-[var(--dur-short)] ease-[var(--ease-micro)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${ink} ${
              // The same halo for the wordmark, which is a mask, not text.
              halo ? "drop-shadow-[0_0_0.75rem_rgb(5_8_52/0.55)]" : ""
            }`}
          >
            {/* The wordmark as a mask over the current colour, so it changes
                ink with the links rather than swapping one file for another. */}
            <span
              aria-hidden="true"
              className="block w-[clamp(8.5rem,12.5vw,15rem)] bg-current"
              style={{
                aspectRatio: `${IMAGES.logoDurallWhite.width} / ${IMAGES.logoDurallWhite.height}`,
                mask: `url(${IMAGES.logoDurallWhite.src}) center / contain no-repeat`,
              }}
            />
          </Link>

          <nav aria-label="Primary" className="hidden min-w-0 lg:block">
            <ul className="flex items-center justify-end gap-x-[clamp(1.25rem,1.82vw,2.2rem)]">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                const full = item.fullLabel || undefined;
                return (
                  <li key={item.href + item.label}>
                    <Link
                      {...linkTarget(item.href)}
                      aria-current={active ? "page" : undefined}
                      {...(full ? { "aria-label": full } : {})}
                      className={`flex min-h-11 items-center border-b-2 font-display text-[clamp(0.875rem,0.78vw,0.9375rem)] transition-colors duration-[var(--dur-short)] ease-[var(--ease-micro)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${ink} ${
                        active
                          ? "border-current font-medium"
                          : "border-transparent hover:border-current/45"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              {settings.header.cta.label ? (
                <li className="ml-[clamp(0rem,0.1vw,0.1rem)]">
                  <Link
                    {...linkTarget(settings.header.cta.href)}
                    // The button turns over with the glass: white on the
                    // dark one, navy on the pale one. `hover-lift` carries
                    // the colour transition.
                    // The style sheet's button, held to the bar's 44px.
                    className={`hover-lift flex min-h-11 items-center px-6 font-display text-[0.8125rem] font-medium tracking-[0.077em] focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      dark
                        ? "bg-white text-navy hover:bg-[#f4f4f2] focus-visible:outline-white"
                        : "bg-navy text-white hover:bg-navy-700 focus-visible:outline-navy"
                    }`}
                  >
                    {settings.header.cta.label}
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>

          {/* Three lines and no word: the lines are the sign, the name is
              for a screen reader. Open, the outer two cross and the middle
              one goes. */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Menu"}
            className={`flex size-11 items-center justify-center transition-colors duration-[var(--dur-short)] ease-[var(--ease-micro)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current lg:hidden ${ink}`}
          >
            <span aria-hidden="true" className="relative block h-4 w-[1.375rem]">
              {(["-translate-y-[0.4375rem]", "", "translate-y-[0.4375rem]"] as const).map(
                (rest, line) => (
                  <span
                    key={line}
                    className={`absolute top-1/2 left-0 -mt-px block h-[1.5px] w-full bg-current transition-[translate,rotate,opacity] duration-[var(--dur-short)] ease-[var(--ease-micro)] motion-reduce:transition-none ${
                      open ? ["rotate-45", "opacity-0", "-rotate-45"][line] : rest
                    }`}
                  />
                ),
              )}
            </span>
          </button>
        </div>
      </header>

      {/* Full-screen menu rather than a squeezed copy of the bar: eight
          entries, the long Partners label in full, and the contact line the
          bar has no room for. */}
      <div
        id="site-menu"
        ref={panelRef}
        data-site-menu
        data-open={open ? "true" : "false"}
        // `hidden` while shut, so its links are not laid out (or preloaded)
        // behind the page; styles.css lets it fade out before it goes.
        hidden={!open}
        inert={!open}
        className="fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-navy pt-[calc(var(--header-h)+clamp(1.5rem,5vh,3rem))] pb-[max(2rem,env(safe-area-inset-bottom))] text-white lg:hidden"
      >
        <nav aria-label="Primary" className="shell flex-1">
          <ul>
            {items.map((item, index) => {
              const active = isActive(pathname, item.href);
              const full = item.fullLabel || undefined;
              return (
                <li
                  key={item.href + item.label}
                  data-menu-item
                  style={{ "--menu-index": index } as React.CSSProperties}
                  className="border-b border-white/12"
                >
                  <Link
                    {...linkTarget(item.href)}
                    aria-current={active ? "page" : undefined}
                    onClick={close}
                    className={`hover-lift flex min-h-14 items-center justify-between gap-4 py-[clamp(0.5rem,1.4vh,1rem)] font-display text-[clamp(1.375rem,6vw,2rem)] leading-tight font-medium tracking-tight ${
                      active ? "text-white" : "text-white/70 hover:text-white"
                    }`}
                    style={{ "--lift-x": "0.375rem", "--lift-y": "0" } as React.CSSProperties}
                  >
                    <span>{full ?? item.label}</span>
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          {settings.header.cta.label ? (
            <Link
              {...linkTarget(settings.header.cta.href)}
              onClick={close}
              className={`${BUTTON.inverted} mt-[clamp(1.5rem,4vh,2.5rem)] w-fit`}
            >
              {settings.header.cta.label}
              <ArrowRight className="hover-arrow h-4 w-4 shrink-0" />
            </Link>
          ) : null}

          {/* The company's line, and where else to find it. */}
          <div className="mt-[clamp(2rem,5vh,3rem)] flex items-end justify-between gap-6">
            <div>
              <p className="font-display text-[0.6875rem] leading-none font-medium tracking-eyebrow text-white/60 uppercase">
                {settings.company.tagline}
              </p>
              <span aria-hidden="true" className="mt-4 block h-px w-8 bg-accent-blue" />
            </div>
            {settings.footer.social.length ? (
              <ul className="-mr-3 -mb-3 flex items-center text-white/80">
                {settings.footer.social.map((item) => (
                  <li key={item.label}>
                    <SocialMark item={item} className="hover:text-white" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </nav>
      </div>
    </>
  );
}
