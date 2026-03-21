#!/usr/bin/env python3
"""Parse scraped kaodian raw text into structured JSON."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

STATE_RE = re.compile(r"^(.+?) \((.+?)\) - 考点共(\d+)个$")
EMAIL_RE = re.compile(r"\[([^\]]+)\]\(mailto:([^)]+)\)")


def extract_email(text: str) -> str | None:
    m = EMAIL_RE.search(text)
    return m.group(2) if m else None


def parse_venue_block(name: str, raw_lines: list[str]) -> dict:
    lines = []
    for ln in raw_lines:
        s = ln.strip()
        if not s or s.startswith("|"):
            continue
        lines.append(s)

    email = ""
    phone = ""
    address = ""
    region = ""

    # Pull email from any line
    for s in lines:
        e = extract_email(s)
        if e:
            email = e
            lines = [x for x in lines if extract_email(x) != e]
            break

    if len(lines) >= 1:
        region = lines[0]
    if len(lines) >= 2:
        address = lines[1]
    if len(lines) >= 3:
        phone = lines[2]

    return {
        "name": name,
        "region": region,
        "address": address,
        "phone": phone,
        "email": email,
    }


def slug_state(en_name: str) -> str:
    s = en_name.lower()
    for a, b in [
        ("ä", "ae"),
        ("ö", "oe"),
        ("ü", "ue"),
        ("ß", "ss"),
    ]:
        s = s.replace(a, b)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def parse(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    states: list[dict] = []
    cur: dict | None = None
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]
        stripped = line.strip()
        m = STATE_RE.match(stripped)
        if m:
            zh, en, count = m.group(1).strip(), m.group(2).strip(), int(m.group(3))
            cur = {
                "id": slug_state(en),
                "nameZh": zh,
                "nameDe": en,
                "listedCount": count,
                "venues": [],
            }
            states.append(cur)
            i += 1
            continue

        if stripped.startswith("### ") and cur is not None:
            name = stripped[4:].strip()
            i += 1
            chunk: list[str] = []
            while i < n:
                s = lines[i]
                st = s.strip()
                if STATE_RE.match(st):
                    break
                if st.startswith("### "):
                    break
                chunk.append(s)
                i += 1
            cur["venues"].append(parse_venue_block(name, chunk))
            continue

        i += 1

    return states


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = root / "data" / "raw-source.txt"
    out = root / "public" / "data" / "venues.json"
    if not src.is_file():
        print(f"Missing {src}", file=sys.stderr)
        sys.exit(1)
    out.parent.mkdir(parents=True, exist_ok=True)
    data = parse(src)
    out.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    total = sum(len(s["venues"]) for s in data)
    print(f"Wrote {out} — {len(data)} states, {total} venues")
    for s in data:
        c = len(s["venues"])
        exp = s["listedCount"]
        if c != exp:
            print(f"  WARN {s['nameZh']}: parsed {c} vs listed {exp}", file=sys.stderr)


if __name__ == "__main__":
    main()
