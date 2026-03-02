// ============================================================================
// API CONFIG — Cliente HTTP centralizado para el backend Spring Boot
// ============================================================================

export const API_BASE_URL = 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform';

export const BEARER_TOKEN = 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIxIiwic2NvcGUiOiJwbGF0Zm9ybSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NzI0MjIxNTYsImV4cCI6MTc3MjUwODU1Niwicm9sZSI6IlNVUEVSQURNSU4ifQ.But34rAvQA2cbOIeCEAKvffAaHBOe2kSi-k3H5U5UYyJp9LVC3Ok6E-289fiElfx';

export const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${BEARER_TOKEN}`,
});

// ── Fetch genérico con manejo de errores ────────────────────────────────────

interface ApiErrorBody {
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? body?.error ?? `Error HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

/**
 * Wrapper de fetch que inyecta headers, parsega JSON y lanza ApiError si falla.
 * Retorna directamente el body JSON (el backend decide la forma).
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = getHeaders();

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  // DELETE/PATCH/POST sin body pueden devolver 204 No Content
  if (res.status === 204) return null as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }

  return body as T;
}

/** Construye query string a partir de un objeto (omite null/undefined/'') */
export function buildQuery(params: Record<string, string | number | boolean | null | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  );
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}
