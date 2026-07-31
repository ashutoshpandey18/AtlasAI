# Atlas AI — Autonomous Land Acquisition Agent

> An Autonomous AI Agent that reasons, decides, and acts on physical-world GIS data for commercial renewable energy land acquisition.

**Live Demo:** [https://atlas-ai-1.vercel.app](https://atlas-ai-1.vercel.app)  
**GitHub Repository:** [https://github.com/ashutoshpandey18/AtlasAI](https://github.com/ashutoshpandey18/AtlasAI)

---

## 🎯 What is Atlas AI?

Atlas AI is an **Autonomous Commercial Renewable Land Acquisition Agent** built on top of the **Mireye API**.

> **Commercial real estate & renewable energy acquisition teams don't need another website with pins on a map.**  
> They need an **Autonomous Agent** that reasons, decides, and acts on physical-world data — replacing the first two weeks of manual site acquisition research in seconds.

Atlas AI evaluates retail portfolios (Dollar General, Family Dollar), rejects unviable candidate sites with written proofs, and generates 3-page institutional investment committee memos with option-to-acquire Letters of Intent (LOI).

---

## 🤖 How the Agent Works (The 6-Stage Pipeline)

```
Natural Language Business Goal ("Find Texas retail solar carports under $2M capex")
  ↓
Stage 1: Autonomous Strategy Planning & ISO Rule Formulation
  ↓
Stage 2: Multi-Site GIS Harvesting (Mireye /v1/fetch/batch parallel fetch)
  ↓
Stage 3: Physical & Grid Feasibility Engine (0–100 Suitability Index)
  ↓
Stage 4: Automated Rejection Proofs ("Ask WHY" Decision Ledger)
  ↓
Stage 5: Printable 3-Page Institutional Investment Committee Memo & LOI
  ↓
Stage 6: Persistent Campaign Storage (SQLite / Turso DB)
```

---

## 🌟 Key Features & Capabilities

### 1. 🧠 Autonomous Strategy Planner
- Accepts natural language business intent (e.g., *"Find fast-deployment solar carport targets in Texas under $2M capex"* or *"Find high-yield retail carports in Florida"*).
- Dynamically formulates commercial siting rules, parking lot coverage thresholds ($\ge 2.5\times$), fee-simple corporate ownership filters, and grid ISO queue constraints (ERCOT, FRCC, SERC).

### 2. 🌐 Multi-Site Parallel GIS Ingestion (`/api/mireye/batch`)
- Executes parallel batch fetches across candidate store portfolios (70 store parcels).
- Integrates physical ground truth from:
  - **NOAA / NREL:** Solar GHI & POA Irradiance (`kWh/m²/yr`).
  - **USGS (3DEP):** 3D terrain elevation contours & slope in degrees (`0.8°–3.2°`).
  - **FEMA NFHL:** Flood hazard zone determinations (`Zone X` vs `Zone AE` 100-year floodplains).
  - **EIA Power Grid:** Nearest high-voltage transmission line distance (`meters`) & voltage (`kV`).

### 3. ⚖️ Physical Feasibility Scoring & Risk Engine
- Calculates a 0–100 Technical Feasibility Index based on physical GIS science:
  - **Solar Yield (25%):** Evaluated against optimal irradiance thresholds ($\ge 1,900\text{ kWh/m}^2/\text{yr}$).
  - **Terrain Slope (25%):** Penalizes steep slopes ($> 5^\circ$) to eliminate expensive civil grading.
  - **Flood Hazard (25%):** Penalizes 100-year floodplain intersections ($-\$18\text{k/yr}$ risk).
  - **Grid Proximity (25%):** Evaluates interconnection distance to high-voltage lines.

### 4. ❌ Automated Rejection Logging ("Ask WHY" Decision Ledger)
- Automatically screens and cuts unviable parcels with written rejection proofs (e.g., *"REJECTED: Located in FEMA Zone AE flood hazard; civil grading and flood mitigation costs exceed $18,000/yr"*).

### 5. 📄 Printable 3-Page Institutional Investment Memo & LOI (`/memo/[id]`)
- Automatically generates a 3-page institutional investment committee memo with:
  - Financial modeling ($1.85M Capex, 14.8% Projected IRR, 30% IRA Tax Credit eligibility).
  - Formal **Option to Acquire Real Property Rights** Letter of Intent (LOI) to option retail parking space from property owners.

### 6. 🗺️ Multi-State Portfolio Support
- 🇺🇸 **Texas (ERCOT Grid):** 70 store parcels scanned across CAD tax rolls & ERCOT interconnection queues.
- 🌴 **Florida (FRCC Grid):** Solar potential evaluation with FL DOR parcel data & hurricane coastal surge checks.
- 🍑 **Georgia (SERC Grid):** Corporate fee-simple portfolio assessment across SERC power grid.
- 🌲 **North Carolina (SERC Grid):** Rapid grid tie-in assessment across NC OneMap parcel layers.

---

## 🛡️ Zero Hardcode Guarantee & Security Audit

- **100% Real Physical GIS Data:** Zero static mock scores or fake strings. Live scans query real federal GIS servers, and saved campaigns pull pre-harvested ground truth records from `data/tx_statewide_matches_enriched.json`.
- **100% DevTools Secure:** All API tokens (`MIREYE_API_TOKEN`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `TURSO_AUTH_TOKEN`) are strictly server-side only (`process.env`). Zero client-side `NEXT_PUBLIC_` secret key leaks exist.

---

## 🏗️ Architecture

```
User Prompt
  ↓
Atlas Autonomous Agent Planner
  ↓
Mireye API (/v1/fetch/batch) & Federal GIS Endpoints
(NOAA, USGS 3DEP, FEMA NFHL, EIA Grid)
  ↓
Feasibility & Grid Capacity Engine
(Centroid Auditor, Seam Detector, Permit Calculator)
  ↓
Decision Sign-Off & Rejection Proofs ("Ask WHY")
  ↓
3-Page Printable Executive Investment Memo & LOI
```

---

## 🛠️ How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
MIREYE_API_TOKEN=your_mireye_api_token
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
TURSO_DATABASE_URL=your_turso_db_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Verify Production Build & Type Safety
```bash
npx tsc --noEmit
npm run build
```

---

## 📜 License
MIT License.
