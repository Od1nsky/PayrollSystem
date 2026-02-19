import { Router } from 'express';
import { body } from 'express-validator';
import { AccrualController } from '../controllers/accrualController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AccrualType } from '../types';

const router = Router();
router.use(authenticate);

const createValidation = [
  body('employeeId').isInt({ min: 1 }).withMessage('Сотрудник обязателен'),
  body('type').isIn(Object.values(AccrualType)).withMessage('Некорректный тип начисления'),
  body('amount').isFloat({ min: 0 }).withMessage('Сумма должна быть положительной'),
  body('period').matches(/^\d{4}-\d{2}$/).withMessage('Период в формате YYYY-MM'),
  body('date').isISO8601().withMessage('Некорректная дата'),
  validate,
];

router.get('/', AccrualController.getAll);
router.get('/:id', AccrualController.getById);
router.post('/', createValidation, AccrualController.create);
router.put('/:id', AccrualController.update);
router.delete('/:id', AccrualController.delete);

export default router;
