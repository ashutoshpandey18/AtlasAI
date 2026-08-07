# Atlas AI
**Autonomous Commercial Land Acquisition Agent**

Atlas evaluates candidate property portfolios for commercial solar and battery storage developers—combining Mireye physical intelligence with USGS LiDAR slope, FEMA flood hazard boundaries, and county tax delinquency records to disqualify unviable land and recommend acquisition-ready targets in minutes.

---

## Primary Buyer

> **Target Customer**: VP of Land Acquisition & Commercial Solar/Battery Storage Developers  
> **Core Pain**: 3 to 6 weeks spent manually screening properties across fragmented map layers  
> **Atlas Impact**: Reduces early-stage site screening and prioritization from weeks to minutes  

---

## 1. Problem

Commercial renewable energy developers lose weeks manually inspecting candidate properties across separate GIS portals, county appraisal offices, and utility maps. 

When a developer acquires land containing hidden steep terrain, 100-year floodways, or restricted heavy-equipment transport access, civil grading and transport costs escalate by over $100,000 in specialized route escorts or earthwork overruns—causing late-stage project cancellation after significant capital expenditure.

---

## 2. Solution

Atlas replaces manual map inspection with an autonomous underwriting agent. Developers upload candidate parcel portfolios (CSV street addresses or coordinates), and Atlas runs automated screening across physical terrain, flood hazards, and transport logistics.

Atlas automatically disqualifies unviable properties with written due diligence proofs, ranks viable parcels by net economic feasibility, and outputs executive investment memos with draft Land Option Agreements.

---

## 3. What Atlas Combines With Mireye

Atlas pairs **Mireye physical location intelligence** with domain-specific commercial underwriting datasets:

* **Mireye Physical Intelligence**: Real-time parcel geocoding (`/v1/lookup`), physical solar radiometry & elevation slope (`/v1/fetch`), heavy-equipment logistics drive times (`/v1/proximity`), and spatial copilot due diligence synthesis (`/v1/ask`).
* **USGS 3DEP LiDAR Elevation**: Evaluates ground slope terrain to prevent expensive earthwork grading overruns.
* **FEMA NFHL Flood Hazard Boundaries**: Disqualifies 100-year Zone AE floodways to avoid mandatory BFE structural pile engineering and flood insurance.
* **County Tax Delinquency Rolls**: Cross-references back-tax appraisal rolls to identify motivated sellers ($28,400 overdue tax signal).
* **EIA Substation Infrastructure**: Measures distribution feeder distance to 138kV substations to evaluate interconnection cost.
* **Inflation Reduction Act § 48 Statute**: Applies federal Investment Tax Credit bonuses into financial IRR modeling.

---

## 4. Why Mireye is Essential

Atlas relies on Mireye as its physical location intelligence backbone:

* **`/v1/lookup` (Parcel Resolution)**: Resolves street addresses to exact parcel boundaries and county appraisal identifiers.
* **`/v1/fetch` (Physical Characteristics)**: Retrieves solar irradiance, USGS LiDAR elevation slope, and FEMA flood zone boundaries.
* **`/v1/proximity` (Logistics Routing)**: Calculates heavy equipment transport drive times from Interstate freight corridors (`op: "distance"`).
* **`/v1/ask` (Site Trade-offs)**: Explains comparative due diligence trade-offs in natural language via the Spatial Copilot.

---

## 5. System Workflow

Portfolio CSV Upload  
↓  
Mireye Parcel Lookup (`/v1/lookup`)  
↓  
Physical GIS Layer Fetch (`/v1/fetch`)  
↓  
Heavy Equipment Transport Routing (`/v1/proximity`)  
↓  
Commercial Underwriting (Tax & Grid Scoring)  
↓  
Decision Ledger & Written Rejection Flaw Proofs  
↓  
Investment Committee Memo & Draft LOI Contract  

---

## 6. Key Capabilities

* **Automated Fatal Flaw Screening**: Disqualifies properties in floodways or steep terrain before spending engineering budget.
* **Multi-Criteria Site Scoring**: Ranks candidate properties on solar yield, ground slope, flood risk, and transport drive time.
* **Written Rejection Proofs**: Generates clear due diligence ledgers explaining exactly why candidate sites were cut.
* **Live API Telemetry**: Displays real-time API fetches versus edge cache hits with transparent data provenance.
* **Draft LOI Generation**: Populates initial commercial Land Option Agreements for top-ranked parcels.

---

## 7. Screenshots

1. **Live Portfolio Scan Pipeline**: Shows real-time agent execution streaming batch progress, site screening, and candidate scoring.
2. **Executive Decision Ledger**: Displays written rejection flaw proofs, USGS slope savings, and Mireye transport drive-time metrics.
3. **Investment Committee Memo**: Demonstrates the exported 3-page institutional due diligence memo with draft Land Option Agreement.

---

## 8. Technology Stack

* **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
* **Location Intelligence**: Mireye APIs (`/v1/lookup`, `/v1/fetch`, `/v1/proximity`, `/v1/ask`)
* **Database & Caching**: Turso SQLite, Edge Cache Warmer
* **Language Engines**: Gemini 2.5 Flash, Groq LLM Inference

---

## 9. Why Atlas Stands Out

Traditional GIS software consists of static mapping dashboards—they display map layers, but require human analysts to manually inspect properties, calculate risks, and compare trade-offs.

Atlas is an autonomous execution agent. It ingests candidate portfolios, queries Mireye physical data, evaluates multi-criteria constraints, disqualifies unviable properties with written proof, and outputs actionable site-control recommendations. Atlas transforms passive spatial data into automated commercial acquisition decisions.

---

**Live Application**: [https://atlas-ai-pi-one.vercel.app](https://atlas-ai-pi-one.vercel.app)  
**GitHub Repository**: [https://github.com/ashutoshpandey18/AtlasAI](https://github.com/ashutoshpandey18/AtlasAI)  
**Document Link**: [https://github.com/ashutoshpandey18/AtlasAI/blob/main/ONE_PAGER.md](https://github.com/ashutoshpandey18/AtlasAI/blob/main/ONE_PAGER.md)
