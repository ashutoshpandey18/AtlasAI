import fs from 'fs';
import path from 'path';
import type { ProjectWorkspace } from '@/types/atlas';

const FILE_PATH = path.resolve(process.cwd(), 'campaigns.json');

function readData(): ProjectWorkspace[] {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      // Seed default campaigns if the file doesn't exist
      const defaultCampaigns: ProjectWorkspace[] = [
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
      fs.writeFileSync(FILE_PATH, JSON.stringify(defaultCampaigns, null, 2), 'utf-8');
      return defaultCampaigns;
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read campaigns.json', error);
    return [];
  }
}

function writeData(data: ProjectWorkspace[]): void {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write campaigns.json', error);
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
