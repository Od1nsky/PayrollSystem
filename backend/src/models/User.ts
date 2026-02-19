import db from '../database/db';
import { User, CreateUser, UpdateUser } from '../types';

export class UserModel {
  static findAll(): User[] {
    return db.prepare('SELECT id, email, name, role, createdAt FROM users').all() as User[];
  }

  static findById(id: number): User | undefined {
    return db.prepare('SELECT id, email, name, role, createdAt FROM users WHERE id = ?').get(id) as User | undefined;
  }

  static findByEmail(email: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  }

  static create(userData: CreateUser): User {
    const stmt = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(userData.email, userData.password, userData.name, userData.role);
    const user = this.findById(result.lastInsertRowid as number);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  static update(id: number, userData: UpdateUser): User | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    if (userData.email !== undefined) { fields.push('email = ?'); values.push(userData.email); }
    if (userData.password !== undefined) { fields.push('password = ?'); values.push(userData.password); }
    if (userData.name !== undefined) { fields.push('name = ?'); values.push(userData.name); }
    if (userData.role !== undefined) { fields.push('role = ?'); values.push(userData.role); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0;
  }
}
