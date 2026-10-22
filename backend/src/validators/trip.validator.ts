import { z } from 'zod';
import { TripStatus } from '../types';

export const tripSearchSchema = z
  .object({
    from: z.string().min(1, 'Please select your departure city.'),
    to: z.string().min(1, 'Please select your arrival city.'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid travel date (YYYY-MM-DD).'),
    passengers: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().min(1, 'At least 1 passenger is required.').max(10, 'Maximum 10 passengers allowed per search.')),
  })
  .refine((data) => data.from !== data.to, {
    message: 'Departure and arrival cities cannot be the same.',
    path: ['to'],
  });

export const createTripSchema = z
  .object({
    route: z.string().min(1, 'Route ID is required'),
    operator: z.string().min(1, 'Operator ID is required'),
    vehicle: z.string().min(1, 'Vehicle ID is required'),
    driver: z.string().optional(),
    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Departure date must be YYYY-MM-DD').optional(),
    departureDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    recurringDays: z.array(z.string()).optional(),
    repeatWeeks: z.number().min(1).max(8).optional(),
    departureTime: z.string().min(1, 'Departure time is required (e.g. 06:00 AM)'),
    departureTimes: z.array(z.string()).optional(),
    estimatedArrival: z.string().min(1, 'Estimated arrival is required (e.g. 11:30 AM)'),
    fare: z.number().min(50, 'Official fare must be at least 50 ETB'),
    serviceFee: z.number().optional().default(15),
    pickupLocation: z.string().min(2, 'Pickup location is required'),
    dropOffLocation: z.string().min(2, 'Drop-off location is required'),
    amenities: z.array(z.string()).optional(),
    boardingNotes: z.string().optional(),
  })
  .refine(
    (data) =>
      Boolean(
        data.departureDate ||
          (data.departureDates && data.departureDates.length > 0) ||
          (data.recurringDays && data.recurringDays.length > 0)
      ),
    {
      message: 'Please provide departureDate, departureDates, or recurringDays.',
      path: ['departureDate'],
    }
  );

export const updateTripStatusSchema = z.object({
  status: z.nativeEnum(TripStatus),
});
