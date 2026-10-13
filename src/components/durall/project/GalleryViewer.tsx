import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { boxOf, flip, type Box, type Flight } from "@/lib/flip";
import { lockScroll, scrollToY, unlockScroll } from "@/lib/scroll-lock";
import { prefersReducedMotion } from "@/lib/motion-prefs";
import { BUTTON } from "../ui";
import type { Plate } from "./data";

const OPEN_S = 0.9;
const CLOSE_S = 0.8;

function aspectOf(plate: Plate) {
  return plate.image.width / plate.image.height;
}

/** The smallest variant in a srcset — already in cache from the gallery. */
function smallest(plate: Plate) {
  const first = plate.image.srcSet?.split(",")[0]?.trim().split(" ")[0];
  return first ?? plate.image.src;
}

/**
 * Keeps an off-screen start or end point just outside the viewport, so a
 * photograph far down the page flies in from the nearest edge instead of
 * streaking across from a thousand pixels away.
 */
function nearEdge(box: Box): Box {
  const vh = window.innerHeight;
  if (box.top + box.height < 0) return { ...box, top: -box.height - 24 };
  if (box.top > vh) return { ...box, top: vh + 24 };
  return box;
}

/**
 * Two layers: the small variant the gallery already loaded, instantly, and
 * the full-size one over it once it arrives. A photograph therefore always
 * has something to show, and sharpens as it settles.
 */
function Layers({ plate, sizes }: { plate: Plate; sizes: string }) {
  return (
    <>
      <img
        src={smallest(plate)}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        {...plate.image}
        alt={plate.alt}
        sizes={sizes}
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </>
  );
}

function fadeOpacity(
  el: HTMLElement | null,
  from: number,
  to: number,
  ms: number,
  delay: number,
  reduced: boolean,
) {
  if (!el) return;
  if (reduced) {
    el.style.opacity = String(to);
    return;
  }
  el.animate([{ opacity: from }, { opacity: to }], {
    duration: ms,
    delay,
    easing: "cubic-bezier(0.33, 1, 0.68, 1)",
    fill: "both",
  });
}

/**
 * The full-screen viewer.
 *
 * Opening, the photograph that was clicked grows out of its place in the
 * gallery to fill the stage, at its own proportions, so it is seen whole
 * however its frame in the gallery crops it. The arrows, the arrow keys and
 * a swipe step through the set, and the photograph simply changes: there is
 * no line-up of thumbnails and nothing flies between one photograph and the
 * next. Closing sends the photograph on show back to its place, after
 * quietly scrolling the page behind so that place is in view.
 *
 * A modal dialog: focus moves in and is held there, Escape closes, and focus
 * returns to the photograph's own button afterwards. Under reduced motion
 * the two flights are skipped.
 */
