/**
 * SELECTOR DE VARIANTES
 *
 * Selector de talla, color y cantidad para productos.
 * Uses real catalog data from the API via storefrontApi helpers.
 */

import { Check, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { obtenerTalla, obtenerColor , getBasePath } from '../../services/storefrontApi';

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
   * Stock maximo disponible
   * @default 0
   */
  stockMax?: number;
}

export default function ProductVariants({
  tallas = [],
  colores = [],
  tallaSeleccionada,
  colorSeleccionado,
  cantidad,
  onTallaChange,
  onColorChange,
  onCantidadChange,
  stockMax = 0
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
            <Link to={`${getBasePath()}/guia-tallas`} className="text-xs text-gray-500 hover:text-black underline">
              Guia de tallas
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {tallas.map((tallaId) => {
              const talla = obtenerTalla(tallaId);
              return (
                <button
                  key={tallaId}
                  onClick={() => onTallaChange(tallaId)}
                  className={`
                    px-3 py-3 rounded-lg border-2 font-medium text-sm text-center
                    transition-all
                    ${tallaSeleccionada === tallaId
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  {talla?.codigo || `T${tallaId}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selector de Color */}
      {colores.length > 0 && (
        <div>
          <label className="font-medium text-sm block mb-3">
            Color{colorSeleccionado ? `: ${obtenerColor(colorSeleccionado)?.nombre || ''}` : ''}
          </label>
          <div className="flex flex-wrap gap-3">
            {colores.map((colorId) => {
              const color = obtenerColor(colorId);
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
                      style={{ backgroundColor: color.codigoHex }}
                    >
                      {colorSeleccionado === colorId && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check
                            size={18}
                            strokeWidth={3}
                            className={color.codigoHex === '#FFFFFF' ? 'text-black' : 'text-white'}
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
            {stockMax === 0 ? 'Sin stock' : `${stockMax} disponibles`}
          </span>
        </div>
      </div>
    </div>
  );
}
