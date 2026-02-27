export interface SuperadminRequirement {
  code: string;
  name: string;
  area: string;
  priority: 'Critica' | 'Alta' | 'Media';
  status: 'Nuevo' | 'Actualizado';
}

const STORAGE_KEY = 'superadmin_requirements';
const DEFAULT_REQUIREMENTS: SuperadminRequirement[] = [
  {
    code: 'RF-SUP-001',
    name: 'Registrar nueva tienda en la plataforma',
    area: 'Gestion de Tiendas',
    priority: 'Critica',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-002',
    name: 'Listar todas las tiendas de la plataforma',
    area: 'Gestion de Tiendas',
    priority: 'Critica',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-003',
    name: 'Consultar informacion completa de una tienda',
    area: 'Gestion de Tiendas',
    priority: 'Critica',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-004',
    name: 'Modificar informacion de una tienda',
    area: 'Gestion de Tiendas',
    priority: 'Critica',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-005',
    name: 'Suspender o activar tienda',
    area: 'Gestion de Tiendas',
    priority: 'Critica',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-006',
    name: 'Dashboard de ingresos globales',
    area: 'Metricas Globales',
    priority: 'Alta',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-007',
    name: 'Consultar modulos habilitados por tienda',
    area: 'Planes y Modulos',
    priority: 'Alta',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-008',
    name: 'Gestionar tickets de soporte',
    area: 'Soporte',
    priority: 'Alta',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-009',
    name: 'Eliminar tienda (soft delete)',
    area: 'Gestion de Tiendas',
    priority: 'Alta',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-010',
    name: 'Ver logs de auditoria multi-tenant',
    area: 'Auditoria Global',
    priority: 'Alta',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-011',
    name: 'Gestionar catalogos globales de moda',
    area: 'Catalogos de Moda',
    priority: 'Alta',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-012',
    name: 'Definir politicas globales de liquidacion y devolucion',
    area: 'Politicas Globales',
    priority: 'Alta',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-013',
    name: 'Monitorear KPIs de moda y rotacion',
    area: 'Tendencias',
    priority: 'Media',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-014',
    name: 'Aprobar marcas y colecciones globales',
    area: 'Marcas y Colecciones',
    priority: 'Media',
    status: 'Nuevo'
  },
  {
    code: 'RF-SUP-015',
    name: 'Control de temporadas y colecciones',
    area: 'Temporadas',
    priority: 'Media',
    status: 'Nuevo'
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readStorage = (): SuperadminRequirement[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_REQUIREMENTS;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REQUIREMENTS));
    return DEFAULT_REQUIREMENTS;
  }

  try {
    const parsed = JSON.parse(stored) as SuperadminRequirement[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.warn('[superadminApi] Invalid storage payload, resetting.', error);
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REQUIREMENTS));
  return DEFAULT_REQUIREMENTS;
};

const writeStorage = (data: SuperadminRequirement[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const fetchRequirements = async (): Promise<SuperadminRequirement[]> => {
  await delay(800);
  return readStorage();
};

export const createRequirement = async (
  payload: SuperadminRequirement
): Promise<SuperadminRequirement[]> => {
  await delay(800);
  const current = readStorage();
  const next = [payload, ...current];
  writeStorage(next);
  return next;
};

export const updateRequirement = async (
  payload: SuperadminRequirement
): Promise<SuperadminRequirement[]> => {
  await delay(800);
  const current = readStorage();
  const next = current.map((item) => (item.code === payload.code ? payload : item));
  writeStorage(next);
  return next;
};

export const deleteRequirement = async (code: string): Promise<SuperadminRequirement[]> => {
  await delay(800);
  const current = readStorage();
  const next = current.filter((item) => item.code !== code);
  writeStorage(next);
  return next;
};
