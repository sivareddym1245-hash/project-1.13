# Doc Decoder

## The problem

While building full-stack projects, I kept getting stuck on official technical documentation written in dense, unfamiliar language. I could spend around 20 minutes unpacking a page just to understand one feature, instead of getting back to building. Doc Decoder is for student developers and other builders who run into the same wall: paste the confusing passage and get a beginner-friendly explanation plus an everyday analogy.

## What it does

The browser sends the pasted documentation to the Express API. The backend asks an AI model to explain the concept accurately in plain language and provide a practical analogy, then sends the result back. It does not save submitted documentation.

## AI integration

- **Provider:** OpenRouter
- **Model:** `openai/gpt-4o-mini`
- **API call:** `backend/server.js`, inside the `/api/simplify` route created by `createApp()`
- **Key handling:** `OPENROUTER_API_KEY` is read from the backend environment only. The frontend calls the Express API and contains no AI endpoint or key.

## What I intentionally excluded

- **Accounts:** The core interaction should be immediate; sign-in would add friction without helping explain the pasted text.
- **Saved history and a database:** Explanations are useful in the moment, and storing documentation would introduce privacy and maintenance costs.
- **A general-purpose chat interface:** The product stays focused on translating documentation into an explanation and analogy.

## Monthly cost calculation

Estimate based on the listed model rates and an average request:

```text
Model: openai/gpt-4o-mini
Input token rate: $0.15 per 1 million tokens
Output token rate: $0.60 per 1 million tokens
Average tokens per call: ~600 input + ~400 output
Input cost: 600 / 1,000,000 × $0.15 = $0.000090
Output cost: 400 / 1,000,000 × $0.60 = $0.000240
Cost per call: $0.000090 + $0.000240 = $0.000330
Expected monthly calls: 300
Monthly total: 300 × $0.000330 = $0.099 (~$0.10/month)
```

This estimate covers model tokens only; hosting, taxes, and any provider pricing changes are excluded.

## Project layout

```text
backend/
  server.js              Express API, validation, and server-side model request
  .env.example           Environment variable template (never put real keys here)
  test/server.test.js    API tests with a mocked provider
frontend/
  index.html             Accessible input and result interface
  script.js              Calls only the Doc Decoder backend
  style.css              Responsive presentation
```

## Run locally

Requirements: Node.js 20 or later.

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Add your own OpenRouter key to `backend/.env`, then run:

```powershell
npm start
```

Serve `frontend/` with any static file server. For local development, set `BACKEND_URL` in `frontend/script.js` to `http://localhost:3000`. Do not commit `.env`; the root `.gitignore` excludes it. The API health check is `GET http://localhost:3000/health`.

Run backend tests with `cd backend; npm test`. Tests use a mocked AI provider and do not require a key or make external AI calls.

## Deployment

- **Frontend:** [https://siva-project-1-13.netlify.app](https://siva-project-1-13.netlify.app)
- **Backend:** [https://project-1-13-ciea.onrender.com](https://project-1-13-ciea.onrender.com)
- **Health check:** [https://project-1-13-ciea.onrender.com/health](https://project-1-13-ciea.onrender.com/health)

The backend service is configured to run from `backend/` with `npm install` and `npm start`; set `OPENROUTER_API_KEY` as a Render environment variable. The frontend is a static site; keep its `BACKEND_URL` pointed at the Render service.

Before sharing the live demo, redeploy the latest commit and confirm both URLs are publicly accessible. The current Netlify deployment returned an access-protection response during verification; disable site/team access protection for public assessment. The Render deployment did not yet expose `/health`; redeploy this backend version before treating the endpoint as live.
