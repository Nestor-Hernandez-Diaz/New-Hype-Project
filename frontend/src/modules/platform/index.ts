/**
 * 🏢 PLATFORM MODULE (SUPERADMIN)
 * 
 * Módulo para la gestión de la plataforma multi-tenant.
 * Solo accesible por el Superadmin.
 * 
 * Funcionalidades:
 * - Gestión de Tenants (crear, editar, suspender)
 * - Gestión de Planes de suscripción
 * - Dashboard global de la plataforma
 * - Configuración de módulos habilitados por tenant
 */

// Pages
export { default as PlatformLogin } from './pages/PlatformLogin';
export { default as PlatformDashboard } from './pages/PlatformDashboard';
export { default as TenantsManagement } from './pages/TenantsManagement';
export { default as PlansManagement } from './pages/PlansManagement';

// Layout
export { default as PlatformLayout } from './pages/PlatformLayout';
