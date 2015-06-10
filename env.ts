// src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

interface Config {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
  API_GATEWAY_URL: string;
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL || 'localhost:5432',
  REDIS_URL: process.env.REDIS_URL || 'localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'secretkey',
  JWT_EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN, 10) || 3600, // 1 hour
  API_GATEWAY_URL: process.env.API_GATEWAY_URL || 'http://localhost:8080',
};

if (!config.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!config.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}

if (!config.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';

export default config;