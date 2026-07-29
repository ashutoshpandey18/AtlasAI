/**
 * rtoKnowledgeBase.ts
 *
 * Pre-written regulatory knowledge chunks covering interconnection rules,
 * queue timelines, study costs, and tariff requirements for all 7 US RTO/ISO regions.
 *
 * These chunks are embedded once (via embedRtoCorpus()) and stored in LibSQL.
 * At query time, the top-K most relevant chunks are retrieved via cosine similarity
 * and injected into the Gemini prompt to produce regulation-aware site narratives.
 */

export interface RtoChunk {
  id: string;
  rtoRegion: string; // ERCOT | PJM | MISO | WECC | SPP | NYISO | ISO-NE
  topic: string;
  content: string;   // the text that gets embedded + retrieved
  sourceLabel: string; // display citation
}

export const RTO_KNOWLEDGE_BASE: RtoChunk[] = [

  // ─── ERCOT ────────────────────────────────────────────────────────────────

  {
    id: 'ercot-queue-001',
    rtoRegion: 'ERCOT',
    topic: 'Interconnection Queue Process',
    content: `ERCOT operates a first-come, first-served interconnection queue with no competitive windows. As of 2024, the ERCOT queue contains over 300 GW of pending requests, predominantly solar and storage. Average queue-to-commercial-operation time for utility-scale solar projects is 24–36 months. ERCOT uses a synchronous interconnection process where projects are studied in groups. The Full Interconnection Study (FIS) typically takes 9–18 months after the Screening Study is complete.`,
    sourceLabel: 'ERCOT Planning Guide, Section 5 — Interconnection',
  },
  {
    id: 'ercot-costs-001',
    rtoRegion: 'ERCOT',
    topic: 'Interconnection Study Costs',
    content: `ERCOT charges a Screening Study deposit of $10,000 per request plus $1,000 per MW of project capacity. The Full Interconnection Study (FIS) deposit is $150,000 for projects under 300 MW and $250,000 for larger projects. Network Upgrade costs in ERCOT are the responsibility of the interconnecting generator but may be reimbursed pro-rata if subsequent projects use the same upgrades. Transmission Service Providers (TSPs) are responsible for constructing network upgrades within ERCOT.`,
    sourceLabel: 'ERCOT Nodal Protocols, Section 5.3',
  },
  {
    id: 'ercot-voltage-001',
    rtoRegion: 'ERCOT',
    topic: 'Voltage and Capacity Rules',
    content: `In ERCOT, most utility-scale solar projects interconnect at 69 kV or 138 kV. Projects seeking 345 kV interconnection must connect at a ERCOT-designated high-voltage Transmission Substation. The ERCOT Fast Track process is available for projects under 20 MW that can demonstrate they will not cause adverse impacts. ERCOT does not have a central capacity market; energy revenues are the primary revenue source. Projects in West Texas (LCRA TSC and Oncor territory) face the most congested interconnection queues.`,
    sourceLabel: 'ERCOT Operating Guide, Attachment A',
  },
  {
    id: 'ercot-geography-001',
    rtoRegion: 'ERCOT',
    topic: 'Geographic Zones and Congestion',
    content: `ERCOT is divided into Load Zones and Weather Zones. West Texas (WZ_WEST) has the highest solar and wind resource quality but also the highest congestion risk due to limited transmission capacity to population centers. The Competitive Renewable Energy Zone (CREZ) transmission buildout added over 3,600 miles of new 345 kV lines between 2009 and 2013, significantly improving West Texas evacuation capacity. Projects in the Houston zone (HB_HOUSTON) face lower curtailment risk but higher land acquisition costs.`,
    sourceLabel: 'ERCOT Congestion Revenue Right Reports, 2024',
  },

  // ─── PJM ──────────────────────────────────────────────────────────────────

  {
    id: 'pjm-queue-001',
    rtoRegion: 'PJM',
    topic: 'CIFP Cluster Process',
    content: `PJM transitioned to a Capacity Interconnection First Processing (CIFP) cluster-based queue in 2023 under FERC Order 2023. Projects are studied in clusters of 3–5 cycles per year. Each cluster study takes approximately 18–24 months. During the transition period (2023–2025), PJM is processing a backlog of 290+ GW of legacy queue requests under the old serial process. New projects entering after Q3 2023 are in Cluster Window 1, with expected study completion in late 2026.`,
    sourceLabel: 'PJM Manual 14A: Generation and Transmission Interconnection, Rev. 26',
  },
  {
    id: 'pjm-costs-001',
    rtoRegion: 'PJM',
    topic: 'Interconnection Deposits and Study Costs',
    content: `PJM requires a $5,000 application fee plus $4,500 per MW for projects over 20 MW (capped at $7M) as a deposit for the cluster study. Network Upgrade costs in PJM average $150–$300/kW for solar projects within 10 miles of a 138 kV or higher substation. Projects farther than 10 miles from a 230 kV or higher line may face Baseline Upgrade costs exceeding $500/kW. PJM's affected systems coordination with MISO or NYISO adds 3–6 months to study timelines for border-zone projects.`,
    sourceLabel: 'PJM Tariff, Attachment O, Schedule 6',
  },
  {
    id: 'pjm-capacity-001',
    rtoRegion: 'PJM',
    topic: 'Capacity Market and Reliability Requirements',
    content: `PJM operates the Reliability Pricing Model (RPM) capacity market, clearing annually for 3 years forward. Solar resources qualify for capacity under Effective Load-Carrying Capability (ELCC) methodology, which values solar at 10–20% of nameplate capacity depending on geographic zone and assumed storage. New projects must demonstrate capacity qualification in the Base Residual Auction (BRA) or Incremental Auctions. Capacity prices in PJM's RTO zone averaged $28.92/MW-day in the 2025/26 BRA.`,
    sourceLabel: 'PJM RPM Auction Results, June 2024',
  },
  {
    id: 'pjm-seam-001',
    rtoRegion: 'PJM',
    topic: 'PJM/MISO Seam and Joint Studies',
    content: `Projects located within approximately 50 miles of the PJM/MISO border (the "seam") may require Joint Studies with both RTOs under FERC's affected systems coordination requirements. Joint Studies add 6–12 months and significant cost uncertainty. The PJM/MISO seam runs roughly through western Ohio (approximately -84° longitude), western Indiana, and southwestern Michigan. Energy wheeling across the seam is subject to the Joint Operating Agreement (JOA) between PJM and MISO, which governs energy trading, emergency operations, and planning coordination.`,
    sourceLabel: 'PJM-MISO Joint Operating Agreement, November 2023',
  },
  {
    id: 'pjm-ohio-001',
    rtoRegion: 'PJM',
    topic: 'Ohio Sub-Zone Specifics',
    content: `Ohio is served primarily by American Electric Power (AEP Ohio) and FirstEnergy transmission systems within PJM. Western Ohio (west of Columbus, approximately -83° longitude) sits adjacent to the PJM/MISO boundary. Projects in Mercer, Auglaize, Logan, and Union counties Ohio may be flagged for affected systems studies. AEP Ohio's transmission system operates at 138 kV and 345 kV in most of western and central Ohio. The Columbus Load Pocket is a high-demand zone with generally favorable interconnection economics due to proximity to load.`,
    sourceLabel: 'PJM Regional Transmission Expansion Plan (RTEP), Ohio Chapter, 2024',
  },

  // ─── MISO ─────────────────────────────────────────────────────────────────

  {
    id: 'miso-queue-001',
    rtoRegion: 'MISO',
    topic: 'Generator Interconnection Queue',
    content: `MISO processes interconnection requests in annual Definitive Planning Phases (DPP). Each DPP cycle runs approximately 18 months. As of 2024, MISO's active queue contains over 800 GW of pending projects, with solar comprising over 70% of new requests. MISO's Long Range Transmission Planning (LRTP) program identifies network upgrades needed for the energy transition over 20-year horizons. Projects in MISO Midwest (Zone 7–8) face longer queue times than projects in MISO South due to higher queue density.`,
    sourceLabel: 'MISO Generator Interconnection Procedures (MISO Tariff, Attachment X)',
  },
  {
    id: 'miso-costs-001',
    rtoRegion: 'MISO',
    topic: 'Network Upgrade Costs',
    content: `MISO interconnection costs are shared between the generator and transmission system under the Transmission Cost Allocation (TCA) methodology. Network Upgrade costs are split: 90% allocated regionally (shared across all load-serving entities), 10% allocated to the interconnecting generator. This cost-sharing mechanism is more favorable to generators than PJM's fully customer-funded model. Typical generator-assigned network upgrade costs in MISO range from $0–$50/kW for projects within 5 miles of existing 345 kV infrastructure.`,
    sourceLabel: 'MISO Tariff Schedule 26 and Attachment FF',
  },
  {
    id: 'miso-east-west-001',
    rtoRegion: 'MISO',
    topic: 'MISO East/West Seam',
    content: `MISO is divided into MISO Midwest (the "East" footprint covering IL, IN, MI, MN, WI, OH, MO, ND, SD) and MISO South (covering LA, AR, MS, TX panhandle). The two footprints are interconnected via a limited set of 345 kV AC ties and HVDC links. Projects in MISO Indiana (Zone 6) and MISO Illinois (Zone 4) face the most competitive queue environments due to high solar resource potential and proximity to load centers. MISO's Energy Storage Resource (ESR) participation model allows storage to participate in both Energy and Ancillary Services markets.`,
    sourceLabel: 'MISO Footprint and Organizational Structure, 2024',
  },

  // ─── WECC ─────────────────────────────────────────────────────────────────

  {
    id: 'wecc-queue-001',
    rtoRegion: 'WECC',
    topic: 'CAISO and Non-CAISO Interconnection',
    content: `Within WECC, most states have their own Balancing Authority (BA) or Transmission Provider rather than a centralized RTO. California is served by CAISO. Nevada, Arizona, Utah, New Mexico, Colorado, Wyoming, Montana, Idaho, Oregon, and Washington are served by various utilities (NV Energy, APS, PacifiCorp, Idaho Power, etc.). CAISO uses a Cluster Study Process similar to PJM's new model. Non-CAISO areas process interconnection under FERC's Large Generator Interconnection Procedures (LGIP) individually through each transmission provider, with highly variable timelines (12–48 months).`,
    sourceLabel: 'WECC Regional Entity Compliance Monitoring, 2024',
  },
  {
    id: 'wecc-caiso-001',
    rtoRegion: 'WECC',
    topic: 'CAISO Cluster Studies',
    content: `CAISO's Cluster Study process (reformed in 2022 under FERC Order 2023 compliance) groups projects by geographic area and studies them simultaneously. CAISO cluster windows open approximately twice per year. Full Interconnection Study deposits in CAISO range from $100,000 to $500,000 depending on project size. Network Upgrade Costs in CAISO are funded by the interconnecting generator but may receive Deliverability Network Upgrades (DNU) cost allocation through the annual Transmission Planning Process (TPP). CAISO's Resource Adequacy (RA) framework requires load-serving entities to procure 115% of peak load in capacity resources.`,
    sourceLabel: 'CAISO Business Practice Manual (BPM) for Generator Interconnection',
  },

  // ─── SPP ──────────────────────────────────────────────────────────────────

  {
    id: 'spp-queue-001',
    rtoRegion: 'SPP',
    topic: 'Interconnection Queue and Integrated Transmission Planning',
    content: `Southwest Power Pool (SPP) covers Kansas, Oklahoma, Nebraska, South Dakota, North Dakota, parts of Texas, Louisiana, Arkansas, and Missouri. SPP uses a first-come, first-served serial interconnection process but is transitioning to a cluster model under FERC Order 2023 compliance by 2025. SPP's queue contains approximately 200 GW of pending requests. Wind energy dominates the Oklahoma and Kansas queues. SPP's Integrated Transmission Planning (ITP) process identifies long-range network upgrades needed for renewable integration.`,
    sourceLabel: 'SPP Open Access Transmission Tariff (OATT), Attachment V',
  },
  {
    id: 'spp-wind-001',
    rtoRegion: 'SPP',
    topic: 'Wind Resource and Transmission Capacity',
    content: `SPP's footprint contains some of the highest quality wind resources in North America, particularly in western Kansas and the Oklahoma panhandle. However, transmission capacity from high-resource areas to load centers (Dallas/Ft. Worth, Kansas City, Oklahoma City) is constrained. SPP's Priority Projects from its ITP process include over 15,000 MW of new 345 kV transmission in Kansas and Oklahoma to reduce congestion. Solar projects in SPP's Texas footprint (west Texas panhandle, near Amarillo) may interact with ERCOT via DC ties operated by SPS (Southwestern Public Service Company).`,
    sourceLabel: 'SPP Regional Transmission Plan, 2023',
  },

  // ─── NYISO ────────────────────────────────────────────────────────────────

  {
    id: 'nyiso-queue-001',
    rtoRegion: 'NYISO',
    topic: 'Interconnection Process and Offshore Wind',
    content: `NYISO manages interconnection for New York State. The queue is dominated by offshore wind projects targeting state-mandated goals of 9,000 MW of offshore wind by 2035. Land-based solar and storage projects in upstate New York (Zones A–E) face shorter queue times than downstate projects (Zones G–K) which require expensive cables or transmission upgrades. NYISO's Class Year process is similar to PJM's cluster model, studying projects in annual cohorts. Typical Class Year study duration is 18–24 months.`,
    sourceLabel: 'NYISO Generator Interconnection Process Manual (M-13)',
  },
  {
    id: 'nyiso-capacity-001',
    rtoRegion: 'NYISO',
    topic: 'Installed Capacity Market and Locational Considerations',
    content: `NYISO operates the Installed Capacity (ICAP) market. New York City (Zone J) and Long Island (Zone K) are Capacity Constrained Regions requiring local capacity resources. Projects sited upstate that wish to qualify for NYC/LI capacity must demonstrate ability to import power through the Transmission Constraint Benefit Test. Capacity prices in constrained zones can be 3–5× the NYISO Rest-of-State price. The AC Transmission Public Policy projects (including the Champlain Hudson Power Express HVDC line) will add significant import capacity for Zone J by 2025–2026.`,
    sourceLabel: 'NYISO ICAP Market Training Materials, 2024',
  },

  // ─── ISO-NE ───────────────────────────────────────────────────────────────

  {
    id: 'isone-queue-001',
    rtoRegion: 'ISO-NE',
    topic: 'Interconnection Queue and Forward Capacity Market',
    content: `ISO New England (ISO-NE) covers the six New England states. The queue is the smallest of the major RTOs but also has the most constrained transmission system. ISO-NE uses a Class Year (CY) process for interconnection studies. A typical CY runs 2–3 years, making ISO-NE the slowest RTO for interconnection. The Forward Capacity Market (FCM) auctions capacity 3 years forward. New resources must clear in the FCM to receive capacity payments. ISO-NE's minimum offer price rule (MOPR) prevents subsidized resources from suppressing capacity prices.`,
    sourceLabel: 'ISO-NE Planning Procedures, Appendix E',
  },
  {
    id: 'isone-constraints-001',
    rtoRegion: 'ISO-NE',
    topic: 'Transmission Constraints and Import Limits',
    content: `ISO-NE's transmission system is heavily constrained between Maine/New Hampshire and Massachusetts. The Maine Public Utilities interface has limited northward export capacity. Southern New England (Connecticut, Rhode Island, Massachusetts) is import-dependent, with significant transmission upgrades underway. The Taunton to Stoughton project and the Killingly to Norwich 345 kV rebuild are key reliability projects. Import limits from HQ Energy Services (hydro imports from Quebec) are approximately 2,000 MW via the Phase II HVDC tie. Offshore wind (Revolution Wind, Vineyard Wind) will add capacity at multiple onshore injection points along the Massachusetts and Rhode Island coast.`,
    sourceLabel: 'ISO-NE Regional System Plan 2024',
  },
  {
    id: 'isone-costs-001',
    rtoRegion: 'ISO-NE',
    topic: 'Interconnection Costs in New England',
    content: `ISO-NE interconnection costs are among the highest in the US due to aging infrastructure and high construction labor costs in New England. Network Upgrade costs for solar projects in Massachusetts and Connecticut typically range from $300–$800/kW, compared to $50–$200/kW in ERCOT or MISO. Land acquisition costs in New England are also significantly higher than other regions. Projects in Maine and Vermont face lower interconnection costs but higher transmission congestion risk due to the constrained New Hampshire/Massachusetts interface.`,
    sourceLabel: 'ISO-NE Interconnection Cost Benchmark Study, 2023',
  },

  // ─── Cross-RTO General ────────────────────────────────────────────────────

  {
    id: 'ferc-order2023-001',
    rtoRegion: 'all',
    topic: 'FERC Order 2023 — Cluster Study Reform',
    content: `FERC Order 2023 (issued July 2023) mandates all RTOs and ISOs transition from serial (first-come, first-served) interconnection queues to cluster-based processing by June 2025. Under cluster processing, projects are grouped into cycles of approximately 100–150 projects per cycle, studied simultaneously. This eliminates the "serial queue death spiral" where early-queue withdrawals caused cascading cost reallocations to remaining projects. Order 2023 also requires: (1) readiness deposits to deter speculative applications, (2) standardized 150-day study timelines per phase, (3) independent study processes, and (4) co-located storage and hybrid resource provisions.`,
    sourceLabel: 'FERC Order 2023, Docket No. RM22-14-000, July 2023',
  },
  {
    id: 'ferc-fast-track-001',
    rtoRegion: 'all',
    topic: 'Fast Track Interconnection for Small Projects',
    content: `FERC's standardized Fast Track process (under the Small Generator Interconnection Procedures, SGIP) allows projects under 20 MW to skip the full cluster study if they meet certain criteria: (1) the project will not cause adverse system impacts, (2) the project will not increase fault current above protective device ratings, (3) the project does not require network upgrades. Fast Track approval typically takes 45 days. Projects between 20–50 MW may qualify for the Simplified Process in some RTOs. Fast Track is most commonly used for distribution-level solar and behind-the-meter storage projects.`,
    sourceLabel: 'FERC Pro Forma SGIP, Sections 3.2–3.4',
  },
  {
    id: 'hvdc-001',
    rtoRegion: 'all',
    topic: 'HVDC and Long-Distance Transmission Economics',
    content: `High-Voltage Direct Current (HVDC) transmission becomes economically preferable to AC transmission for distances over 300–600 miles, depending on conductor size and terrain. HVDC has lower electrical losses (0.3% per 100 km vs. 0.5% for AC) and can interconnect two asynchronous grids (e.g., ERCOT to SPP). Current HVDC projects under development include the SOO Green (1,000 MW, Iowa to Chicago), the Grain Belt Express (5,000 MW, Kansas to Missouri/Illinois/Indiana), and the Champlain Hudson Power Express (1,250 MW, Quebec to NYC). HVDC converter station costs typically range $200–400M per terminal.`,
    sourceLabel: 'DOE Grid Deployment Office, Transmission Needs Study, 2023',
  },
];
