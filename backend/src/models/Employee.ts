import db from '../database/db';
import { Employee, CreateEmployee, UpdateEmployee, EmployeeFilters, PaginatedResponse } from '../types';

export class EmployeeModel {
  static findAll(filters?: EmployeeFilters): PaginatedResponse<Employee> {
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params: any[] = [];

    if (filters?.department) {
      query += ' AND department = ?';
      params.push(filters.department);
    }
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.search) {
      query += ' AND (fullName LIKE ? OR personnelNumber LIKE ? OR position LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY fullName ASC';

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const total = (db.prepare(countQuery).get(...params) as { total: number }).total;

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const data = db.prepare(query).all(...params) as Employee[];

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static findById(id: number): Employee | undefined {
    return db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as Employee | undefined;
  }

  static findByPersonnelNumber(num: string): Employee | undefined {
    return db.prepare('SELECT * FROM employees WHERE personnelNumber = ?').get(num) as Employee | undefined;
  }

  static create(data: CreateEmployee): Employee {
    const stmt = db.prepare(`
      INSERT INTO employees (fullName, personnelNumber, department, position, hireDate, status, baseSalary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.fullName, data.personnelNumber, data.department, data.position, data.hireDate, data.status, data.baseSalary);
    const employee = this.findById(result.lastInsertRowid as number);
    if (!employee) throw new Error('Failed to create employee');
    return employee;
  }

  static update(id: number, data: UpdateEmployee): Employee | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.fullName !== undefined) { fields.push('fullName = ?'); values.push(data.fullName); }
    if (data.personnelNumber !== undefined) { fields.push('personnelNumber = ?'); values.push(data.personnelNumber); }
    if (data.department !== undefined) { fields.push('department = ?'); values.push(data.department); }
    if (data.position !== undefined) { fields.push('position = ?'); values.push(data.position); }
    if (data.hireDate !== undefined) { fields.push('hireDate = ?'); values.push(data.hireDate); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.baseSalary !== undefined) { fields.push('baseSalary = ?'); values.push(data.baseSalary); }

    if (fields.length === 0) return this.findById(id);

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    return db.prepare('DELETE FROM employees WHERE id = ?').run(id).changes > 0;
  }

  static getDepartments(): string[] {
    const rows = db.prepare('SELECT DISTINCT department FROM employees ORDER BY department').all() as { department: string }[];
    return rows.map(r => r.department);
  }
}
