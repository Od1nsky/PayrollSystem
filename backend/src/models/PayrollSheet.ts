import db from '../database/db';
import { PayrollSheet, CreatePayrollSheet, PayrollItem, CreatePayrollItem } from '../types';

export class PayrollSheetModel {
  static findAll(): PayrollSheet[] {
    return db.prepare('SELECT * FROM payroll_sheets ORDER BY period DESC, createdAt DESC').all() as PayrollSheet[];
  }

  static findById(id: number): PayrollSheet | undefined {
    return db.prepare('SELECT * FROM payroll_sheets WHERE id = ?').get(id) as PayrollSheet | undefined;
  }

  static create(data: CreatePayrollSheet): PayrollSheet {
    const stmt = db.prepare(`
      INSERT INTO payroll_sheets (period, status, totalAccrued, totalDeducted, totalNet, createdBy, approvedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.period, data.status, data.totalAccrued, data.totalDeducted, data.totalNet, data.createdBy, data.approvedBy || null);
    const sheet = this.findById(result.lastInsertRowid as number);
    if (!sheet) throw new Error('Failed to create payroll sheet');
    return sheet;
  }

  static updateStatus(id: number, status: string, approvedBy?: number): PayrollSheet | undefined {
    if (approvedBy) {
      db.prepare('UPDATE payroll_sheets SET status = ?, approvedBy = ? WHERE id = ?').run(status, approvedBy, id);
    } else {
      db.prepare('UPDATE payroll_sheets SET status = ? WHERE id = ?').run(status, id);
    }
    return this.findById(id);
  }

  static delete(id: number): boolean {
    return db.prepare('DELETE FROM payroll_sheets WHERE id = ?').run(id).changes > 0;
  }
}

export class PayrollItemModel {
  static findBySheetId(sheetId: number): PayrollItem[] {
    return db.prepare('SELECT * FROM payroll_items WHERE payrollSheetId = ?').all(sheetId) as PayrollItem[];
  }

  static create(data: CreatePayrollItem): PayrollItem {
    const stmt = db.prepare(`
      INSERT INTO payroll_items (payrollSheetId, employeeId, accrued, deducted, netAmount, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.payrollSheetId, data.employeeId, data.accrued, data.deducted, data.netAmount, data.notes || null);
    return db.prepare('SELECT * FROM payroll_items WHERE id = ?').get(result.lastInsertRowid) as PayrollItem;
  }

  static createMany(items: CreatePayrollItem[]): PayrollItem[] {
    const stmt = db.prepare(`
      INSERT INTO payroll_items (payrollSheetId, employeeId, accrued, deducted, netAmount, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const created: PayrollItem[] = [];
    const transaction = db.transaction((items: CreatePayrollItem[]) => {
      for (const item of items) {
        const result = stmt.run(item.payrollSheetId, item.employeeId, item.accrued, item.deducted, item.netAmount, item.notes || null);
        const row = db.prepare('SELECT * FROM payroll_items WHERE id = ?').get(result.lastInsertRowid) as PayrollItem;
        if (row) created.push(row);
      }
    });
    transaction(items);
    return created;
  }
}
