# The widths each photograph is kept at. A browser takes the first file in a
# srcset at least as wide as the screen needs, so with only 800w and 1600w a
# screen that needs 850px downloads the 1600px file: three times the bytes.
# No step from one width to the next is more than 1.5x.
#
#   python3 scripts/image-ladder.py encode SOURCE DEST-BASE NAME [--max N]
#       Writes DEST-BASE-<w>w.webp (DEST-BASE under src/assets, e.g.
#       parikrama/dusk) at the widths below up to the source's own (or N),
#       whole, and prints the imports and the set() entry for images.ts.
#   python3 scripts/image-ladder.py fill
#       Gives every set() in src/assets/images.ts that steps up by more than
#       1.5x the widths it is missing, made from its largest file.
#   python3 scripts/image-ladder.py check
#       Fails if any set() still steps up by more than 1.5x.
#
# Then rerun `node scripts/image-tones.mjs`. Needs Pillow.
import io
import math
import re
import sys
from pathlib import Path

from PIL import Image, ImageCms

WIDTHS = [640, 960, 1280, 1600, 1920, 2560, 3200]
MAX_STEP = 1.5


def quality(width: int) -> int:
    """Lower for the large files: they are seen on dense screens, where it doesn't show."""
    return 82 if width <= 1280 else 75 if width <= 1920 else 68

ASSETS = Path(__file__).resolve().parent.parent / "src" / "assets"
REGISTRY = ASSETS / "images.ts"
IMPORT = re.compile(r'^import (\w+) from "\./([^"]+)";$', re.M)
SET = re.compile(r"(\w+): set\(\s*\[((?:\s*\[\w+, \d+\],?)+)\s*\]")
PAIR = re.compile(r"\[(\w+), (\d+)\]")


def srgb(image: Image.Image) -> Image.Image:
    """The picture in sRGB, as a browser shows a file without a profile."""
    icc = image.info.get("icc_profile")
    if icc:
        image = ImageCms.profileToProfile(
            image, ImageCms.ImageCmsProfile(io.BytesIO(icc)), ImageCms.createProfile("sRGB")
        )
    return image.convert("RGB")


def save(image: Image.Image, width: int, path: Path) -> None:
    height = round(image.height * width / image.width)
    image.resize((width, height), Image.LANCZOS).save(
        path, "WEBP", quality=quality(width), method=6
    )


def steps_between(low: int, high: int) -> list[int]:
    """As few widths as fit between two with no step over MAX_STEP, evenly spaced."""
    count = math.ceil(math.log(high / low) / math.log(MAX_STEP) - 1e-9) - 1
    return [round(low * (high / low) ** (k / (count + 1)) / 10) * 10 for k in range(1, count + 1)]


def encode(source: str, base: str, name: str, cap: int | None) -> None:
    image = srgb(Image.open(source))
    top = min(image.width, cap or image.width)
    widths = [w for w in WIDTHS if w < top * 0.97] + [top]
    pairs = []
    for width in widths:
        path = ASSETS / f"{base}-{width}w.webp"
        save(image, width, path)
        pairs.append((f"{name}{width}", width, path))
        print(f"{path.relative_to(ASSETS)}  {path.stat().st_size // 1024} KB")
    print()
    for var, _, path in pairs:
        print(f'import {var} from "./{path.relative_to(ASSETS)}";')
    height = round(image.height * top / image.width)
    print(f"  {name}: set(\n    [")
    for var, width, _ in pairs:
        print(f"      [{var}, {width}],")
    print(f"    ],\n    {height},\n  ),")


def sets(source: str):
    """Each set() in the registry: its key, its [var, width] pairs, and where its list sits."""
    for match in SET.finditer(source):
        pairs = [(var, int(w)) for var, w in PAIR.findall(match.group(2))]
        yield match.group(1), pairs, match.span(2)


def gaps(pairs) -> list[tuple[int, int]]:
    widths = [w for _, w in pairs]
    return [(a, b) for a, b in zip(widths, widths[1:]) if b / a > MAX_STEP]


def fill() -> None:
    source = REGISTRY.read_text()
    files = dict(IMPORT.findall(source))
    by_path = {path: var for var, path in files.items()}
    new_imports: dict[str, list[str]] = {}  # after which import, the lines to add
    edits = []  # (span of a set's list, its new text)
    for key, pairs, span in sets(source):
        if not gaps(pairs):
            continue
        largest_var = pairs[-1][0]
        largest = ASSETS / files[largest_var]
        stem = re.sub(r"(-\d+w)?\.webp$", "", largest.name)
        image = None
        widths = sorted({w for _, w in pairs} | {s for a, b in gaps(pairs) for s in steps_between(a, b)})
        listed = dict((w, var) for var, w in pairs)
        for width in widths:
            if width in listed:
                continue
            path = largest.with_name(f"{stem}-{width}w.webp")
            rel = str(path.relative_to(ASSETS))
            if rel not in by_path:
                if not path.exists():
                    image = image or srgb(Image.open(largest))
                    save(image, width, path)
                var = re.sub(r"\d+$", "", largest_var) + str(width)
                while var in files:
                    var += "x"
                files[var] = rel
                by_path[rel] = var
                new_imports.setdefault(largest_var, []).append(f'import {var} from "./{rel}";')
            listed[width] = by_path[rel]
        indent = "\n      "
        text = indent + indent.join(f"[{listed[w]}, {w}]," for w in sorted(listed)) + "\n    "
        edits.append((span, text))
        print(f"{key}: {[w for _, w in pairs]} -> {sorted(listed)}")
    for (start, end), text in sorted(edits, reverse=True):
        source = source[:start] + text + source[end:]
    for after, lines in new_imports.items():
        line = re.search(rf'^import {after} from "[^"]+";$', source, re.M)
        source = source[: line.end()] + "\n" + "\n".join(lines) + source[line.end():]
    REGISTRY.write_text(source)


def check() -> int:
    bad = [(key, [w for _, w in pairs]) for key, pairs, _ in sets(REGISTRY.read_text()) if gaps(pairs)]
    for key, widths in bad:
        print(f"{key}: {widths} steps up by more than {MAX_STEP}x")
    return 1 if bad else 0


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["encode"] and len(args) in (4, 6):
        cap = int(args[5]) if len(args) == 6 and args[4] == "--max" else None
        encode(args[1], args[2], args[3], cap)
    elif args == ["fill"]:
        fill()
    elif args == ["check"]:
        sys.exit(check())
    else:
        sys.exit(__doc__ or "usage: see the top of scripts/image-ladder.py")
