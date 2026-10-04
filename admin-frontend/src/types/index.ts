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
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum TicketStatus {
  ISSUED = 'ISSUED',
  BOARDED = 'BOARDED',
  USED = 'USED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  operatorId?: string | { _id: string; name: string; licenseNumber?: string } | any;
  createdAt: string;
}

export interface City {
  _id: string;
  name: string;
  amharicName?: string;
  region: string;
  country: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  terminalName?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
}

export interface Route {
  _id: string;
  origin: City;
  destination: City;
  distanceKm: number;
  estimatedDurationHours: number;
  pickupPoints: Array<{
    name: string;
    locationNote?: string;
    timeOffsetMinutes: number;
  }>;
  dropOffPoints: Array<{
    name: string;
    locationNote?: string;
  }>;
  status: 'ACTIVE' | 'INACTIVE';
  popularityScore: number;
  createdAt: string;
}

export interface Operator {
  _id: string;
  name: string;
  legalName: string;
  licenseNumber: string;
  logoUrl?: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  rating: number;
  totalTripsCount: number;
  createdAt: string;
}

export interface Vehicle {
  _id: string;
  plateNumber: string;
  vehicleType: string;
  operator: Operator | string;
  seatCapacity: number;
  seatLayout: {
    layoutType: string;
    rows: number;
    columns: number;
    aislePosition: number[];
  };
  vehicleModel: string;
  year: number;
  features: string[];
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  operator: Operator | string;
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
  boardingNotes?: string;
  createdAt: string;
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
  user: User;
  trip: Trip;
  seats: string[];
  passengers: PassengerInfo[];
  fare: number;
  serviceFee: number;
  total: number;
  status: BookingStatus;
  payment?: any;
  tickets?: any[];
  expiresAt: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  booking: string;
  trip: Trip;
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
  status: TicketStatus;
  boardingTime?: string;
}

export interface Payment {
  _id: string;
  booking: Booking;
  user: User;
  provider: 'mock' | 'telebirr' | 'chapa' | 'cbe_birr';
  transactionReference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface AuditLog {
  _id?: string;
  user?: string;
  userEmail?: string;
  role: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AdminAnalytics {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    totalTrips: number;
    totalPassengers: number;
  };
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  popularRoutes: Array<{
    routeId: string;
    title: string;
    distanceKm: number;
    bookingsCount: number;
  }>;
  recentBookings: Booking[];
  activeOperatorsCount: number;
}
