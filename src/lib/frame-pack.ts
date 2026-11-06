/** "ftyp", the box every AVIF file starts with. */
const FTYP = 0x66747970;

/**
 * The AVIF files in `pack`, a file of them end to end (made by
 * scripts/hero-frames.py). Each one starts with its `ftyp` box, so one ends
 * where the next `ftyp` begins; the boxes between are stepped over by the
 * size each starts with.
 */
export function avifFrames(pack: ArrayBuffer): ArrayBuffer[] {
  const view = new DataView(pack);
  const frames: ArrayBuffer[] = [];
  let start = 0;
  let at = 0;
  while (at + 8 <= pack.byteLength) {
    if (at > start && view.getUint32(at + 4) === FTYP) {
      frames.push(pack.slice(start, at));
      start = at;
    }
    at += view.getUint32(at) || pack.byteLength; // a size of 0: the box runs to the end
  }
  if (start < pack.byteLength) frames.push(pack.slice(start));
  return frames;
}
