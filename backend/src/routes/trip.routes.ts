import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { tripSearchSchema, createTripSchema } from '../validators/trip.validator';
import { lockSeatsSchema } from '../validators/booking.validator';
import { UserRole } from '../types';

const router = Router();

// Public passenger search and discovery
router.get('/search', validateQuery(tripSearchSchema), TripController.searchTrips);
router.get('/:id/seats', optionalAuthenticate, TripController.getTripSeats);
router.post('/:id/seats/lock', optionalAuthenticate, validateBody(lockSeatsSchema), TripController.lockSeats);
router.post('/:id/seats/unlock', optionalAuthenticate, TripController.unlockSeats);
router.get('/:id', TripController.getTripById);

// Admin & Operator trip management
router.get('/', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR), TripController.getAllTrips);
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR),
  validateBody(createTripSchema),
  TripController.createTrip
);
router.put(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR),
  TripController.updateTrip
);
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR),
  TripController.updateTrip
);
router.patch(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR),
  TripController.updateTrip
);

export default router;
