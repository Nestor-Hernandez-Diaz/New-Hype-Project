/**
 * 🛒 PANEL LATERAL DEL CARRITO
 * 
 * Sidebar deslizable con productos del carrito, subtotal y botón de pago.
 */

import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useStorefront } from '../../context/StorefrontContext';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const { state, dispatch, actualizarCantidadCarrito, eliminarDelCarrito, obtenerResumenCarrito } = useStorefront();
  const navigate = useNavigate();
  
  const resumen = obtenerResumenCarrito();
  const { carrito, carritoAbierto } = state;
  
  const handleCheckout = () => {
    dispatch({ type: 'CERRAR_CARRITO' });
    navigate('/storefront/checkout');
  };
  
  if (!carritoAbierto) return null;
  
  return (
    <>
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-black/50 z-[1000] animate-fade-in"
        onClick={() => dispatch({ type: 'CERRAR_CARRITO' })}
      />
      
      {/* Panel lateral */}
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[1001] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Tu Carrito
            {resumen.cantidadItems > 0 && (
              <span className="text-sm font-normal text-gray-500">({resumen.cantidadItems})</span>
            )}
          </h3>
          <button
            onClick={() => dispatch({ type: 'CERRAR_CARRITO' })}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Cuerpo (productos) */}
        <div className="flex-1 overflow-y-auto p-6">
          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 text-gray-300">
                <ShoppingBag size={64} strokeWidth={1.5} className="mx-auto" />
              </div>
              <p className="text-lg text-gray-600 mb-6">Tu carrito está vacío</p>
              <button
                onClick={() => {
                  dispatch({ type: 'CERRAR_CARRITO' });
                  navigate('/storefront/catalogo?filtro=nuevo');
                }}
                className="px-6 py-2.5 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors duration-300 rounded-md"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {carrito.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  {/* Imagen */}
                  <div className="w-[80px] h-[100px] flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={item.imagen}
                      alt={item.nombreProducto}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2">{item.nombreProducto}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.tallaCodigo && `Talla: ${item.tallaCodigo}`}
                          {item.tallaCodigo && item.colorNombre && ' · '}
                          {item.colorNombre && (
                            <>
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 align-middle"
                                style={{ backgroundColor: item.colorHex }}
                              />
                              {' '}{item.colorNombre}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* Controles de cantidad y precio */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 border border-gray-300 rounded-md">
                        <button
                          onClick={() => actualizarCantidadCarrito(index, -1)}
                          className="p-1.5 hover:bg-gray-100 transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidadCarrito(index, 1)}
                          className="p-1.5 hover:bg-gray-100 transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="font-bold text-sm">
                        S/. {(item.precioUnitario * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Botón eliminar */}
                    <button
                      onClick={() => eliminarDelCarrito(index)}
                      className="text-xs text-red-600 hover:text-red-800 mt-2 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer (totales y checkout) */}
        {carrito.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center text-base">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">S/. {resumen.subtotal.toFixed(2)}</span>
            </div>
            
            {/* Mensaje de envío */}
            <div className="text-sm text-center py-2">
              {resumen.envio === 0 ? (
                <span className="text-green-600 font-semibold">✓ ¡Tienes envío gratis!</span>
              ) : (
                <span className="text-gray-600">
                  Agrega S/.{(150 - resumen.subtotal).toFixed(2)} más para envío gratis
                </span>
              )}
            </div>
            
            {/* Botón Ir a Pagar */}
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-3.5 rounded-md font-bold text-base hover:bg-gray-800 transition-colors duration-300"
            >
              Ir a Pagar
            </button>
            
            {/* Nota */}
            <p className="text-xs text-gray-500 text-center">
              Envío gratis en compras mayores a S/.150
            </p>
          </div>
        )}
      </aside>
      
      {/* Animaciones CSS */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
