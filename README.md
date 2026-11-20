# heat

Personal website featuring live Discord presence, Last.fm plays, Letterboxd recent films, and an X profile card.

## Cards & Integrations

| Card | Source | Details |
| --- | --- | --- |
| **Discord** | Lanyard WebSocket | Live presence, avatar, activity, and custom status |
| **Last.fm** | Last.fm API | Currently playing track or recent scrobble with cover art; fallback rotation |
| **Letterboxd** | RSS feed parser | Last 4 logged diary entries, star ratings, and posters |
| **X (Twitter)** | Static / local | Profile card with local avatar and banner assets |
| **Snowfall** | Canvas overlay | Toggleable winter snow particle effect |

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** Radix UI / shadcn/ui
- **Animation:** Framer Motion

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `LASTFM_API_KEY` | Optional | API key from Last.fm to fetch live scrobbles and now-playing tracks |
| `LASTFM_USERNAME` | Optional | Last.fm handle (defaults to `siteConfig.socials.lastfm.handle`) |
| `LETTERBOXD_USERNAME` | Optional | Letterboxd handle (defaults to `siteConfig.socials.letterboxd.handle`) |

If `LASTFM_API_KEY` is not provided, the Last.fm card falls back to the static tracks defined in `src/config/site.ts`.

### 3. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### 4. Build for production

```bash
pnpm build
pnpm start
```

### 5. Docker

```bash
docker compose up -d --build
```

Runs on port `3000` by default (override with `PORT=3001 docker compose up -d --build`) and automatically loads `.env` if present.

## Customization

- **Site metadata & profile links:** Edit `src/config/site.ts` to update your Discord user ID, handles, fallback tracks, and recent films.
- **X card images:** Replace `public/x/avatar.jpg` and `public/x/banner.jpg` with your own images.
