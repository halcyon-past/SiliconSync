from __future__ import annotations

import json
import logging
from datetime import date
from typing import Any

from google import genai

logger = logging.getLogger(__name__)


def _prompt(articles: list[dict[str, Any]], target_date: date) -> str:
    articles_json = json.dumps(articles, indent=2)
    return f"""You are a tech journalist writing for a sophisticated audience.

Based on the following {len(articles)} tech news articles from {target_date.isoformat()}, write a comprehensive 4-6 paragraph blog post summary.

Guidelines:
- Open with a compelling hook about the biggest story
- Group related themes together (AI, hardware, software, industry moves)
- Write in an engaging editorial voice - not a listicle
- End with a brief forward-looking paragraph on what to watch next
- Generate a punchy 6-8 word headline that captures the day's theme

Return a JSON object with keys: "headline", "summary", and "image_prompt" (a concise, descriptive prompt for generating an image related to the news).

Articles:
{articles_json}
"""


def parse_summary_response(raw_text: str) -> dict[str, str]:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()

    data = json.loads(cleaned)
    headline = str(data.get("headline", "")).strip()
    summary = str(data.get("summary", "")).strip()
    image_prompt = str(data.get("image_prompt", f"Tech news: {headline}")).strip()

    if not headline or not summary:
        raise ValueError("Gemini response missing headline or summary")

    return {"headline": headline, "summary": summary, "image_prompt": image_prompt}


def summarize_articles(
    api_key: str,
    articles: list[dict[str, Any]],
    target_date: date,
    model_name: str = "gemini-2.0-flash",
) -> dict[str, str]:
    if not articles:
        raise ValueError("No articles provided for summarization")

    client = genai.Client(api_key=api_key)
    prompt = _prompt(articles=articles, target_date=target_date)

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
    )

    text = response.text

    if not text:
        logger.error("Gemini returned empty response")
        raise RuntimeError("Gemini returned empty response")

    return parse_summary_response(text)
