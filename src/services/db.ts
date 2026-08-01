import { createClient } from '@libsql/client';
import type { ProjectWorkspace } from '@/types/atlas';

const url = process.env.TURSO_DATABASE_URL || 'file:atlas.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

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
  const sampleLocations = Array.from({ length: 66 }, (_, i) => ({
    id: `loc-${i}`,
    address: `Dollar General Candidate Site #${i + 101}`,
    label: `Candidate Site #${i + 101}`,
    lat: 31.8608 + (i * 0.01),
    lng: -102.3436 - (i * 0.01),
    geocoding: false,
    geocoded: true,
  }));

  return [
    {
      id: 'camp-tx-01',
      name: 'Find fast-deployment solar carport targets in Texas under $2M capex.',
      useCaseId: 'solar-carport' as any,
      requirements: { targetState: 'TX', targetChain: 'Dollar General' } as any,
      locations: sampleLocations as any,
      createdAt: '2026-08-01T10:15:00.000Z',
    },
    {
      id: 'camp-fl-02',
      name: 'Find high-yield retail solar carport targets in Florida with low flood risk.',
      useCaseId: 'solar-carport' as any,
      requirements: { targetState: 'FL', targetChain: 'Dollar General' } as any,
      locations: sampleLocations.slice(0, 48) as any,
      createdAt: '2026-08-01T09:30:00.000Z',
    },
    {
      id: 'camp-ga-03',
      name: 'Find corporate-owned Dollar General sites in Georgia with strong solar potential.',
      useCaseId: 'solar-carport' as any,
      requirements: { targetState: 'GA', targetChain: 'Dollar General' } as any,
      locations: sampleLocations.slice(0, 35) as any,
      createdAt: '2026-07-31T18:20:00.000Z',
    },
    {
      id: 'camp-nc-04',
      name: 'Find retail carport candidate sites in North Carolina with quick grid tie-in.',
      useCaseId: 'solar-carport' as any,
      requirements: { targetState: 'NC', targetChain: 'Dollar General' } as any,
      locations: sampleLocations.slice(0, 42) as any,
      createdAt: '2026-07-30T14:45:00.000Z',
    },
  ];
}

export async function clearAllCampaigns(): Promise<void> {
  await initDb();
  await client.execute('DELETE FROM campaigns');
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
      JSON.stringify(workspace.requirements ?? {}),
      JSON.stringify(workspace.locations ?? []),
      workspace.createdAt ?? new Date().toISOString()
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