export function GalleryViewer({
  title,
  plates,
  startIndex,
  frames,
  onClosed,
}: {
  title: string;
  plates: readonly Plate[];
  startIndex: number;
  frames: () => HTMLElement[];
  onClosed: (index: number) => void;
}) {
  // Read directly rather than through useReducedMotion(), whose first render
  // is always `false`: the viewer only ever mounts after a click, on the
  // client, and does all of its opening work in that first render.
  const [reduced] = useState(prefersReducedMotion);
  const [index, setIndex] = useState(startIndex);
  const [closing, setClosing] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageMediaRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const flight = useRef<Flight | null>(null);
  const locked = useRef(false);
  const away = useRef<HTMLElement | null>(null);

  const plate = plates[index]!;

  const fade = (el: HTMLElement | null, from: number, to: number, ms: number, delay = 0) =>
    fadeOpacity(el, from, to, ms, delay, reduced);

  /** The photograph on show is out of the gallery while the viewer has it:
   * its place there is left empty, and every other one stays where it is. */
  const takeFromGallery = (frame: HTMLElement | null | undefined) => {
    if (away.current) away.current.style.visibility = "";
    away.current = frame ?? null;
    if (frame) frame.style.visibility = "hidden";
  };

  /* ── Open ──────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    const home = frames()[startIndex];
    const origin = home ? nearEdge(boxOf(home)) : undefined;
    takeFromGallery(home);
    lockScroll();
    locked.current = true;
    fade(backdropRef.current, 0, 1, 450);
    fade(dialogRef.current?.querySelector("[data-viewer-chrome]") ?? null, 0, 1, 500, 250);

    if (!reduced && stageRef.current && origin) {
      flight.current = flip(
        [
          {
            el: stageRef.current,
            from: origin,
            media: stageMediaRef.current,
            aspect: aspectOf(plates[startIndex]!),
          },
        ],
        { duration: OPEN_S },
      );
    }
    closeRef.current?.focus({ preventScroll: true });
    // Mount-only: the open choreography runs exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leaving the page with the viewer open — the back button, say — must not
  // leave the next page unable to scroll.
  useEffect(
    () => () => {
      flight.current?.cancel();
      if (away.current) away.current.style.visibility = "";
      if (locked.current) unlockScroll();
      locked.current = false;
    },
    [],
  );

  /* ── Switch: the photograph changes, and that is all ───────────────── */
  const go = useCallback(
    (next: number) => {
      if (closing) return;
      const target = (next + plates.length) % plates.length;
      if (target === index) return;
      // An opening flight still under way is landed, not carried over.
      flight.current?.cancel();
      takeFromGallery(frames()[target]);
      setIndex(target);
    },
    [closing, frames, index, plates.length],
  );

  /* ── Close ─────────────────────────────────────────────────────────── */
  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    flight.current?.cancel();
    unlockScroll();
    locked.current = false;

    const home = frames()[index];
    if (home) {
      const box = boxOf(home);
      const vh = window.innerHeight;
      if (box.top < vh * 0.08 || box.top + box.height > vh * 0.95) {
        const offset = box.height < vh * 0.8 ? (vh - box.height) / 2 : vh * 0.1;
        scrollToY(window.scrollY + box.top - offset, { immediate: true });
      }
    }

    fadeOpacity(backdropRef.current, 1, 0, 600, 120, reduced);
    fadeOpacity(
      dialogRef.current?.querySelector<HTMLElement>("[data-viewer-chrome]") ?? null,
      1,
      0,
      200,
      0,
      reduced,
    );

    const finish = () => {
      takeFromGallery(null);
      onClosed(index);
    };
    if (reduced || !stageRef.current || !home) {
      finish();
      return;
    }

    flight.current = flip(
      [
        {
          el: stageRef.current,
          to: nearEdge(boxOf(home)),
          media: stageMediaRef.current,
          aspect: aspectOf(plates[index]!),
        },
      ],
      // Held at its landing spot until its own frame is showing again
      // underneath and the viewer is gone, so nothing blinks on the way out.
      { duration: CLOSE_S, hold: true },
    );
    void flight.current.finished.then(finish);
  }, [closing, frames, index, onClosed, plates, reduced]);

  /* ── Keyboard: Escape, arrows, and a focus trap ────────────────────── */
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "Tab") {
      const focusables = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [],
      );
      if (!focusables.length) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  /* ── Swipe on touch screens ────────────────────────────────────────── */
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1));
  };

  const counter = `${String(index + 1).padStart(2, "0")} / ${String(plates.length).padStart(2, "0")}`;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photographs`}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[80] text-navy"
    >
      <div ref={backdropRef} aria-hidden="true" className="absolute inset-0 bg-white" />

      <div className="relative h-full">
        <div
          data-viewer-stage
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          className="relative h-full touch-pan-y"
        >
          <div className="pointer-events-none absolute inset-x-[clamp(1rem,4vw,4rem)] inset-y-[clamp(4.25rem,9vh,5.5rem)] grid place-items-center [container-type:size]">
            <figure
              ref={stageRef}
              style={{ ["--ar" as string]: aspectOf(plate) } as CSSProperties}
              className="viewer-frame pointer-events-auto relative overflow-hidden bg-mist"
            >
              <div ref={stageMediaRef} className="absolute inset-0">
                <Layers key={index} plate={plate} sizes="(min-width: 48rem) 80vw, 100vw" />
              </div>
              <figcaption className="sr-only">{plate.caption}</figcaption>
            </figure>
          </div>
        </div>
      </div>

      <div
        data-viewer-chrome
        className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-6 px-[clamp(1rem,4vw,4rem)] pt-[clamp(0.75rem,2.4vh,1.5rem)]"
      >
        <p className="min-w-0 pt-3 font-display text-[0.6875rem] font-bold tracking-[0.16em] uppercase">
          <span aria-live="polite" className="tabular-nums">
            {counter}
          </span>
          <span className="ml-4 hidden font-body text-xs font-normal tracking-normal text-slate normal-case sm:inline">
            {plate.caption}
          </span>
        </p>
        <div className="pointer-events-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous photograph"
            className="grid h-11 w-11 place-items-center rounded-full transition-colors duration-[var(--dur-short)] hover:bg-mist focus-visible:outline-2 focus-visible:outline-accent-blue"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next photograph"
            className="grid h-11 w-11 place-items-center rounded-full transition-colors duration-[var(--dur-short)] hover:bg-mist focus-visible:outline-2 focus-visible:outline-accent-blue"
          >
            <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close photographs"
            className={`${BUTTON.primary} ml-2`}
          >
            Close
            <X aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.2} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
