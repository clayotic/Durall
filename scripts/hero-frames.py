# Makes the home opening's film (src/components/durall/Hero.tsx) from a video:
# the still shown until the film runs (the video's first frame, at the
# widths src/assets/images.ts lists as `heroFilm`) and the 96 frames the
# scroll plays over it. Then rerun `node scripts/image-tones.mjs`.
#
# HOMEHERO-1.mp4 is 3532 px wide but holds only about 1500 px of detail (it
# was enlarged from a smaller original), so it is first upscaled for real:
# brought down to 1920 px, padded to 16:9 (the upscaler only keeps that or
# a few other shapes), and run through Topaz Video at 2160p (Higgsfield's
# upscale_video, provider "topaz"). Its padding is then cut off, it is
# brought to the width the frames are kept at, and given the frames between
# by motion interpolation (at its own 24 fps it has too few where the glass
# moves fastest for 96 even steps), losslessly:
#
#   ffmpeg -i HOMEHERO-1.mp4 -an -vf "scale=1920:1274:flags=lanczos,pad=2265:1274:172:0"
#     -c:v libx264 -crf 10 topaz-in.mp4                 # -> Topaz 2160p 16:9 -> topaz.mp4
#   ffmpeg -i topaz.mp4 -vf "crop=3256:2160:291:0,scale=2560:-2:flags=lanczos,
#     minterpolate=fps=72:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
#     -c:v ffv1 -pix_fmt yuv420p interp72.mkv
#   python3 scripts/hero-frames.py interp72.mkv
#
# The frames are picked at equal steps of change in the picture, not of time,
# so equal steps of scroll move the picture equally. Frames where it has
# settled at the end are left out. They are kept as AVIF, which at the same
# quality is about half the size of WebP and decodes as fast. Needs ffmpeg
# (with libaom), Pillow and numpy. If the video is not 3:2, change the
# canvas size in Hero.tsx and the height in images.ts to match.
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

COUNT = 96
# 2560 wide: a retina laptop shows the film about that many pixels across.
# AV1 quality (lower is better): 32 keeps the stone's grain, 36 smooths it.
FRAME_WIDTH, FRAME_CRF = 2560, 32
STILL_QUALITY = 75
STILLS = {
    2560: "hero-film-2560w.webp",
    1920: "hero-film.webp",
    1440: "hero-film-1440w.webp",
    960: "hero-film-960w.webp",
}
# Below this share of the largest change, a frame at the end counts as settled.
SETTLED = 0.15
# The frames are sent in a few files rather than one each (a request to the
# host can take a second to start): every 8th frame first, so the whole film
# can run coarsely on one file, then the 4ths between, the 2nds and the rest.
# Each file is the frames' AVIF files end to end; Hero.tsx splits them apart
# where each one's first box (`ftyp`) starts. A phone takes the first three.
STEPS = (8, 4, 2, 1)

ASSETS = Path(__file__).resolve().parent.parent / "src" / "assets"


def frames(video, out, width, colour, only=None):
    """The frames of `video` (all, or the numbers in `only`) into `out` as PNG, `width` wide."""
    pick = f"select='{'+'.join(f'eq(n,{n})' for n in only)}'," if only else ""
    scale = f"scale={width}:-2:flags=lanczos:in_color_matrix=bt709"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-i", video, "-vf", f"{pick}{scale},format={colour}"]
        + ["-fps_mode", "passthrough", f"{out}/%04d.png"],
        check=True,
    )
    return sorted(Path(out).glob("*.png"))


def main(video):
    with tempfile.TemporaryDirectory() as tmp:
        grey = [np.asarray(Image.open(f), dtype=np.float32) for f in frames(video, tmp, 160, "gray")]
    change = np.array([np.abs(b - a).mean() for a, b in zip(grey, grey[1:])])
    last = int(np.nonzero(change >= SETTLED * change.max())[0][-1]) + 1
    total = np.concatenate([[0], np.cumsum(change[:last])])  # total[n]: change up to frame n
    picked, previous = [], 0
    for k in range(1, COUNT + 1):
        n = int(np.argmin(np.abs(total - total[-1] * k / COUNT)))
        previous = max(n, previous + 1)  # never the same frame twice
        picked.append(previous)
    if picked[-1] >= len(grey):
        sys.exit(f"{video}: {last + 1} frames of movement, too few for {COUNT}")
    print(f"{len(grey)} frames, moving to {last}, picked {picked}")

    with tempfile.TemporaryDirectory() as tmp:
        still, *files = frames(video, tmp, max(STILLS), "rgb24", [0, *picked])
        still = Image.open(still).convert("RGB")
        for width, name in STILLS.items():
            size = (width, round(width * still.height / still.width))
            still.resize(size, Image.LANCZOS).save(ASSETS / name, quality=STILL_QUALITY, method=6)
        encoded = []
        for file in files:
            image = Image.open(file).convert("RGB")
            size = (FRAME_WIDTH, round(FRAME_WIDTH * image.height / image.width))
            image.resize(size, Image.LANCZOS).save(file)
            avif = file.with_suffix(".avif")
            subprocess.run(
                ["ffmpeg", "-v", "error", "-i", file, "-c:v", "libaom-av1", "-still-picture", "1"]
                + ["-crf", str(FRAME_CRF), "-cpu-used", "4", "-pix_fmt", "yuv420p", avif],
                check=True,
            )
            encoded.append(avif.read_bytes())
    pack(encoded, ASSETS / "hero-doors")
    print(f"still {still.width}x{still.height}; frames {size[0]}x{size[1]}")


def boxes(file):
    """The types of the top-level boxes `file` (an AVIF file, as bytes) is made of."""
    at, types = 0, []
    while at + 8 <= len(file):
        types.append(file[at + 4 : at + 8])
        at += int.from_bytes(file[at : at + 4], "big")
    assert at == len(file), "a box runs past the end"
    return types


def pack(frames, doors):
    """`frames` (AVIF files as bytes, the film's first frame first) into one file per step."""
    for old in doors.iterdir():
        old.unlink()
    taken = set()
    for i, step in enumerate(STEPS, 1):
        part = [n for n in range(step, len(frames) + 1, step) if n not in taken]
        taken.update(part)
        for n in part:  # split where each `ftyp` starts, so it must be there once, first
            types = boxes(frames[n - 1])
            assert types[0] == b"ftyp" and types.count(b"ftyp") == 1, types
        (doors / f"{i}.bin").write_bytes(b"".join(frames[n - 1] for n in part))
        print(f"hero-doors/{i}.bin: frames {part[0]}, {part[1]} … {part[-1]}")


if __name__ == "__main__":
    main(sys.argv[1])
