import { Response } from 'express';
import { UserModel } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AuthRequest, RegisterRequest, LoginRequest, UserRole } from '../types';

export class AuthController {
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, role }: RegisterRequest = req.body;
      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        return;
      }
      const hashedPassword = await hashPassword(password);
      const user = UserModel.create({ email, password: hashedPassword, name, role: role || UserRole.MANAGER });
      const token = generateToken({ userId: user.id, email: user.email, role: user.role as UserRole });
      res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Не удалось зарегистрировать пользователя' });
    }
  }

  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;
      const user = UserModel.findByEmail(email);
      if (!user) { res.status(401).json({ error: 'Неверный email или пароль' }); return; }
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) { res.status(401).json({ error: 'Неверный email или пароль' }); return; }
      const token = generateToken({ userId: user.id, email: user.email, role: user.role as UserRole });
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Не удалось войти в систему' });
    }
  }

  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ error: 'Не авторизован' }); return; }
      const user = UserModel.findById(req.user.userId);
      if (!user) { res.status(404).json({ error: 'Пользователь не найден' }); return; }
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Не удалось получить информацию о пользователе' });
    }
  }

  static async getUsers(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = UserModel.findAll();
      res.json(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt })));
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Не удалось получить список пользователей' });
    }
  }
}
