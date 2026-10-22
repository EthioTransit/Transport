import { z } from 'zod';
import { VehicleType } from '../types';

export const createCitySchema = z.object({
  name: z.string().min(2, 'City name is required'),
  amharicName: z.string().optional(),
  region: z.string().min(2, 'Region is required'),
  country: z.string().default('Ethiopia'),
  code: z.string().min(2, 'Unique city code is required (e.g. ADD, DBR, BHD)').max(5),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  terminalName: z.string().optional(),
  image: z.string().optional(),
});

export const updateCitySchema = createCitySchema.partial();

export const createRouteSchema = z.object({
  origin: z.string().min(1, 'Origin city ID is required'),
  destination: z.string().min(1, 'Destination city ID is required'),
  distanceKm: z.number().min(1, 'Distance must be at least 1 km'),
  estimatedDurationHours: z.number().min(0.5, 'Estimated duration must be positive'),
  pickupPoints: z
    .array(
      z.object({
        name: z.string().min(1),
        locationNote: z.string().optional(),
        timeOffsetMinutes: z.number().default(0),
      })
    )
    .optional(),
  dropOffPoints: z
    .array(
      z.object({
        name: z.string().min(1),
        locationNote: z.string().optional(),
      })
    )
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  popularityScore: z.number().optional(),
  operatingDays: z.array(z.string()).optional(),
  departureTimes: z.array(z.string()).optional(),
  baseFare: z.number().optional(),
  operator: z.string().optional().nullable(),
  autoScheduleTrips: z.boolean().optional(),
});

export const updateRouteSchema = createRouteSchema.partial();

export const createOperatorSchema = z.object({
  name: z.string().min(2, 'Operator name is required'),
  legalName: z.string().min(2, 'Legal business name is required'),
  licenseNumber: z.string().min(3, 'Transport license number is required'),
  logoUrl: z.string().optional(),
  contactPhone: z.string().regex(/^(\+251|0)[79]\d{8}$/, 'Valid Ethiopian phone number required'),
  contactEmail: z.string().email('Valid email is required'),
  address: z.string().min(3, 'Address is required'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']).default('ACTIVE'),
});

export const updateOperatorSchema = createOperatorSchema.partial();

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(4, 'Valid plate number is required (e.g. ET-3-12345)'),
  vehicleType: z.nativeEnum(VehicleType).default(VehicleType.BUS),
  operator: z.string().min(1, 'Operator ID is required'),
  seatCapacity: z.number().min(10).max(80),
  seatLayout: z.object({
    layoutType: z.enum(['2x2', '2x1', '1x2', 'minibus']).default('2x2'),
    rows: z.number().min(2).max(20),
    columns: z.number().min(2).max(5),
    aislePosition: z.array(z.number()).default([2]),
    blockedSeats: z.array(z.string()).optional(),
  }),
  vehicleModel: z.string().min(2, 'Vehicle model is required'),
  year: z.number().min(2000).max(2030),
  features: z.array(z.string()).default(['AC', 'USB Charging', 'Reclining Seats']),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).default('ACTIVE'),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const createDriverSchema = z.object({
  name: z.string().min(2, 'Driver name is required'),
  phone: z.string().regex(/^(\+251|0)[79]\d{8}$/, 'Valid Ethiopian phone number required'),
  licenseNumber: z.string().min(4, 'License number is required'),
  licenseCategory: z.string().default('Public Transport 1'),
  operator: z.string().min(1, 'Operator ID is required'),
  user: z.string().optional(),
  status: z.enum(['ACTIVE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).default('ACTIVE'),
});

export const updateDriverSchema = createDriverSchema.partial();

export const updateUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'DRIVER', 'PASSENGER']).optional(),
  operatorId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
