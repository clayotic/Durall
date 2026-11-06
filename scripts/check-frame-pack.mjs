// Checks how the home film's frame files are split apart (src/lib/frame-pack.ts),
// on a made-up file and on the real ones in src/assets/hero-doors.
//
//   node scripts/check-frame-pack.mjs
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createJiti } from "jiti";

const { avifFrames } = await createJiti(import.meta.url).import("../src/lib/frame-pack.ts");

const box = (type, body) => {
  const out = Buffer.alloc(8 + body.length);
  out.writeUInt32BE(out.length);
  out.write(type, 4, "latin1");
  Buffer.from(body).copy(out, 8);
  return out;
};
/** A Node Buffer's bytes as the ArrayBuffer a fetch gives. */
const bytesOf = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.length);
const file = (body) => Buffer.concat([box("ftyp", "avif"), box("meta", "m"), box("mdat", body)]);
const files = [file("one"), file("second"), file("3")];
const pack = Buffer.concat(files);
const split = avifFrames(bytesOf(pack));
assert.deepEqual(
  split.map((f) => Buffer.from(f)),
  files,
);

// "ftyp" inside a picture's data is not the start of the next one.
const tricky = Buffer.concat([file("ftypftyp"), file("x")]);
assert.equal(avifFrames(bytesOf(tricky)).length, 2);

const doors = new URL("../src/assets/hero-doors/", import.meta.url);
const counts = readdirSync(doors)
  .sort()
  .map((name) => {
    const bytes = readFileSync(new URL(name, doors));
    const frames = avifFrames(bytesOf(bytes));
    for (const frame of frames) assert.equal(Buffer.from(frame).toString("latin1", 4, 8), "ftyp");
    assert.equal(
      frames.reduce((sum, f) => sum + f.byteLength, 0),
      bytes.length,
    );
    return frames.length;
  });
assert.deepEqual(counts, [12, 12, 24, 48]); // every 8th, 4th, 2nd frame, then the rest of the 96
console.log("frame packs ok:", counts.join(" + "), "frames");
