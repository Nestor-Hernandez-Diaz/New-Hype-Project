/**
 * 🧾 RESUMEN DE PEDIDO
 * 
 * Componente sticky que muestra el resumen del carrito durante el checkout.
 * 
 * @example
 * <OrderSummary
 *   items={carrito}
 *   subtotal={120.00}
 *   envio={9.90}
 *   total={129.90}
 * />
 */

import { ShoppingBag } from 'lucide-react';

interface ItemCarrito {
  productoId: number;
  nombreProducto: string;
  marca: string;
  imagen: string;
  precioUnitario: number;
  cantidad: number;
  tallaCodigo?: string;
  colorNombre?: string;
}

interface OrderSummaryProps {
  /**
   * Items del carrito
   */
  items: ItemCarrito[];
  
  /**
   * Subtotal (sin envío)
   */
  subtotal: number;
  
  /**
   * Costo de envío
   */
  envio: number;
  
  /**
   * Total final
   */
  total: number;
  
  /**
   * Si debe mostrar versión compacta
   * @default false
   */
  compact?: boolean;
}

export default function OrderSummary({ 
  items, 
  subtotal, 
  envio, 
  total,
  compact = false 
}: OrderSummaryProps) {
  
  if (compact) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <ShoppingBag size={20} />
          Resumen ({items.length} {items.length === 1 ? 'producto' : 'productos'})
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Envío</span>
            <span className="font-semibold">
              {envio === 0 ? (
                <span className="text-green-600">GRATIS</span>
              ) : (
                `S/ ${envio.toFixed(2)}`
              )}
            </span>
          </div>
          
          <div className="border-t-2 border-gray-200 pt-3 flex justify-between text-lg">
            <span className="font-bold">Total</span>
            <span className="font-bold">S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
      <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
        <ShoppingBag size={22} />
        Resumen del pedido
      </h3>
      
      {/* Lista de productos */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3">
            <div className="w-16 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
              <img
                src={item.imagen || '/placeholder-product.jpg'}
                alt={item.nombreProducto}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">
                {item.nombreProducto}
              </h4>
              <p className="text-xs text-gray-600">{item.marca}</p>
              {item.tallaCodigo && (
                <p className="text-xs text-gray-500">
                  Talla: {item.tallaCodigo}
                  {item.colorNombre && ` • ${item.colorNombre}`}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold">
                  S/ {item.precioUnitario.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">x {item.cantidad}</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-bold">
                S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Totales */}
      <div className="border-t-2 border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Envío</span>
          <span className="font-semibold">
            {envio === 0 ? (
              <span className="text-green-600">GRATIS 🎉</span>
            ) : (
              `S/ ${envio.toFixed(2)}`
            )}
          </span>
        </div>
        
        {envio > 0 && subtotal < 150 && (
          <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
            💡 Agrega S/ {(150 - subtotal).toFixed(2)} más para envío gratis
          </p>
        )}
        
        <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-lg">
          <span className="font-bold">Total</span>
          <span className="font-bold text-xl">S/ {total.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Métodos de pago aceptados */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center mb-2">
          Aceptamos
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <span className="px-2 py-1 bg-white rounded text-xs font-semibold border border-gray-200">
            Efectivo
          </span>
          <span className="px-2 py-1 bg-white rounded text-xs font-semibold border border-gray-200">
            Tarjeta
          </span>
          <span className="px-2 py-1 bg-white rounded text-xs font-semibold border border-gray-200">
            Yape
          </span>
          <span className="px-2 py-1 bg-white rounded text-xs font-semibold border border-gray-200">
            Plin
          </span>
        </div>
      </div>
    </div>
  );
}
