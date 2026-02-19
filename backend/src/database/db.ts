import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: DatabaseType = new Database(config.dbPath);

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export default db;
