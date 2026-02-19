import { Response } from 'express';
import db from '../database/db';
import { PayrollSheetModel, PayrollItemModel, EmployeeModel, AccrualModel, DeductionModel } from '../models';
import { AuthRequest, PayrollStatus, EmployeeStatus } from '../types';

export class PayrollController {
  static getAll(_req: AuthRequest, res: Response): void {
    try {
      res.json(PayrollSheetModel.findAll());
    } catch (error) {
      console.error('Get payroll sheets error:', error);
      res.status(500).json({ error: 'Не удалось получить ведомости' });
    }
  }

  static getById(req: AuthRequest, res: Response): void {
    try {
      const sheet = PayrollSheetModel.findById(parseInt(req.params.id));
      if (!sheet) { res.status(404).json({ error: 'Ведомость не найдена' }); return; }
      const items = PayrollItemModel.findBySheetId(sheet.id);
      // Enrich items with employee names
      const enrichedItems = items.map(item => {
        const emp = EmployeeModel.findById(item.employeeId);
        return { ...item, employeeName: emp?.fullName || 'Неизвестный', personnelNumber: emp?.personnelNumber || '' };
      });
      res.json({ ...sheet, items: enrichedItems });
    } catch (error) {
      console.error('Get payroll sheet error:', error);
      res.status(500).json({ error: 'Не удалось получить ведомость' });
    }
  }

  static create(req: AuthRequest, res: Response): void {
    try {
      const { period } = req.body;
      if (!period) { res.status(400).json({ error: 'Период обязателен' }); return; }

      // Get active employees
      const allEmployees = EmployeeModel.findAll({ status: EmployeeStatus.ACTIVE, limit: 1000 });
      const employees = allEmployees.data;

      if (employees.length === 0) { res.status(400).json({ error: 'Нет активных сотрудников' }); return; }

      let totalAccrued = 0;
      let totalDeducted = 0;

      // Calculate per employee
      const itemsData = employees.map(emp => {
        const accrued = AccrualModel.getTotalByEmployeeAndPeriod(emp.id, period);
        const deducted = DeductionModel.getTotalByEmployeeAndPeriod(emp.id, period);
        const actualAccrued = accrued > 0 ? accrued : emp.baseSalary;
        totalAccrued += actualAccrued;
        totalDeducted += deducted;
        return { employeeId: emp.id, accrued: actualAccrued, deducted, netAmount: actualAccrued - deducted, notes: null };
      });

      // Create sheet in transaction
      const transaction = db.transaction(() => {
        const sheet = PayrollSheetModel.create({
          period,
          status: PayrollStatus.DRAFT,
          totalAccrued,
          totalDeducted,
          totalNet: totalAccrued - totalDeducted,
          createdBy: req.user!.userId,
        });

        const items = itemsData.map(item => ({ ...item, payrollSheetId: sheet.id }));
        PayrollItemModel.createMany(items);

        return sheet;
      });

      const sheet = transaction();
      res.status(201).json(sheet);
    } catch (error) {
      console.error('Create payroll error:', error);
      res.status(500).json({ error: 'Не удалось создать ведомость' });
    }
  }

  static approve(req: AuthRequest, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      const sheet = PayrollSheetModel.findById(id);
      if (!sheet) { res.status(404).json({ error: 'Ведомость не найдена' }); return; }
      if (sheet.status !== PayrollStatus.DRAFT) { res.status(400).json({ error: 'Можно утвердить только черновик' }); return; }
      const updated = PayrollSheetModel.updateStatus(id, PayrollStatus.APPROVED, req.user!.userId);
      res.json(updated);
    } catch (error) {
      console.error('Approve payroll error:', error);
      res.status(500).json({ error: 'Не удалось утвердить ведомость' });
    }
  }

  static delete(req: AuthRequest, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      const sheet = PayrollSheetModel.findById(id);
      if (!sheet) { res.status(404).json({ error: 'Ведомость не найдена' }); return; }
      if (sheet.status === PayrollStatus.PAID) { res.status(400).json({ error: 'Нельзя удалить оплаченную ведомость' }); return; }
      PayrollSheetModel.delete(id);
      res.json({ message: 'Ведомость удалена' });
    } catch (error) {
      console.error('Delete payroll error:', error);
      res.status(500).json({ error: 'Не удалось удалить ведомость' });
    }
  }
}
