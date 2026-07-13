import fs from 'fs';
import path from 'path';
import type { ProjectWorkspace } from '@/types/atlas';

const FILE_PATH = path.resolve(process.cwd(), 'campaigns.json');

// Global in-memory fallback for serverless environments (like Vercel)
const globalForCampaigns = global as unknown as {
  _inMemoryCampaigns?: ProjectWorkspace[];
  _hasLoadedFromFile?: boolean;
};

if (!globalForCampaigns._inMemoryCampaigns) {
  globalForCampaigns._inMemoryCampaigns = [];
  globalForCampaigns._hasLoadedFromFile = false;
}

function getDefaultSeed(): ProjectWorkspace[] {
  return [
    {
      id: 'campaign-demo-solar',
      name: 'Solar Farm Campaign',
      useCaseId: 'solar-farm',
      requirements: { project_size: 'large', cultivated_ok: true },
      locations: [
        { id: 'loc-ohio', address: 'Pickaway County, OH', label: 'Pickaway County, OH', lat: 39.6012, lng: -82.9463, geocoding: false, geocoded: true, error: null }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'campaign-demo-warehouse',
      name: 'Warehouse Campaign',
      useCaseId: 'warehouse',
      requirements: { rail_required: false, power_requirement: 'medium', flood_tolerance: false },
      locations: [
        { id: 'loc-memphis', address: 'Memphis, TN', label: 'Memphis, TN', lat: 35.1495, lng: -90.0490, geocoding: false, geocoded: true, error: null }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'campaign-demo-retail',
      name: 'Retail Store Campaign',
      useCaseId: 'retail-store',
      requirements: { drive_thru: false, traffic_type: 'mixed' },
      locations: [
        { id: 'loc-florida', address: 'Central Florida Site', label: 'Central Florida Site', lat: 27.7568, lng: -81.4640, geocoding: false, geocoded: true, error: null }
      ],
      createdAt: new Date().toISOString()
    }
  ];
}

function readData(): ProjectWorkspace[] {
  // If we already loaded data and are running in serverless fallback mode, use memory
  if (globalForCampaigns._hasLoadedFromFile && globalForCampaigns._inMemoryCampaigns!.length > 0) {
    return globalForCampaigns._inMemoryCampaigns!;
  }

  try {
    let campaignsList: ProjectWorkspace[] = [];
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, 'utf-8');
      campaignsList = JSON.parse(raw);
    } else {
      campaignsList = getDefaultSeed();
    }
    
    globalForCampaigns._inMemoryCampaigns = campaignsList;
    globalForCampaigns._hasLoadedFromFile = true;
    return campaignsList;
  } catch (error) {
    console.warn('Read campaigns.json failed (likely serverless environment). Using in-memory fallback.', error);
    if (!globalForCampaigns._hasLoadedFromFile) {
      globalForCampaigns._inMemoryCampaigns = getDefaultSeed();
      globalForCampaigns._hasLoadedFromFile = true;
    }
    return globalForCampaigns._inMemoryCampaigns!;
  }
}

function writeData(data: ProjectWorkspace[]): void {
  // Always update in-memory array first
  globalForCampaigns._inMemoryCampaigns = data;

  try {
    // Attempt to write to file system (works on localhost)
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    // Catch EROFS (Read-only file system) on Vercel silently, allowing in-memory fallback to work
    console.warn('Write campaigns.json failed (serverless environment). Saved in-memory instead.', error);
  }
}

export async function getCampaigns(): Promise<ProjectWorkspace[]> {
  return readData();
}

export async function getCampaignById(id: string): Promise<ProjectWorkspace | null> {
  const data = readData();
  return data.find((c) => c.id === id) || null;
}

export async function saveCampaign(workspace: ProjectWorkspace): Promise<void> {
  const data = readData();
  const idx = data.findIndex((c) => c.id === workspace.id);
  if (idx > -1) {
    data[idx] = workspace;
  } else {
    data.push(workspace);
  }
  writeData(data);
}

export async function deleteCampaign(id: string): Promise<void> {
  const data = readData();
  const filtered = data.filter((c) => c.id !== id);
  writeData(filtered);
}
