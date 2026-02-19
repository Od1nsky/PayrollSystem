import { Response } from 'express';
import { DeductionModel } from '../models';
import { AuthRequest, DeductionType } from '../types';

export class DeductionController {
  static getAll(req: AuthRequest, res: Response): void {
    try {
      const filters = {
        employeeId: req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined,
        type: req.query.type as DeductionType | undefined,
        period: req.query.period as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };
      res.json(DeductionModel.findAll(filters));
    } catch (error) {
      console.error('Get deductions error:', error);
      res.status(500).json({ error: 'Не удалось получить удержания' });
    }
  }

  static getById(req: AuthRequest, res: Response): void {
    try {
      const deduction = DeductionModel.findById(parseInt(req.params.id));
      if (!deduction) { res.status(404).json({ error: 'Удержание не найдено' }); return; }
      res.json(deduction);
    } catch (error) {
      console.error('Get deduction error:', error);
      res.status(500).json({ error: 'Не удалось получить удержание' });
    }
  }

  static create(req: AuthRequest, res: Response): void {
    try {
      const data = { ...req.body, createdBy: req.user!.userId };
      res.status(201).json(DeductionModel.create(data));
    } catch (error) {
      console.error('Create deduction error:', error);
      res.status(500).json({ error: 'Не удалось создать удержание' });
    }
  }

  static update(req: AuthRequest, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      if (!DeductionModel.findById(id)) { res.status(404).json({ error: 'Удержание не найдено' }); return; }
      const updated = DeductionModel.update(id, req.body);
      if (!updated) { res.status(500).json({ error: 'Не удалось обновить удержание' }); return; }
      res.json(updated);
    } catch (error) {
      console.error('Update deduction error:', error);
      res.status(500).json({ error: 'Не удалось обновить удержание' });
    }
  }

  static delete(req: AuthRequest, res: Response): void {
    try {
      if (!DeductionModel.delete(parseInt(req.params.id))) { res.status(404).json({ error: 'Удержание не найдено' }); return; }
      res.json({ message: 'Удержание удалено' });
    } catch (error) {
      console.error('Delete deduction error:', error);
      res.status(500).json({ error: 'Не удалось удалить удержание' });
    }
  }
}
