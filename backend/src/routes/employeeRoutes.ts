import { Router } from 'express';
import { body } from 'express-validator';
import { EmployeeController } from '../controllers/employeeController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { EmployeeStatus } from '../types';

const router = Router();
router.use(authenticate);

const createValidation = [
  body('fullName').notEmpty().withMessage('ФИО обязательно'),
  body('personnelNumber').notEmpty().withMessage('Табельный номер обязателен'),
  body('department').notEmpty().withMessage('Отдел обязателен'),
  body('position').notEmpty().withMessage('Должность обязательна'),
  body('hireDate').isISO8601().withMessage('Некорректная дата приёма'),
  body('status').isIn(Object.values(EmployeeStatus)).withMessage('Некорректный статус'),
  body('baseSalary').isFloat({ min: 0 }).withMessage('Оклад должен быть положительным числом'),
  validate,
];

const updateValidation = [
  body('fullName').optional().notEmpty(),
  body('personnelNumber').optional().notEmpty(),
  body('department').optional().notEmpty(),
  body('position').optional().notEmpty(),
  body('hireDate').optional().isISO8601(),
  body('status').optional().isIn(Object.values(EmployeeStatus)),
  body('baseSalary').optional().isFloat({ min: 0 }),
  validate,
];

router.get('/', EmployeeController.getAll);
router.get('/departments', EmployeeController.getDepartments);
router.get('/:id', EmployeeController.getById);
router.post('/', createValidation, EmployeeController.create);
router.put('/:id', updateValidation, EmployeeController.update);
router.delete('/:id', EmployeeController.delete);

export default router;
