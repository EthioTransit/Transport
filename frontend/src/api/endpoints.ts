import { apiRequest } from './client';
import { City, Route, Trip, Booking, Ticket, SeatItem, User, Operator } from '../types';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiRequest<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: any) =>
    apiRequest<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  initiateRegistration: (data: any) =>
    apiRequest<{ message: string; email: string; expiresInSeconds: number; devCode?: string }>('/auth/register/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyRegistrationOtp: (data: { email: string; otp: string }) =>
    apiRequest<{ user: User; accessToken: string; refreshToken: string }>('/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resendRegistrationOtp: (data: { email: string }) =>
    apiRequest<{ message: string; email: string; expiresInSeconds: number; devCode?: string }>('/auth/register/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest<User>('/auth/me'),
};

export const citiesApi = {
  search: (q?: string) => apiRequest<City[]>(`/cities${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getById: (id: string) => apiRequest<City>(`/cities/${id}`),
  create: (data: any) =>
    apiRequest<City>('/cities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const routesApi = {
  getAll: () => apiRequest<Route[]>('/routes'),
  getPopular: () => apiRequest<Route[]>('/routes/popular'),
  getById: (id: string) => apiRequest<Route>(`/routes/${id}`),
  create: (data: any) =>
    apiRequest<Route>('/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const operatorsApi = {
  getAll: () => apiRequest<Operator[]>('/operators'),
  getById: (id: string) => apiRequest<Operator>(`/operators/${id}`),
};

export const tripsApi = {
  search: (params: {
    from: string;
    to: string;
    date: string;
    passengers: number;
    priceMin?: number;
    priceMax?: number;
    operatorId?: string;
    vehicleType?: string;
    sortBy?: string;
  }) => {
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      date: params.date,
      passengers: params.passengers.toString(),
    });
    if (params.priceMin) query.append('priceMin', params.priceMin.toString());
    if (params.priceMax) query.append('priceMax', params.priceMax.toString());
    if (params.operatorId) query.append('operatorId', params.operatorId);
    if (params.vehicleType) query.append('vehicleType', params.vehicleType);
    if (params.sortBy) query.append('sortBy', params.sortBy);

    return apiRequest<{
      trips: Trip[];
      total: number;
      route?: any;
      originCity?: any;
      destinationCity?: any;
      message?: string;
    }>(`/trips/search?${query.toString()}`);
  },
  getById: (id: string) => apiRequest<Trip>(`/trips/${id}`),
  getSeats: (tripId: string, guestLockId?: string) =>
    apiRequest<{
      tripId: string;
      vehicle: any;
      seats: SeatItem[];
      totalSeats: number;
      availableCount: number;
    }>(`/trips/${tripId}/seats${guestLockId ? `?guestLockId=${guestLockId}` : ''}`),
  lockSeats: (tripId: string, seatNumbers: string[], guestLockId?: string) =>
    apiRequest<{
      success: boolean;
      lockedSeats: string[];
      lockExpiresAt: string;
      timeoutMinutes: number;
    }>(`/trips/${tripId}/seats/lock`, {
      method: 'POST',
      body: JSON.stringify({ tripId, seatNumbers, guestLockId }),
    }),
  unlockSeats: (tripId: string, seatNumbers: string[], guestLockId?: string) =>
    apiRequest<{ success: boolean }>(`/trips/${tripId}/seats/unlock`, {
      method: 'POST',
      body: JSON.stringify({ tripId, seatNumbers, guestLockId }),
    }),
  create: (data: any) =>
    apiRequest<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const bookingsApi = {
  create: (data: { tripId: string; seats: string[]; passengers: any[]; guestLockId?: string }) =>
    apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getById: (id: string) => apiRequest<Booking>(`/bookings/${id}`),
  getByRef: (ref: string) => apiRequest<Booking>(`/bookings/ref/${ref}`),
  getMyBookings: () => apiRequest<Booking[]>('/bookings/my'),
  cancel: (id: string, reason?: string) =>
    apiRequest<Booking>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  getAll: (params: { operatorId?: string; status?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.operatorId) q.append('operatorId', params.operatorId);
    if (params.status) q.append('status', params.status);
    return apiRequest<{ bookings: Booking[]; total: number }>(`/bookings?${q.toString()}`);
  },
};

export const paymentsApi = {
  create: (data: { bookingId: string; provider: string; paymentMethod: string }) =>
    apiRequest<{
      paymentId: string;
      transactionReference: string;
      amount: number;
      currency: string;
      officialFare: number;
      serviceFee: number;
      provider: string;
      checkoutUrl?: string;
    }>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verify: (data: { transactionReference: string; simulateResult?: 'SUCCESS' | 'FAILED' }) =>
    apiRequest<{
      payment: any;
      status: string;
      message: string;
      tickets?: Ticket[];
      bookingReference?: string;
    }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getChapaStatus: () =>
    apiRequest<{
      isConfigured: boolean;
      mode: 'live' | 'sandbox';
      publicKey: string | null;
      provider: string;
    }>('/payments/chapa/status'),
};

export const ticketsApi = {
  getById: (id: string) => apiRequest<Ticket>(`/tickets/${id}`),
  getByBooking: (bookingId: string) => apiRequest<Ticket[]>(`/tickets/booking/${bookingId}`),
  getMyTickets: () => apiRequest<Ticket[]>('/tickets/my'),
};

export const boardingApi = {
  verify: (data: { token: string; tripId?: string; verificationDevice?: string }) =>
    apiRequest<{
      code: 'VALID_TICKET' | 'INVALID_TICKET' | 'ALREADY_USED';
      message: string;
      ticket?: Ticket;
      passenger?: any;
    }>('/boarding/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const analyticsApi = {
  getAdmin: () => apiRequest<any>('/analytics/admin'),
  getOperator: (operatorId?: string) =>
    apiRequest<any>(`/analytics/operator${operatorId ? `?operatorId=${operatorId}` : ''}`),
  globalSearch: (q: string) => apiRequest<any>(`/analytics/search/global?q=${encodeURIComponent(q)}`),
  getAuditLogs: () => apiRequest<any>('/analytics/audit-logs'),
  getNotifications: () => apiRequest<any[]>('/analytics/notifications'),
};
