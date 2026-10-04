import { Router } from 'express';
import authRoutes from './auth.routes';
import cityRoutes from './city.routes';
import routeRoutes from './route.routes';
import operatorRoutes from './operator.routes';
import vehicleRoutes from './vehicle.routes';
import driverRoutes from './driver.routes';
import tripRoutes from './trip.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import ticketRoutes from './ticket.routes';
import boardingRoutes from './boarding.routes';
import analyticsRoutes from './analytics.routes';
import userRoutes from './user.routes';
import { BRAND_CONFIG } from '../config/brand';

const apiRouter = Router();

apiRouter.get('/brand', (req, res) => {
  res.json({
    success: true,
    data: BRAND_CONFIG,
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/cities', cityRoutes);
apiRouter.use('/routes', routeRoutes);
apiRouter.use('/operators', operatorRoutes);
apiRouter.use('/vehicles', vehicleRoutes);
apiRouter.use('/drivers', driverRoutes);
apiRouter.use('/trips', tripRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/tickets', ticketRoutes);
apiRouter.use('/boarding', boardingRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;
