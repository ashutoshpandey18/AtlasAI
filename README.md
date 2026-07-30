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
- Site-Shifting engine suggests optimized coordinate adjustments and estimates potential suitability score boosts when a constraint lowers a score

**GIS & Pre-Flight Intelligence**
- Centroid Misalignment Detector audits geocode confidence and detects road-centerline snaps before scoring to prevent field poisoning
- Live Federal Map Layer & Reverse-Geocoding Inspector renders dynamic map tile layer switching (Vector OpenStreetMap, Satellite Imagery, USGS 3DEP Topography) and triggers live Nominatim reverse-geocoding to resolve exact Street, County, State, and ZIP boundaries in real time
- Physical Agent Buildable Area Mask Harness calculates net buildable parcel acreage, constraint deduction footprints (flood, wetland 100ft buffer, steep slope > 8°), and emits actionable AI agent verdicts (`READY_FOR_SITE_CONTROL`, `NEEDS_PARCEL_ASSEMBLY`, `REJECT_CONSTRAINED`)
- Autonomous Land Acquisition LOI & Owner Outreach Engine transforms spatial data and parcel lookup into formal, downloadable Letters of Intent (LOI) to option-to-lease land with calculated annual lease payments ($/acre/yr) and option terms
- Live Regional Energy Market LMP Price Tracker fetches live Locational Marginal Prices ($/MWh) across ERCOT, PJM, MISO, CAISO, SPP, NYISO, and ISO-NE to project annual solar generation revenues and data center power costs
- Grid Capacity Engine calculates barrier path multipliers (1.4×–1.9× for floodplains, wetlands, protected areas), FERC-calibrated interconnection capex ($USD), and RTO queue risks
- Interactive Corridor Cable Path Visualizer renders an animated SVG transmission path from site origin through environmental barrier nodes to the grid substation with step-by-step cost impact callouts
- Jurisdiction & Seam Detector flags cross-RTO boundary seam risks (PJM/MISO, WECC/SPP, ERCOT) and FEMA flood panel vintage staleness

**RTO Regulatory RAG**
- Embedded knowledge base of tariff rules, study costs, and queue timelines across all 7 US RTO/ISO regions
- Semantic vector retrieval powered by Gemini embeddings (`gemini-embedding-001`) and Groq (`llama-3.3-70b`) augmented generation

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
Pre-Flight Audit & Pre-Screening
(Centroid Validator & Seam Risk Detector)
  ↓
Mireye API
(Trusted Location Intelligence)
  ↓
Business Rules & Grid Capacity Engine
(Interconnection Capex & Barrier Multipliers)
  ↓
Regulatory RAG & LLM — Groq / Gemini
(RTO Tariff Briefing & Explanation Layer)
  ↓
Recommendation
```

- **Mireye** provides trusted, provenance-backed location intelligence.
- **Pre-Flight & Grid Engines** audit geocode precision, compute corridor barrier penalties, and estimate capex.
- **Regulatory RAG & LLM** retrieve RTO tariff rules and explain results in plain language any decision maker can act on.

---

## How It Works

```
User describes what they want to build
  ↓
Atlas AI collects project requirements
  ↓
Mireye returns structured location intelligence
  ↓
Centroid audit & grid capacity engine evaluate candidate locations
  ↓
Business rules calculate a suitability score (0–100) & capex
  ↓
RAG & LLM generate plain-language explanations and regulatory briefing
  ↓
