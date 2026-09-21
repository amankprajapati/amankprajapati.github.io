#!/usr/bin/env python
"""Moves an MP4's moov atom in front of mdat ("faststart"), without
re-encoding. Equivalent to `ffmpeg -c copy -movflags +faststart`, written
from scratch because ffmpeg isn't available in this environment.

Why this matters: a browser streaming an MP4 progressively needs moov's
sample tables to know how to schedule playback as bytes arrive. If moov
sits after mdat (the default for some recorders/exporters), playback can
run correctly for a while and then break once the browser exhausts what
it could infer, which is exactly the "plays fine then falls apart partway
through" symptom -- not data corruption, a container layout problem.

Usage: python scripts/faststart.py <input.mp4> <output.mp4>
"""

from __future__ import annotations

import struct
import sys


def read_boxes(data: bytes, start: int, end: int) -> list[tuple[str, int, int, int]]:
    """Returns (type, box_start, header_size, box_size) for each top-level
    box in data[start:end]."""
    boxes = []
    pos = start
    while pos < end:
        box_size = struct.unpack(">I", data[pos:pos + 4])[0]
        box_type = data[pos + 4:pos + 8].decode("ascii")
        header_size = 8
        if box_size == 1:
            box_size = struct.unpack(">Q", data[pos + 8:pos + 16])[0]
            header_size = 16
        elif box_size == 0:
            box_size = end - pos
        boxes.append((box_type, pos, header_size, box_size))
        pos += box_size
    return boxes


def patch_chunk_offsets(moov: bytearray, delta: int) -> None:
    """Walks every box inside moov and adds `delta` to each entry of every
    stco (32-bit chunk offsets) and co64 (64-bit chunk offsets) table --
    the only places in moov that hold absolute byte offsets into mdat."""

    def walk(data: bytearray, start: int, end: int) -> None:
        pos = start
        while pos < end:
            box_size = struct.unpack(">I", data[pos:pos + 4])[0]
            box_type = data[pos + 4:pos + 8].decode("ascii")
            header_size = 8
            if box_size == 1:
                box_size = struct.unpack(">Q", data[pos + 8:pos + 16])[0]
                header_size = 16
            elif box_size == 0:
                box_size = end - pos

            if box_type == "stco":
                entry_count = struct.unpack(">I", data[pos + 12:pos + 16])[0]
                table_start = pos + 16
                for i in range(entry_count):
                    off = table_start + i * 4
                    (value,) = struct.unpack(">I", data[off:off + 4])
                    struct.pack_into(">I", data, off, value + delta)
            elif box_type == "co64":
                entry_count = struct.unpack(">I", data[pos + 12:pos + 16])[0]
                table_start = pos + 16
                for i in range(entry_count):
                    off = table_start + i * 8
                    (value,) = struct.unpack(">Q", data[off:off + 8])
                    struct.pack_into(">Q", data, off, value + delta)
            elif box_type in ("trak", "mdia", "minf", "stbl", "moov", "edts"):
                # Container boxes: recurse into their children.
                walk(data, pos + header_size, pos + box_size)

            pos += box_size

    walk(moov, 0, len(moov))


def faststart(input_path: str, output_path: str) -> None:
    with open(input_path, "rb") as f:
        data = f.read()

    top = read_boxes(data, 0, len(data))
    kinds = [t for t, *_ in top]
    if "moov" not in kinds:
        raise ValueError("no moov box found")
    if kinds.index("moov") < kinds.index("mdat"):
        print(f"{input_path}: moov already precedes mdat, nothing to do")
        with open(output_path, "wb") as f:
            f.write(data)
        return

    moov_type, moov_start, _, moov_size = next(b for b in top if b[0] == "moov")
    moov_bytes = bytearray(data[moov_start:moov_start + moov_size])

    mdat_type, mdat_start, _, mdat_size = next(b for b in top if b[0] == "mdat")
    mdat_bytes = data[mdat_start:mdat_start + mdat_size]

    # Inserting moov right before mdat shifts mdat (and therefore every
    # sample) forward by exactly len(moov_bytes).
    delta = len(moov_bytes)
    patch_chunk_offsets(moov_bytes, delta)

    before_mdat = data[:mdat_start]
    # Anything that isn't mdat or moov (e.g. a trailing uuid box) keeps its
    # original bytes and relative order, just appended after mdat instead
    # of wherever it sat relative to moov originally.
    trailing = b"".join(
        data[box_start:box_start + box_size]
        for box_type, box_start, _, box_size in top
        if box_type not in ("mdat", "moov")
        and box_start > mdat_start
    )

    new_data = bytes(before_mdat) + bytes(moov_bytes) + bytes(mdat_bytes) + trailing

    with open(output_path, "wb") as f:
        f.write(new_data)

    print(f"{input_path}: moved moov ({moov_size} bytes) before mdat, "
          f"patched offsets by +{delta} -> {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("usage: python scripts/faststart.py <input.mp4> <output.mp4>", file=sys.stderr)
        raise SystemExit(2)
    faststart(sys.argv[1], sys.argv[2])
