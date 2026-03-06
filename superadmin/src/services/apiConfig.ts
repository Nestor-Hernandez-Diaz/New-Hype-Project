// ============================================================================
// API CONFIG
// ============================================================================

// CORS habilitado en el backend — conexión directa sin proxy
export const API_BASE_URL = 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform';

export const BEARER_TOKEN = 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIxIiwic2NvcGUiOiJwbGF0Zm9ybSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NzI2Mzg0ODcsImV4cCI6MTc3MjcyNDg4Nywicm9sZSI6IlNVUEVSQURNSU4ifQ.XKQ-WaHA0uGXEgLc8N3AX7ny5VLkx7wPIUMkbuga5N8GSFKAH3piAhZKdxSzxQED';

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
 * Wrapper de fetch que inyecta headers, parsea JSON y lanza ApiError si falla.
 * El backend envuelve las respuestas en { success, data } — este wrapper lo desenvuelve
 * automáticamente y retorna solo el payload útil (body.data).
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

  // El backend envuelve en { success: boolean, data: T } — desenvolver
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data as T;
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
