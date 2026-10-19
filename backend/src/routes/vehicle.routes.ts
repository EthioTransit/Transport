import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createVehicleSchema, updateVehicleSchema } from '../validators/admin.validator';
import { UserRole } from '../types';

const router = Router();

router.get('/', optionalAuthenticate, VehicleController.getVehicles);
router.get('/:id', optionalAuthenticate, VehicleController.getVehicleById);

router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR),
  validateBody(createVehicleSchema),
  VehicleController.createVehicle
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR),
  validateBody(updateVehicleSchema),
  VehicleController.updateVehicle
);

export default router;
