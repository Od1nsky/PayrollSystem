import express from 'express';
import cors from 'cors';
import { config } from './config';
import { initDatabase } from './database/init';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import accrualRoutes from './routes/accrualRoutes';
import deductionRoutes from './routes/deductionRoutes';
import payrollRoutes from './routes/payrollRoutes';
import reportRoutes from './routes/reportRoutes';
import { errorHandler } from './middleware/errorHandler';

initDatabase();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'PayrollSystem API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/accruals', accrualRoutes);
app.use('/api/deductions', deductionRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

export default app;
