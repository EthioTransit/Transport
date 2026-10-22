import { adminApiRequest } from './client';
import {
  User,
  City,
  Route,
  Operator,
  Vehicle,
  Trip,
  Booking,
  Ticket,
  AdminAnalytics,
  AuditLog,
} from '../types';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    adminApiRequest<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => adminApiRequest<User>('/auth/me'),
};

export const analyticsApi = {
  getAdmin: () => adminApiRequest<AdminAnalytics>('/analytics/admin'),
  globalSearch: (q: string) => adminApiRequest<any>(`/analytics/search/global?q=${encodeURIComponent(q)}`),
  getAuditLogs: () => adminApiRequest<{ logs: AuditLog[]; total: number }>('/analytics/audit-logs'),
  getNotifications: () => adminApiRequest<any[]>('/analytics/notifications'),
};

export const citiesApi = {
  getAll: (q?: string, includeAll: boolean = true) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (includeAll) params.append('all', 'true');
    const qs = params.toString();
    return adminApiRequest<City[]>(`/cities${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => adminApiRequest<City>(`/cities/${id}`),
  create: (data: Partial<City>) =>
    adminApiRequest<City>('/cities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<City>) =>
    adminApiRequest<City>(`/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    adminApiRequest<City>(`/cities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const routesApi = {
  getAll: () => adminApiRequest<Route[]>('/routes'),
  getPopular: () => adminApiRequest<Route[]>('/routes/popular'),
  getById: (id: string) => adminApiRequest<Route>(`/routes/${id}`),
  create: (data: any) =>
    adminApiRequest<Route>('/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    adminApiRequest<Route>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const operatorsApi = {
  getAll: () => adminApiRequest<Operator[]>('/operators'),
  getById: (id: string) => adminApiRequest<Operator>(`/operators/${id}`),
  updateStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED' | 'PENDING') =>
    adminApiRequest<Operator>(`/operators/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const vehiclesApi = {
  getAll: (params?: string | { operatorId?: string; activeOnly?: boolean; status?: string }) => {
    let q = '';
    if (typeof params === 'string') {
      q = params ? `?operatorId=${params}` : '';
    } else if (params) {
      const searchParams = new URLSearchParams();
      if (params.operatorId) searchParams.append('operatorId', params.operatorId);
      if (params.activeOnly) searchParams.append('active', 'true');
      if (params.status) searchParams.append('status', params.status);
      const str = searchParams.toString();
      q = str ? `?${str}` : '';
    }
    return adminApiRequest<Vehicle[]>(`/vehicles${q}`);
  },
  getById: (id: string) => adminApiRequest<Vehicle>(`/vehicles/${id}`),
  create: (data: any) =>
    adminApiRequest<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    adminApiRequest<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE') =>
    adminApiRequest<Vehicle>(`/vehicles/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const tripsApi = {
  getAll: (params: {
    from?: string;
    to?: string;
    date?: string;
    operatorId?: string;
    status?: string;
  } = {}) => {
    const q = new URLSearchParams();
    if (params.from) q.append('from', params.from);
    if (params.to) q.append('to', params.to);
    if (params.date) q.append('date', params.date);
    if (params.operatorId) q.append('operatorId', params.operatorId);
    if (params.status) q.append('status', params.status);
    return adminApiRequest<{ trips: Trip[]; total: number }>(`/trips?${q.toString()}`);
  },
  getById: (id: string) => adminApiRequest<Trip>(`/trips/${id}`),
  create: (data: any) =>
    adminApiRequest<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: string) =>
    adminApiRequest<Trip>(`/trips/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getSeats: (tripId: string) =>
    adminApiRequest<{
      tripId: string;
      vehicle: any;
      seats: any[];
      totalSeats: number;
      availableCount: number;
    }>(`/trips/${tripId}/seats`),
};

export const bookingsApi = {
  getAll: (params: { operatorId?: string; status?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.operatorId) q.append('operatorId', params.operatorId);
    if (params.status) q.append('status', params.status);
    return adminApiRequest<{ bookings: Booking[]; total: number }>(`/bookings?${q.toString()}`);
  },
  getById: (id: string) => adminApiRequest<Booking>(`/bookings/${id}`),
  cancel: (id: string, reason?: string) =>
    adminApiRequest<Booking>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

export const ticketsApi = {
  getById: (id: string) => adminApiRequest<Ticket>(`/tickets/${id}`),
  getByBooking: (bookingId: string) => adminApiRequest<Ticket[]>(`/tickets/booking/${bookingId}`),
};

export const usersApi = {
  getAll: (params: { search?: string; role?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.role) q.append('role', params.role);
    return adminApiRequest<User[]>(`/users?${q.toString()}`);
  },
  getById: (id: string) => adminApiRequest<User>(`/users/${id}`),
  update: (id: string, data: any) =>
    adminApiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleStatus: (id: string, isActive: boolean) =>
    adminApiRequest<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
};

export const systemApi = {
  checkHealth: async () => {
    try {
      const res = await fetch('http://localhost:5000/health');
      return await res.json();
    } catch {
      return null;
    }
  },
  getBrand: () => adminApiRequest<any>('/brand'),
};
