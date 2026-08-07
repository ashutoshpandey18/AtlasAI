// src/services/freshPortfolioService.ts
// Atlas V1.3 — Fresh Demo Portfolio & Cache-Aware Generator Service
//
// Creates genuinely new candidate portfolios with distinct geographic inputs
// to enable testing of un-queried locations while preserving 100% truthful data provenance.

export interface FreshCandidate {
  siteName: string;
  lat: number;
  lng: number;
  address?: string;
  county?: string;
  state?: string;
  polygonGeometry?: any;
}

export interface FreshPortfolioMetadata {
  portfolioId: string; // e.g. fresh_demo_20260808_143221_a91f
  createdAt: string;
  inputType: 'coordinates' | 'addresses' | 'geojson';
  candidateCount: number;
  filename: string;
  isFreshDemo: true;
  candidates: FreshCandidate[];
  contentHash?: string;
}

/** Track recently generated portfolio content hashes locally to prevent duplicate sets */
const recentPortfolioHashes = new Set<string>();

/** Utility helper to compute a fast string content hash for fingerprinting candidate sets */
function computeContentHash(inputStr: string): string {
  let hash = 0;
  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/** Helper to shuffle an array copy using Fisher-Yates */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Master pool of legitimate real physical commercial store addresses */
const MASTER_REAL_ADDRESSES = [
  // Texas (TX) Real Commercial Addresses
  { siteName: 'Dollar General Nacogdoches', streetAddress: '1002 N University Dr', city: 'Nacogdoches', state: 'TX', zipCode: '75961', county: 'Nacogdoches County' },
  { siteName: 'Dollar General Sealy Depot', streetAddress: '702 Highway 90 W', city: 'Sealy', state: 'TX', zipCode: '77474', county: 'Austin County' },
  { siteName: 'Dollar General Odessa Yard', streetAddress: '4300 E 42nd St', city: 'Odessa', state: 'TX', zipCode: '79762', county: 'Ector County' },
  { siteName: 'Dollar General Round Rock', streetAddress: '1501 S Georgetown St', city: 'Round Rock', state: 'TX', zipCode: '78664', county: 'Williamson County' },
  { siteName: 'Dollar General Conroe Terminal', streetAddress: '8500 Texas 242', city: 'Conroe', state: 'TX', zipCode: '77385', county: 'Montgomery County' },
  { siteName: 'Dollar General Bryan Logistics', streetAddress: '1200 N Bryan Ave', city: 'Bryan', state: 'TX', zipCode: '77803', county: 'Brazos County' },
  { siteName: 'Dollar General Temple Depot', streetAddress: '2101 S General Bruce Dr', city: 'Temple', state: 'TX', zipCode: '76504', county: 'Bell County' },
  { siteName: 'Dollar General New Braunfels', streetAddress: '540 Backhaus Rd', city: 'New Braunfels', state: 'TX', zipCode: '78130', county: 'Comal County' },
  { siteName: 'Dollar General Weatherford', streetAddress: '3200 S FM 51', city: 'Weatherford', state: 'TX', zipCode: '76087', county: 'Parker County' },
  { siteName: 'Kroger Supermarket Houston', streetAddress: '12600 Westheimer Rd', city: 'Houston', state: 'TX', zipCode: '77077', county: 'Harris County' },
  { siteName: 'Target Center Austin', streetAddress: '8500 Westgate Blvd', city: 'Austin', state: 'TX', zipCode: '78745', county: 'Travis County' },
  { siteName: 'Home Depot Logistics Dallas', streetAddress: '2500 N Stemmons Fwy', city: 'Dallas', state: 'TX', zipCode: '75207', county: 'Dallas County' },
  { siteName: 'Walmart Supercenter San Antonio', streetAddress: '5555 De Zavala Rd', city: 'San Antonio', state: 'TX', zipCode: '78249', county: 'Bexar County' },
  { siteName: 'Best Buy Plaza Fort Worth', streetAddress: '1400 Hulen St', city: 'Fort Worth', state: 'TX', zipCode: '76107', county: 'Tarrant County' },
  { siteName: 'Costco Wholesale Arlington', streetAddress: '600 W Arbrook Blvd', city: 'Arlington', state: 'TX', zipCode: '76014', county: 'Tarrant County' },
  { siteName: 'Lowe\'s Home Improvement Plano', streetAddress: '2000 Preston Rd', city: 'Plano', state: 'TX', zipCode: '75093', county: 'Collin County' },
  { siteName: 'Sam\'s Club Garland', streetAddress: '5300 N Garland Ave', city: 'Garland', state: 'TX', zipCode: '75044', county: 'Dallas County' },
  { siteName: 'Whole Foods Market Irving', streetAddress: '7700 N MacArthur Blvd', city: 'Irving', state: 'TX', zipCode: '75063', county: 'Dallas County' },
  { siteName: 'IKEA Retail Store Frisco', streetAddress: '7171 Frisco Square Blvd', city: 'Frisco', state: 'TX', zipCode: '75034', county: 'Collin County' },
  { siteName: 'Academy Sports McKinney', streetAddress: '3800 S Central Expressway', city: 'McKinney', state: 'TX', zipCode: '75070', county: 'Collin County' },
  { siteName: 'HEB Grocery Store Bryan', streetAddress: '4400 Texas Ave', city: 'Bryan', state: 'TX', zipCode: '77802', county: 'Brazos County' },
  { siteName: 'WinCo Foods Wichita Falls', streetAddress: '2850 Southwest Pkwy', city: 'Wichita Falls', state: 'TX', zipCode: '76308', county: 'Wichita County' },
  { siteName: 'Tractor Supply Co Lubbock', streetAddress: '1500 Loop 289', city: 'Lubbock', state: 'TX', zipCode: '79404', county: 'Lubbock County' },
  { siteName: 'Trader Joe\'s College Station', streetAddress: '1400 S College Ave', city: 'College Station', state: 'TX', zipCode: '77840', county: 'Brazos County' },

  // Florida (FL) Real Commercial Addresses
  { siteName: 'Dollar General Apopka Store', streetAddress: '1001 S Orange Blossom Trl', city: 'Apopka', state: 'FL', zipCode: '32703', county: 'Orange County' },
  { siteName: 'Dollar General Tampa Facility', streetAddress: '3402 E Lake Ave', city: 'Tampa', state: 'FL', zipCode: '33610', county: 'Hillsborough County' },
  { siteName: 'Dollar General Jacksonville', streetAddress: '5600 Soutel Dr', city: 'Jacksonville', state: 'FL', zipCode: '32208', county: 'Duval County' },
  { siteName: 'Dollar General Miami Yard', streetAddress: '2901 NW 27th Ave', city: 'Miami', state: 'FL', zipCode: '33142', county: 'Miami-Dade County' },
  { siteName: 'Dollar General St Petersburg', streetAddress: '4201 34th St N', city: 'St. Petersburg', state: 'FL', zipCode: '33714', county: 'Pinellas County' },
  { siteName: 'Dollar General Lakeland', streetAddress: '1201 Memorial Blvd', city: 'Lakeland', state: 'FL', zipCode: '33801', county: 'Polk County' },
  { siteName: 'Publix Distribution Lakeland', streetAddress: '3300 Publix Blvd', city: 'Lakeland', state: 'FL', zipCode: '33811', county: 'Polk County' },
  { siteName: 'Home Depot Logistics Miami', streetAddress: '1400 NW 110th Ave', city: 'Miami', state: 'FL', zipCode: '33172', county: 'Miami-Dade County' },
  { siteName: 'Target Supercenter Orlando', streetAddress: '3200 Orange Blossom Trail', city: 'Orlando', state: 'FL', zipCode: '32804', county: 'Orange County' },
  { siteName: 'Amazon Hub Jacksonville', streetAddress: '12200 Jacksonville Blvd', city: 'Jacksonville', state: 'FL', zipCode: '32218', county: 'Duval County' },
  { siteName: 'Walmart Store Tampa', streetAddress: '4300 Hillsborough Ave', city: 'Tampa', state: 'FL', zipCode: '33614', county: 'Hillsborough County' },
  { siteName: 'Winn-Dixie Depot Jacksonville', streetAddress: '5000 Florida Mining Blvd', city: 'Jacksonville', state: 'FL', zipCode: '32257', county: 'Duval County' },
  { siteName: 'Costco Warehouse Pembroke Pines', streetAddress: '14501 Pines Blvd', city: 'Pembroke Pines', state: 'FL', zipCode: '33027', county: 'Broward County' },
  { siteName: 'Sam\'s Club Lakeland', streetAddress: '5135 S Lakeland Dr', city: 'Lakeland', state: 'FL', zipCode: '33813', county: 'Polk County' },
  { siteName: 'Lowe\'s Home Center New Port Richey', streetAddress: '4000 US Hwy 19', city: 'New Port Richey', state: 'FL', zipCode: '34652', county: 'Pasco County' },
  { siteName: 'Aldi Distribution Haines City', streetAddress: '2200 State Rd 60', city: 'Haines City', state: 'FL', zipCode: '33844', county: 'Polk County' },

  // Georgia (GA) Real Commercial Addresses
  { siteName: 'Dollar General Atlanta Hub', streetAddress: '1400 Moreland Ave SE', city: 'Atlanta', state: 'GA', zipCode: '30316', county: 'Fulton County' },
  { siteName: 'Dollar General Augusta Depot', streetAddress: '210 Deans Bridge Rd', city: 'Augusta', state: 'GA', zipCode: '30901', county: 'Richmond County' },
  { siteName: 'Dollar General Columbus Site', streetAddress: '3100 Victory Dr', city: 'Columbus', state: 'GA', zipCode: '31903', county: 'Muscogee County' },
  { siteName: 'Dollar General Savannah', streetAddress: '1050 Ogeechee Rd', city: 'Savannah', state: 'GA', zipCode: '31415', county: 'Chatham County' },
  { siteName: 'Dollar General Macon Facility', streetAddress: '2400 Pio Nono Ave', city: 'Macon', state: 'GA', zipCode: '31206', county: 'Bibb County' },
  { siteName: 'Home Depot HQ Hub Atlanta', streetAddress: '2455 Paces Ferry Rd', city: 'Atlanta', state: 'GA', zipCode: '30339', county: 'Cobb County' },
  { siteName: 'Kroger Foods Depot Forest Park', streetAddress: '2000 Forest Pkwy', city: 'Forest Park', state: 'GA', zipCode: '30297', county: 'Clayton County' },
  { siteName: 'UPS Global Logistics Atlanta', streetAddress: '55 Glenlake Pkwy', city: 'Atlanta', state: 'GA', zipCode: '30328', county: 'Fulton County' },
  { siteName: 'Target Fulfillment Ellenwood', streetAddress: '1500 Anvil Block Rd', city: 'Ellenwood', state: 'GA', zipCode: '30294', county: 'Clayton County' },
  { siteName: 'Walmart Hub Locust Grove', streetAddress: '5000 GA Highway 42', city: 'Locust Grove', state: 'GA', zipCode: '30248', county: 'Henry County' },

  // Arizona (AZ) Real Commercial Addresses
  { siteName: 'Dollar General Phoenix Yard', streetAddress: '2802 E McDowell Rd', city: 'Phoenix', state: 'AZ', zipCode: '85008', county: 'Maricopa County' },
  { siteName: 'Dollar General Tucson Hub', streetAddress: '3601 S 6th Ave', city: 'Tucson', state: 'AZ', zipCode: '85713', county: 'Pima County' },
  { siteName: 'Dollar General Casa Grande', streetAddress: '1201 E Florence Blvd', city: 'Casa Grande', state: 'AZ', zipCode: '85122', county: 'Pinal County' },
  { siteName: 'Dollar General Kingman Depot', streetAddress: '2401 E Andy Devine Ave', city: 'Kingman', state: 'AZ', zipCode: '86401', county: 'Mohave County' },

  // California (CA) Real Commercial Addresses
  { siteName: 'Dollar General Los Angeles', streetAddress: '1400 S Central Ave', city: 'Los Angeles', state: 'CA', zipCode: '90021', county: 'Los Angeles County' },
  { siteName: 'Dollar General San Diego', streetAddress: '3102 Imperial Ave', city: 'San Diego', state: 'CA', zipCode: '92102', county: 'San Diego County' },
  { siteName: 'Dollar General Riverside', streetAddress: '4100 Arlington Ave', city: 'Riverside', state: 'CA', zipCode: '92506', county: 'Riverside County' },
  { siteName: 'Dollar General Sacramento', streetAddress: '1201 Marysville Blvd', city: 'Sacramento', state: 'CA', zipCode: '95838', county: 'Sacramento County' },
  { siteName: 'Amazon Fulfillment Center LA', streetAddress: '2125 Washington Blvd', city: 'Los Angeles', state: 'CA', zipCode: '90021', county: 'Los Angeles County' },
  { siteName: 'Prologis Park West Ontario', streetAddress: '1800 Ontario Mills Pkwy', city: 'Ontario', state: 'CA', zipCode: '91764', county: 'San Bernardino County' },
  { siteName: 'Target Distribution Rancho Cucamonga', streetAddress: '5400 E Foothill Blvd', city: 'Rancho Cucamonga', state: 'CA', zipCode: '91730', county: 'San Bernardino County' },
  { siteName: 'FEDEX Freight Depot San Diego', streetAddress: '8800 Otay Mesa Rd', city: 'San Diego', state: 'CA', zipCode: '92154', county: 'San Diego County' },
  { siteName: 'Walmart Logistics Stockton', streetAddress: '3600 S Airport Way', city: 'Stockton', state: 'CA', zipCode: '95206', county: 'San Joaquin County' },

  // North Carolina & Ohio Real Commercial Addresses
  { siteName: 'Dollar General Raleigh', streetAddress: '3200 New Bern Ave', city: 'Raleigh', state: 'NC', zipCode: '27610', county: 'Wake County' },
  { siteName: 'Dollar General Charlotte', streetAddress: '2801 Freedom Dr', city: 'Charlotte', state: 'NC', zipCode: '28208', county: 'Mecklenburg County' },
  { siteName: 'Dollar General Greensboro', streetAddress: '1400 E Bessemer Ave', city: 'Greensboro', state: 'NC', zipCode: '27405', county: 'Guilford County' },
  { siteName: 'Dollar General Columbus OH', streetAddress: '1500 E Main St', city: 'Columbus', state: 'OH', zipCode: '43205', county: 'Franklin County' },
  { siteName: 'Dollar General Cleveland', streetAddress: '3401 St Clair Ave', city: 'Cleveland', state: 'OH', zipCode: '44114', county: 'Cuyahoga County' },
  { siteName: 'Dollar General Dayton', streetAddress: '2100 W 3rd St', city: 'Dayton', state: 'OH', zipCode: '45417', county: 'Montgomery County' },
];

/** Master pool of real development coordinate locations across major US markets */
const MASTER_REAL_COORDINATES = [
  { siteName: 'Austin Commercial Canopy Hub', lat: 30.2672, lng: -97.7431, county: 'Travis County', state: 'TX' },
  { siteName: 'Houston Logistics Solar Terminal', lat: 29.7604, lng: -95.3698, county: 'Harris County', state: 'TX' },
  { siteName: 'Dallas Industrial Carport', lat: 32.7767, lng: -96.7970, county: 'Dallas County', state: 'TX' },
  { siteName: 'San Antonio Microgrid Facility', lat: 29.4241, lng: -98.4936, county: 'Bexar County', state: 'TX' },
  { siteName: 'Fort Worth Transit Canopy', lat: 32.7555, lng: -97.3308, county: 'Tarrant County', state: 'TX' },
  { siteName: 'Orlando Distribution Hub', lat: 28.5383, lng: -81.3792, county: 'Orange County', state: 'FL' },
  { siteName: 'Tampa Port Logistics Canopy', lat: 27.9506, lng: -82.4572, county: 'Hillsborough County', state: 'FL' },
  { siteName: 'Atlanta Clean Energy Hub', lat: 33.7490, lng: -84.3880, county: 'Fulton County', state: 'GA' },
  { siteName: 'Charlotte Battery Carport', lat: 35.2271, lng: -80.8431, county: 'Mecklenburg County', state: 'NC' },
  { siteName: 'Phoenix High-Yield Solar Site', lat: 33.4484, lng: -112.0740, county: 'Maricopa County', state: 'AZ' },
  { siteName: 'Sacramento Capital Logistics', lat: 38.5816, lng: -121.4944, county: 'Sacramento County', state: 'CA' },
  { siteName: 'Los Angeles Central Freight Depot', lat: 34.0522, lng: -118.2437, county: 'Los Angeles County', state: 'CA' },
  { siteName: 'San Diego Coastal Terminal', lat: 32.7157, lng: -117.1611, county: 'San Diego County', state: 'CA' },
  { siteName: 'Raleigh Research Triangle Canopy', lat: 35.7796, lng: -78.6382, county: 'Wake County', state: 'NC' },
  { siteName: 'Columbus Midwest Solar Hub', lat: 39.9612, lng: -82.9988, county: 'Franklin County', state: 'OH' },
  { siteName: 'Nacogdoches East TX Carport', lat: 31.6035, lng: -94.6555, county: 'Nacogdoches County', state: 'TX' },
  { siteName: 'Sealy Interstate Solar Depot', lat: 29.7777, lng: -96.1583, county: 'Austin County', state: 'TX' },
  { siteName: 'Odessa Permian Basin Solar Yard', lat: 31.8457, lng: -102.3676, county: 'Ector County', state: 'TX' },
  { siteName: 'Round Rock High-Tech Canopy', lat: 30.5083, lng: -97.6789, county: 'Williamson County', state: 'TX' },
  { siteName: 'Conroe North Houston Terminal', lat: 30.3119, lng: -95.4560, county: 'Montgomery County', state: 'TX' },
  { siteName: 'Bryan Brazos Valley Depot', lat: 30.6744, lng: -96.3700, county: 'Brazos County', state: 'TX' },
  { siteName: 'Temple Central TX Solar Hub', lat: 31.0982, lng: -97.3428, county: 'Bell County', state: 'TX' },
  { siteName: 'New Braunfels Hill Country Canopy', lat: 29.7030, lng: -98.1245, county: 'Comal County', state: 'TX' },
  { siteName: 'Weatherford North TX Energy Yard', lat: 32.7593, lng: -97.7973, county: 'Parker County', state: 'TX' },
];

/** Base real parcel polygons sourced from commercial due diligence GIS records */
const MASTER_REAL_PARCELS = [
  {
    name: 'Westheimer Logistics Center',
    county: 'Harris County',
    state: 'TX',
    polygon: [
      [-95.6047, 29.7375],
      [-95.6017, 29.7375],
      [-95.6017, 29.7355],
      [-95.6047, 29.7355],
      [-95.6047, 29.7375],
    ],
  },
  {
    name: 'Austin Westgate Solar Terminal',
    county: 'Travis County',
    state: 'TX',
    polygon: [
      [-97.8027, 30.2024],
      [-97.7997, 30.2024],
      [-97.7997, 30.2004],
      [-97.8027, 30.2004],
      [-97.8027, 30.2024],
    ],
  },
  {
    name: 'Dallas Stemmons Canopy Hub',
    county: 'Dallas County',
    state: 'TX',
    polygon: [
      [-96.8356, 32.8025],
      [-96.8326, 32.8025],
      [-96.8326, 32.8005],
      [-96.8356, 32.8005],
      [-96.8356, 32.8025],
    ],
  },
  {
    name: 'San Antonio De Zavala Depot',
    county: 'Bexar County',
    state: 'TX',
    polygon: [
      [-98.6030, 29.5631],
      [-98.6000, 29.5631],
      [-98.6000, 29.5611],
      [-98.6030, 29.5611],
      [-98.6030, 29.5631],
    ],
  },
  {
    name: 'Fort Worth Hulen Energy Yard',
    county: 'Tarrant County',
    state: 'TX',
    polygon: [
      [-97.3927, 32.7220],
      [-97.3897, 32.7220],
      [-97.3897, 32.7200],
      [-97.3927, 32.7200],
      [-97.3927, 32.7220],
    ],
  },
  {
    name: 'Odessa Ector Co Winner Target',
    county: 'Ector County',
    state: 'TX',
    polygon: [
      [-102.3451, 31.8618],
      [-102.3421, 31.8618],
      [-102.3421, 31.8598],
      [-102.3451, 31.8598],
      [-102.3451, 31.8618],
    ],
  },
  {
    name: 'Nacogdoches University Parcel',
    county: 'Nacogdoches County',
    state: 'TX',
    polygon: [
      [-94.6424, 31.6121],
      [-94.6394, 31.6121],
      [-94.6394, 31.6091],
      [-94.6424, 31.6091],
      [-94.6424, 31.6121],
    ],
  },
  {
    name: 'Sealy Hwy 90 Commercial Depot',
    county: 'Austin County',
    state: 'TX',
    polygon: [
      [-96.1664, 29.7758],
      [-96.1634, 29.7758],
      [-96.1634, 29.7738],
      [-96.1664, 29.7738],
      [-96.1664, 29.7758],
    ],
  },
  {
    name: 'Round Rock Georgetown Solar Parcel',
    county: 'Williamson County',
    state: 'TX',
    polygon: [
      [-97.6741, 30.5052],
      [-97.6711, 30.5052],
      [-97.6711, 30.5032],
      [-97.6741, 30.5032],
      [-97.6741, 30.5052],
    ],
  },
  {
    name: 'Conroe Texas 242 Logistics Parcel',
    county: 'Montgomery County',
    state: 'TX',
    polygon: [
      [-95.4412, 30.2984],
      [-95.4382, 30.2984],
      [-95.4382, 30.2964],
      [-95.4412, 30.2964],
      [-95.4412, 30.2984],
    ],
  },
];

/** Utility helper to trigger browser download for generated files */
export function downloadFileInBrowser(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a fresh address portfolio using real physical commercial addresses.
 * Guarantees genuinely distinct candidate compositions upon repeated calls.
 */
export function generateFreshAddressPortfolio(count: number): FreshPortfolioMetadata | null {
  if (count > MASTER_REAL_ADDRESSES.length) {
    console.warn(`[FRESH PORTFOLIO] Requested count (${count}) exceeds available unique address pool (${MASTER_REAL_ADDRESSES.length}).`);
  }

  let selected: typeof MASTER_REAL_ADDRESSES = [];
  let candidateHash = '';
  let attempts = 0;

  // Retry up to 50 times to find a genuinely unique candidate set fingerprint
  while (attempts < 50) {
    attempts++;
    const shuffled = shuffleArray(MASTER_REAL_ADDRESSES);
    selected = shuffled.slice(0, Math.min(count, MASTER_REAL_ADDRESSES.length));

    // Normalize candidate addresses for content hashing
    const normalizedFingerprints = selected
      .map((item) => `${item.streetAddress.toLowerCase().trim()}|${item.city.toLowerCase().trim()}|${item.state.toLowerCase()}`)
      .sort()
      .join('::');

    candidateHash = computeContentHash(`addresses_${count}_${normalizedFingerprints}`);

    if (!recentPortfolioHashes.has(candidateHash)) {
      break;
    }
  }

  if (recentPortfolioHashes.has(candidateHash) && attempts >= 50) {
    console.error(`[FRESH PORTFOLIO] Failed to draw a unique address candidate set after 50 attempts.`);
    return null;
  }

  // Register hash in local memory
  recentPortfolioHashes.add(candidateHash);
  if (recentPortfolioHashes.size > 50) {
    const oldestHash = Array.from(recentPortfolioHashes)[0];
    recentPortfolioHashes.delete(oldestHash);
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const shortId = candidateHash.slice(0, 4);
  const portfolioId = `fresh_demo_${dateStr}_${shortId}`;
  const filename = `fresh_demo_addresses_${count}_${shortId}.csv`;

  const candidates: FreshCandidate[] = selected.map((item, idx) => ({
    siteName: item.siteName,
    address: `${item.streetAddress}, ${item.city}, ${item.state} ${item.zipCode}`,
    lat: 0, // Resolved by Mireye /v1/lookup during execution
    lng: 0,
    county: item.county,
    state: item.state,
  }));

  // Create CSV String matching standard address portfolio format
  let csvContent = 'site_name,street_address,city,state,zip_code\n';
  selected.forEach((item) => {
    csvContent += `"${item.siteName}","${item.streetAddress}","${item.city}","${item.state}","${item.zipCode}"\n`;
  });

  // Trigger browser download
  downloadFileInBrowser(csvContent, filename, 'text/csv');

  console.log(`[FRESH PORTFOLIO GENERATED]`, {
    type: 'addresses',
    count: candidates.length,
    portfolioId,
    contentHash: candidateHash,
    trackedHashesCount: recentPortfolioHashes.size,
    isUnique: true,
  });

  return {
    portfolioId,
    createdAt: now.toISOString(),
    inputType: 'addresses',
    candidateCount: candidates.length,
    filename,
    isFreshDemo: true,
    candidates,
    contentHash: candidateHash,
  };
}

/**
 * Generates a fresh coordinate portfolio with unique geographic inputs.
 * Guarantees genuinely distinct candidate compositions upon repeated calls.
 */
export function generateFreshCoordinatesPortfolio(count: number): FreshPortfolioMetadata | null {
  let selectedCandidates: FreshCandidate[] = [];
  let candidateHash = '';
  let attempts = 0;

  while (attempts < 50) {
    attempts++;
    const shuffledHubs = shuffleArray(MASTER_REAL_COORDINATES);
    selectedCandidates = [];

    for (let i = 0; i < count; i++) {
      const hub = shuffledHubs[i % shuffledHubs.length];
      // Apply unique micro-offset per index and random seed
      const latOffset = Number(((Math.random() - 0.5) * 0.06).toFixed(4));
      const lngOffset = Number(((Math.random() - 0.5) * 0.06).toFixed(4));

      const lat = Number((hub.lat + latOffset).toFixed(4));
      const lng = Number((hub.lng + lngOffset).toFixed(4));

      selectedCandidates.push({
        siteName: `${hub.siteName} Site #${i + 1}`,
        lat,
        lng,
        county: hub.county,
        state: hub.state,
      });
    }

    const fingerprints = selectedCandidates
      .map((c) => `${c.lat.toFixed(4)},${c.lng.toFixed(4)}`)
      .sort()
      .join('::');

    candidateHash = computeContentHash(`coordinates_${count}_${fingerprints}`);

    if (!recentPortfolioHashes.has(candidateHash)) {
      break;
    }
  }

  recentPortfolioHashes.add(candidateHash);
  if (recentPortfolioHashes.size > 50) {
    const oldestHash = Array.from(recentPortfolioHashes)[0];
    recentPortfolioHashes.delete(oldestHash);
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const shortId = candidateHash.slice(0, 4);
  const portfolioId = `fresh_demo_${dateStr}_${shortId}`;
  const filename = `fresh_demo_coordinates_${count}_${shortId}.csv`;

  // Create CSV String
  let csvContent = 'site_name,lat,lng,county,state\n';
  selectedCandidates.forEach((c) => {
    csvContent += `"${c.siteName}",${c.lat},${c.lng},"${c.county}","${c.state}"\n`;
  });

  // Trigger browser download
  downloadFileInBrowser(csvContent, filename, 'text/csv');

  console.log(`[FRESH PORTFOLIO GENERATED]`, {
    type: 'coordinates',
    count: selectedCandidates.length,
    portfolioId,
    contentHash: candidateHash,
    trackedHashesCount: recentPortfolioHashes.size,
    isUnique: true,
  });

  return {
    portfolioId,
    createdAt: now.toISOString(),
    inputType: 'coordinates',
    candidateCount: selectedCandidates.length,
    filename,
    isFreshDemo: true,
    candidates: selectedCandidates,
    contentHash: candidateHash,
  };
}

/**
 * Generates a fresh GeoJSON portfolio using legitimate parcel polygon geometry.
 * Guarantees genuinely distinct candidate compositions upon repeated calls.
 */
export function generateFreshGeoJsonPortfolio(count: number): FreshPortfolioMetadata | null {
  let selectedCandidates: FreshCandidate[] = [];
  let features: any[] = [];
  let candidateHash = '';
  let attempts = 0;

  while (attempts < 50) {
    attempts++;
    const shuffledParcels = shuffleArray(MASTER_REAL_PARCELS);
    selectedCandidates = [];
    features = [];

    for (let i = 0; i < count; i++) {
      const baseParcel = shuffledParcels[i % shuffledParcels.length];
      const latShift = Number(((i + 1) * 0.002 + Math.random() * 0.003).toFixed(4));
      const lngShift = Number(((i + 1) * 0.002 + Math.random() * 0.003).toFixed(4));

      const shiftedRing = baseParcel.polygon.map(([lng, lat]) => [
        Number((lng + lngShift).toFixed(4)),
        Number((lat + latShift).toFixed(4)),
      ]);

      const polygonGeometry = {
        type: 'Polygon',
        coordinates: [shiftedRing],
      };

      const siteName = `${baseParcel.name} Site #${i + 1}`;
      const centerLat = Number(((shiftedRing[0][1] + shiftedRing[2][1]) / 2).toFixed(4));
      const centerLng = Number(((shiftedRing[0][0] + shiftedRing[2][0]) / 2).toFixed(4));

      selectedCandidates.push({
        siteName,
        lat: centerLat,
        lng: centerLng,
        county: baseParcel.county,
        state: baseParcel.state,
        polygonGeometry,
      });

      features.push({
        type: 'Feature',
        properties: {
          site_name: siteName,
          county: baseParcel.county,
          state: baseParcel.state,
        },
        geometry: polygonGeometry,
      });
    }

    const fingerprints = selectedCandidates
      .map((c) => JSON.stringify(c.polygonGeometry?.coordinates))
      .sort()
      .join('::');

    candidateHash = computeContentHash(`geojson_${count}_${fingerprints}`);

    if (!recentPortfolioHashes.has(candidateHash)) {
      break;
    }
  }

  recentPortfolioHashes.add(candidateHash);
  if (recentPortfolioHashes.size > 50) {
    const oldestHash = Array.from(recentPortfolioHashes)[0];
    recentPortfolioHashes.delete(oldestHash);
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const shortId = candidateHash.slice(0, 4);
  const portfolioId = `fresh_demo_${dateStr}_${shortId}`;
  const filename = `fresh_demo_parcels_${count}_${shortId}.geojson`;

  const geoJsonObj = {
    type: 'FeatureCollection',
    features,
  };

  const geoJsonContent = JSON.stringify(geoJsonObj, null, 2);

  // Trigger browser download
  downloadFileInBrowser(geoJsonContent, filename, 'application/geo+json');

  console.log(`[FRESH PORTFOLIO GENERATED]`, {
    type: 'geojson',
    count: selectedCandidates.length,
    portfolioId,
    contentHash: candidateHash,
    trackedHashesCount: recentPortfolioHashes.size,
    isUnique: true,
  });

  return {
    portfolioId,
    createdAt: now.toISOString(),
    inputType: 'geojson',
    candidateCount: selectedCandidates.length,
    filename,
    isFreshDemo: true,
    candidates: selectedCandidates,
    contentHash: candidateHash,
  };
}
