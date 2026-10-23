import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createPaymentSchema, verifyPaymentSchema } from '../validators/payment.validator';
import { UserRole } from '../types';

const router = Router();

router.post('/create', optionalAuthenticate, validateBody(createPaymentSchema), PaymentController.createPayment);
router.post('/verify', validateBody(verifyPaymentSchema), PaymentController.verifyPayment);
router.post('/chapa/webhook', PaymentController.chapaWebhook);
router.get('/chapa/status', PaymentController.getChapaStatus);

router.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PaymentController.getAllPayments
);

export default router;
