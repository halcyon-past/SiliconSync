from __future__ import annotations

import asyncio
import json
import logging
import os
import subprocess
import sys
from datetime import date, datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

from image_generator import generate_header_image
from news_fetcher import fetch_tech_news
from summarizer import summarize_articles

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).resolve().parent.parent
# Move directories into frontend for static access
DATA_DIR = ROOT_DIR / "frontend" / "public" / "data"
ASSETS_DIR = ROOT_DIR / "frontend" / "public" / "assets" / "headers"
INDEX_FILE = DATA_DIR / "index.json"


def utc_now_iso() -> str:
    return datetime.now(tz=timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _load_index() -> list[dict]:
    if not INDEX_FILE.exists():
        return []
    try:
        return json.loads(INDEX_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def _write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Use ensure_ascii=False and separators to prevent invalid escape characters or formatting issues
    content = json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(content, encoding="utf-8")


def _update_index(entry: dict) -> list[dict]:
    index_entries = _load_index()
    filtered = [item for item in index_entries if item.get("date") != entry["date"]]
    filtered.append(entry)
    filtered.sort(key=lambda item: item["date"], reverse=True)
    trimmed = filtered[:90]
    _write_json(INDEX_FILE, trimmed)
    return trimmed


def _run_git_commit(target_date: date) -> None:
    commands = [
        ["git", "config", "user.name", "halcyon-past"],
        ["git", "config", "user.email", "titansuperior@gmail.com"],
        ["git", "add", "frontend/public/"],
    ]

    for command in commands:
        subprocess.run(command, cwd=ROOT_DIR, check=True)

    diff_check = subprocess.run(
        ["git", "diff", "--staged", "--quiet"],
        cwd=ROOT_DIR,
        check=False,
    )
    if diff_check.returncode == 0:
        logger.info("No staged changes found; skipping commit")
        return

    subprocess.run(
        ["git", "commit", "-m", f"Daily news: {target_date.isoformat()}"],
        cwd=ROOT_DIR,
        check=True,
    )
    subprocess.run(["git", "push"], cwd=ROOT_DIR, check=True)


def build_post(target_date: date) -> dict:
    load_dotenv()

    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise RuntimeError("GEMINI_API_KEY is required")

    newsapi_key = os.getenv("NEWSAPI_KEY")
    gnews_key = os.getenv("GNEWS_KEY")
    mediastack_key = os.getenv("MEDIASTACK_KEY")

    articles = asyncio.run(
        fetch_tech_news(
            newsapi_key=newsapi_key,
            gnews_key=gnews_key,
            mediastack_key=mediastack_key,
        )
    )
    if not articles:
        raise RuntimeError("No articles fetched from any source")

    ai_result = summarize_articles(
        api_key=gemini_key,
        articles=articles,
        target_date=target_date,
    )

    header_image_path = generate_header_image(
        target_date=target_date,
        headline=ai_result["headline"],
        output_dir=ASSETS_DIR,
        image_prompt=ai_result.get("image_prompt"),
        api_key=gemini_key,
    )

    post_payload = {
        "date": target_date.isoformat(),
        "headline": ai_result["headline"],
        "summary": ai_result["summary"],
        "articles": articles,
        "image_path": f"/assets/headers/{header_image_path.name}",
        "generated_at": utc_now_iso(),
    }

    _write_json(DATA_DIR / f"{target_date.isoformat()}.json", post_payload)

    index_entry = {
        "date": target_date.isoformat(),
        "headline": ai_result["headline"],
        "preview": ai_result["summary"][:200],
        "image_path": f"/assets/headers/{header_image_path.name}",
    }
    _update_index(index_entry)

    return post_payload


def main() -> int:
    target_date = date.today()
    try:
        build_post(target_date)
        # We no longer handle git operations inside the python script.
        # This is now handled by the GitHub Actions workflow.
    except Exception as exc:
        logger.exception("Publishing pipeline failed: %s", exc)
        return 1

    logger.info("Generated post for %s", target_date.isoformat())
    return 0


if __name__ == "__main__":
    sys.exit(main())
