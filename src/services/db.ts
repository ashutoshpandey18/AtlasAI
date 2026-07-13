import { createClient } from '@libsql/client';
import type { ProjectWorkspace } from '@/types/atlas';

const url = process.env.TURSO_DATABASE_URL || '';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

const client = createClient({
  url,
  authToken,
});

let initPromise: Promise<void> | null = null;

async function initDb() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Create tables if they don't exist
        await client.execute(`
          CREATE TABLE IF NOT EXISTS campaigns (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            useCaseId TEXT NOT NULL,
            requirements TEXT NOT NULL,
            locations TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);

        await client.execute(`
          CREATE TABLE IF NOT EXISTS api_cache (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);

        // Check if we need to seed the table
        const result = await client.execute('SELECT count(*) as count FROM campaigns');
        const count = Number(result.rows[0]?.count || 0);
        if (count === 0) {
          const defaultSeed = getDefaultSeed();
          for (const c of defaultSeed) {
            await client.execute({
              sql: 'INSERT INTO campaigns (id, name, useCaseId, requirements, locations, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
              args: [
                c.id,
                c.name,
                c.useCaseId,
                JSON.stringify(c.requirements),
                JSON.stringify(c.locations),
                c.createdAt
              ]
            });
          }
          console.log('[Turso] Database seeded successfully.');
        }
      } catch (err) {
        console.error('[Turso] Failed to initialize database:', err);
      }
    })();
  }
  return initPromise;
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

export async function getCampaigns(): Promise<ProjectWorkspace[]> {
  await initDb();
  const res = await client.execute('SELECT * FROM campaigns ORDER BY createdAt DESC');
  return res.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    useCaseId: String(row.useCaseId) as any,
    requirements: JSON.parse(String(row.requirements)),
    locations: JSON.parse(String(row.locations)),
    createdAt: String(row.createdAt),
  }));
}

export async function getCampaignById(id: string): Promise<ProjectWorkspace | null> {
  await initDb();
  const res = await client.execute({
    sql: 'SELECT * FROM campaigns WHERE id = ?',
    args: [id]
  });
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: String(row.id),
    name: String(row.name),
    useCaseId: String(row.useCaseId) as any,
    requirements: JSON.parse(String(row.requirements)),
    locations: JSON.parse(String(row.locations)),
    createdAt: String(row.createdAt),
  };
}


export async function saveCampaign(workspace: ProjectWorkspace): Promise<void> {
  await initDb();
  await client.execute({
    sql: `INSERT INTO campaigns (id, name, useCaseId, requirements, locations, createdAt)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            useCaseId = excluded.useCaseId,
            requirements = excluded.requirements,
            locations = excluded.locations,
            createdAt = excluded.createdAt`,
    args: [
      workspace.id,
      workspace.name,
      workspace.useCaseId,
      JSON.stringify(workspace.requirements),
      JSON.stringify(workspace.locations),
      workspace.createdAt
    ]
  });
}

export async function deleteCampaign(id: string): Promise<void> {
  await initDb();
  await client.execute({
    sql: 'DELETE FROM campaigns WHERE id = ?',
    args: [id]
  });
}

export async function getCache(key: string): Promise<any | null> {
  await initDb();
  try {
    const res = await client.execute({
      sql: 'SELECT value FROM api_cache WHERE key = ?',
      args: [key],
    });
    if (res.rows.length === 0) return null;
    return JSON.parse(String(res.rows[0].value));
  } catch (err) {
    console.error('Failed to read from Turso cache:', err);
    return null;
  }
}

export async function setCache(key: string, value: any): Promise<void> {
  await initDb();
  try {
    await client.execute({
      sql: `INSERT INTO api_cache (key, value, createdAt)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
              value = excluded.value,
              createdAt = excluded.createdAt`,
      args: [key, JSON.stringify(value), new Date().toISOString()],
    });
  } catch (err) {
    console.error('Failed to write to Turso cache:', err);
  }
}

