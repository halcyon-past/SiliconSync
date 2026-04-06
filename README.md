# SiliconSync

SiliconSync is a fully automated, daily tech news blog that provides "Neon Noir" editorial summaries. It operates as a **Serverless Static Site**: a Python pipeline fetches news, summarizes it using Gemini, generates AI-powered hero images, and saves the data directly into the frontend's static directory. All date and time operations are configured for **Indian Standard Time (IST - Asia/Kolkata)**.

![SiliconSync Screenshot Placeholder](assets/SiliconSyncBanner.png)

## Project Overview

- **Frontend:** Vite + React (Static distribution)
- **Pipeline:** Python 3.11+ (Data generation)
- **AI Engine:** Google Gemini (`gemini-2.5-flash` for text, `gemini-2.5-flash-image` for images) via `google-genai`
- **Architecture:** Static JSON-based "database" (No running API server required)
- **Timezone:** Fully localized to IST (`Asia/Kolkata`)
- **Automation:** GitHub Actions (`daily-news.yml` for content, `cleanup.yml` for history)
- **Design:** "Neon Noir" / Cyberpunk aesthetic with CSS animations

## Repository Structure

```text
.
├── .github/workflows/   # Automated daily content & cleanup generation
├── backend/
│   ├── news_fetcher.py  # Aggregates from NewsAPI, HN, GNews, MediaStack, RSS
│   ├── summarizer.py    # Gemini 2.5 Flash logic
│   ├── image_generator.py # AI-powered hero image generation (or SVG fallback)
│   ├── publisher.py     # Main entry point for the daily flow
│   ├── cleanup.py       # Deletes posts older than 90 days
│   └── requirements.txt
├── frontend/
│   ├── src/             # React components and styling
│   ├── public/          # STATIC DATA STORE (JSON + Images)
│   │   ├── data/        # Daily news JSON files & index
│   │   └── assets/      # Generated hero images
│   └── package.json
└── README.md
```

## Environment Variables

Set these in a `backend/.env` file and as GitHub repository secrets:

- `GEMINI_API_KEY` - Google AI Studio key: [aistudio.google.com](https://aistudio.google.com) (Required)
- `FALLBACK_GEMINI_API_KEY` - Alternative Google AI Studio key to handle quota limits (Optional)
- `NEWSAPI_KEY` - NewsAPI Key: [newsapi.org](https://newsapi.org) (Optional)
- `GNEWS_KEY` - GNews Key: [gnews.io](https://gnews.io) (Optional)
- `MEDIASTACK_KEY` - MediaStack Key: [api.mediastack.com](https://mediastack.com) (Optional)

## Local Development Setup

### 1. Daily Pipeline (Data Generation)

The "backend" is a CLI tool that updates the frontend data dynamically.

```bash
# Setup environment
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Run the daily update (Generates files in frontend/public/data and frontend/public/assets)
python backend/publisher.py

# Run the cleanup script (Deletes files older than 90 days)
python backend/cleanup.py
```

### 2. Frontend

The frontend is a static React app that reads the generated JSON files:

```bash
cd frontend
npm install
npm run dev
```

## Deployment

1. **GitHub Actions:** Workflows automatically run to generate the new post based on IST and commit it directly to the repository.
2. **Static Hosting:** Simply point your host (GitHub Pages, Vercel, Netlify) to the `frontend/` directory. No API server or database setup is required.

## Pipeline Flow (Daily)

1. Checks out code and sets Python.
2. Installs backend dependencies.
3. Runs `python backend/publisher.py`.
4. `publisher.py`:
        - Fetches and merges tech news from multiple providers (NewsAPI, HN, GNews, MediaStack, RSS).
        - Summarizes with Gemini 2.5 Flash.
        - Generates an AI-powered hero image using Gemini 2.5 Flash Image (with an automatic SVG generation fallback).
        - Writes to `frontend/public/data/YYYY-MM-DD.json` automatically formatted to IST and updates `index.json`.
5. Workflow commits and pushes generated files back to the repo.
6. The `cleanup.py` script automatically prunes data older than 90 days.
