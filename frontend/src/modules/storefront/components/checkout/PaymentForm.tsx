/**
 * 💳 FORMULARIO DE PAGO
 * 
 * Formulario para seleccionar método de pago y capturar datos según el método.
 * Soporta: Efectivo, Tarjeta, Yape, Plin, Transferencia.
 * 
 * @example
 * <PaymentForm
 *   metodoPago="Tarjeta"
 *   pagoData={pagoData}
 *   onMetodoPagoChange={setMetodoPago}
 *   onPagoDataChange={handleChange}
 * />
 */

import { CreditCard, DollarSign, Smartphone, Building2, Banknote } from 'lucide-react';

type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin' | 'Transferencia';

interface PagoData {
  numeroTarjeta: string;
  nombreTitular: string;
  vencimiento: string;
  cvv: string;
  codigoYape: string;
  codigoPlin: string;
  bancoTransferencia: string;
  numeroOperacion: string;
}

interface PaymentFormProps {
  /**
   * Método de pago seleccionado
   */
  metodoPago: MetodoPago;
  
  /**
   * Datos de pago
   */
  pagoData: PagoData;
  
  /**
   * Callback cuando cambia el método de pago
   */
  onMetodoPagoChange: (metodo: MetodoPago) => void;
  
  /**
   * Callback cuando cambian los datos de pago
   */
  onPagoDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function PaymentForm({ 
  metodoPago, 
  pagoData, 
  onMetodoPagoChange, 
  onPagoDataChange 
}: PaymentFormProps) {
  
  // Formatear número de tarjeta
  const formatearTarjeta = (valor: string) => {
    const limpio = valor.replace(/\s/g, '');
    const grupos = limpio.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : limpio;
  };
  
  // Formatear vencimiento
  const formatearVencimiento = (valor: string) => {
    const limpio = valor.replace(/\D/g, '');
    if (limpio.length >= 2) {
      return limpio.slice(0, 2) + '/' + limpio.slice(2, 4);
    }
    return limpio;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    // Aplicar formatos específicos
    if (name === 'numeroTarjeta') {
      value = formatearTarjeta(value.replace(/\s/g, '').slice(0, 16));
    } else if (name === 'vencimiento') {
      value = formatearVencimiento(value);
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    
    onPagoDataChange({ ...e, target: { ...e.target, name, value } });
  };
  
  return (
    <div className="space-y-6">
      {/* Título */}
      <h2 className="text-2xl font-bold">Método de pago</h2>
      
      {/* Selector de Método de Pago */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => onMetodoPagoChange('Efectivo')}
          className={`
            p-4 rounded-xl border-2 flex flex-col items-center gap-2
            transition-all
            ${metodoPago === 'Efectivo'
              ? 'border-black bg-black/5'
              : 'border-gray-200 hover:border-gray-400'
            }
          `}
        >
          <DollarSign size={24} />
          <span className="font-semibold text-sm">Efectivo</span>
        </button>
        
        <button
          type="button"
          onClick={() => onMetodoPagoChange('Tarjeta')}
          className={`
            p-4 rounded-xl border-2 flex flex-col items-center gap-2
            transition-all
            ${metodoPago === 'Tarjeta'
              ? 'border-black bg-black/5'
              : 'border-gray-200 hover:border-gray-400'
            }
          `}
        >
          <CreditCard size={24} />
          <span className="font-semibold text-sm">Tarjeta</span>
        </button>
        
        <button
          type="button"
          onClick={() => onMetodoPagoChange('Yape')}
          className={`
            p-4 rounded-xl border-2 flex flex-col items-center gap-2
            transition-all
            ${metodoPago === 'Yape'
              ? 'border-black bg-black/5'
              : 'border-gray-200 hover:border-gray-400'
            }
          `}
        >
          <Smartphone size={24} />
          <span className="font-semibold text-sm">Yape</span>
        </button>
        
        <button
          type="button"
          onClick={() => onMetodoPagoChange('Plin')}
          className={`
            p-4 rounded-xl border-2 flex flex-col items-center gap-2
            transition-all
            ${metodoPago === 'Plin'
              ? 'border-black bg-black/5'
              : 'border-gray-200 hover:border-gray-400'
            }
          `}
        >
          <Banknote size={24} />
          <span className="font-semibold text-sm">Plin</span>
        </button>
        
        <button
          type="button"
          onClick={() => onMetodoPagoChange('Transferencia')}
          className={`
            p-4 rounded-xl border-2 flex flex-col items-center gap-2
            transition-all
            ${metodoPago === 'Transferencia'
              ? 'border-black bg-black/5'
              : 'border-gray-200 hover:border-gray-400'
            }
          `}
        >
          <Building2 size={24} />
          <span className="font-semibold text-sm">Transferencia</span>
        </button>
      </div>
      
      {/* Campos según método de pago */}
      {metodoPago === 'Tarjeta' && (
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2">Número de tarjeta *</label>
            <input
              type="text"
              name="numeroTarjeta"
              value={pagoData.numeroTarjeta}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Nombre del titular *</label>
            <input
              type="text"
              name="nombreTitular"
              value={pagoData.nombreTitular}
              onChange={onPagoDataChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
              placeholder="Como aparece en la tarjeta"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vencimiento *</label>
              <input
                type="text"
                name="vencimiento"
                value={pagoData.vencimiento}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                placeholder="MM/AA"
                maxLength={5}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">CVV *</label>
              <input
                type="text"
                name="cvv"
                value={pagoData.cvv}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      )}
      
      {metodoPago === 'Yape' && (
        <div className="mt-6 p-6 bg-purple-50 rounded-xl">
          <p className="text-sm text-gray-700 mb-4">
            Escanea el código QR o realiza la transferencia al número:
          </p>
          <p className="text-2xl font-bold text-center mb-4">999 999 999</p>
          <div>
            <label className="block text-sm font-medium mb-2">Código de operación *</label>
            <input
              type="text"
              name="codigoYape"
              value={pagoData.codigoYape}
              onChange={onPagoDataChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
              placeholder="Ingresa el código de 8 dígitos"
            />
          </div>
        </div>
      )}
      
      {metodoPago === 'Plin' && (
        <div className="mt-6 p-6 bg-blue-50 rounded-xl">
          <p className="text-sm text-gray-700 mb-4">
            Escanea el código QR o realiza la transferencia al número:
          </p>
          <p className="text-2xl font-bold text-center mb-4">999 999 999</p>
          <div>
            <label className="block text-sm font-medium mb-2">Código de operación *</label>
            <input
              type="text"
              name="codigoPlin"
              value={pagoData.codigoPlin}
              onChange={onPagoDataChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
              placeholder="Ingresa el código de operación"
            />
          </div>
        </div>
      )}
      
      {metodoPago === 'Transferencia' && (
        <div className="mt-6 space-y-4">
          <div className="p-6 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700 mb-2">Datos bancarios:</p>
            <p className="font-semibold">Banco: BCP</p>
            <p className="font-semibold">Cuenta: 191-1234567-0-89</p>
            <p className="font-semibold">CCI: 00219100123456789012</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Banco origen *</label>
            <select
              name="bancoTransferencia"
              value={pagoData.bancoTransferencia}
              onChange={onPagoDataChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
            >
              <option value="">Seleccionar banco</option>
              <option value="BCP">BCP</option>
              <option value="BBVA">BBVA</option>
              <option value="Interbank">Interbank</option>
              <option value="Scotiabank">Scotiabank</option>
              <option value="BanBif">BanBif</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Número de operación *</label>
            <input
              type="text"
              name="numeroOperacion"
              value={pagoData.numeroOperacion}
              onChange={onPagoDataChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
              placeholder="123456789"
            />
          </div>
        </div>
      )}
      
      {metodoPago === 'Efectivo' && (
        <div className="mt-6 p-6 bg-green-50 rounded-xl">
          <p className="text-sm text-gray-700">
            💵 Pagarás en efectivo al recibir tu pedido. Por favor, ten el monto exacto preparado.
          </p>
        </div>
      )}
    </div>
  );
}
