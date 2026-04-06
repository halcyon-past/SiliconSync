# SiliconSync

SiliconSync is a fully automated, daily tech news blog that provides "Neon Noir" editorial summaries. It operates as a **Serverless Static Site**: a Python pipeline fetches news, summarizes it using Gemini, generates AI-powered hero images, and saves the data directly into the frontend's static directory.

![SiliconSync Screenshot Placeholder](assets/SiliconSyncBanner.png)

## Project Overview

- **Frontend:** Vite + React (Static distribution)
- **Pipeline:** Python 3.11+ (Data generation)
- **AI Engine:** Google Gemini (`gemini-2.0-flash`) via `google-genai`
- **Architecture:** Static JSON-based "database" (No running API server required)
- **Automation:** GitHub Actions (`daily-news.yml` for content, `cleanup.yml` for history)
- **Design:** "Neon Noir" / Cyberpunk aesthetic with CSS animations

## Repository Structure

```text
.
├── .github/workflows/   # Automated daily content generation
├── backend/
│   ├── news_fetcher.py # Aggregates from NewsAPI, HN, GNews
│   ├── summarizer.py    # Gemini 2.0 Flash logic
│   ├── image_generator.py # AI-powered hero image generation
│   ├── publisher.py     # Main entry point for the daily flow
│   └── requirements.txt
├── frontend/
│   ├── src/            # React components and styling
│   ├── public/         # STATIC DATA STORE (JSON + Images)
│   │   ├── data/       # Daily news JSON files
│   │   └── assets/     # Generated hero images
│   └── package.json
└── README.md
```

## Environment Variables

Set these in a `backend/.env` file and as GitHub repository secrets:

- `GEMINI_API_KEY` - Google AI Studio key: [aistudio.google.com](https://aistudio.google.com)
- `NEWSAPI_KEY` - NewsAPI Key: [newsapi.org](https://newsapi.org)
- `GNEWS_KEY` - GNews Key: [gnews.io](https://gnews.io)
- `MEDIASTACK_KEY` - Optional fallback: [api.mediastack.com](https://mediastack.com)

## Local Development Setup

### 1. Daily Pipeline (Data Generation)

The "backend" is now a CLI tool that updates the frontend data:

```bash
# Setup environment
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Run the daily update (Generates files in frontend/public/data)
python backend/publisher.py
```

### 2. Frontend

The frontend is a static React app that reads the generated JSON files:

```bash
cd frontend
npm install
npm run dev
```

## Deployment

1. **GitHub Actions:** The `daily-news.yml` workflow runs every day at 01:30 UTC. It generates the new post and commits it directly to the repository.
2. **Static Hosting:** Simply point your host (GitHub Pages, Vercel, Netlify) to the `frontend/` directory. No API server or database setup is required.

## GitHub Secrets Setup

1. Go to repository `Settings` -> `Secrets and variables` -> `Actions`.
2. Add the following secrets:
	- `GEMINI_API_KEY`
	- `NEWSAPI_KEY`
	- `GNEWS_KEY`
	- `MEDIASTACK_KEY` (optional)

## Pipeline Flow (Daily)

`daily-news.yml` runs at `01:30 UTC`:

1. Checks out code and sets Python 3.11.
2. Installs backend dependencies.
3. Runs `python backend/publisher.py`.
4. `publisher.py`:
	- fetches and merges tech news from multiple providers,
	- summarizes with Gemini 2.0 Flash,
	- generates an AI-powered hero image (with SVG fallback),
	- writes to `frontend/public/data/YYYY-MM-DD.json` and updates `index.json`.
5. Workflow commits and pushes generated files back to the repo.
