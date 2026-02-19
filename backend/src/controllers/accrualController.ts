import { Response } from 'express';
import { AccrualModel } from '../models';
import { AuthRequest, AccrualType } from '../types';

export class AccrualController {
  static getAll(req: AuthRequest, res: Response): void {
    try {
      const filters = {
        employeeId: req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined,
        type: req.query.type as AccrualType | undefined,
        period: req.query.period as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };
      res.json(AccrualModel.findAll(filters));
    } catch (error) {
      console.error('Get accruals error:', error);
      res.status(500).json({ error: 'Не удалось получить начисления' });
    }
  }

  static getById(req: AuthRequest, res: Response): void {
    try {
      const accrual = AccrualModel.findById(parseInt(req.params.id));
      if (!accrual) { res.status(404).json({ error: 'Начисление не найдено' }); return; }
      res.json(accrual);
    } catch (error) {
      console.error('Get accrual error:', error);
      res.status(500).json({ error: 'Не удалось получить начисление' });
    }
  }

  static create(req: AuthRequest, res: Response): void {
    try {
      const data = { ...req.body, createdBy: req.user!.userId };
      res.status(201).json(AccrualModel.create(data));
    } catch (error) {
      console.error('Create accrual error:', error);
      res.status(500).json({ error: 'Не удалось создать начисление' });
    }
  }

  static update(req: AuthRequest, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      if (!AccrualModel.findById(id)) { res.status(404).json({ error: 'Начисление не найдено' }); return; }
      const updated = AccrualModel.update(id, req.body);
      if (!updated) { res.status(500).json({ error: 'Не удалось обновить начисление' }); return; }
      res.json(updated);
    } catch (error) {
      console.error('Update accrual error:', error);
      res.status(500).json({ error: 'Не удалось обновить начисление' });
    }
  }

  static delete(req: AuthRequest, res: Response): void {
    try {
      if (!AccrualModel.delete(parseInt(req.params.id))) { res.status(404).json({ error: 'Начисление не найдено' }); return; }
      res.json({ message: 'Начисление удалено' });
    } catch (error) {
      console.error('Delete accrual error:', error);
      res.status(500).json({ error: 'Не удалось удалить начисление' });
    }
  }
}
