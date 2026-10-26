import { z } from 'zod';
import { UserRole } from '../types';

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+251|0)[79]\d{8}$/, 'Valid Ethiopian phone number required (e.g., +251911234567 or 0911234567)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.PASSENGER),
  operatorId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Valid email is required'),
  otp: z.string().regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Valid email is required'),
});

