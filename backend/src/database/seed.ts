import db from './db';
import bcrypt from 'bcrypt';
import { initDatabase } from './init';

const SALT_ROUNDS = 10;

function seed() {
  initDatabase();
  console.log('Clearing existing data...');
  db.prepare('DELETE FROM payroll_items').run();
  db.prepare('DELETE FROM payroll_sheets').run();
  db.prepare('DELETE FROM deductions').run();
  db.prepare('DELETE FROM accruals').run();
  db.prepare('DELETE FROM employees').run();
  db.prepare('DELETE FROM users').run();

  console.log('Seeding database...');

  // ===================== USERS =====================
  const users = [
    { email: 'admin@company.ru', password: 'admin123', name: 'Иванов Сергей Петрович', role: 'admin' },
    { email: 'accountant1@company.ru', password: 'pass123', name: 'Петрова Анна Михайловна', role: 'accountant' },
    { email: 'accountant2@company.ru', password: 'pass123', name: 'Козлова Елена Владимировна', role: 'accountant' },
    { email: 'manager1@company.ru', password: 'pass123', name: 'Сидоров Дмитрий Александрович', role: 'manager' },
    { email: 'manager2@company.ru', password: 'pass123', name: 'Николаева Ольга Игоревна', role: 'manager' },
    { email: 'manager3@company.ru', password: 'pass123', name: 'Федоров Алексей Викторович', role: 'manager' },
  ];

  const insertUser = db.prepare('INSERT INTO users (email, password, name, role) VALUES (@email, @password, @name, @role)');
  const userIds: number[] = [];
  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, SALT_ROUNDS);
    const result = insertUser.run({ email: u.email, password: hash, name: u.name, role: u.role });
    userIds.push(Number(result.lastInsertRowid));
  }
  console.log(`Created ${userIds.length} users`);

  // ===================== EMPLOYEES =====================
  const employees = [
    // IT отдел
    { fullName: 'Кузнецов Андрей Валерьевич', personnelNumber: 'T-001', department: 'IT', position: 'Руководитель IT-отдела', hireDate: '2020-03-15', status: 'active', baseSalary: 120000 },
    { fullName: 'Морозов Игорь Дмитриевич', personnelNumber: 'T-002', department: 'IT', position: 'Системный администратор', hireDate: '2021-06-01', status: 'active', baseSalary: 85000 },
    { fullName: 'Волков Павел Сергеевич', personnelNumber: 'T-003', department: 'IT', position: 'Программист', hireDate: '2022-01-10', status: 'active', baseSalary: 95000 },
    { fullName: 'Лебедева Мария Андреевна', personnelNumber: 'T-004', department: 'IT', position: 'Программист', hireDate: '2022-09-15', status: 'active', baseSalary: 90000 },
    { fullName: 'Соколов Артём Игоревич', personnelNumber: 'T-005', department: 'IT', position: 'Тестировщик', hireDate: '2023-02-01', status: 'active', baseSalary: 70000 },
    // Бухгалтерия
    { fullName: 'Новикова Татьяна Васильевна', personnelNumber: 'T-006', department: 'Бухгалтерия', position: 'Главный бухгалтер', hireDate: '2019-05-20', status: 'active', baseSalary: 110000 },
    { fullName: 'Фёдорова Ирина Николаевна', personnelNumber: 'T-007', department: 'Бухгалтерия', position: 'Бухгалтер', hireDate: '2020-08-10', status: 'active', baseSalary: 65000 },
    { fullName: 'Егорова Светлана Павловна', personnelNumber: 'T-008', department: 'Бухгалтерия', position: 'Бухгалтер', hireDate: '2021-11-01', status: 'on_leave', baseSalary: 62000 },
    // Отдел продаж
    { fullName: 'Козлов Роман Владимирович', personnelNumber: 'T-009', department: 'Продажи', position: 'Руководитель отдела продаж', hireDate: '2019-09-01', status: 'active', baseSalary: 100000 },
    { fullName: 'Смирнова Елена Александровна', personnelNumber: 'T-010', department: 'Продажи', position: 'Менеджер по продажам', hireDate: '2020-04-15', status: 'active', baseSalary: 60000 },
    { fullName: 'Попов Виталий Олегович', personnelNumber: 'T-011', department: 'Продажи', position: 'Менеджер по продажам', hireDate: '2021-03-01', status: 'active', baseSalary: 58000 },
    { fullName: 'Крылова Дарья Сергеевна', personnelNumber: 'T-012', department: 'Продажи', position: 'Менеджер по продажам', hireDate: '2022-07-10', status: 'active', baseSalary: 55000 },
    { fullName: 'Белов Максим Николаевич', personnelNumber: 'T-013', department: 'Продажи', position: 'Менеджер по продажам', hireDate: '2023-05-15', status: 'active', baseSalary: 52000 },
    // Логистика
    { fullName: 'Орлов Дмитрий Петрович', personnelNumber: 'T-014', department: 'Логистика', position: 'Начальник склада', hireDate: '2020-01-20', status: 'active', baseSalary: 75000 },
    { fullName: 'Тихонов Алексей Юрьевич', personnelNumber: 'T-015', department: 'Логистика', position: 'Логист', hireDate: '2021-04-05', status: 'active', baseSalary: 55000 },
    { fullName: 'Гусев Николай Иванович', personnelNumber: 'T-016', department: 'Логистика', position: 'Водитель', hireDate: '2021-06-15', status: 'active', baseSalary: 48000 },
    { fullName: 'Баранов Сергей Алексеевич', personnelNumber: 'T-017', department: 'Логистика', position: 'Водитель', hireDate: '2022-02-01', status: 'active', baseSalary: 46000 },
    { fullName: 'Комаров Виктор Геннадьевич', personnelNumber: 'T-018', department: 'Логистика', position: 'Кладовщик', hireDate: '2022-10-10', status: 'fired', baseSalary: 40000 },
    // HR
    { fullName: 'Михайлова Анастасия Дмитриевна', personnelNumber: 'T-019', department: 'HR', position: 'HR-директор', hireDate: '2019-11-01', status: 'active', baseSalary: 95000 },
    { fullName: 'Захарова Юлия Сергеевна', personnelNumber: 'T-020', department: 'HR', position: 'HR-менеджер', hireDate: '2021-09-15', status: 'active', baseSalary: 60000 },
    // Руководство
    { fullName: 'Алексеев Владимир Иванович', personnelNumber: 'T-021', department: 'Руководство', position: 'Генеральный директор', hireDate: '2018-01-10', status: 'active', baseSalary: 250000 },
    { fullName: 'Романов Георгий Александрович', personnelNumber: 'T-022', department: 'Руководство', position: 'Финансовый директор', hireDate: '2018-06-01', status: 'active', baseSalary: 200000 },
    { fullName: 'Воронова Ксения Михайловна', personnelNumber: 'T-023', department: 'Руководство', position: 'Коммерческий директор', hireDate: '2019-02-15', status: 'active', baseSalary: 180000 },
    // Ещё
    { fullName: 'Степанов Олег Валерьевич', personnelNumber: 'T-024', department: 'IT', position: 'DevOps инженер', hireDate: '2023-08-01', status: 'active', baseSalary: 100000 },
    { fullName: 'Никитина Вера Петровна', personnelNumber: 'T-025', department: 'Бухгалтерия', position: 'Кассир', hireDate: '2022-05-20', status: 'active', baseSalary: 45000 },
  ];

  const insertEmployee = db.prepare(`
    INSERT INTO employees (fullName, personnelNumber, department, position, hireDate, status, baseSalary)
    VALUES (@fullName, @personnelNumber, @department, @position, @hireDate, @status, @baseSalary)
  `);

  const empIds: number[] = [];
  const insertEmps = db.transaction(() => {
    for (const e of employees) {
      const result = insertEmployee.run(e);
      empIds.push(Number(result.lastInsertRowid));
    }
  });
  insertEmps();
  console.log(`Created ${empIds.length} employees`);

  // ===================== ACCRUALS =====================
  const insertAccrual = db.prepare(`
    INSERT INTO accruals (employeeId, type, amount, period, description, date, createdBy)
    VALUES (@employeeId, @type, @amount, @period, @description, @date, @createdBy)
  `);

  const periods = ['2024-10', '2024-11', '2024-12', '2025-01', '2025-02'];
  let accCount = 0;

  const insertAccruals = db.transaction(() => {
    for (let i = 0; i < empIds.length; i++) {
      const emp = employees[i];
      if (emp.status === 'fired') continue;

      for (const period of periods) {
        const [year, month] = period.split('-');
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();

        // Зарплата
        insertAccrual.run({
          employeeId: empIds[i], type: 'salary', amount: emp.baseSalary,
          period, description: `Оклад за ${period}`, date: `${year}-${month}-${lastDay}`, createdBy: userIds[1]
        });
        accCount++;

        // Премии (случайные, ~30% вероятность)
        if ((i + parseInt(month)) % 3 === 0) {
          const bonusAmount = Math.round(emp.baseSalary * 0.15 * 100) / 100;
          insertAccrual.run({
            employeeId: empIds[i], type: 'bonus', amount: bonusAmount,
            period, description: 'Премия за выполнение плана', date: `${year}-${month}-${lastDay}`, createdBy: userIds[1]
          });
          accCount++;
        }

        // Сверхурочные для некоторых
        if (emp.department === 'Логистика' && parseInt(month) % 2 === 0) {
          insertAccrual.run({
            employeeId: empIds[i], type: 'overtime', amount: Math.round(emp.baseSalary * 0.08 * 100) / 100,
            period, description: 'Сверхурочные', date: `${year}-${month}-${lastDay}`, createdBy: userIds[1]
          });
          accCount++;
        }
      }

      // Отпускные
      if (i % 5 === 0) {
        insertAccrual.run({
          employeeId: empIds[i], type: 'vacation', amount: Math.round(emp.baseSalary * 1.2 * 100) / 100,
          period: '2024-11', description: 'Отпускные (14 дней)', date: '2024-11-01', createdBy: userIds[1]
        });
        accCount++;
      }

      // Больничные
      if (i === 7) { // Егорова на больничном
        insertAccrual.run({
          employeeId: empIds[i], type: 'sick_leave', amount: Math.round(emp.baseSalary * 0.6 * 100) / 100,
          period: '2025-01', description: 'Больничный лист (10 дней)', date: '2025-01-15', createdBy: userIds[2]
        });
        accCount++;
      }
    }
  });
  insertAccruals();
  console.log(`Created ${accCount} accruals`);

  // ===================== DEDUCTIONS =====================
  const insertDeduction = db.prepare(`
    INSERT INTO deductions (employeeId, type, amount, period, description, date, createdBy)
    VALUES (@employeeId, @type, @amount, @period, @description, @date, @createdBy)
  `);

  let dedCount = 0;
  const insertDeductions = db.transaction(() => {
    for (let i = 0; i < empIds.length; i++) {
      const emp = employees[i];
      if (emp.status === 'fired') continue;

      for (const period of periods) {
        const [year, month] = period.split('-');
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();

        // НДФЛ 13%
        const taxAmount = Math.round(emp.baseSalary * 0.13 * 100) / 100;
        insertDeduction.run({
          employeeId: empIds[i], type: 'tax', amount: taxAmount,
          period, description: 'НДФЛ 13%', date: `${year}-${month}-${lastDay}`, createdBy: userIds[1]
        });
        dedCount++;

        // Аванс (40% оклада, первая половина месяца)
        const advanceAmount = Math.round(emp.baseSalary * 0.4 * 100) / 100;
        insertDeduction.run({
          employeeId: empIds[i], type: 'advance', amount: advanceAmount,
          period, description: 'Аванс', date: `${year}-${month}-15`, createdBy: userIds[1]
        });
        dedCount++;

        // Страховые взносы для некоторых
        if (parseInt(month) % 2 === 0) {
          insertDeduction.run({
            employeeId: empIds[i], type: 'insurance', amount: Math.round(emp.baseSalary * 0.01 * 100) / 100,
            period, description: 'ДМС (удержание сотрудника)', date: `${year}-${month}-${lastDay}`, createdBy: userIds[2]
          });
          dedCount++;
        }
      }

      // Алименты для одного
      if (i === 15) {
        for (const period of periods) {
          const [year, month] = period.split('-');
          const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
          insertDeduction.run({
            employeeId: empIds[i], type: 'alimony', amount: Math.round(emp.baseSalary * 0.25 * 100) / 100,
            period, description: 'Алименты 25%', date: `${year}-${month}-${lastDay}`, createdBy: userIds[1]
          });
          dedCount++;
        }
      }
    }
  });
  insertDeductions();
  console.log(`Created ${dedCount} deductions`);

  // ===================== PAYROLL SHEETS =====================
  const insertSheet = db.prepare(`
    INSERT INTO payroll_sheets (period, status, totalAccrued, totalDeducted, totalNet, createdBy, approvedBy)
    VALUES (@period, @status, @totalAccrued, @totalDeducted, @totalNet, @createdBy, @approvedBy)
  `);
  const insertItem = db.prepare(`
    INSERT INTO payroll_items (payrollSheetId, employeeId, accrued, deducted, netAmount, notes)
    VALUES (@payrollSheetId, @employeeId, @accrued, @deducted, @netAmount, @notes)
  `);

  let sheetCount = 0;
  let itemCount = 0;

  const sheetPeriods = [
    { period: '2024-10', status: 'paid', approvedBy: userIds[0] },
    { period: '2024-11', status: 'paid', approvedBy: userIds[0] },
    { period: '2024-12', status: 'approved', approvedBy: userIds[0] },
    { period: '2025-01', status: 'draft', approvedBy: null },
  ];

  const insertSheets = db.transaction(() => {
    for (const sp of sheetPeriods) {
      let totalAccrued = 0;
      let totalDeducted = 0;
      const itemsData: any[] = [];

      for (let i = 0; i < empIds.length; i++) {
        if (employees[i].status === 'fired') continue;
        const acc = (db.prepare('SELECT COALESCE(SUM(amount), 0) as t FROM accruals WHERE employeeId = ? AND period = ?').get(empIds[i], sp.period) as any).t;
        const ded = (db.prepare('SELECT COALESCE(SUM(amount), 0) as t FROM deductions WHERE employeeId = ? AND period = ?').get(empIds[i], sp.period) as any).t;
        totalAccrued += acc;
        totalDeducted += ded;
        itemsData.push({ employeeId: empIds[i], accrued: acc, deducted: ded, netAmount: acc - ded });
      }

      const result = insertSheet.run({
        period: sp.period, status: sp.status,
        totalAccrued: Math.round(totalAccrued * 100) / 100,
        totalDeducted: Math.round(totalDeducted * 100) / 100,
        totalNet: Math.round((totalAccrued - totalDeducted) * 100) / 100,
        createdBy: userIds[1], approvedBy: sp.approvedBy,
      });
      const sheetId = Number(result.lastInsertRowid);
      sheetCount++;

      for (const item of itemsData) {
        insertItem.run({ payrollSheetId: sheetId, ...item, notes: null });
        itemCount++;
      }
    }
  });
  insertSheets();
  console.log(`Created ${sheetCount} payroll sheets with ${itemCount} items`);

  console.log('\n=== Seed completed successfully! ===');
  console.log('Login credentials:');
  console.log('  Admin:      admin@company.ru / admin123');
  console.log('  Accountant: accountant1@company.ru / pass123');
  console.log('  Manager:    manager1@company.ru / pass123');
}

seed();
