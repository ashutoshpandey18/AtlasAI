# Atlas AI

> AI Copilot for Location Intelligence

**Live Demo:** https://atlas-ai-1.vercel.app

**GitHub:** https://github.com/ashutoshpandey18/AtlasAI


---

Atlas AI is an AI Copilot for Location Intelligence built on top of the Mireye API.

It helps businesses evaluate candidate sites and make faster, more informed location decisions using trusted geospatial intelligence.

Instead of exposing hundreds of geospatial attributes, Atlas AI transforms trusted location intelligence into clear, explainable business decisions.

It helps organizations evaluate candidate locations for projects such as:


- Battery factories
- Warehouses and logistics hubs
- Solar farms
- Wind farms
- EV charging pads
- Hospitals
- Retail stores
- Manufacturing facilities

---

## Features

**Analysis**
- Compare up to 5 candidate sites in a single campaign
- Each location receives a 0–100 suitability score based on project-specific criteria
- Site-Shifting engine suggests coordinate adjustments when a constraint lowers a score, then re-scores automatically

**Copilot**
- Ask natural language questions about any site
- The Copilot responds with answers grounded in live Mireye location intelligence
- Answers are fact-driven; the LLM explains but never invents location data

**Reporting**
- AI-generated executive summary in plain language
- Scores and recommendations surfaced with provenance references
- The landing page Report Builder demonstrates the output format with pre-seeded scenarios

**Campaigns**
- Campaigns persist to a cloud database across sessions
- Each campaign supports multiple candidate locations and use cases

---

## Why Atlas AI?

Traditional GIS tools are built for analysts.

Atlas AI is built for decision makers.

Users shouldn't need to interpret hundreds of geospatial attributes. They should receive clear recommendations, understand the trade-offs, and confidently decide where to build.

This is the core product philosophy behind every decision we made.

---

## Why Mireye?

Google Maps answers:

> "How do I get there?"

Mireye answers:

> "What is true about this location?"

Atlas AI answers:

> "Should I build here?"

Mireye provides structured, provenance-backed geospatial intelligence. Atlas AI builds the decision layer on top of that intelligence.

---

## Architecture

```
User
  ↓
Atlas AI (Campaign Workspace)
  ↓
Mireye API
(Trusted Location Intelligence)
  ↓
Business Rules
(Project Evaluation)
  ↓
LLM — Groq
(Explanation Layer)
  ↓
Recommendation
```

- **Mireye** provides trusted, provenance-backed location intelligence.
- **Business Rules** evaluate that data against project-specific requirements deterministically.
- **The LLM** explains the results in plain language any decision maker can act on.

---

## How It Works

```
User describes what they want to build
  ↓
Atlas AI collects project requirements
  ↓
Mireye returns structured location intelligence
  ↓
Atlas AI evaluates candidate locations
  ↓
Business rules calculate a suitability score (0–100)
  ↓
LLM generates plain-language explanations
  ↓
Executive-ready report with provenance
```

Key capabilities:

- **Multi-location comparison** — evaluate up to 5 candidate sites side by side.
- **Siting Copilot** — ask natural language questions about any site and receive fact-grounded answers.
- **Smart Site-Shifting** — if a site scores low due to a constraint (e.g., a conservation easement), the engine suggests coordinate shifts to bypass it and re-scores automatically.
- **Provenance surfaced** — sources are cited in the campaign's Citations section so decision makers can trace and defend the recommendation.

---

## Product Decisions

Several design decisions intentionally shaped Atlas AI.

- Decision-first interface instead of GIS layers.
- Explainable recommendations instead of opaque scores.
- Multi-location comparison instead of isolated analysis.
- AI assists interpretation but never invents location facts.
- Provenance surfaced wherever available to increase trust.
- Business logic remains deterministic; AI explains rather than decides.

---

## Demo Experience

The landing page contains a guided simulation that demonstrates the Atlas AI Siting Copilot workflow for first-time visitors.

Launching the workspace switches the application into live mode, where every analysis is powered by real Mireye API responses.

---

## Mireye API Integration

We integrated two core endpoints from the **Mireye Coordinate API**:

### `/v1/fetch` — Decision Intelligence Engine
- **What it does**: Returns structured location intelligence for any coordinate in a single call.
- **Why it matters**: Powers our scoring engine. The returned data is evaluated against project-specific criteria to calculate a 0–100 suitability index.

### `/v1/ask` — Siting Copilot Chat
- **What it does**: Answers natural language questions about a location using Mireye-powered location intelligence.
- **Why it matters**: Powers the interactive AI assistant. Instead of reading raw maps, users ask questions in plain English and get instant, grounded answers.

---

## What We Learned

Building Atlas AI reinforced one important idea:

Location intelligence becomes significantly more valuable when it is translated into decisions rather than presented as raw geospatial data.

That insight shaped every product decision we made throughout the project.

### Feedback for Mireye

1. **Batch Fetching**: Siting is fundamentally about comparing locations. An endpoint that fetches data for multiple coordinates in a single call would make multi-site comparisons significantly faster.
2. **Data Freshness**: A "Last Updated" timestamp on returned data would help teams understand whether they are working with current records.
3. **Obstruction Context**: Proximity is useful, but knowing whether a physical barrier (like a river or private land) exists between a site and a nearby asset would prevent real-world planning errors.

---

## How to Run the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Your Keys
Create a `.env.local` file in the root folder and add:
```env
MIREYE_API_TOKEN=your_mireye_api_token
GROQ_API_KEY=your_groq_api_key
TURSO_DATABASE_URL=your_turso_db_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

### 3. Start the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Vision

Atlas AI isn't another GIS platform.

It is a decision intelligence layer built on top of trusted geospatial data.

Our goal isn't to help people explore maps.

Our goal is to help them make better decisions.

Instead of asking users to interpret hundreds of data points, Atlas AI helps them answer one question:

**Where should we build?**
