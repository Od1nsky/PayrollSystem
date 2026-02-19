import db from './db';
import { runMigrations } from './migrations/001_initial_schema';

export function initDatabase(): void {
  try {
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='users'
    `).get();

    if (!tableExists) {
      runMigrations();
    } else {
      console.log('Database already initialized');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
