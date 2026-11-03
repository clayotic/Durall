// Writes src/assets/tones.ts: for every photograph in the image registry, its
// colours at the top, middle and bottom, which the page paints behind the
// photograph until it arrives. Rerun after adding or replacing an image:
//
//   node scripts/image-tones.mjs
//
// Needs ffmpeg and ffprobe. Images with transparency (marks, drawings on
// nothing) and SVGs get no tone, since the colour would show through them.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const REGISTRY = "src/assets/images.ts";
const source = readFileSync(REGISTRY, "utf8");
const files = Object.fromEntries(
  [...source.matchAll(/^import (\w+) from "\.\/([^"]+)";$/gm)].map(([, name, path]) => [
    name,
    path,
  ]),
);
const registry = source.slice(source.indexOf("export const IMAGES"));
const entries = registry.split(/^ {2}(?=\w+: )/m).slice(1);

const tones = {};
for (const entry of entries) {
  const key = entry.slice(0, entry.indexOf(":"));
  // The last file an entry names is its largest.
  const file = [...entry.matchAll(/\b(\w+)\b/g)]
    .map(([name]) => files[name])
    .filter(Boolean)
    .at(-1);
  if (!file || file.endsWith(".svg")) continue;
  const path = `src/assets/${file}`;
  const format = execFileSync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=pix_fmt",
    "-of",
    "csv=p=0",
    path,
  ])
    .toString()
    .trim();
  const decode = (filter, pixels) =>
    execFileSync(
      "ffmpeg",
      [
        "-nostdin",
        "-loglevel",
        "error",
        "-i",
        path,
        "-vf",
        filter,
        "-f",
        "rawvideo",
        "-pix_fmt",
        pixels,
        "-",
      ],
      { maxBuffer: 1 << 26 },
    );
  // Some photographs carry an alpha channel that is opaque throughout.
  if (format !== "yuv420p" && decode("alphaextract", "gray").some((alpha) => alpha < 255)) continue;
  const rgb = decode("scale=1:3:flags=area", "rgb24");
  tones[key] = [0, 3, 6].map((i) => rgb.subarray(i, i + 3).toString("hex")).join(" ");
}

writeFileSync(
  "src/assets/tones.ts",
  `// Written by scripts/image-tones.mjs; rerun it after changing an image.
/** Each photograph's colours at its top, middle and bottom. */
export const TONES: Partial<Record<string, string>> = ${JSON.stringify(tones, null, 2)};
`,
);
console.log(`${Object.keys(tones).length} tones written`);
