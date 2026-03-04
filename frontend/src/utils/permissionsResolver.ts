import { apiService } from './api';

/**
 * Obtiene los permisos reales de un rol desde el backend.
 * Se llama después del login para resolver los permisos del usuario.
 *
 * Flujo: Login → obtiene rol (string) → fetchPermissionsForRole(rol) → string[]
 *
 * El backend endpoint GET /roles retorna la lista de roles con su campo `permisos`
 * que es un JSON string con el array de permisos.
 */
export async function fetchPermissionsForRole(roleName: string): Promise<string[]> {
  try {
    const response = await apiService.get<any[]>('/roles');

    if (response.success && response.data) {
      // response.data puede ser un array de roles directamente o estar wrapeado
      const roles = Array.isArray(response.data) ? response.data : [];

      // Buscar el rol por nombre (el backend puede usar 'nombre' o 'nombreRol')
      const role = roles.find(
        (r: any) => r.nombre === roleName || r.nombreRol === roleName
      );

      if (role?.permisos) {
        // permisos puede ser un JSON string o ya un array/objeto
        let parsed = role.permisos;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch {
            console.warn('[permissionsResolver] Error parsing permisos JSON:', role.permisos);
            return getDefaultPermissionsForRole(roleName);
          }
        }
        // Si es {"all": true}, el rol tiene todos los permisos → usar defaults completos
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.all === true) {
          return getDefaultPermissionsForRole(roleName);
        }
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }

    console.warn(`[permissionsResolver] No se encontraron permisos para el rol: ${roleName}`);
    return getDefaultPermissionsForRole(roleName);
  } catch (error) {
    console.error('[permissionsResolver] Error fetching roles:', error);
    // Fallback a permisos por defecto si el endpoint falla
    return getDefaultPermissionsForRole(roleName);
  }
}

/**
 * Permisos por defecto como fallback si no se puede contactar al backend.
 * Solo se usan si GET /roles falla.
 */
function getDefaultPermissionsForRole(roleName: string): string[] {
  const upperRole = roleName.toUpperCase();

  const defaults: Record<string, string[]> = {
    ADMIN: [
      'dashboard.read',
      'products.read', 'products.create', 'products.update', 'products.delete',
      'sales.read', 'sales.create', 'sales.update', 'sales.delete',
      'purchases.read', 'purchases.create', 'purchases.update', 'purchases.delete',
      'inventory.read', 'inventory.create', 'inventory.update', 'inventory.delete',
      'warehouses.read', 'warehouses.create', 'warehouses.update', 'warehouses.delete',
      'clients.read', 'clients.create', 'clients.update', 'clients.delete',
      'commercial_entities.read', 'commercial_entities.create', 'commercial_entities.update', 'commercial_entities.delete',
      'users.read', 'users.create', 'users.update', 'users.delete',
      'cash-sessions.read', 'cash-sessions.create', 'cash-sessions.update', 'cash-sessions.delete',
      'reports.read', 'reports.export',
      'settings.read', 'settings.update',
      'configuracion.read', 'configuracion.update',
      'audit.read', 'auditoria.read',
    ],
    VENDEDOR: [
      'dashboard.read',
      'products.read',
      'sales.read', 'sales.create', 'sales.update',
      'clients.read', 'clients.create',
      'cash-sessions.read', 'cash-sessions.create',
    ],
    ALMACENERO: [
      'dashboard.read',
      'products.read', 'products.update',
      'inventory.read', 'inventory.create', 'inventory.update',
      'warehouses.read',
      'purchases.read',
    ],
  };

  return defaults[upperRole] || [];
}
