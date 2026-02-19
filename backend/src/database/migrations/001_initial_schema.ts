import db from '../db';
import fs from 'fs';
import path from 'path';

export function runMigrations(): void {
  const schemaPath = path.join(__dirname, '../schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Database migrations completed successfully');
}
