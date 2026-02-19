import { Request } from 'express';

// Enums
export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  MANAGER = 'manager',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  FIRED = 'fired',
}

export enum AccrualType {
  SALARY = 'salary',
  BONUS = 'bonus',
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  OVERTIME = 'overtime',
}

export enum DeductionType {
  TAX = 'tax',
  ADVANCE = 'advance',
  PENALTY = 'penalty',
  ALIMONY = 'alimony',
  INSURANCE = 'insurance',
}

export enum PayrollStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  PAID = 'paid',
}

// Interfaces
export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Employee {
  id: number;
  fullName: string;
  personnelNumber: string;
  department: string;
  position: string;
  hireDate: string;
  status: EmployeeStatus;
  baseSalary: number;
  createdAt: string;
  updatedAt: string;
}

export interface Accrual {
  id: number;
  employeeId: number;
  type: AccrualType;
  amount: number;
  period: string;
  description?: string;
  date: string;
  createdBy: number;
  createdAt: string;
}

export interface Deduction {
  id: number;
  employeeId: number;
  type: DeductionType;
  amount: number;
  period: string;
  description?: string;
  date: string;
  createdBy: number;
  createdAt: string;
}

export interface PayrollSheet {
  id: number;
  period: string;
  status: PayrollStatus;
  totalAccrued: number;
  totalDeducted: number;
  totalNet: number;
  createdBy: number;
  approvedBy?: number;
  createdAt: string;
}

export interface PayrollItem {
  id: number;
  payrollSheetId: number;
  employeeId: number;
  accrued: number;
  deducted: number;
  netAmount: number;
  notes?: string;
}

// Create types
export type CreateUser = Omit<User, 'id' | 'createdAt'>;
export type CreateEmployee = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateAccrual = Omit<Accrual, 'id' | 'createdAt'>;
export type CreateDeduction = Omit<Deduction, 'id' | 'createdAt'>;
export type CreatePayrollSheet = Omit<PayrollSheet, 'id' | 'createdAt'>;
export type CreatePayrollItem = Omit<PayrollItem, 'id'>;

// Update types
export type UpdateUser = Partial<Omit<User, 'id' | 'createdAt'>>;
export type UpdateEmployee = Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateAccrual = Partial<Omit<Accrual, 'id' | 'createdAt'>>;
export type UpdateDeduction = Partial<Omit<Deduction, 'id' | 'createdAt'>>;

// JWT
export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
}

// API request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface EmployeeFilters {
  department?: string;
  status?: EmployeeStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AccrualFilters {
  employeeId?: number;
  type?: AccrualType;
  period?: string;
  page?: number;
  limit?: number;
}

export interface DeductionFilters {
  employeeId?: number;
  type?: DeductionType;
  period?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Express Auth Request
export interface AuthRequest extends Request {
  user?: JWTPayload;
}
