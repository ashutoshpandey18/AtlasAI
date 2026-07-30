# Atlas AI — Enterprise Location Siting & Decision Intelligence Platform

> **Live Demo:** [https://atlas-ai-1.vercel.app](https://atlas-ai-1.vercel.app)  
> **GitHub Repository:** [https://github.com/ashutoshpandey18/AtlasAI](https://github.com/ashutoshpandey18/AtlasAI)  
> **Case Study Page:** [/case-study/atlas-ai](https://vibedraw18.vercel.app/case-study/atlas-ai)  
> **Tech Stack:** Next.js 15, React 19, TypeScript, Turso (LibSQL Vector DB), Gemini 3072-dim Embeddings, Groq LLM, Tailwind CSS, Vitest

---

## 🌟 Executive Summary

**Atlas AI** is an enterprise location siting and decision intelligence platform built for utility-scale developments ($100M+ Solar Farms, Wind Parks, Battery Storage, and Data Centers) on top of the Mireye physical data API.

Rather than overwhelming developers and investment committees with raw heatmaps or hundreds of uninterpreted GIS layers, Atlas AI runs pre-flight data quality auditing, calculates FERC-calibrated interconnection capex ($USD), computes net buildable parcel acreage, and retrieves RTO regulatory tariffs to emit clear, explainable site control recommendations.

---

## 🎯 Key Problems Solved

1. **Silent Geocode Match Failure & Field Poisoning:**
   - Standard geocoders often snap vague inputs (e.g., city-name queries) to city centers or road dividers. Downstream spatial calculations (flood risk, terrain slope, transmission line distance) then run on random city-center points without alerting decision-makers.
   - **Solution:** Engineered `centroidValidator.ts` to audit geocode precision using 5-pattern pre-flight checks before downstream scoring.

2. **Euclidean vs. Real Corridor Transmission Pathing:**
   - Physical data APIs return straight-line air distance to nearest transmission lines, ignoring environmental barriers (FEMA floodplains, USFWS wetlands, PAD-US protected lands) in the cable corridor.
   - **Solution:** Engineered `gridCapacityEngine.ts` to apply barrier cost multipliers (1.4×–1.9× for floodplains, wetlands, protected areas) and calculate FERC-calibrated interconnection capex ($USD).

3. **Physical Parcel Footprint & Buildable Constraints:**
   - Parcels listed at 100 gross acres frequently lose 30–50% of buildable area due to flood zones, 100ft wetland buffers, and steep terrain (>8°).
   - **Solution:** Built `buildableAreaHarness.ts` to deduct spatial constraint footprints and emit automated action verdicts (`READY_FOR_SITE_CONTROL`, `NEEDS_PARCEL_ASSEMBLY`, `REJECT_CONSTRAINED`).

4. **Autonomous Land Acquisition LOI & Owner Outreach:**
   - Land acquisition is the highest friction point in physical development.
   - **Solution:** Built `ownerOutreachEngine.ts` to generate formal, downloadable option-to-lease Letters of Intent (LOI) with calculated annual lease rates ($/acre/yr) and option terms.

5. **Live Energy Market & RTO Tariff RAG:**
   - Real-time Locational Marginal Pricing (LMP in $/MWh) and RTO tariff rules dictate solar revenue and data center power costs.
   - **Solution:** Integrated `liveLmpGridTracker.ts` and an embedded RTO tariff vector RAG pipeline powered by Gemini 3072-dim embeddings in Turso and Groq LLM synthesis.

---

## 🛠️ Architecture & Tech Stack

```
User Request → Next.js 15 Workspace Route
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
 Mireye Fetch API        Turso / LibSQL Edge DB
(300+ Raw Attributes)   (Vector Tariff Chunks)
        │                         │
        └────────────┬────────────┘
                     ▼
       Pre-Flight Audit Engine
 (Centroid Validator + Grid Capex)
                     │
                     ▼
       RTO Regulatory RAG Pipeline
(Gemini 3072-dim Vector Search + Groq Synthesis)
                     │
                     ▼
   Segmented Tabbed HUD & Executive Briefing
```

---

## 📊 Performance & Reliability Highlights

- **64 Automated Unit Tests (100% Pass Rate):** Complete Vitest coverage across spatial math, capex calculations, centroid validation, permitting lead times, and LOI generation.
- **Zero TypeScript Errors (`npx tsc --noEmit`):** Full type safety across Next.js 15 client and server route handlers.
- **100% Credential Security:** All API tokens (`MIREYE_API_TOKEN`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `TURSO_DATABASE_URL`) are strictly isolated on the server. Zero client bundle or DevTools exposure.
