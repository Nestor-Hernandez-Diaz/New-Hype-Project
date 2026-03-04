/**
 * Decolecta API Service
 * Consulta RUC (SUNAT) y DNI (RENIEC) via api.decolecta.com
 */

const DECOLECTA_BASE = import.meta.env.DEV
  ? '/decolecta-api'
  : 'https://api.decolecta.com/v1';
const DECOLECTA_TOKEN = import.meta.env.VITE_DECOLECTA_TOKEN || '';

// ============= RESPONSE TYPES =============

export interface DecolectaRUCResponse {
  razon_social: string;
  numero_documento: string;
  estado: string;
  condicion: string;
  direccion: string;
  ubigeo: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  es_agente_retencion?: boolean;
  es_buen_contribuyente?: boolean;
  nombre_comercial?: string;
}

export interface DecolectaDNIResponse {
  first_name: string;
  first_last_name: string;
  second_last_name: string;
  full_name: string;
  document_number: string;
}

// ============= MAPPED TYPES (compatible with NuevaEntidadModal) =============

export interface SunatRucData {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  estado: string;
  condicion: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
}

export interface ReniecDniData {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

// ============= API FUNCTIONS =============

async function decolectaFetch<T>(endpoint: string): Promise<T> {
  if (!DECOLECTA_TOKEN) {
    throw new Error('Token Decolecta no configurado (VITE_DECOLECTA_TOKEN)');
  }

  const response = await fetch(`${DECOLECTA_BASE}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${DECOLECTA_TOKEN}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      response.status === 404
        ? 'Documento no encontrado'
        : response.status === 401
          ? 'Token Decolecta inválido o expirado'
          : `Error Decolecta: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

/**
 * Buscar empresa por RUC en SUNAT via Decolecta
 */
export async function buscarPorRUC(ruc: string): Promise<SunatRucData> {
  const raw = await decolectaFetch<DecolectaRUCResponse>(
    `/sunat/ruc?numero=${encodeURIComponent(ruc)}`
  );

  return {
    ruc: raw.numero_documento || ruc,
    razonSocial: raw.razon_social || '',
    nombreComercial: raw.nombre_comercial || undefined,
    direccion: raw.direccion || undefined,
    estado: raw.estado || '',
    condicion: raw.condicion || '',
    departamento: raw.departamento || undefined,
    provincia: raw.provincia || undefined,
    distrito: raw.distrito || undefined,
  };
}

/**
 * Buscar persona por DNI en RENIEC via Decolecta
 */
export async function buscarPorDNI(dni: string): Promise<ReniecDniData> {
  const raw = await decolectaFetch<DecolectaDNIResponse>(
    `/reniec/dni?numero=${encodeURIComponent(dni)}`
  );

  return {
    dni: raw.document_number || dni,
    nombres: raw.first_name || '',
    apellidoPaterno: raw.first_last_name || '',
    apellidoMaterno: raw.second_last_name || '',
  };
}
