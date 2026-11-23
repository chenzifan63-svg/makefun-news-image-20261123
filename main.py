#!/usr/bin/env python3
"""Front Page: 23 November 2026.

Copies the front page image (entry.png, rendered from frontpage.html) to
/output/entry.png. Deterministic: the same bytes on every run. No network,
standard library only.
"""
import os
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    out_dir = os.environ.get("MAKEFUN_OUTPUT_DIR", "/output")
    os.makedirs(out_dir, exist_ok=True)
    src = os.path.join(HERE, "entry.png")
    dest = os.path.join(out_dir, "entry.png")
    shutil.copyfile(src, dest)
    os.chmod(dest, 0o644)
    with open(src, "rb") as f:
        expected = f.read()
    with open(dest, "rb") as f:
        actual = f.read()
    if actual != expected:
        raise SystemExit("entry.png copy differs from the source")


if __name__ == "__main__":
    main()
