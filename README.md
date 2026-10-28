# Doc Decoder

## The Problem
While building full-stack applications, I constantly hit roadblocks reading official documentation. Frameworks often use dense, academic jargon that takes 20 minutes to decipher just to implement a basic feature. I waste time parsing these docs instead of actually writing code, and I know other student developers face this exact same friction.

## What It Does
Doc Decoder takes confusing technical documentation as input and uses AI to transform it into a simple, 5th-grade reading level explanation, accompanied by a real-world, everyday analogy. This allows developers to instantly grasp complex concepts and get back to building.

## AI Integration
**API:** OpenRouter
**Model:** openai/gpt-4o-mini
**Location:** `backend/server.js` → `app.post('/api/simplify')` route
**What the AI does:** Translates dense technical text into a simplified explanation and a practical analogy based on a strict system prompt.

## What I Intentionally Excluded
1. **User Authentication:** I excluded login functionality because the core value of the tool is instant translation. Forcing users to create an account would add unnecessary friction to a tool meant to save time.
2. **Database/History:** I chose not to save past translations to a database. The tool is session-based to keep the architecture lightweight, as reading old documentation explanations is rarely needed once the concept is understood.

## Monthly Cost Calculation
Model: openai/gpt-4o-mini
Input: $0.15 per 1M tokens
Output: $0.60 per 1M tokens
Avg tokens per call: ~600 input + ~400 output
Cost per call: $0.000090 + $0.000240 = $0.000330
Expected calls/month: 300
**Monthly total: 300 × $0.000330 = $0.099 (~$0.10/month)**

## Live Deployment
**Frontend:** [Insert your GitHub Pages URL here]
**Backend:** [Insert your Render URL here]