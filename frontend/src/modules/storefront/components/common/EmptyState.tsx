/**
 * 📭 EMPTY STATE
 * 
 * Componente para mostrar estados vacíos (sin resultados, carrito vacío, etc.)
 * 
 * @example
 * <EmptyState
 *   icon="🔍"
 *   title="No hay resultados"
 *   description="Intenta con otros términos de búsqueda"
 *   action={{ label: 'Volver', onClick: handleBack }}
 * />
 */

import { ReactNode } from 'react';

interface EmptyStateProps {
  /**
   * Emoji o ícono a mostrar
   */
  icon?: ReactNode;
  
  /**
   * Título principal
   */
  title: string;
  
  /**
   * Descripción opcional
   */
  description?: string;
  
  /**
   * Acción opcional (botón)
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /**
   * Variante visual
   * @default 'default'
   */
  variant?: 'default' | 'error' | 'success';
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  variant = 'default'
}: EmptyStateProps) {
  
  const variantColors = {
    default: 'text-gray-400',
    error: 'text-red-400',
    success: 'text-green-400'
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icono */}
      {icon && (
        <div className={`text-6xl mb-4 ${variantColors[variant]}`}>
          {icon}
        </div>
      )}
      
      {/* Título */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {/* Descripción */}
      {description && (
        <p className="text-gray-600 text-sm max-w-md mb-6">
          {description}
        </p>
      )}
      
      {/* Acción */}
      {action && (
        <button
          onClick={action.onClick}
          className="
            px-6 py-3 bg-negro text-white rounded-lg font-medium
            hover:bg-gray-900 transition-colors
          "
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
