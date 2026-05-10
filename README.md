# HackMatch — Conference Networking Assistant

> Built at the Anakin.io Mini-Hackathon, Bangalore · 10 May 2026
> **Live URL:** https://gitdate.vercel.app

HackMatch is an AI-powered networking assistant that helps hackathon attendees instantly find their best collaborators. Paste a GitHub URL → Anakin scrapes the profile → skills and interests are extracted → attendees are matched by complementary skills → Groq AI writes a personalized one-sentence reason to connect.

---

## How it works

1. Paste your GitHub profile URL
2. Anakin's Browser Session API scrapes and analyzes your profile
3. Skills, projects, interests and experience are extracted from the markdown
4. A scoring algorithm matches you against other attendees based on complementary skills and shared interests
5. Groq AI generates a personalized one-sentence reason why two people should collaborate
6. Your top 3 best matches are shown instantly

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS — dark glassmorphism, animations |
| Profile Scraping | Anakin Universal Scraper API |
| AI Match Insights | Groq API (`llama-3.3-70b-versatile`) |
| Serverless Backend | Vercel API routes (`/api/`) |
| Deployment | Vercel |

---

## Project Structure

```
HackMatch/
├── src/
│   ├── App.jsx               # All React UI + business logic
│   └── index.css             # Full dark theme design system
├── api/
│   ├── scrape.js             # Serverless proxy → Anakin scrape API
│   └── generate-insight.js  # Serverless proxy → Groq AI API
├── index.html
├── package.json
├── vite.config.js
└── .env.local                # Local secrets (gitignored)
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
ANAKIN_KEY=your_anakin_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

| Variable | Purpose |
|---|---|
| `ANAKIN_KEY` | Authenticates the Anakin scraper API |
| `GROQ_API_KEY` | Authenticates the Groq AI API (free tier) |

> Never commit `.env.local` to source control. Both keys are secured via Vercel environment variables in production.

---

## Key Features

### GitHub Profile Scraping — `/api/scrape.js`
- Client POSTs a GitHub URL to `/api/scrape`
- Serverless function proxies the request to Anakin's Universal Scraper API
- `useBrowser: true` handles JS-rendered GitHub pages
- Returns scraped content as clean markdown
- API key never exposed to the browser

### Profile Extraction — `extractProfile()`
Parses raw GitHub markdown to extract:
- Name, username, bio, org, location
- Skills — matched against 35 known technologies
- Interests — matched against 18 interest categories

### Match Scoring — `scoreMatch()`
Deterministic scoring — same inputs always produce the same score:
- Base score: `40`
- `+15` per shared interest
- `+8` per shared skill
- `+10` per complementary skill (frontend ↔ backend pairing)
- Max cap: `98`

### AI Match Insights — `/api/generate-insight.js`
- Calls Groq API with `llama-3.3-70b-versatile`
- Sends both profiles: name, org, skills, location
- Returns a one-sentence personalized collaboration reason
- All 3 insights fetched in parallel via `Promise.all`

### Anakin API Usage

```js
fetch('https://api.anakin.io/scrape', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${ANAKIN_KEY}` },
  body: JSON.stringify({
    url: githubUrl,
    format: 'markdown',
    useBrowser: true   // required for JS-rendered GitHub pages
  })
})
```

---

## End-to-End Flow

```
User enters GitHub URL → clicks "Analyze & Join"
        ↓
POST /api/scrape → Anakin API → markdown response
        ↓
extractProfile() → { name, username, bio, org, location, skills, interests }
        ↓
scoreMatch() vs all attendees → top 3 sorted by score
        ↓
POST /api/generate-insight × 3 (parallel) → Groq AI → insight string
        ↓
setMatches() → setTab('matches') → user sees match cards
```

---

## Local Development

```bash
npm install
vercel dev       # runs frontend + /api/ routes locally
```

> Use `vercel dev` instead of `npm run dev` to test the serverless API routes locally.

## Production Build & Deploy

```bash
npm run build
vercel --prod
```

Add environment variables to Vercel:

```bash
vercel env add ANAKIN_KEY
vercel env add GROQ_API_KEY
```

---

## Progress Checklist

- [x] React + Vite project setup
- [x] Dark glassmorphism UI design
- [x] GitHub profile URL input and validation
- [x] Anakin scraper integration (serverless proxy)
- [x] GitHub markdown profile extraction
- [x] Deterministic match scoring algorithm
- [x] Demo attendee pool (7 profiles)
- [x] Groq AI insight generation (free tier)
- [x] Parallel AI fetching with `Promise.all`
- [x] Auto-tab switch to matches after joining
- [x] Rich match cards with AI insight
- [x] API keys secured via Vercel env vars
- [x] Deployed to Vercel production
- [ ] Real-time shared attendee pool (currently in-memory per session)
- [ ] Persistent attendee database
- [ ] Team formation and connection request feature

---

## Hackathon Rules Compliance

- ✅ Solo build
- ✅ New code written on the day
- ✅ Anakin in the critical path (Browser Session for GitHub scraping)
- ✅ Public repo
- ✅ Deployed live on Vercel

---

*Built by Ganesh Dhakali at the Anakin.io Mini-Hackathon, Bangalore · 10 May 2026*