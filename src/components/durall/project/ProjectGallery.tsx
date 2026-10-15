import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { loadGsap, markAnimReady, playAfterIntro, visibleOnLoad } from "@/lib/anim";
import { prefersReducedMotion } from "@/lib/motion-prefs";
import { GalleryViewer } from "./GalleryViewer";
import { LANDING, useLineReveal } from "./motion";
import { Eyebrow } from "./parts";
import type { ProjectsPage } from "@/content/types";
import type { Plate, ProjectDetail } from "./data";

/**
 * How wide a plate's photograph is drawn, for the browser to pick a file by.
 * The masonry (styles.css) is three columns of the page shell from 64rem and
 * two below it, `--gallery-gap` apart, and each photograph fills its column
 * at its own shape, so the width is all there is to it:
 *
 * - three columns: (92.5vw less two gaps of 1.5vw) / 3, about 30vw, until the
 *   shell stops growing at 120rem, where a column is 576px;
 * - two columns: about 46vw, cut by a third on a phone with a very dense
 *   screen (a tap opens the photograph at full size, and at twice the
 *   screen's pixels a preview looks the same for less than half the
 *   download).
 */
const PLATE_SIZES =
  "(min-width: 120rem) 576px, (min-width: 64rem) 30vw, (min-resolution: 2.5dppx) 31vw, 46vw";

/**
 * Project photography, as a masonry: every photograph whole, at its own
 * shape, in columns. Clicking one opens it full screen.
 *
 * Each photograph arrives once, the first time it comes into view: a white
 * shutter lifts off it from the bottom edge while the image settles out of
 * an overscan.
 *
 * There were three arrangements here (an editorial scatter, this masonry and
 * a horizontal slider, switched from a pill at the foot of the screen); the
 * client asked for the masonry alone.
 */
export function ProjectGallery({
  project,
  labels,
}: {
  project: ProjectDetail;
  labels: ProjectsPage["detail"];
}) {
  const { plates } = project;
  const headRef = useLineReveal<HTMLDivElement>();
  const listRef = useRef<HTMLUListElement>(null);
  const [viewing, setViewing] = useState<number | null>(null);

  const frames = useCallback(
    () => Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-plate-frame]") ?? []),
    [],
  );

  // First arrival of each photograph.
  useEffect(() => {
    const list = listRef.current;
    if (!list || prefersReducedMotion()) return;
    let cancelled = false;
    let dispose = () => {};

    void loadGsap().then(({ gsap }) => {
      if (cancelled || !listRef.current) return;
      const tweens = frames().map((frame) => {
        const cover = frame.querySelector<HTMLElement>("[data-plate-cover]");
        const img = frame.querySelector<HTMLElement>("[data-plate-img]");
        const onScreen = visibleOnLoad(frame);
        const tl = gsap.timeline({
          paused: onScreen,
          defaults: { ease: LANDING },
          ...(onScreen
            ? {}
            : {
                // Plays on entry and never reverses — not `once`, which can
                // crash a refresh (see useLineReveal).
                scrollTrigger: {
                  trigger: frame,
                  start: "clamp(top 92%)",
                  toggleActions: "play none none none",
                },
              }),
        });
        if (cover) tl.fromTo(cover, { scaleY: 1 }, { scaleY: 0, duration: 1.35 }, 0);
        if (img) tl.fromTo(img, { scale: 1.24 }, { scale: 1, duration: 2 }, 0);
        if (onScreen) playAfterIntro(tl, () => cancelled);
        return tl;
      });
      markAnimReady();

      dispose = () =>
        tweens.forEach((tl) => {
          tl.scrollTrigger?.kill();
          tl.progress(1).kill();
        });
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [frames]);

  const onViewerClosed = useCallback(
    (index: number) => {
      setViewing(null);
      frames()[index]?.focus({ preventScroll: true });
    },
    [frames],
  );

  const count = String(plates.length).padStart(2, "0");

  return (
    <section
      data-gallery
      aria-labelledby="gallery-heading"
      className="shell pb-[clamp(6rem,10vw,9rem)]"
    >
      <div ref={headRef}>
        <span data-rule aria-hidden="true" className="block h-px w-full bg-navy-14" />
        <div className="mt-5 flex items-baseline justify-between gap-6">
          <h2
            id="gallery-heading"
            data-rise
            className="font-display text-[0.6875rem] font-bold tracking-[0.18em] text-slate uppercase"
          >
            {labels.gallery}
          </h2>
          <Eyebrow>
            {count} {labels.plates}
          </Eyebrow>
        </div>
      </div>

      <ul ref={listRef} data-gallery-list className="mt-[clamp(3rem,6vw,5rem)]">
        {plates.map((plate, index) => (
          <li
            key={index}
            data-plate
            style={
              {
                ["--ar" as string]: `${plate.image.width} / ${plate.image.height}`,
              } as CSSProperties
            }
            className="min-w-0"
          >
            <button
              type="button"
              data-plate-frame
              aria-haspopup="dialog"
              aria-label={`Open photograph ${index + 1} of ${plates.length}: ${plate.alt}`}
              onClick={() => setViewing(index)}
              className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-mist focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-blue"
            >
              <span data-plate-media className="absolute inset-0 block">
                <img
                  data-plate-img
                  {...plate.image}
                  alt=""
                  sizes={PLATE_SIZES}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="media-zoom h-full w-full object-cover"
                />
              </span>
              <span
                data-plate-cover
                aria-hidden="true"
                className="absolute inset-0 bg-white"
                style={{ transform: "scaleY(0)", transformOrigin: "50% 0%" }}
              />
            </button>
          </li>
        ))}
      </ul>

      {viewing !== null ? (
        <GalleryViewer
          title={project.name}
          plates={plates}
          startIndex={viewing}
          frames={frames}
          onClosed={onViewerClosed}
        />
      ) : null}
    </section>
  );
}
