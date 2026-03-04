/**
 * 🪝 STOREFRONT HOOKS - Index
 * 
 * Exportación centralizada de todos los hooks customizados del storefront.
 * 
 * @module hooks
 */

export { useScrollAnimation } from './useScrollAnimation';
export { useProductFilters } from './useProductFilters';
export { useCart } from './useCart';
export { useAuth } from './useAuth';

// Re-exportar tipos útiles
export type { UseProductFiltersReturn } from './useProductFilters';
export type { UseCartReturn } from './useCart';
export type { UseAuthReturn, UsuarioStorefront, RegisterData } from './useAuth';
