/**
 * 🎨 SELECTOR DE VARIANTES
 * 
 * Selector de talla, color y cantidad para productos.
 * 
 * @example
 * <ProductVariants
 *   tallas={[1, 2, 3]}
 *   colores={[1, 2]}
 *   tallaSeleccionada={1}
 *   colorSeleccionado={1}
 *   cantidad={1}
 *   onTallaChange={setTalla}
 *   onColorChange={setColor}
 *   onCantidadChange={setCantidad}
 * />
 */

import { Check, Minus, Plus } from 'lucide-react';

interface ProductVariantsProps {
  /**
   * IDs de tallas disponibles
   */
  tallas?: number[];
  
  /**
   * IDs de colores disponibles
   */
  colores?: number[];
  
  /**
   * Talla seleccionada actualmente
   */
  tallaSeleccionada: number | null;
  
  /**
   * Color seleccionado actualmente
   */
  colorSeleccionado: number | null;
  
  /**
   * Cantidad seleccionada
   */
  cantidad: number;
  
  /**
   * Callback cuando se selecciona una talla
   */
  onTallaChange: (tallaId: number) => void;
  
  /**
   * Callback cuando se selecciona un color
   */
  onColorChange: (colorId: number) => void;
  
  /**
   * Callback cuando cambia la cantidad
   */
  onCantidadChange: (cantidad: number) => void;
  
  /**
   * Stock máximo disponible
   * @default 10
   */
  stockMax?: number;
}

// TODO: Estos datos deberían venir de una API real
const CATALOG_TALLAS: Record<number, string> = {
  1: 'XXS',
  2: 'XS',
  3: 'S',
  4: 'M',
  5: 'L',
  6: 'XL',
  7: 'XXL',
  8: '28',
  9: '30',
  10: '32',
  11: '34',
  12: '36'
};

const CATALOG_COLORES: Record<number, { nombre: string; hex: string }> = {
  1: { nombre: 'Negro', hex: '#000000' },
  2: { nombre: 'Blanco', hex: '#FFFFFF' },
  3: { nombre: 'Rojo', hex: '#DC2626' },
  4: { nombre: 'Azul', hex: '#2563EB' },
  5: { nombre: 'Verde', hex: '#16A34A' },
  6: { nombre: 'Gris', hex: '#6B7280' },
  7: { nombre: 'Beige', hex: '#D4A574' }
};

export default function ProductVariants({
  tallas = [],
  colores = [],
  tallaSeleccionada,
  colorSeleccionado,
  cantidad,
  onTallaChange,
  onColorChange,
  onCantidadChange,
  stockMax = 10
}: ProductVariantsProps) {
  
  const handleIncrementarCantidad = () => {
    if (cantidad < stockMax) {
      onCantidadChange(cantidad + 1);
    }
  };
  
  const handleDecrementarCantidad = () => {
    if (cantidad > 1) {
      onCantidadChange(cantidad - 1);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Selector de Talla */}
      {tallas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="font-medium text-sm">Talla</label>
            <button className="text-xs text-gray-500 hover:text-black underline">
              Guía de tallas
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tallas.map((tallaId) => (
              <button
                key={tallaId}
                onClick={() => onTallaChange(tallaId)}
                className={`
                  min-w-[60px] px-4 py-3 rounded-lg border-2 font-medium text-sm
                  transition-all
                  ${tallaSeleccionada === tallaId
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-gray-500'
                  }
                `}
              >
                {CATALOG_TALLAS[tallaId] || `T${tallaId}`}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Selector de Color */}
      {colores.length > 0 && (
        <div>
          <label className="font-medium text-sm block mb-3">Color</label>
          <div className="flex flex-wrap gap-3">
            {colores.map((colorId) => {
              const color = CATALOG_COLORES[colorId];
              if (!color) return null;
              
              return (
                <button
                  key={colorId}
                  onClick={() => onColorChange(colorId)}
                  className="flex flex-col items-center gap-1 group"
                  title={color.nombre}
                >
                  <div className="relative">
                    <div
                      className={`
                        w-10 h-10 rounded-full border-2 transition-all
                        ${colorSeleccionado === colorId
                          ? 'border-black scale-110'
                          : 'border-gray-300 group-hover:border-gray-500'
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                    >
                      {colorSeleccionado === colorId && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check 
                            size={18} 
                            strokeWidth={3}
                            className={color.hex === '#FFFFFF' ? 'text-black' : 'text-white'} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{color.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Selector de Cantidad */}
      <div>
        <label className="font-medium text-sm block mb-3">Cantidad</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-300 rounded-lg">
            <button
              onClick={handleDecrementarCantidad}
              disabled={cantidad <= 1}
              className="
                p-3 hover:bg-gray-100 transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed
              "
              aria-label="Disminuir cantidad"
            >
              <Minus size={16} strokeWidth={2.5} />
            </button>
            
            <span className="px-6 font-semibold text-lg min-w-[60px] text-center">
              {cantidad}
            </span>
            
            <button
              onClick={handleIncrementarCantidad}
              disabled={cantidad >= stockMax}
              className="
                p-3 hover:bg-gray-100 transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed
              "
              aria-label="Aumentar cantidad"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
          
          <span className="text-sm text-gray-500">
            {stockMax} disponibles
          </span>
        </div>
      </div>
    </div>
  );
}
