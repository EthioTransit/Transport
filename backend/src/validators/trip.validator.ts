import { z } from 'zod';
import { TripStatus } from '../types';

export const tripSearchSchema = z
  .object({
    from: z.string().min(1, 'Please select your departure city.').transform((s) => s.trim()),
    to: z.string().min(1, 'Please select your arrival city.').transform((s) => s.trim()),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid travel date (YYYY-MM-DD).'),
    passengers: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val ? Number(val) : 1))
      .pipe(z.number().min(1, 'At least 1 passenger is required.').max(10, 'Maximum 10 passengers allowed per search.')),
    priceMin: z.union([z.string(), z.number()]).optional().transform((val) => (val !== undefined && val !== '' ? Number(val) : undefined)),
    priceMax: z.union([z.string(), z.number()]).optional().transform((val) => (val !== undefined && val !== '' ? Number(val) : undefined)),
    operatorId: z.string().optional(),
    vehicleType: z.string().optional(),
    sortBy: z.enum(['PRICE_ASC', 'PRICE_DESC', 'DEPARTURE_EARLIEST', 'DEPARTURE_LATEST', 'SEATS_AVAILABLE']).optional(),
  })
  .refine((data) => data.from.toLowerCase() !== data.to.toLowerCase(), {
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
    estimatedArrival: z.string().optional(),
    fare: z.union([z.number(), z.string().transform((v) => Number(v))]).pipe(z.number().min(50, 'Official fare must be at least 50 ETB')),
    serviceFee: z.union([z.number(), z.string().transform((v) => Number(v))]).optional().default(15),
    pickupLocation: z.string().optional(),
    dropOffLocation: z.string().optional(),
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
