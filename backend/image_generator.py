from __future__ import annotations

import mimetypes
import os
from datetime import date
from pathlib import Path
from google import genai
from google.genai import types

PALETTE = [
    "#00d4ff",
    "#ff6b35",
    "#8aff80",
    "#ffd166",
    "#7b9cff",
    "#ff7ac6",
]


def _seed_from_date(target_date: date) -> int:
    return int(target_date.strftime("%Y%m%d"))


def _accent_color(target_date: date) -> str:
    return PALETTE[_seed_from_date(target_date) % len(PALETTE)]


def generate_svg_content(target_date: date, headline: str) -> str:
    accent = _accent_color(target_date)
    date_text = target_date.isoformat()

    lines = []
    for x in range(0, 1201, 80):
        lines.append(f'<line x1="{x}" y1="0" x2="{x}" y2="400" stroke="#1d1d2a" stroke-width="1" />')
    for y in range(0, 401, 80):
        lines.append(f'<line x1="0" y1="{y}" x2="1200" y2="{y}" stroke="#1d1d2a" stroke-width="1" />')

    decorative = """
      <g opacity="0.35">
        <circle cx="140" cy="80" r="8" fill="{accent}" />
        <circle cx="1040" cy="120" r="6" fill="{accent}" />
        <polygon points="980,290 1020,270 1060,290 1060,335 1020,355 980,335" fill="none" stroke="{accent}" stroke-width="2" />
        <line x1="220" y1="300" x2="420" y2="230" stroke="{accent}" stroke-width="2" />
      </g>
    """.format(accent=accent)

    return f"""<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"400\" viewBox=\"0 0 1200 400\">
  <defs>
    <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">
      <stop offset=\"0%\" stop-color=\"#090b12\" />
      <stop offset=\"100%\" stop-color=\"#121624\" />
    </linearGradient>
    <filter id=\"glow\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\">
      <feGaussianBlur stdDeviation=\"3\" result=\"blur\" />
      <feMerge>
        <feMergeNode in=\"blur\" />
        <feMergeNode in=\"SourceGraphic\" />
      </feMerge>
    </filter>
  </defs>

  <rect width=\"1200\" height=\"400\" fill=\"url(#bg)\" />
  <g>{''.join(lines)}</g>
  {decorative}

  <rect x=\"80\" y=\"70\" width=\"1040\" height=\"260\" rx=\"16\" fill=\"rgba(0,0,0,0.24)\" stroke=\"#22263a\" />
  <text x=\"110\" y=\"120\" fill=\"{accent}\" font-size=\"20\" font-family=\"'JetBrains Mono', 'SFMono-Regular', monospace\" filter=\"url(#glow)\">{date_text}</text>
  <text x=\"110\" y=\"195\" fill=\"#ecf1ff\" font-size=\"56\" font-family=\"'Bebas Neue', 'Arial Narrow', sans-serif\">SILICONSYNC</text>
  <text x=\"110\" y=\"250\" fill=\"#d4d9eb\" font-size=\"34\" font-family=\"'DM Sans', 'Segoe UI', sans-serif\">{headline}</text>
</svg>
"""


def generate_header_image(
    target_date: date,
    headline: str,
    output_dir: Path,
    image_prompt: str | None = None,
    api_key: str | None = None,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Try to generate an image with Gemini 2.x Flash Image if prompt and API key are provided
    if image_prompt and api_key:
        try:
            client = genai.Client(api_key=api_key)
            model_id = "gemini-2.5-flash-image"
            
            # Using basic generation without strict response_modalities
            # to let the model decide the best output format for the cartoon prompt
            tech_context = f"Topic: {image_prompt}"
            visual_style = (
                "Style: Vibrant cartoonish digital art with a heavy cyberpunk aesthetic. "
                "Atmosphere: Neon-noir, electric blues and magentas, glowing circuits and holograms. "
                "Details: Include an artistic 'SiliconSync' stylized logo integrated into the scene. "
                "Composition: Wide cinematic shot, high detail, playful but high-tech."
            )
            final_prompt = f"{tech_context}. {visual_style}. Please output an image."
            
            for chunk in client.models.generate_content_stream(
                model=model_id,
                contents=final_prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                ),
            ):
                if chunk.parts:
                    for part in chunk.parts:
                        if part.inline_data and part.inline_data.data:
                            inline_data = part.inline_data
                            file_extension = mimetypes.guess_extension(inline_data.mime_type) or ".png"
                            file_path = output_dir / f"{target_date.isoformat()}{file_extension}"
                            file_path.write_bytes(inline_data.data)
                            return file_path
        except Exception as e:
            print(f"Failed to generate AI image: {e}. Falling back to SVG.")

    # Fallback to SVG
    file_path = output_dir / f"{target_date.isoformat()}.svg"
    file_path.write_text(generate_svg_content(target_date, headline), encoding="utf-8")
    return file_path
