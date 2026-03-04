/**
 * 🔔 TOAST CONTEXT
 * 
 * Sistema de notificaciones toast para el storefront.
 * Maneja la cola de notificaciones y su ciclo de vida.
 * 
 * @module ToastContext
 */

import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';

// ============================================================================
// TIPOS
// ============================================================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // en ms, default 3000
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string };

// ============================================================================
// CONTEXT
// ============================================================================

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ============================================================================
// REDUCER
// ============================================================================

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      // Limitar a máximo 3 toasts visibles
      const newToasts = [...state.toasts, action.payload];
      return {
        toasts: newToasts.slice(-3)
      };
    
    case 'REMOVE_TOAST':
      return {
        toasts: state.toasts.filter(t => t.id !== action.payload)
      };
    
    default:
      return state;
  }
}

// ============================================================================
// PROVIDER
// ============================================================================

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });
  
  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    
    const toast: Toast = {
      id,
      type,
      message,
      duration
    };
    
    dispatch({ type: 'ADD_TOAST', payload: toast });
    
    // Auto-remover después de duration
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, duration);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);
  
  return (
    <ToastContext.Provider value={{ toasts: state.toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  
  return context;
}
