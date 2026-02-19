import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5500,
  jwtSecret: process.env.JWT_SECRET || 'payroll-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbPath: process.env.DB_PATH || './data/database.db',
  nodeEnv: process.env.NODE_ENV || 'development',
};
