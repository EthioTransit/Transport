export const API_BASE_URL =
  ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export async function adminApiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('ethiotransit_admin_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('ethiotransit_admin_token');
      localStorage.removeItem('ethiotransit_admin_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      data: null as any,
      message: 'Network response was not valid JSON.',
    }));

    if (!response.ok || !data.success) {
      const errorMsg = data.message || `API request failed with status ${response.status}`;
      const err: any = new Error(errorMsg);
      err.code = data.code;
      err.status = response.status;
      throw err;
    }

    return data.data;
  } catch (error: any) {
    throw error;
  }
}
