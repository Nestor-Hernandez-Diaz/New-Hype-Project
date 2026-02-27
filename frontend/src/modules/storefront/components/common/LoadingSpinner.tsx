/**
 * ⏳ LOADING SPINNER
 * 
 * Spinner de carga reutilizable para todo el storefront.
 * 
 * @example
 * <LoadingSpinner size="lg" />
 */

interface LoadingSpinnerProps {
  /**
   * Tamaño del spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Texto opcional a mostrar debajo del spinner
   */
  text?: string;
  
  /**
   * Si true, ocupa toda la pantalla con overlay
   */
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };
  
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div 
        className={`
          ${sizeClasses[size]}
          border-gray-200 border-t-negro
          rounded-full animate-spin
        `}
        role="status"
        aria-label="Cargando"
      />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
        {spinner}
      </div>
    );
  }
  
  return spinner;
}
