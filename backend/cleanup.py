from __future__ import annotations

import json
import subprocess
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data" / "news"
ASSETS_DIR = ROOT_DIR / "assets" / "headers"
INDEX_FILE = DATA_DIR / "index.json"


def _load_index() -> list[dict]:
    if not INDEX_FILE.exists():
        return []
    return json.loads(INDEX_FILE.read_text(encoding="utf-8"))


def _save_index(entries: list[dict]) -> None:
    INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
    INDEX_FILE.write_text(json.dumps(entries, indent=2), encoding="utf-8")


def cleanup_old_news(days: int = 90) -> list[str]:
    entries = _load_index()
    if not entries:
        return []

    cutoff = datetime.now(tz=ZoneInfo("Asia/Kolkata")).date() - timedelta(days=days)
    kept_entries: list[dict] = []
    removed_dates: list[str] = []

    for entry in entries:
        entry_date = datetime.strptime(entry["date"], "%Y-%m-%d").date()
        if entry_date >= cutoff:
            kept_entries.append(entry)
            continue

        date_str = entry["date"]
        removed_dates.append(date_str)

        json_file = DATA_DIR / f"{date_str}.json"
        svg_file = ASSETS_DIR / f"{date_str}.svg"
        if json_file.exists():
            json_file.unlink()
        if svg_file.exists():
            svg_file.unlink()

    kept_entries.sort(key=lambda item: item["date"], reverse=True)
    _save_index(kept_entries)
    return removed_dates


def commit_cleanup() -> None:
    commands = [
        ["git", "config", "user.name", "SiliconSync Bot"],
        ["git", "config", "user.email", "bot@siliconsync.dev"],
        ["git", "add", "-A"],
    ]
    for command in commands:
        subprocess.run(command, cwd=ROOT_DIR, check=True)

    diff_check = subprocess.run(["git", "diff", "--staged", "--quiet"], cwd=ROOT_DIR, check=False)
    if diff_check.returncode != 0:
        subprocess.run(
            ["git", "commit", "-m", "Cleanup: removed news older than 90 days"],
            cwd=ROOT_DIR,
            check=True,
        )
        subprocess.run(["git", "push"], cwd=ROOT_DIR, check=True)


def main() -> int:
    removed = cleanup_old_news(days=90)
    if removed:
        commit_cleanup()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
