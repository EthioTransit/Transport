import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createBookingSchema, cancelBookingSchema } from '../validators/booking.validator';
import { UserRole } from '../types';

const router = Router();

router.post('/', optionalAuthenticate, validateBody(createBookingSchema), BookingController.createBooking);
router.get('/my', authenticate, BookingController.getMyBookings);
router.get('/ref/:reference', BookingController.getBookingByReference);
router.get('/:id', optionalAuthenticate, BookingController.getBookingById);
router.post('/:id/cancel', authenticate, validateBody(cancelBookingSchema), BookingController.cancelBooking);

// Management
router.get(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR),
  BookingController.getAllBookings
);

export default router;
