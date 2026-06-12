#!/usr/bin/env python3
"""Add a figure or animation to the website gallery and publish it.

Usage:
    python3 add-figure.py ~/Desktop/my_plot.png

The script copies the file into assets/gallery/, asks for a title, caption,
and category, adds the entry to data/gallery-data.js, then commits and
pushes. The site updates about a minute later.
"""

import re
import shutil
import subprocess
import sys
from datetime import date
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent
GALLERY_DIR = SITE_DIR / "assets" / "gallery"
DATA_FILE = SITE_DIR / "data" / "gallery-data.js"

VIDEO_EXTS = {".mp4", ".webm", ".mov"}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}


def fail(msg):
    print(f"error: {msg}")
    sys.exit(1)


def ask(prompt, default=None, required=True):
    suffix = f" [{default}]" if default else ""
    while True:
        value = input(f"{prompt}{suffix}: ").strip()
        if not value and default is not None:
            return default
        if value or not required:
            return value
        print("  (required)")


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)

    src = Path(sys.argv[1]).expanduser()
    if not src.is_file():
        fail(f"file not found: {src}")

    ext = src.suffix.lower()
    if ext in VIDEO_EXTS:
        media_type = "video"
    elif ext in IMAGE_EXTS:
        media_type = "image"
    else:
        fail(f"unsupported file type: {ext} (use png/jpg/gif/svg/webp or mp4/webm/mov)")

    if src.stat().st_size > 50 * 1024 * 1024:
        fail("file is larger than 50 MB — compress it first (GitHub blocks >100 MB)")

    data = DATA_FILE.read_text(encoding="utf-8")
    cat_block = re.search(r"const GALLERY_CATEGORIES = \{(.*?)\};", data, re.S)
    cats = dict(re.findall(r'(\w+):\s*"([^"]+)"', cat_block.group(1))) if cat_block else {}
    if not cats:
        fail(f"could not read categories from {DATA_FILE}")

    # copy media into the gallery folder (spaces -> dashes)
    dest = GALLERY_DIR / src.name.replace(" ", "-")
    if dest.exists():
        fail(f"{dest.name} already exists in assets/gallery/ — rename the file first")
    shutil.copy2(src, dest)
    print(f"copied -> assets/gallery/{dest.name}\n")

    title = ask("Title")
    caption = ask("Caption (one sentence shown under the figure)")
    print("Categories: " + ", ".join(f"{k} ({v})" for k, v in cats.items()))
    category = ask("Category", default=next(iter(cats)))
    if category not in cats:
        label = ask(f'"{category}" is new — label to show on the site', default=category.title())
        data = data.replace(
            "const GALLERY_CATEGORIES = {",
            f'const GALLERY_CATEGORIES = {{\n  {category}: "{label}",',
        )
    featured = ask("Show on homepage? (y/n)", default="n").lower().startswith("y")

    esc = lambda s: s.replace('"', '\\"')
    entry_lines = [
        "  {",
        f'    title: "{esc(title)}",',
        f'    category: "{category}",',
        f'    type: "{media_type}",',
        f'    src: "assets/gallery/{dest.name}",',
        f'    caption: "{esc(caption)}",',
        f'    date: "{date.today():%Y-%m}",',
    ]
    if featured:
        entry_lines.append("    featured: true,")
    entry_lines.append("  },")
    entry = "\n".join(entry_lines)

    marker = "const GALLERY_ITEMS = ["
    if marker not in data:
        fail(f"could not find '{marker}' in {DATA_FILE}")
    data = data.replace(marker, marker + "\n" + entry, 1)
    DATA_FILE.write_text(data, encoding="utf-8")
    print(f"\nadded entry to data/gallery-data.js")

    push = ask("Commit and push now? (y/n)", default="y").lower().startswith("y")
    if push:
        subprocess.run(["git", "add", "-A"], cwd=SITE_DIR, check=True)
        subprocess.run(["git", "commit", "-m", f"Add figure: {title}"], cwd=SITE_DIR, check=True)
        subprocess.run(["git", "push"], cwd=SITE_DIR, check=True)
        print("\ndone — live at https://ashcav1.github.io/gallery.html in about a minute")
    else:
        print("\nnot pushed — run this when ready:")
        print('  git add -A && git commit -m "Add figure" && git push')


if __name__ == "__main__":
    main()
