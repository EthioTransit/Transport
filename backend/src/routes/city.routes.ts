import { Router } from 'express';
import { CityController } from '../controllers/city.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createCitySchema, updateCitySchema } from '../validators/admin.validator';
import { UserRole } from '../types';

const router = Router();

router.get('/', CityController.searchCities);
router.get('/:id', CityController.getCityById);
router.get('/:id/routes', CityController.getCityRoutes);

router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateBody(createCitySchema),
  CityController.createCity
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateBody(updateCitySchema),
  CityController.updateCity
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CityController.toggleStatus
);

export default router;
