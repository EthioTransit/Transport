import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'ethiotransit_jwt_secret_production_2026_modern',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'ethiotransit_refresh_secret_production_2026',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:5174',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'chapa',
  PAYMENT_PROVIDER_KEY: process.env.PAYMENT_PROVIDER_KEY || '',
  PAYMENT_PROVIDER_SECRET: process.env.PAYMENT_PROVIDER_SECRET || '',
  PAYMENT_CALLBACK_URL: process.env.PAYMENT_CALLBACK_URL || 'http://localhost:5000/api/payments/verify',

  // Chapa Payment Gateway Configuration
  CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY || process.env.PAYMENT_PROVIDER_SECRET || '',
  CHAPA_PUBLIC_KEY: process.env.CHAPA_PUBLIC_KEY || process.env.PAYMENT_PROVIDER_KEY || '',
  CHAPA_WEBHOOK_SECRET: process.env.CHAPA_WEBHOOK_SECRET || '',
  CHAPA_API_URL: process.env.CHAPA_API_URL || 'https://api.chapa.co/v1',

  NODE_ENV: process.env.NODE_ENV || 'development',
};
