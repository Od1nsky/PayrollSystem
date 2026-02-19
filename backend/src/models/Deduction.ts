import db from '../database/db';
import { Deduction, CreateDeduction, UpdateDeduction, DeductionFilters, PaginatedResponse } from '../types';

export class DeductionModel {
  static findAll(filters?: DeductionFilters): PaginatedResponse<Deduction> {
    let query = 'SELECT * FROM deductions WHERE 1=1';
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

    const data = db.prepare(query).all(...params) as Deduction[];
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static findById(id: number): Deduction | undefined {
    return db.prepare('SELECT * FROM deductions WHERE id = ?').get(id) as Deduction | undefined;
  }

  static findByEmployeeId(employeeId: number): Deduction[] {
    return db.prepare('SELECT * FROM deductions WHERE employeeId = ? ORDER BY date DESC').all(employeeId) as Deduction[];
  }

  static create(data: CreateDeduction): Deduction {
    const stmt = db.prepare(`
      INSERT INTO deductions (employeeId, type, amount, period, description, date, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.employeeId, data.type, data.amount, data.period, data.description || null, data.date, data.createdBy);
    const deduction = this.findById(result.lastInsertRowid as number);
    if (!deduction) throw new Error('Failed to create deduction');
    return deduction;
  }

  static update(id: number, data: UpdateDeduction): Deduction | undefined {
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
    db.prepare(`UPDATE deductions SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    return db.prepare('DELETE FROM deductions WHERE id = ?').run(id).changes > 0;
  }

  static getTotalByEmployeeAndPeriod(employeeId: number, period: string): number {
    const result = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM deductions WHERE employeeId = ? AND period = ?').get(employeeId, period) as { total: number };
    return result.total;
  }
}
