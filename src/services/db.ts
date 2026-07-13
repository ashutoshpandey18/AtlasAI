import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import type { ProjectWorkspace } from '@/types/atlas';

let dbInstance: Database | null = null;

async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  // Resolve db file path to the root of the project workspace
  const dbPath = path.resolve(process.cwd(), 'atlas.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create table schema if not exists
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      use_case_id TEXT NOT NULL,
      requirements TEXT NOT NULL,
      locations TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  return dbInstance;
}

export async function getCampaigns(): Promise<ProjectWorkspace[]> {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM campaigns ORDER BY created_at DESC');
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    useCaseId: row.use_case_id,
    requirements: JSON.parse(row.requirements),
    locations: JSON.parse(row.locations),
    createdAt: row.created_at,
  }));
}

export async function getCampaignById(id: string): Promise<ProjectWorkspace | null> {
  const db = await getDb();
  const row = await db.get('SELECT * FROM campaigns WHERE id = ?', id);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    useCaseId: row.use_case_id,
    requirements: JSON.parse(row.requirements),
    locations: JSON.parse(row.locations),
    createdAt: row.created_at,
  };
}

export async function saveCampaign(workspace: ProjectWorkspace): Promise<void> {
  const db = await getDb();
  await db.run(
    `INSERT OR REPLACE INTO campaigns (id, name, use_case_id, requirements, locations, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    workspace.id,
    workspace.name,
    workspace.useCaseId,
    JSON.stringify(workspace.requirements),
    JSON.stringify(workspace.locations),
    workspace.createdAt
  );
}

export async function deleteCampaign(id: string): Promise<void> {
  const db = await getDb();
  await db.run('DELETE FROM campaigns WHERE id = ?', id);
}
