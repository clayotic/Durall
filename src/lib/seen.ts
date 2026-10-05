import { useEffect, useRef } from "react";

/**
 * For sequences that are played by CSS rather than by the scroll (the
 * `seq` classes in styles.css): gives every `.seq` element under the
 * returned ref the class `is-in` the first time it is on screen, which is
 * what starts its parts. Once only; scrolling away and back does not replay.
 */
export function useSeen<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          seen.unobserve(entry.target);
        }
      },
      { threshold },
    );
    root.querySelectorAll(".seq").forEach((group) => seen.observe(group));
    return () => seen.disconnect();
  }, [threshold]);

  return ref;
}

/** `--d`: when a part starts, in seconds after its group comes on screen;
 *  `--t`: how long it takes, where the part's kind lets that vary. */
export const at = (delay: number, time?: number) =>
  ({ "--d": `${delay}s`, ...(time ? { "--t": `${time}s` } : {}) }) as React.CSSProperties;
