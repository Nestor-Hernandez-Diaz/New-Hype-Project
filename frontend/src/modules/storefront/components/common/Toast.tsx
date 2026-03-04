/**
 * 🔔 TOAST COMPONENT
 * 
 * Notificación individual animada con auto-dismiss.
 * Usado por ToastContainer.
 * 
 * @module Toast
 */

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast as ToastType } from '../../context/ToastContext';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  
  // Auto-dismiss animation antes de remover
  useEffect(() => {
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300); // Esperar animación de salida
    }, duration - 300);
    
    return () => clearTimeout(timer);
  }, [toast, onRemove]);
  
  // Iconos según tipo
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />
  };
  
  // Colores según tipo
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };
  
  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600'
  };
  
  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg min-w-[300px] max-w-[400px]
        ${colors[toast.type]}
        ${isExiting 
          ? 'animate-toast-out' 
          : 'animate-toast-in'
        }
      `}
      role="alert"
    >
      {/* Icono */}
      <div className={`flex-shrink-0 ${iconColors[toast.type]}`}>
        {icons[toast.type]}
      </div>
      
      {/* Mensaje */}
      <div className="flex-1 text-sm font-medium leading-snug pt-0.5">
        {toast.message}
      </div>
      
      {/* Botón cerrar */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
