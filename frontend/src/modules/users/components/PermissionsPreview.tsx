import React from 'react';
import styled from 'styled-components';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../../styles/theme';

interface PermissionsPreviewProps {
  permissions: string[];
  title?: string;
  emptyMessage?: string;
  groupByModule?: boolean;
}

const Container = styled.div`
  margin: ${SPACING.md} 0;
`;

const Title = styled.h4`
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.body};
  margin-bottom: ${SPACING.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${SPACING.xs};
  max-height: 300px;
  overflow-y: auto;
  padding: ${SPACING.md};
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.md};
  border: 1px solid ${COLORS.borderLight};
`;

const ModuleGroup = styled.div`
  margin-bottom: ${SPACING.md};
`;

const ModuleTitle = styled.div`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.small};
  text-transform: uppercase;
  margin-bottom: ${SPACING.xs};
  padding-bottom: ${SPACING.xs};
  border-bottom: 2px solid ${COLORS.primary};
`;

const PermissionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${SPACING.xs} ${SPACING.sm};
  background: white;
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.text.secondary};
  box-shadow: ${SHADOWS.sm};
  
  &::before {
    content: '✓';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: ${SPACING.xs};
    background: ${COLORS.success};
    color: white;
    border-radius: ${BORDER_RADIUS.full};
    font-size: ${TYPOGRAPHY.fontSize.xs};
    line-height: 16px;
    text-align: center;
    font-weight: ${TYPOGRAPHY.fontWeight.bold};
  }
`;

const EmptyState = styled.div`
  padding: ${SPACING.xl};
  text-align: center;
  color: ${COLORS.text.muted};
  font-style: italic;
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.md};
  border: 1px dashed ${COLORS.border};
