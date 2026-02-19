import { Response } from 'express';
import db from '../database/db';
import { AuthRequest } from '../types';

export class ReportController {
  static summary(_req: AuthRequest, res: Response): void {
    try {
      const totalEmployees = (db.prepare('SELECT COUNT(*) as c FROM employees WHERE status = ?').get('active') as any).c;
      const totalSalaryFund = (db.prepare('SELECT COALESCE(SUM(baseSalary), 0) as s FROM employees WHERE status = ?').get('active') as any).s;
      const avgSalary = totalEmployees > 0 ? totalSalaryFund / totalEmployees : 0;
      const onLeave = (db.prepare('SELECT COUNT(*) as c FROM employees WHERE status = ?').get('on_leave') as any).c;
      const fired = (db.prepare('SELECT COUNT(*) as c FROM employees WHERE status = ?').get('fired') as any).c;
      const totalAccruals = (db.prepare('SELECT COALESCE(SUM(amount), 0) as s FROM accruals').get() as any).s;
      const totalDeductions = (db.prepare('SELECT COALESCE(SUM(amount), 0) as s FROM deductions').get() as any).s;

      res.json({
        totalEmployees,
        totalSalaryFund: Math.round(totalSalaryFund * 100) / 100,
        avgSalary: Math.round(avgSalary * 100) / 100,
        onLeave,
        fired,
        totalAccruals: Math.round(totalAccruals * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
      });
    } catch (error) {
      console.error('Summary report error:', error);
      res.status(500).json({ error: 'Не удалось сформировать отчёт' });
    }
  }

  static byDepartment(_req: AuthRequest, res: Response): void {
    try {
      const data = db.prepare(`
        SELECT department, COUNT(*) as count,
          SUM(baseSalary) as totalSalary,
          AVG(baseSalary) as avgSalary
        FROM employees WHERE status = 'active'
        GROUP BY department ORDER BY department
      `).all();
      res.json(data);
    } catch (error) {
      console.error('Department report error:', error);
      res.status(500).json({ error: 'Не удалось сформировать отчёт по отделам' });
    }
  }

  static byEmployee(req: AuthRequest, res: Response): void {
    try {
      const period = req.query.period as string | undefined;
      let query = `
        SELECT e.id, e.fullName, e.personnelNumber, e.department, e.baseSalary,
          COALESCE((SELECT SUM(a.amount) FROM accruals a WHERE a.employeeId = e.id ${period ? 'AND a.period = ?' : ''}), 0) as totalAccrued,
          COALESCE((SELECT SUM(d.amount) FROM deductions d WHERE d.employeeId = e.id ${period ? 'AND d.period = ?' : ''}), 0) as totalDeducted
        FROM employees e WHERE e.status = 'active' ORDER BY e.fullName
      `;
      const params = period ? [period, period] : [];
      const data = db.prepare(query).all(...params);
      res.json(data);
    } catch (error) {
      console.error('Employee report error:', error);
      res.status(500).json({ error: 'Не удалось сформировать отчёт по сотрудникам' });
    }
  }

  static export(_req: AuthRequest, res: Response): void {
    try {
      const employees = db.prepare('SELECT * FROM employees ORDER BY fullName').all();
      const accruals = db.prepare('SELECT * FROM accruals ORDER BY date DESC').all();
      const deductions = db.prepare('SELECT * FROM deductions ORDER BY date DESC').all();
      const payrollSheets = db.prepare('SELECT * FROM payroll_sheets ORDER BY period DESC').all();

      res.json({ employees, accruals, deductions, payrollSheets });
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Не удалось экспортировать данные' });
    }
  }
}
