import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.post('/register', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  body('name').notEmpty().withMessage('Имя обязательно'),
  validate,
], AuthController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен'),
  validate,
], AuthController.login);

router.get('/me', authenticate, AuthController.getMe);
router.get('/users', authenticate, requireRole(UserRole.ADMIN), AuthController.getUsers);

export default router;
