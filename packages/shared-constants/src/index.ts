// Document types
export const DOCUMENT_TYPES = {
  DNI: 'DNI',
  RUC: 'RUC',
  PASAPORTE: 'PASAPORTE',
} as const;

// Entity types
export const ENTITY_TYPES = {
  CLIENTE: 'CLIENTE',
  PROVEEDOR: 'PROVEEDOR',
  AMBOS: 'AMBOS',
} as const;

// Movement types
export const MOVEMENT_TYPES = {
  ENTRADA: 'ENTRADA',
  SALIDA: 'SALIDA',
  AJUSTE: 'AJUSTE',
} as const;

// Stock status
export const STOCK_STATUS = {
  NORMAL: 'NORMAL',
  BAJO: 'BAJO',
  CRITICO: 'CRITICO',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm:ss',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
} as const;

// Currency
export const CURRENCY = {
  CODE: 'PEN',
  SYMBOL: 'S/',
  LOCALE: 'es-PE',
} as const;

// Validation rules
export const VALIDATION = {
  DNI_LENGTH: 8,
  RUC_LENGTH: 11,
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
