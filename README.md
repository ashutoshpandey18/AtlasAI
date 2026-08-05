# Atlas Acquisition Agent
## Autonomous AI Agent for Commercial Renewable Land Acquisition & Site Control

[![Live Demo](https://img.shields.io/badge/Live_Demo-atlas--ai--pi--one.vercel.app-amber?style=for-the-badge&logo=vercel)](https://atlas-ai-pi-one.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-ashutoshpandey18/AtlasAI-white?style=for-the-badge&logo=github)](https://github.com/ashutoshpandey18/AtlasAI)
[![Mireye API Verified](https://img.shields.io/badge/Mireye_API-Verified_Intelligence-emerald?style=for-the-badge)](https://mireye.com)

---

![Atlas Siting Agent Pipeline Status](public/images/siting_pipeline_status.png)

---

## 1. Problem

Commercial real estate and renewable energy developers spend weeks deciding which candidate sites deserve expensive engineering due diligence and legal outreach.

Traditional site selection relies on a slow, fragmented manual workflow:  
$$\text{Maps} \longrightarrow \text{Raw GIS Layers} \longrightarrow \text{County Tax Records} \longrightarrow \text{Engineering Review} \longrightarrow \textbf{Weeks of Delay}$$

Traditional GIS tools are built for analysts to inspect maps. However, land acquisition directors do not need another website with pins on a map. They need **automated, defensible decisions**.

---

## 2. Who Writes the Cheque?

| Role | Primary Customer Pain | Atlas Outcome |
| :--- | :--- | :--- |
| **VP of Land Acquisition** | Weeks spent manually screening candidate sites across 50 map layers | **Reduces early-stage site screening and prioritization to minutes** |
| **Commercial Solar Developer** | High engineering budgets wasted on sites that get killed 3 years later | **Engineering & legal budgets spent ONLY on tier-1 viable opportunities** |
| **Clean Tech Real Estate Fund** | Slow deal velocity and high ground lease transaction friction | **Automated institutional pro-forma underwriting & LOI contracts** |

---

## 3. How Atlas Works

Atlas is an **Autonomous Decision Platform** that automates the early-stage screening, prioritization, and underwriting workflow for commercial renewable siting (retail solar carports, utility solar PV, battery energy storage systems, and EV charging plazas).

### Input-to-Output Flow

```text
INPUT
"Find fast-deployment solar carport targets in Texas under $2M capex."

  ↓

Stage 01: Goal Formulation & Business Mandate Planning
  ↓
Stage 02: Mireye GIS Batch Ingestion (/lookup & /fetch)
  ↓
Stage 03: Mireye Proximity Heavy Transport Drive-Time Routing (/proximity)
  ↓
Stage 04: Rejection Ledger & Fatal Flaw Disqualification
  ↓
Stage 05: Multi-Criteria Technical Feasibility Scoring (0-100)
  ↓
Stage 06: Rank #1 Winner Parcel Selection & Decision Ledger
  ↓
Stage 07: Spatial Copilot Q&A & Trade-off Analysis (/ask)
  ↓
Stage 08: Executive 3-Page Investment Memo & LOI Contract Generation

  ↓

OUTPUT
Recommended Target + Rejection Proofs + Investment Memo & LOI
```

---

## 4. Visual Workflow & Product Demonstrations

### Step 1: Automated Mireye GIS Pipeline & Batch Portfolio Ingestion
Atlas ingests multi-state candidate parcel portfolios (CSV or GeoJSON) and queries Mireye `/v1/lookup` and `/v1/fetch` APIs in parallel, evaluating plane-of-array solar radiometry, USGS 3DEP LiDAR slope, and FEMA NFHL flood zone clearance.

![Atlas Siting Agent Pipeline Status](public/images/siting_pipeline_status.png)

---

### Step 2: Live Geospatial Map Tiles & Reverse Geocode Inspector
Interactive vector and satellite map layers plot candidate parcels, boundaries, and grid interconnection lines while reverse-geocoding coordinates in real time.

![Live Geospatial Map Tiles Inspector](public/images/live_map_inspector.png)

---

### Step 3: Executive Decision Ledger & Spatial Copilot Q&A
The Decision Ledger displays why the #1 winning site was chosen over candidate alternatives, featuring the **Mireye Proximity API Heavy Equipment Access Card** (sub-15 min heavy transport clearance avoiding $120k route escort fees) and Spatial Copilot Q&A (`/v1/ask`).

![Executive Decision Ledger & Spatial Copilot](public/images/decision_ledger_copilot.png)

---

### Step 4: Replayable 10-Stage AI Execution Trace Timeline
Every decision step is recorded in an audit trail with exact millisecond timings, proving 100% replayable AI reasoning for institutional investment committees.

![Replayable 10-Stage AI Execution Trace Timeline](public/images/replayable_ai_trace.png)

---

### Step 5: 3-Page Executive Investment Memo & LOI Contract
Atlas automatically generates a downloadable 3-page Executive Investment Committee Memo featuring CapEx savings breakdowns, IRA §48 tax credit bonus qualifications, and customized LOI option agreements.

![3-Page Executive Investment Memo Modal](public/images/investment_memo.png)

---

## 5. Mireye API Integration Matrix (100% Real Platform Endpoints)

| Mireye Capability | Endpoint Target | Purpose in Atlas | Production Service |
| :--- | :--- | :--- | :--- |
| **Address Geocoding** | `POST https://api.mireye.com/v1/lookup` | Resolves street addresses to high-precision lat/lng coordinates and county boundaries | [mireyeApiClient.ts](file:///Users/air/Desktop/Atlas/src/services/mireyeApiClient.ts) |
| **Physical GIS Layers** | `POST https://api.mireye.com/v1/fetch` | Extracts NREL POA solar yield, USGS 3DEP 1.2° LiDAR slope, and FEMA flood zone clearance | [mireyeApiClient.ts](file:///Users/air/Desktop/Atlas/src/services/mireyeApiClient.ts) |
| **Proximity Matrix** | `POST https://api.mireye.com/v1/proximity` | Evaluates heavy equipment transport drive-time routing to Interstate freight interchanges | [mireyeProximityService.ts](file:///Users/air/Desktop/Atlas/src/services/mireyeProximityService.ts) |
| **Spatial Copilot** | `POST https://api.mireye.com/v1/ask` | Answers natural language due diligence questions with comparative trade-off reasoning | [ask/route.ts](file:///Users/air/Desktop/Atlas/src/app/api/mireye/ask/route.ts) |

---

## 6. Sample Test Datasets

Atlas provides ready-to-test sample CSV datasets inside the web upload modal window:

### Option A: Geographic Coordinates
* `15 Coords` (`/data/coordinates_portfolio_15.csv`)
* `20 Coords` (`/data/coordinates_portfolio_20.csv`)
* `50 Coords` (`/data/coordinates_portfolio_50.csv`)
* `100 Coords` (`/data/coordinates_portfolio_100.csv`)
* `300 Coords` (`/data/coordinates_portfolio_300.csv`)
* `500 Coords` (`/data/coordinates_portfolio_500.csv`)

### Option B: Street Addresses
* `15 Sites` (`/data/address_portfolio_15.csv`)
* `20 Sites` (`/data/address_portfolio_20.csv`)
* `50 Sites` (`/data/address_portfolio_50.csv`)
* `100 Sites` (`/data/address_portfolio_100.csv`)
* `300 Sites` (`/data/address_portfolio_300.csv`)
* `500 Sites` (`/data/address_portfolio_500.csv`)

---

## 7. Insomnia & Postman API Verification

All production API routes can be tested directly via Insomnia or Postman against the live production server `https://atlas-ai-pi-one.vercel.app`.

### 1. Mireye Physical GIS Layer Intelligence (`/v1/fetch`)
Queries real NREL solar yield, USGS 3DEP 1.2° LiDAR slope, and FEMA NFHL flood clearance.

![Insomnia Mireye Physical GIS Fetch Test](public/images/insomnia_fetch.png)

```bash
curl -X POST https://atlas-ai-pi-one.vercel.app/api/mireye/fetch \
  -H "Content-Type: application/json" \
  -d '{"lat":39.9881,"lng":-83.0384,"fields":["poa_irradiance_optimal_tilt_kwh_m2_yr","slope_degrees","fema_flood_zone"]}'
```

---

### 2. Spatial Copilot Q&A & Proximity Reasoning (`/v1/ask`)
Executes comparative trade-off reasoning and cites Mireye Proximity heavy equipment transport drive-time metrics.

![Insomnia Spatial Copilot Q&A Test](public/images/insomnia_ask.png)

```bash
curl -X POST https://atlas-ai-pi-one.vercel.app/api/mireye/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Which site has the lowest construction and transport risk?","evaluations":[{"siteName":"Kroger Supermarket","county":"Franklin County","state":"OH"}]}'
```

---

### 3. Live Agent SSE Site Scan Pipeline (`/api/agent/site-scan`)
Streams Server-Sent Events (SSE) progress in real time across candidate parcel portfolios.

![Insomnia Live Agent SSE Site Scan Test](public/images/insomnia_site_scan.png)

```bash
curl -X POST https://atlas-ai-pi-one.vercel.app/api/agent/site-scan \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"prompt":"Find commercial solar carports in Texas under $2M capex.","dataset":[{"geo_id":"US-TX-0001","chain":"Kroger Supermarket","lat":29.7365,"lon":-95.6032}]}'
```

---

### 4. Save Acquisition Campaign (`/api/campaigns`)
Persists acquisition campaign strategy plans and site evaluations to Turso Edge SQLite storage.

![Insomnia Save Campaign POST Test](public/images/insomnia_campaigns_post.png)

```bash
curl -X POST https://atlas-ai-pi-one.vercel.app/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{"id":"camp-001","name":"Texas Commercial Solar","useCaseId":"solar-carport","requirements":{},"locations":[]}'
```

---

### 5. Retrieve Saved Acquisition Campaigns (`/api/campaigns`)
Retrieves saved acquisition campaigns for executive due diligence review.

![Insomnia Retrieve Campaigns GET Test](public/images/insomnia_campaigns_get.png)

```bash
curl -X GET https://atlas-ai-pi-one.vercel.app/api/campaigns
```

---

## 8. Local Setup & Development

```bash
# Clone the repository
git clone https://github.com/ashutoshpandey18/AtlasAI.git
cd AtlasAI

# Install dependencies
npm install

# Run Next.js production build check
npm run build

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 9. License

Developed for the official Mireye Build Challenge.