Executive-ready report with provenance
```

Key capabilities:

- **Multi-location comparison** — evaluate up to 5 candidate sites side by side.
- **Siting Copilot** — ask natural language questions about any site and receive fact-grounded answers.
- **Smart Site-Shifting** — if a site scores low due to a constraint (e.g., a flood zone or steep terrain), the engine calculates and suggests nearby geographical shifts (e.g., "Move 350m North-West") with estimated suitability improvements.
- **GIS Intelligence Panel** — surfaces centroid validation confidence, corridor barrier cost multipliers, estimated interconnection capex, and RTO queue risks directly in the workspace.
- **Provenance surfaced** — sources are cited in the campaign's Citations section so decision makers can trace and defend the recommendation.

---

## Product Decisions

Several design decisions intentionally shaped Atlas AI.

- Decision-first interface instead of GIS layers.
- Pre-flight data auditing to prevent geocode poisoning.
- Corridor barrier modeling over simple straight-line distance.
- Explainable recommendations instead of opaque scores.
- Multi-location comparison instead of isolated analysis.
- AI assists interpretation but never invents location facts.
- Provenance surfaced wherever available to increase trust.
- Business logic remains deterministic; AI explains rather than decides.

---

The landing page features two guided simulations to showcase Atlas AI's capabilities instantly before launching a live campaign:

### 1. Phone Chat Simulator (AI Copilot Preview)
* **What it does**: Demonstrates how a project team can ask plain-English questions about terrain, road access, and site-shifting to bypass conservation easements.
* **Why it uses demo data**: It provides an immediate visual walk-through of the Siting Copilot conversational interface without requiring coordinate inputs first.

### 2. AI Feasibility Report Builder (Executive Report Preview)
* **What it does**: Simulates generating an executive feasibility report where users can select a project type (e.g., Battery Factory) and customize parameter weights (Terrain, Grid, Flood).
* **Why it uses demo data**: It showcases the custom-weighted scoring logic and the format of the final executive report instantly.

Launching the **Active Workspace** switches the application into live mode, where every site analysis and Copilot query is dynamically powered by real-time geocoding, live Mireye API responses, and RTO regulatory intelligence retrieval.


---

## Mireye API Integration

We integrated core endpoints from the **Mireye Coordinate API**:

### `/v1/fetch` — Decision Intelligence Engine
- **What it does**: Returns structured location intelligence for any coordinate in a single call.
- **Why it matters**: Powers our scoring engine. The returned data is evaluated against project-specific criteria to calculate a 0–100 suitability index.

### `/v1/ask` — Siting Copilot Chat
- **What it does**: Answers natural language questions about a location using Mireye-powered location intelligence.
- **Why it matters**: Powers the interactive AI assistant. Instead of reading raw maps, users ask questions in plain English and get instant, grounded answers.

### `/v1/geocode` — Coordinate Resolution
- **What it does**: Resolves street addresses to latitude and longitude coordinates.
- **Why it matters**: Powers the location input bar in campaigns, audited by Atlas's pre-flight centroid validator.

---

## What We Learned

Building Atlas AI reinforced one important idea:

Location intelligence becomes significantly more valuable when it is translated into decisions rather than presented as raw geospatial data.

That insight shaped every product decision we made throughout the project.

### Feedback for Mireye

1. **`geocode_match_type` Metadata**: Returning precision metadata (`rooftop` vs `parcel_centroid` vs `city_centroid`) alongside `confidence_score` in `/v1/geocode` to prevent ambiguous city-name inputs from silently poisoning downstream spatial calculations.
2. **Polygon-Level Queries (`/v1/fetch/polygon`)**: Accepting GeoJSON polygons to compute area statistics (`% area in flood`, `max_slope`, `buildable_acres`) across parcel boundaries rather than sampling a single centroid point.
3. **Corridor Path Barriers**: Factoring environmental barriers (PAD-US protected areas, wetlands) directly into transmission line distance queries rather than returning Euclidean air-distance.

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
GEMINI_API_KEY=your_gemini_api_key
TURSO_DATABASE_URL=your_turso_db_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

### 3. Start the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
```bash
npm run test:run
```

---

## Clearing the Floor: What Makes Atlas AI Different?

While traditional projects focus on single-use site selection (e.g., just data centers), Atlas AI was designed to be a flexible platform solving three unsolved industry challenges:

* **Multi-Industry Adaptability**: Instead of hardcoding one facility type, Atlas AI dynamically reweights its scoring algorithms across eight diverse industries (Battery Factories, Solar, Wind, EV Charging, Retail, etc.) using custom business rules.
* **Proactive Site-Shifting**: Traditional GIS tools only tell you when a site is unsuitable. Atlas AI's engine analyzes local terrain and flood boundaries to calculate and suggest optimized coordinate shifts (e.g., "Move 350m NW") to bypass constraints.
* **C-Suite Explainability**: Analysts love layers, but decision-makers need answers. Atlas AI translates raw spatial attributes into a plain-English executive summary with direct provenance links, eliminating the need to decode complex heatmaps.

---


## Vision

Atlas AI isn't another GIS platform.

It is a decision intelligence layer built on top of trusted geospatial data.

Our goal isn't to help people explore maps.

Our goal is to help them make better decisions.

Instead of asking users to interpret hundreds of data points, Atlas AI helps them answer one question:

**Where should we build?**
