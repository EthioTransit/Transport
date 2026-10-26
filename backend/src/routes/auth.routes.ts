import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema, verifyOtpSchema, resendOtpSchema } from '../validators/auth.validator';

const router = Router();

// Registration with Brevo OTP verification
router.post('/register/initiate', validateBody(registerSchema), AuthController.initiateRegistration);
router.post('/register/verify', validateBody(verifyOtpSchema), AuthController.verifyRegistrationOtp);
router.post('/register/resend-otp', validateBody(resendOtpSchema), AuthController.resendRegistrationOtp);
router.post('/register', validateBody(registerSchema), AuthController.register);

router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/refresh', validateBody(refreshTokenSchema), AuthController.refresh);
router.get('/me', authenticate, AuthController.getMe);

export default router;

