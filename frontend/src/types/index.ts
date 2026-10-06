export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
}

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  BOARDING = 'BOARDING',
  DEPARTED = 'DEPARTED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  SELECTED = 'SELECTED',
  RESERVED = 'RESERVED',
  BOOKED = 'BOOKED',
  BLOCKED = 'BLOCKED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export interface City {
  _id: string;
  name: string;
  amharicName?: string;
  region: string;
  code: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE';
  terminalName?: string;
  image?: string;
}

export interface Route {
  _id: string;
  origin: City;
  destination: City;
  distanceKm: number;
  estimatedDurationHours: number;
  pickupPoints: Array<{ name: string; locationNote?: string; timeOffsetMinutes: number }>;
  dropOffPoints: Array<{ name: string; locationNote?: string }>;
  status: 'ACTIVE' | 'INACTIVE';
  popularityScore: number;
}

export interface Operator {
  _id: string;
  name: string;
  legalName: string;
  licenseNumber: string;
  logoUrl?: string;
  contactPhone: string;
  contactEmail: string;
  rating: number;
  status: string;
}

export interface Vehicle {
  _id: string;
  plateNumber: string;
  vehicleType: string;
  operator: Operator;
  seatCapacity: number;
  seatLayout: {
    layoutType: '2x2' | '2x1' | '1x2' | 'minibus';
    rows: number;
    columns: number;
    aislePosition: number[];
  };
  vehicleModel: string;
  year: number;
  features: string[];
}

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: string;
  rating: number;
}

export interface Trip {
  _id: string;
  tripCode: string;
  route: Route;
  operator: Operator;
  vehicle: Vehicle;
  driver?: Driver;
  departureDate: string;
  departureTime: string;
  estimatedArrival: string;
  fare: number;
  serviceFee: number;
  status: TripStatus;
  pickupLocation: string;
  dropOffLocation: string;
  availableSeatsCount: number;
  totalSeatsCount: number;
  amenities: string[];
}

export interface SeatItem {
  id: string;
  seatNumber: string;
  row: number;
  column: number;
  seatType: 'WINDOW' | 'AISLE' | 'MIDDLE';
  status: SeatStatus;
  isMine: boolean;
  priceModifier: number;
  fare: number;
  lockExpiresAt?: string;
}

export interface PassengerInfo {
  name: string;
  phone: string;
  seatNumber: string;
  ageGroup: 'ADULT' | 'CHILD';
  idNumber?: string;
}

export interface Booking {
  _id: string;
  bookingReference: string;
  user: any;
  trip: Trip;
  seats: string[];
  passengers: PassengerInfo[];
  fare: number;
  serviceFee: number;
  total: number;
  status: BookingStatus;
  tickets?: Ticket[];
  expiresAt: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  booking: string;
  trip: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: string;
  routeTitle: string;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  pickupLocation: string;
  dropOffLocation: string;
  operatorName: string;
  vehiclePlate: string;
  amountPaid: number;
  qrVerificationToken: string;
  qrCodeDataUrl?: string;
  status: 'ISSUED' | 'USED' | 'CANCELLED';
  boardingTime?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  operatorId?: string;
}
