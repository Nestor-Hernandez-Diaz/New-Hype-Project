/**
 * Storefront API Fetch Helper
 *
 * Lightweight fetch wrapper for storefront public API endpoints.
 * Uses a separate JWT token (nh_sf_token) from the admin panel.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1';
const TENANT_ID = '1';

// ---- Token helpers ----

const SF_TOKEN_KEY = 'nh_token_storefront';

export function getSfToken(): string | null {
  return localStorage.getItem(SF_TOKEN_KEY);
}

export function setSfToken(token: string): void {
  localStorage.setItem(SF_TOKEN_KEY, token);
}

export function clearSfToken(): void {
  localStorage.removeItem(SF_TOKEN_KEY);
}

export function getTenantId(): string {
  return TENANT_ID;
}

// ---- Backend response wrappers ----

/** Shape returned by Spring Boot backend: ApiResponse<T> */
export interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Spring Boot Pageable response shape */
export interface SpringPageable<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// ---- Fetch helper ----

/**
 * Generic fetch for storefront API.
 * Automatically adds Bearer token and Content-Type headers.
 */
export async function storefrontFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getSfToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Try to parse JSON regardless (backend always returns JSON)
  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Error ${res.status}: respuesta no válida del servidor`);
  }

  if (!res.ok) {
    throw new Error(json.message || `Error ${res.status}`);
  }

  return json as T;
}

/**
 * Shortcut for storefront auth endpoints (adds X-TenantId header).
 */
export async function storefrontAuthFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeaders: Record<string, string> = {
    'X-TenantId': TENANT_ID,
    ...((options.headers as Record<string, string>) || {}),
  };

  return storefrontFetch<T>(endpoint, {
    ...options,
    headers: authHeaders,
  });
}
