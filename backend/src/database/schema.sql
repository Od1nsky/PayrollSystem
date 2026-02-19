-- Таблица пользователей системы
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'accountant', 'manager')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сотрудников предприятия
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    personnelNumber TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    hireDate DATE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'on_leave', 'fired')),
    baseSalary REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица начислений
CREATE TABLE IF NOT EXISTS accruals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('salary', 'bonus', 'vacation', 'sick_leave', 'overtime')),
    amount REAL NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    createdBy INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Таблица удержаний
CREATE TABLE IF NOT EXISTS deductions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('tax', 'advance', 'penalty', 'alimony', 'insurance')),
    amount REAL NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    createdBy INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Расчётные ведомости
CREATE TABLE IF NOT EXISTS payroll_sheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('draft', 'approved', 'paid')),
    totalAccrued REAL NOT NULL DEFAULT 0,
    totalDeducted REAL NOT NULL DEFAULT 0,
    totalNet REAL NOT NULL DEFAULT 0,
    createdBy INTEGER NOT NULL,
    approvedBy INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id),
    FOREIGN KEY (approvedBy) REFERENCES users(id)
);

-- Строки расчётной ведомости
CREATE TABLE IF NOT EXISTS payroll_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payrollSheetId INTEGER NOT NULL,
    employeeId INTEGER NOT NULL,
    accrued REAL NOT NULL DEFAULT 0,
    deducted REAL NOT NULL DEFAULT 0,
    netAmount REAL NOT NULL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (payrollSheetId) REFERENCES payroll_sheets(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_accruals_employeeId ON accruals(employeeId);
CREATE INDEX IF NOT EXISTS idx_accruals_period ON accruals(period);
CREATE INDEX IF NOT EXISTS idx_accruals_type ON accruals(type);
CREATE INDEX IF NOT EXISTS idx_deductions_employeeId ON deductions(employeeId);
CREATE INDEX IF NOT EXISTS idx_deductions_period ON deductions(period);
CREATE INDEX IF NOT EXISTS idx_deductions_type ON deductions(type);
CREATE INDEX IF NOT EXISTS idx_payroll_items_payrollSheetId ON payroll_items(payrollSheetId);
CREATE INDEX IF NOT EXISTS idx_payroll_sheets_period ON payroll_sheets(period);
