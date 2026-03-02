// ============================================================================
// API CONFIG — Constantes centrales para cuando se conecte el backend
// ============================================================================

export const API_BASE_URL = 'http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform';

export const BEARER_TOKEN = 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIzNSIsInNjb3BlIjoidGVuYW50IiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc3MTgyMTkzMiwiZXhwIjoxNzcxOTA4MzMyLCJ0ZW5hbnRJZCI6MzQsInJvbGUiOiJBRE1JTiJ9.FXEcXU6SiWlHoCkvRCWdp7QCIVvu9IpxGGCYYXpFIrXZWVZhg50nJs3wBG-8F2jN';

/** Simula latencia de red (800ms) */
export const simulateDelay = (ms = 800): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Headers que se usarán cuando se conecte */
export const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${BEARER_TOKEN}`,
});
