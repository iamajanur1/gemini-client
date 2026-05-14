# Gemini Chat

A Vite + React chat client with saved local conversations and a Vercel serverless API route for Gemini.

## Setup

Create a local `.env` file:

```bash
GEMINI_API_KEY=your_google_ai_studio_key
VITE_GEMINI_API_KEY=your_google_ai_studio_key
```

`GEMINI_API_KEY` is used by the Vercel function in `api/chat.js`. `VITE_GEMINI_API_KEY` is only a local development fallback for `npm run dev`, where Vite does not run Vercel functions.

Optional:

```bash
GEMINI_MODEL=gemini-2.5-flash
VITE_GEMINI_MODEL=gemini-2.5-flash
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Deploy

In Vercel, add `GEMINI_API_KEY` to the project environment variables and redeploy. The browser calls `/api/chat`, so the production API key stays on the server.