`;

const Counter = styled.div`
  display: inline-block;
  background: ${COLORS.primary};
  color: white;
  padding: ${SPACING.xs} ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.full};
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin-left: ${SPACING.xs};
`;

// Mapeo de permisos a nombres legibles y módulos
const PERMISSION_NAMES: Record<string, { name: string; module: string }> = {
  // Dashboard
  'dashboard.read': { name: 'Ver Dashboard', module: 'Dashboard' },

  // Usuarios
  'users.create': { name: 'Crear Usuarios', module: 'Usuarios' },
  'users.read': { name: 'Ver Usuarios', module: 'Usuarios' },
  'users.update': { name: 'Actualizar Usuarios', module: 'Usuarios' },
  'users.delete': { name: 'Eliminar Usuarios', module: 'Usuarios' },

  // Roles
  'roles.create': { name: 'Crear Roles', module: 'Roles' },
  'roles.read': { name: 'Ver Roles', module: 'Roles' },
  'roles.update': { name: 'Actualizar Roles', module: 'Roles' },
  'roles.delete': { name: 'Eliminar Roles', module: 'Roles' },
  'roles.manage': { name: 'Gestionar Roles', module: 'Roles' },

  // Entidades Comerciales (ambos formatos de clave)
  'clients.create': { name: 'Crear Entidades', module: 'Entidades Comerciales' },
  'clients.read': { name: 'Ver Entidades', module: 'Entidades Comerciales' },
  'clients.update': { name: 'Actualizar Entidades', module: 'Entidades Comerciales' },
  'clients.delete': { name: 'Eliminar Entidades', module: 'Entidades Comerciales' },
  'commercial_entities.create': { name: 'Crear Entidades', module: 'Entidades Comerciales' },
  'commercial_entities.read': { name: 'Ver Entidades', module: 'Entidades Comerciales' },
  'commercial_entities.update': { name: 'Actualizar Entidades', module: 'Entidades Comerciales' },
  'commercial_entities.delete': { name: 'Eliminar Entidades', module: 'Entidades Comerciales' },

  // Productos
  'products.create': { name: 'Crear Productos', module: 'Productos' },
  'products.read': { name: 'Ver Productos', module: 'Productos' },
  'products.update': { name: 'Actualizar Productos', module: 'Productos' },
  'products.delete': { name: 'Eliminar Productos', module: 'Productos' },

  // Inventario
  'inventory.read': { name: 'Ver Inventario', module: 'Inventario' },
  'inventory.update': { name: 'Actualizar Inventario', module: 'Inventario' },
  'inventory.adjustment': { name: 'Ajustar Inventario', module: 'Inventario' },

  // Almacenes
  'warehouses.create': { name: 'Crear Almacenes', module: 'Almacenes' },
  'warehouses.read': { name: 'Ver Almacenes', module: 'Almacenes' },
  'warehouses.update': { name: 'Actualizar Almacenes', module: 'Almacenes' },
  'warehouses.delete': { name: 'Eliminar Almacenes', module: 'Almacenes' },

  // Ventas
  'sales.create': { name: 'Crear Ventas', module: 'Ventas' },
  'sales.read': { name: 'Ver Ventas', module: 'Ventas' },
  'sales.update': { name: 'Actualizar Ventas', module: 'Ventas' },
  'sales.delete': { name: 'Eliminar Ventas', module: 'Ventas' },
  'sales.cancel': { name: 'Cancelar Ventas', module: 'Ventas' },
  'sales.credit_note': { name: 'Notas de Crédito', module: 'Ventas' },

  // Compras
  'purchases.create': { name: 'Crear Compras', module: 'Compras' },
  'purchases.read': { name: 'Ver Compras', module: 'Compras' },
  'purchases.update': { name: 'Actualizar Compras', module: 'Compras' },
  'purchases.delete': { name: 'Eliminar Compras', module: 'Compras' },

  // Cajas Registradoras
  'cash-registers.create': { name: 'Crear Cajas', module: 'Cajas Registradoras' },
  'cash-registers.read': { name: 'Ver Cajas', module: 'Cajas Registradoras' },
  'cash-registers.update': { name: 'Actualizar Cajas', module: 'Cajas Registradoras' },
  'cash-registers.delete': { name: 'Eliminar Cajas', module: 'Cajas Registradoras' },

  // Sesiones de Caja
  'cash-sessions.create': { name: 'Abrir Sesión de Caja', module: 'Sesiones de Caja' },
  'cash-sessions.read': { name: 'Ver Sesiones de Caja', module: 'Sesiones de Caja' },
  'cash-sessions.update': { name: 'Actualizar Sesiones', module: 'Sesiones de Caja' },
  'cash-sessions.delete': { name: 'Eliminar Sesiones', module: 'Sesiones de Caja' },
  'cash.open_session': { name: 'Abrir Caja', module: 'Caja' },
  'cash.close_session': { name: 'Cerrar Caja', module: 'Caja' },
  'cash.movements': { name: 'Movimientos de Caja', module: 'Caja' },

  // Configuración
  'settings.read': { name: 'Ver Configuración', module: 'Configuración' },
  'settings.update': { name: 'Actualizar Configuración', module: 'Configuración' },
  'configuration.read': { name: 'Ver Configuración', module: 'Configuración' },
  'configuration.update': { name: 'Actualizar Configuración', module: 'Configuración' },

  // Auditoría
  'audit.read': { name: 'Ver Auditoría', module: 'Auditoría' },

  // Reportes
  'reports.read': { name: 'Ver Reportes', module: 'Reportes' },
  'reports.sales': { name: 'Reportes de Ventas', module: 'Reportes' },
  'reports.inventory': { name: 'Reportes de Inventario', module: 'Reportes' },
  'reports.cash': { name: 'Reportes de Caja', module: 'Reportes' },
  'reports.audit': { name: 'Reportes de Auditoría', module: 'Reportes' },

  // Cotizaciones
  'quotes.create': { name: 'Crear Cotizaciones', module: 'Ventas' },
  'quotes.read': { name: 'Ver Cotizaciones', module: 'Ventas' },
};

const PermissionsPreview: React.FC<PermissionsPreviewProps> = ({
  permissions,
  title = 'Permisos incluidos:',
  emptyMessage = 'No hay permisos asignados',
  groupByModule = true
}) => {
  if (!permissions || permissions.length === 0) {
    return (
      <Container>
        {title && <Title>{title}</Title>}
        <EmptyState>{emptyMessage}</EmptyState>
      </Container>
    );
  }

  // Agrupar permisos por módulo
  const groupedPermissions: Record<string, string[]> = {};
  
  permissions.forEach(permId => {
    const permInfo = PERMISSION_NAMES[permId];
    const module = permInfo?.module || 'Otros';
    
    if (!groupedPermissions[module]) {
      groupedPermissions[module] = [];
    }
    groupedPermissions[module].push(permId);
  });

  if (!groupByModule) {
    return (
      <Container>
        {title && (
          <Title>
            {title}
            <Counter>{permissions.length}</Counter>
          </Title>
        )}
        <PermissionsGrid>
          {permissions.map(permId => {
            const permInfo = PERMISSION_NAMES[permId];
            return (
              <PermissionBadge key={permId}>
                {permInfo?.name || permId}
              </PermissionBadge>
            );
          })}
        </PermissionsGrid>
      </Container>
    );
  }

  return (
    <Container>
      {title && (
        <Title>
          {title}
          <Counter>{permissions.length}</Counter>
        </Title>
      )}
      {Object.entries(groupedPermissions).map(([module, perms]) => (
        <ModuleGroup key={module}>
          <ModuleTitle>{module} ({perms.length})</ModuleTitle>
          <PermissionsGrid>
            {perms.map(permId => {
              const permInfo = PERMISSION_NAMES[permId];
              return (
                <PermissionBadge key={permId}>
                  {permInfo?.name || permId}
                </PermissionBadge>
              );
            })}
          </PermissionsGrid>
        </ModuleGroup>
      ))}
    </Container>
  );
};

export default PermissionsPreview;
