import { API_BASE_URL, apiService, tokenUtils, type ApiResponse, type AuthResponse } from './utils/api';

type PublicEmailCheckResult = ApiResponse<{ exists: boolean }>;

type PlatformLoginRequest = {
  emailOrUsername: string;
  password: string;
};

type PlatformLoginResult = ApiResponse<AuthResponse>;

type NewHypeApiTestHelpers = {
  baseUrl: string;
  explainConsumption: () => void;
  testHealth: () => Promise<ApiResponse>;
  testCheckEmail: (email?: string) => Promise<PublicEmailCheckResult>;
  testPlatformLogin: (credentials?: Partial<PlatformLoginRequest>) => Promise<PlatformLoginResult>;
  runDemo: () => Promise<{
    health: ApiResponse;
    checkEmail: PublicEmailCheckResult;
    platformLogin: PlatformLoginResult;
  }>;
};

declare global {
  interface Window {
    newHypeApiTest?: NewHypeApiTestHelpers;
  }
}

const defaultPlatformCredentials: PlatformLoginRequest = {
  emailOrUsername: 'superadmin@newhype.pe',
  password: 'SuperAdmin2026',
};

async function testHealth(): Promise<ApiResponse> {
  const result = await apiService.healthCheck();
  console.table([{ endpoint: '/health', success: result.success, message: result.message ?? '' }]);
  return result;
}

async function testCheckEmail(
  email: string = 'demo.flujo2026@newhype.com'
): Promise<PublicEmailCheckResult> {
  const result = await apiService.checkEmail(email);
  console.table([{ endpoint: '/auth/check-email', email, success: result.success, exists: result.data?.exists ?? 'n/a' }]);
  return result;
}

async function testPlatformLogin(
  credentials: Partial<PlatformLoginRequest> = {}
): Promise<PlatformLoginResult> {
  const requestBody: PlatformLoginRequest = {
    ...defaultPlatformCredentials,
    ...credentials,
  };

  const response = await fetch(`${API_BASE_URL}/platform/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json() as PlatformLoginResult;

  if (response.ok && data.data?.accessToken && data.data.refreshToken) {
    tokenUtils.setTokens(data.data.accessToken, data.data.refreshToken);
  }

  console.table([
    {
      endpoint: '/platform/auth/login',
      success: data.success,
      httpStatus: response.status,
      scope: data.data?.scope ?? 'n/a',
      user: data.data?.user?.email ?? 'n/a',
    },
  ]);

  return data;
}

function explainConsumption(): void {
  console.log('NewHype ERP API consumption map');
  console.log('1. frontend/src/utils/api.ts -> wrapper central para admin, inventario, ventas, reportes, auth y endpoints genericos.');
  console.log('2. frontend/src/modules/*/services/*.ts -> cada modulo arma payloads y adapta respuestas del backend.');
  console.log('3. frontend/src/modules/storefront/services/storefrontFetch.ts -> wrapper separado para la tienda publica con token propio.');
  console.log('4. test-api.ts -> prueba temporal basada en snippets de Postman para demostrar consumo real desde frontend.');
  console.log('5. Los componentes y contextos llaman servicios; los servicios llaman apiService; apiService hace fetch al backend Spring Boot.');
}

async function runDemo() {
  console.group('NewHype API demo');
  const health = await testHealth();
  const checkEmail = await testCheckEmail();
  const platformLogin = await testPlatformLogin();
  console.groupEnd();

  return {
    health,
    checkEmail,
    platformLogin,
  };
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.newHypeApiTest = {
    baseUrl: API_BASE_URL,
    explainConsumption,
    testHealth,
    testCheckEmail,
    testPlatformLogin,
    runDemo,
  };

  console.log('newHypeApiTest disponible en window para pruebas manuales.');
}

export {};