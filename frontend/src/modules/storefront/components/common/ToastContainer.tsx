/**
 * 🔔 TOAST CONTAINER
 * 
 * Contenedor de todas las notificaciones toast activas.
 * Se monta en el layout principal del storefront.
 * 
 * @module ToastContainer
 */

import { useToast } from '../../context/ToastContext';
import Toast from './Toast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  
  if (toasts.length === 0) return null;
  
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
