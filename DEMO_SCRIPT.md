# ATLAS AI — MIREYE BUILD CHALLENGE DEMO SCRIPT
### Total Duration: 3 Minutes 15 Seconds | Target Audience: Mireye Founders & Hackathon Judges

---

## DEMO TIMELINE & SCREEN ACTIONS OVERVIEW

```
0:00 - 0:20  │ PART 1: THE HOOK (Customer Pain & Expensive Overruns)
0:20 - 0:50  │ PART 2: WHY ATLAS (Dashboard vs. Autonomous Agent)
0:50 - 1:10  │ PART 3: PORTFOLIO UPLOAD (Real World Workflow)
1:10 - 2:10  │ PART 4: LIVE AGENT SCAN (Mireye API Pipeline in Action)
2:10 - 2:55  │ PART 5: THE WINNING MOMENT (Decision Ledger & Flaw Proofs)
2:55 - 3:15  │ PART 6: SPATIAL COPILOT (Natural Language Q&A /v1/ask)
3:15 - 3:35  │ PART 7: INVESTMENT MEMO (LOI Contract & Output)
3:35 - 3:50  │ PART 8: CLOSING STATEMENT (Unforgettable Closing Line)
```

---

## PART 1: THE HOOK (0:00 - 0:20)
**Duration**: 20 Seconds  
**Screen**: Landing page hero section at `localhost:3000` (or `atlas-ai-pi-one.vercel.app`).  
**Mouse Action**: Cursor static on the Hero headline `UNDERWRITE 500 CANDIDATE PARCELS IN MINUTES`.  

### Spoken Narration:
> "Commercial solar and battery storage developers lose $120,000 every time a candidate property fails due diligence late in development. Land acquisition teams spend three to six weeks manually clicking through separate GIS mapping portals, flood maps, and county tax offices—only to tie up land that gets killed months later by steep terrain slope or restricted heavy-equipment transport access."

### Expected Judge Thought:
*“Okay, this is solving an expensive real-world problem for VP of Land Acquisition who writes the cheque.”*

---

## PART 2: WHY ATLAS (0:20 - 0:50)
**Duration**: 30 Seconds  
**Screen**: Hero section displaying the Integrated Infrastructure typography bar.  
**Mouse Action**: Mouse slowly hovers over `Mireye Physical Intelligence • USGS 3DEP LiDAR • FEMA NFHL • NREL PVWatts • EIA Grid • Texas CAD`.

### Spoken Narration:
> "Existing GIS tools fail because they are passive dashboards—they show map layers, but require human analysts to manually inspect properties, calculate risks, and compare trade-offs. Atlas is an autonomous commercial land acquisition agent. It ingests candidate site portfolios, queries Mireye physical location intelligence combined with public GIS datasets, disqualifies unviable properties with written proof, and outputs actionable land option agreements."

### Expected Judge Thought:
*“Got it—it's an autonomous execution agent, not just another map viewer.”*

---

## PART 3: PORTFOLIO UPLOAD (0:50 - 1:10)
**Duration**: 20 Seconds  
**Screen**: Click **"Evaluate Portfolio →"** button to open `ParcelUploadModal`.  
**Mouse Action**: Click `Upload Custom CSV`, select `new_verification_portfolio_10.csv`, and click **"Run Portfolio Underwriting Agent"**.

### Spoken Narration:
> "Land acquisition teams evaluate regional candidate portfolios in bulk. Here, I’m uploading a portfolio of candidate parcels across Texas. Watch what happens when I launch the agent scan."

### Expected Judge Thought:
*“Clean enterprise workflow—this matches how commercial developers actually operate.”*

---

## PART 4: LIVE AGENT SCAN (1:10 - 2:10)
**Duration**: 60 Seconds  
**Screen**: `AgentRunPanel` streaming real-time Server-Sent Events (SSE).  
**Mouse Action**: Cursor points to the live status indicators as Mireye API calls execute in parallel.

### Spoken Narration:
> "Step 1: Atlas formulates the acquisition strategy based on our target state and CapEx constraints.  
> Step 2: It calls Mireye `/v1/lookup` to resolve street addresses to exact parcel boundaries and county appraisal identifiers.  
> In parallel, Atlas queries Mireye `/v1/fetch` for physical radiometry, USGS 3DEP 1.2-degree LiDAR slope, and FEMA flood zone clearance, while invoking Mireye `/v1/proximity` to calculate heavy-equipment transport drive times to regional Interstate freight corridors.  
> Notice the live Data Status telemetry: Atlas tracks live API requests versus edge cache hits in real-time, displaying complete data provenance."

