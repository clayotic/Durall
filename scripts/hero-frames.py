# Makes the home opening's film (src/components/durall/Hero.tsx) from a video:
# the still shown until the film runs (the video's first frame, at the three
# widths src/assets/images.ts lists as `heroFilm`) and the 72 frames the
# scroll plays over it. Then rerun `node scripts/image-tones.mjs`.
#
#   python3 scripts/hero-frames.py HOMEHERO-1.mp4
#
# The frames are picked at equal steps of change in the picture, not of time,
# so equal steps of scroll move the picture equally. Frames where it has
# settled at the end are left out. Needs ffmpeg, Pillow and numpy. If the
# video is not 3:2, change the canvas size in Hero.tsx and the height in
# images.ts to match.
import io
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

COUNT = 72
FRAME_WIDTH, FRAME_QUALITY = 1600, 40
STILL_QUALITY = 75
STILLS = {1920: "hero-film.webp", 1440: "hero-film-1440w.webp", 960: "hero-film-960w.webp"}
# Below this share of the largest change, a frame at the end counts as settled.
SETTLED = 0.15
# The frames are sent in a few files rather than one each (a request to the
# host can take a second to start): every 8th frame first, so the whole film
# can run coarsely on one file, then the 4ths between, the 2nds and the rest.
# Each file is the frames' WebP files end to end; Hero.tsx splits them apart
# by the size each one's RIFF header gives. A phone takes the first three.
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
            out = io.BytesIO()
            image.resize(size, Image.LANCZOS).save(out, "WEBP", quality=FRAME_QUALITY, method=6)
            encoded.append(out.getvalue())
    pack(encoded, ASSETS / "hero-doors")
    print(f"still {still.width}x{still.height}; frames {size[0]}x{size[1]}")


def pack(frames, doors):
    """`frames` (WebP files as bytes, the film's first frame first) into one file per step."""
    for old in doors.iterdir():
        old.unlink()
    taken = set()
    for i, step in enumerate(STEPS, 1):
        part = [n for n in range(step, len(frames) + 1, step) if n not in taken]
        taken.update(part)
        for n in part:  # split by the header's size, so it must be the whole file
            assert len(frames[n - 1]) == 8 + int.from_bytes(frames[n - 1][4:8], "little")
        (doors / f"{i}.bin").write_bytes(b"".join(frames[n - 1] for n in part))
        print(f"hero-doors/{i}.bin: frames {part[0]}, {part[1]} … {part[-1]}")


if __name__ == "__main__":
    main(sys.argv[1])
