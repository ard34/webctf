require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'ctf_platform',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

