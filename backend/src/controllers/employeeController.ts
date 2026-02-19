import { Response } from 'express';
import { EmployeeModel } from '../models';
import { AuthRequest, CreateEmployee, UpdateEmployee, EmployeeStatus } from '../types';

export class EmployeeController {
  static getAll(req: AuthRequest, res: Response): void {
    try {
      const filters = {
        department: req.query.department as string | undefined,
        status: req.query.status as EmployeeStatus | undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };
      res.json(EmployeeModel.findAll(filters));
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({ error: 'Не удалось получить список сотрудников' });
    }
  }

  static getById(req: AuthRequest, res: Response): void {
    try {
      const employee = EmployeeModel.findById(parseInt(req.params.id));
      if (!employee) { res.status(404).json({ error: 'Сотрудник не найден' }); return; }
      res.json(employee);
    } catch (error) {
      console.error('Get employee error:', error);
      res.status(500).json({ error: 'Не удалось получить сотрудника' });
    }
  }

  static create(req: AuthRequest, res: Response): void {
    try {
      const data: CreateEmployee = req.body;
      const existing = EmployeeModel.findByPersonnelNumber(data.personnelNumber);
      if (existing) { res.status(400).json({ error: 'Сотрудник с таким табельным номером уже существует' }); return; }
      res.status(201).json(EmployeeModel.create(data));
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({ error: 'Не удалось создать сотрудника' });
    }
  }

  static update(req: AuthRequest, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      const data: UpdateEmployee = req.body;
      const existing = EmployeeModel.findById(id);
      if (!existing) { res.status(404).json({ error: 'Сотрудник не найден' }); return; }
      if (data.personnelNumber && data.personnelNumber !== existing.personnelNumber) {
        const dup = EmployeeModel.findByPersonnelNumber(data.personnelNumber);
        if (dup) { res.status(400).json({ error: 'Табельный номер уже занят' }); return; }
      }
      const updated = EmployeeModel.update(id, data);
      if (!updated) { res.status(500).json({ error: 'Не удалось обновить сотрудника' }); return; }
      res.json(updated);
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ error: 'Не удалось обновить сотрудника' });
    }
  }

  static delete(req: AuthRequest, res: Response): void {
    try {
      if (!EmployeeModel.delete(parseInt(req.params.id))) { res.status(404).json({ error: 'Сотрудник не найден' }); return; }
      res.json({ message: 'Сотрудник успешно удалён' });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(500).json({ error: 'Не удалось удалить сотрудника' });
    }
  }

  static getDepartments(_req: AuthRequest, res: Response): void {
    try {
      res.json(EmployeeModel.getDepartments());
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({ error: 'Не удалось получить список отделов' });
    }
  }
}