### Expected Judge Thought:
*“Impressive API integration—it’s hitting /v1/lookup, /v1/fetch, and /v1/proximity in parallel.”*

---

## PART 5: THE WINNING MOMENT (2:10 - 2:55)
**Duration**: 45 Seconds  
**Screen**: `DecisionLedger` displaying candidate rankings, rejected sites, and winner card.  
**Mouse Action**: Click **"Why Approved?"** on the #1 Ranked Parcel (Ector County), then hover over the Ground Slope card and Heavy Equipment Access card.

### Spoken Narration:
> "This is the winning moment. Out of all candidate properties, Atlas selected the Ector County parcel as Rank #1 with a 98/100 technical feasibility score. Here is why:  
> First, Mireye physical intelligence combined with USGS 3DEP LiDAR confirms a 0.9-degree terrain slope, eliminating steep earthwork cut-and-fill grading.  
> Second, FEMA flood layers confirm clean 100-year Zone X clearance, avoiding mandatory pile engineering.  
> Third, Mireye `/v1/proximity` calculates an 11.4-minute heavy transport transit time to the Interstate freight corridor, clearing 50-ton transformer delivery.  
> And crucially, Atlas combined Mireye with Ector County Tax Delinquency records—identifying a $28,400 overdue tax signal that indicates a highly motivated seller."

### Expected Judge Thought:
*“THIS IS THE WINNING FEATURE. It combined Mireye with USGS LiDAR, FEMA flood maps, transport routing, AND tax delinquency records to select the winner.”*

---

## PART 6: SPATIAL COPILOT (2:55 - 3:15)
**Duration**: 20 Seconds  
**Screen**: `SpatialCopilot` modal / Q&A chat.  
**Mouse Action**: Click sample prompt **"Why was the Ector County parcel selected as #1 over rejected targets?"**.

### Spoken Narration:
> "If an investment committee member asks why candidate sites were cut, Atlas includes a Spatial Copilot powered by Mireye `/v1/ask`. It synthesizes natural language due diligence answers backed by cited physical radiometry and civil risk data."

### Expected Judge Thought:
*“Complete coverage—they even utilized the /v1/ask endpoint for conversational due diligence.”*

---

## PART 7: INVESTMENT MEMO & CONTRACT (3:15 - 3:35)
**Duration**: 20 Seconds  
**Screen**: `InvestmentMemoModal` (3-Page Executive Investment Committee Memo).  
**Mouse Action**: Scroll down through Section 1 (Technical Scorecard), Section 2 (Financial CapEx & IRA §48 Tax Credits), and Section 3 (Land Option Agreement LOI Contract).

### Spoken Narration:
> "Finally, Atlas produces actionable business outputs: an executive 3-page Investment Committee Memo featuring financial IRR modeling with IRA §48 tax credit bonuses, paired with an automated Land Option Agreement ready for LOI execution."

### Expected Judge Thought:
*“End-to-end completeness—it doesn't just analyze data, it produces the legal and financial deliverables.”*

---

## PART 8: CLOSING STATEMENT (3:35 - 3:50)
**Duration**: 15 Seconds  
**Screen**: Return to Landing Page / Hero Section with GitHub & Live Demo links.  
**Mouse Action**: Cursor static on the primary callout.

### Spoken Narration:
> "Atlas AI turns passive physical spatial data into automated commercial acquisition decisions. It reduces land screening from four weeks down to under two minutes—giving renewable energy developers the site-control speed needed to build the future of energy infrastructure. Thank you."

---

## BACKUP LINES (IF LIVE DEMO STALLS OR NETWORK DELAYS)

* **If SSE connection takes >5 seconds**:  
  *"Atlas uses server-sent events to stream live batch evaluation progress as parallel Mireye API calls process across parcel candidates..."*
* **If API rate limit / cache hit occurs**:  
  *"Notice our edge caching telemetry—when identical parcel coordinates are evaluated, Atlas retrieves results from cache in 0 milliseconds without consuming unnecessary API credits..."*

---

## COMMON DEMO MISTAKES TO AVOID

1. ❌ **Do NOT talk about code syntax**: Never mention React, Next.js, TypeScript, SSE, hooks, state variables, or database queries.
2. ❌ **Do NOT apologize or explain loading spinners**: Keep talking continuously about customer outcomes and due diligence value.
3. ❌ **Do NOT rush the Decision Ledger**: Spend at least 45 seconds on Part 5—it is the single most important judging moment of the demo.

---

## THE UNFORGETTABLE 10-SECOND CLOSING STATEMENT

> **"Atlas AI turns passive physical spatial data into automated commercial acquisition decisions. It cuts site screening from four weeks to under two minutes—giving developers the speed to build the future of clean energy infrastructure."**
