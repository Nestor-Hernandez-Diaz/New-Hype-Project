/**
 * 👣 INDICADOR DE PASOS
 * 
 * Indicador visual del progreso en un proceso de múltiples pasos.
 * Usado principalmente en el checkout.
 * 
 * @example
 * <StepIndicator
 *   steps={['Datos', 'Envío', 'Pago']}
 *   currentStep={1}
 *   completedSteps={[0]}
 * />
 */

import { Check } from 'lucide-react';

interface StepIndicatorProps {
  /**
   * Array con los nombres de cada paso
   */
  steps: string[];
  
  /**
   * Índice del paso actual (0-based)
   */
  currentStep: number;
  
  /**
   * Array de índices de pasos completados
   */
  completedSteps?: number[];
}

export default function StepIndicator({ 
  steps, 
  currentStep, 
  completedSteps = [] 
}: StepIndicatorProps) {
  
  const isCompleted = (index: number) => completedSteps.includes(index);
  const isCurrent = (index: number) => index === currentStep;
  
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Línea de progreso de fondo */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        
        {/* Línea de progreso completada */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-black transition-all duration-500 -z-10"
          style={{ 
            width: `${(currentStep / (steps.length - 1)) * 100}%` 
          }}
        />
        
        {/* Steps */}
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center relative bg-white"
          >
            {/* Círculo del paso */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                font-semibold text-sm transition-all duration-300
                ${isCompleted(index)
                  ? 'bg-black text-white'
                  : isCurrent(index)
                  ? 'bg-black text-white ring-4 ring-black/10'
                  : 'bg-white border-2 border-gray-300 text-gray-400'
                }
              `}
            >
              {isCompleted(index) ? (
                <Check size={18} strokeWidth={3} />
              ) : (
                index + 1
              )}
            </div>
            
            {/* Label del paso */}
            <span
              className={`
                mt-2 text-xs font-medium whitespace-nowrap
                ${isCurrent(index) || isCompleted(index)
                  ? 'text-black'
                  : 'text-gray-400'
                }
              `}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
