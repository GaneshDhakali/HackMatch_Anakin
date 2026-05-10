# ConnectIn / AntiGraqvity Project Guide

## Project Overview

**ConnectIn** is a React + Vite hackathon networking app built to help event attendees discover complementary collaborators. It uses:

- Frontend: React + Vite
- Backend API routes: serverless endpoints under `api/`
- Scraping: Anakin.io scrape API for GitHub profile markdown extraction
- AI insight: Groq / OpenAI-compatible chat completions for collaboration reasons

This document is a complete guide for continuing development in the `antigraqvity` direction.

---

## Folder Structure

```
.
├── api/
│   ├── generate-insight.js   # Groq-based chat completion endpoint
│   └── scrape.js             # Proxy to Anakin.io GitHub scraping API
├── src/
│   ├── App.jsx               # Main React app and matching logic
│   ├── index.css             # App styling
│   └── main.jsx              # React entry point
├── index.html                # Vite HTML template
├── package.json              # Dependencies + scripts
├── vite.config.js            # Vite config
└── README.md                 # Original project README
```

---

## Key Files and Responsibilities

### `src/App.jsx`

- Renders the main UI
- Accepts a GitHub profile URL from the user
- Calls `/api/scrape` to fetch scraped GitHub markdown
- Extracts profile info from scraped markdown using `extractProfile()`
- Generates a match list using `scoreMatch()`
- Sends `person1` and `person2` to `/api/generate-insight` for a one-sentence collaboration reason
- Handles fallback when scraping or AI insight fails

### `api/scrape.js`

- Server-side proxy for the Anakin.io scrape API
- Accepts `{ url }` in the request body
- Uses `process.env.ANAKIN_KEY`
- Requests `format: 'markdown'` and `useBrowser: true`

### `api/generate-insight.js`

- Server-side Groq/OpenAI completion endpoint
- Accepts `{ person1, person2 }` in the request body
- Uses `process.env.GROQ_API_KEY`
- Calls Groq's `chat/completions` endpoint with model `llama3-8b-8192`
- Returns `insight` or an error message

### `package.json`

- Project is `type: module`
- Uses React 18 and Vite 5
- Dev dependency: `@vitejs/plugin-react`
- Scripts:
  - `npm install`
  - `npm run dev`
  - `npm run build`
  - `npm run preview`

### `vite.config.js`

- Standard Vite config with React plugin

---

## Environment Variables

Create a `.env.local` file in the project root with the following values:

```env
ANAKIN_KEY=your_anakin_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### What each key does

- `ANAKIN_KEY`
  - Used by `api/scrape.js`
  - Sent to `https://api.anakin.io/v1/scrape`
  - Required for LinkedIn/GitHub scraping and profile extraction

- `GROQ_API_KEY`
  - Used by `api/generate-insight.js`
  - Sent to `https://api.groq.com/openai/v1/chat/completions`
  - Used for AI-generated match insights

> Do not commit `.env.local` or any secret values to source control.

---

## App Flow

1. User enters a GitHub profile URL in the UI
2. Frontend calls `POST /api/scrape`
3. `api/scrape.js` forwards the request to Anakin.io
4. Anakin returns profile markdown
5. `App.jsx` extracts structured profile data from markdown
6. The app compares the user's profile against demo attendees
7. The app sorts and displays top collaborator matches
8. For each match, the app may call `POST /api/generate-insight`
9. `api/generate-insight.js` calls Groq/OpenAI to get a short reason

---

## Deployment

### Local development

```bash
npm install
npm run dev
```

In development, Vite serves the React app and `api/` routes with Vite's serverless support.

### Production build

```bash
npm run build
npm run preview
```

### Deploy to Vercel

```bash
npx vercel --prod
```

If deploying to Vercel, make sure to add the environment variables in Vercel dashboard:

- `ANAKIN_KEY`
- `GROQ_API_KEY`

If you use another host, ensure the host supports serverless functions or edge functions for the `api/` routes.

---

## AntiGraqvity Development Notes

### What to improve next

- Replace hard-coded `DEMO_PROFILES` with a real attendee pool from a database or event roster
- Add real LinkedIn scraping support for event profiles
- Improve profile extraction rules to detect roles, companies, locations, and skills more accurately
- Add rate limiting and caching for API calls
- Replace the deprecated Groq model with a supported model
- Add tests for endpoint behavior and profile extraction logic

### Current known issue

The current AI endpoint uses a deprecated Groq model:

```text
Grok error: {"error":{"message":"The model `llama3-8b-8192` has been decommissioned and is no longer supported. Please refer to https://console.groq.com/docs/deprecations for a recommendation on which model to use instead.","type":"invalid_request_error","code":"model_decommissioned"}}
```

---

## Start Prompt for AntiGraqvity Fixes

Use this prompt when you begin the next development sprint or when updating the Groq model:

```text
Start prompt:

I am working on the ConnectIn hackathon networking app built with React, Vite, and serverless API routes. The app scrapes GitHub profiles using Anakin.io and generates match insights with Groq. Right now, the Groq model `llama3-8b-8192` is decommissioned and produces this error:

Grok error: {"error":{"message":"The model `llama3-8b-8192` has been decommissioned and is no longer supported. Please refer to https://console.groq.com/docs/deprecations for a recommendation on which model to use instead.","type":"invalid_request_error","code":"model_decommissioned"}}

Please update the code to use a supported Groq model, maintain the existing one-sentence match insight behavior, and keep the Anakin scrape flow intact. Also document the new environment variable usage, deployment steps, and any breaking changes.
```

---

## Recommended fix for the Groq error

Update `api/generate-insight.js` to use a supported model, such as `llama3-small` or another current Groq model.

Example replacement:

```js
model: 'llama3-small',
```

Then redeploy with the new `GROQ_API_KEY` set in the production environment.

---

## Important Notes

- `src/App.jsx` currently expects GitHub URLs only (`github.com/`)
- `api/scrape.js` is a server-side proxy and does not expose the API key to the browser
- `api/generate-insight.js` is also server-side and protects `GROQ_API_KEY`
- Any development of `antigraqvity` should preserve this API key separation and keep secret values in `.env.local`

---

## Quick Command Reference

```bash
npm install
npm run dev
npm run build
npm run preview
npx vercel --prod
```

---

## Useful URLs

- Vite docs: https://vitejs.dev/
- React docs: https://react.dev/
- Groq docs: https://console.groq.com/docs/
- Anakin API docs: https://api.anakin.io/

---

## Summary

This project is a lightweight React networking assistant with two serverless backend routes:

- `api/scrape.js` → profile scraping via Anakin
- `api/generate-insight.js` → AI insights via Groq

For AntiGraqvity development, focus on model replacement, profile extraction accuracy, attendee data persistence, and production-ready deployment.
