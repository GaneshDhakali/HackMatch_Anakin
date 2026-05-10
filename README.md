# Hackathon Networking Assistant
> Built at the Anakin.io Mini-Hackathon, Bangalore · 10 May 2026

Find your best collaborators at any event — instantly.

## How it works
1. Attendee pastes their LinkedIn URL + Anakin API key
2. Anakin Browser Session scrapes their public profile
3. Skills, interests, and experience are extracted
4. AI matches them with other attendees by complementary skills + shared interests
5. Top 3 matches shown with reasons why

## Tech
- React + Vite (frontend)
- Anakin.io Scrape API with `useBrowser: true` (LinkedIn scraping)
- Matching algorithm: complementary skills + shared interests scoring

## Deploy in 2 minutes

```bash
npm install
npm run dev          # local dev
npm run build        # production build
```

Deploy to Vercel:
```bash
npx vercel --prod
```

## Anakin API usage
```js
fetch('https://api.anakin.io/scrape', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${ANAKIN_KEY}` },
  body: JSON.stringify({
    url: linkedinUrl,
    format: 'markdown',
    useBrowser: true   // required for LinkedIn JS rendering
  })
})
```

## Rules compliance
- ✅ Solo build
- ✅ New code written today
- ✅ Anakin in the critical path (Browser Session for LinkedIn scraping)
- ✅ Public repo ready
