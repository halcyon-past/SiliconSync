from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Any

import feedparser
import httpx

logger = logging.getLogger(__name__)

NEWSAPI_URL = "https://newsapi.org/v2/top-headlines"
GNEWS_URL = "https://gnews.io/api/v4/top-headlines"
MEDIASTACK_URL = "http://api.mediastack.com/v1/news"
HN_URL = "https://hn.algolia.com/api/v1/search"
RSS_FEEDS = {
    "TechCrunch": "https://techcrunch.com/feed/",
    "Ars Technica": "https://feeds.arstechnica.com/arstechnica/index",
}

TECH_KEYWORDS = {
    "ai",
    "artificial intelligence",
    "software",
    "hardware",
    "chip",
    "cloud",
    "open source",
    "developer",
    "startup",
    "robot",
    "quantum",
    "cyber",
    "security",
    "tech",
}


async def _fetch_newsapi(client: httpx.AsyncClient, api_key: str | None) -> list[dict[str, Any]]:
    if not api_key:
        logger.warning("NEWSAPI_KEY missing; skipping NewsAPI")
        return []

    try:
        response = await client.get(
            NEWSAPI_URL,
            params={
                "category": "technology",
                "language": "en",
                "pageSize": 10,
                "apiKey": api_key,
            },
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
        articles = data.get("articles", [])
    except Exception as exc:  # pragma: no cover - covered by warning assertion in tests
        logger.warning("NewsAPI fetch failed: %s", exc)
        return []

    normalized = []
    for article in articles:
        normalized.append(
            {
                "title": article.get("title") or "Untitled",
                "source": (article.get("source") or {}).get("name") or "NewsAPI",
                "url": article.get("url"),
                "published_at": article.get("publishedAt") or _ist_now_iso(),
            }
        )
    return normalized


async def _fetch_gnews(client: httpx.AsyncClient, api_key: str | None) -> list[dict[str, Any]]:
    if not api_key:
        logger.warning("GNEWS_KEY missing; skipping GNews")
        return []

    try:
        response = await client.get(
            GNEWS_URL,
            params={
                "category": "technology",
                "lang": "en",
                "token": api_key,
                "max": 10,
            },
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
        articles = data.get("articles", [])
    except Exception as exc:  # pragma: no cover - covered by warning assertion in tests
        logger.warning("GNews fetch failed: %s", exc)
        return []

    normalized = []
    for article in articles:
        source_name = "GNews"
        source = article.get("source")
        if isinstance(source, dict):
            source_name = source.get("name") or source_name
        normalized.append(
            {
                "title": article.get("title") or "Untitled",
                "source": source_name,
                "url": article.get("url"),
                "published_at": article.get("publishedAt") or _ist_now_iso(),
            }
        )
    return normalized


async def _fetch_mediastack(client: httpx.AsyncClient, api_key: str | None) -> list[dict[str, Any]]:
    if not api_key:
        logger.warning("MEDIASTACK_KEY missing; skipping MediaStack")
        return []

    try:
        response = await client.get(
            MEDIASTACK_URL,
            params={
                "access_key": api_key,
                "languages": "en",
                "categories": "technology",
                "limit": 10,
                "sort": "published_desc",
            },
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
        articles = data.get("data", [])
    except Exception as exc:  # pragma: no cover - covered by warning assertion in tests
        logger.warning("MediaStack fetch failed: %s", exc)
        return []

    normalized = []
    for article in articles:
        normalized.append(
            {
                "title": article.get("title") or "Untitled",
                "source": article.get("source") or "MediaStack",
                "url": article.get("url"),
                "published_at": article.get("published_at") or _ist_now_iso(),
            }
        )
    return normalized


def _is_tech_adjacent(title: str) -> bool:
    lowered = title.lower()
    return any(keyword in lowered for keyword in TECH_KEYWORDS)


async def _fetch_hn(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    try:
        response = await client.get(
            HN_URL,
            params={"tags": "front_page", "hitsPerPage": 10},
            timeout=15,
        )
        response.raise_for_status()
        hits = response.json().get("hits", [])
    except Exception as exc:  # pragma: no cover - covered by warning assertion in tests
        logger.warning("HN Algolia fetch failed: %s", exc)
        return []

    articles = []
    for hit in hits:
        title = hit.get("title") or hit.get("story_title") or "Untitled"
        if not _is_tech_adjacent(title):
            continue
        url = hit.get("url") or hit.get("story_url")
        if not url:
            continue
        articles.append(
            {
                "title": title,
                "source": "Hacker News",
                "url": url,
                "published_at": hit.get("created_at") or _ist_now_iso(),
            }
        )
    return articles


async def _fetch_rss() -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []

    for source_name, feed_url in RSS_FEEDS.items():
        try:
            feed = await asyncio.to_thread(feedparser.parse, feed_url)
        except Exception as exc:  # pragma: no cover - covered by warning assertion in tests
            logger.warning("RSS fetch failed for %s: %s", source_name, exc)
            continue

        for entry in feed.entries[:10]:
            title = entry.get("title", "Untitled")
            results.append(
                {
                    "title": title,
                    "source": source_name,
                    "url": entry.get("link"),
                    "published_at": _entry_published_iso(entry),
                }
            )

    return results


def _entry_published_iso(entry: dict[str, Any]) -> str:
    for key in ("published", "updated"):
        raw = entry.get(key)
        if raw:
            return str(raw)
    return _ist_now_iso()


def _ist_now_iso() -> str:
    return datetime.now(tz=ZoneInfo("Asia/Kolkata")).replace(microsecond=0).isoformat()


def _sort_key(article: dict[str, Any]) -> str:
    value = str(article.get("published_at", ""))
    return value


def deduplicate_articles(articles: list[dict[str, Any]]) -> list[dict[str, Any]]:
    deduped: dict[str, dict[str, Any]] = {}

    for article in articles:
        url = article.get("url")
        if not url:
            continue
        deduped[url] = article

    return list(deduped.values())


async def fetch_tech_news(
    newsapi_key: str | None,
    gnews_key: str | None,
    mediastack_key: str | None = None,
) -> list[dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        tasks = (
            _fetch_newsapi(client, newsapi_key),
            _fetch_gnews(client, gnews_key),
            _fetch_mediastack(client, mediastack_key),
            _fetch_hn(client),
            _fetch_rss(),
        )
        results = await asyncio.gather(*tasks, return_exceptions=True)

    aggregated: list[dict[str, Any]] = []
    for result in results:
        if isinstance(result, Exception):
            logger.warning("News source task failed: %s", result)
            continue
        aggregated.extend(result)

    unique_articles = deduplicate_articles(aggregated)
    sorted_articles = sorted(unique_articles, key=_sort_key, reverse=True)

    return sorted_articles[:20]
