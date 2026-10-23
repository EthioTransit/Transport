import { z } from 'zod';

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  provider: z.enum(['chapa', 'mock', 'telebirr', 'cbe_birr']).default('chapa'),
  paymentMethod: z.string().default('Chapa Gateway'),
});

export const verifyPaymentSchema = z.object({
  transactionReference: z.string().min(1, 'Transaction reference is required'),
  simulateResult: z.enum(['SUCCESS', 'FAILED']).optional().default('SUCCESS'),
});
