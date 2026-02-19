import db from '../database/db';
import { Accrual, CreateAccrual, UpdateAccrual, AccrualFilters, PaginatedResponse } from '../types';

export class AccrualModel {
  static findAll(filters?: AccrualFilters): PaginatedResponse<Accrual> {
    let query = 'SELECT * FROM accruals WHERE 1=1';
    const params: any[] = [];

    if (filters?.employeeId) {
      query += ' AND employeeId = ?';
      params.push(filters.employeeId);
    }
    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters?.period) {
      query += ' AND period = ?';
      params.push(filters.period);
    }

    query += ' ORDER BY date DESC';

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const total = (db.prepare(countQuery).get(...params) as { total: number }).total;

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const data = db.prepare(query).all(...params) as Accrual[];
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static findById(id: number): Accrual | undefined {
    return db.prepare('SELECT * FROM accruals WHERE id = ?').get(id) as Accrual | undefined;
  }

  static findByEmployeeId(employeeId: number): Accrual[] {
    return db.prepare('SELECT * FROM accruals WHERE employeeId = ? ORDER BY date DESC').all(employeeId) as Accrual[];
  }

  static create(data: CreateAccrual): Accrual {
    const stmt = db.prepare(`
      INSERT INTO accruals (employeeId, type, amount, period, description, date, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.employeeId, data.type, data.amount, data.period, data.description || null, data.date, data.createdBy);
    const accrual = this.findById(result.lastInsertRowid as number);
    if (!accrual) throw new Error('Failed to create accrual');
    return accrual;
  }

  static update(id: number, data: UpdateAccrual): Accrual | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.employeeId !== undefined) { fields.push('employeeId = ?'); values.push(data.employeeId); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
    if (data.period !== undefined) { fields.push('period = ?'); values.push(data.period); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE accruals SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    return db.prepare('DELETE FROM accruals WHERE id = ?').run(id).changes > 0;
  }

  static getTotalByEmployeeAndPeriod(employeeId: number, period: string): number {
    const result = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM accruals WHERE employeeId = ? AND period = ?').get(employeeId, period) as { total: number };
    return result.total;
  }
}
