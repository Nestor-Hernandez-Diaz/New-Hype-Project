import { CreditCard, Smartphone, Building2, Banknote } from 'lucide-react';
import type { MetodoPagoStorefrontData, EmpresaStorefrontData } from '../../services/storefrontApi';

type MetodoPago = 'Tarjeta' | 'Yape' | 'Plin' | 'Transferencia';

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
  metodoPago: MetodoPago;
  pagoData: PagoData;
  onMetodoPagoChange: (metodo: MetodoPago) => void;
  onPagoDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  availableMethods?: MetodoPagoStorefrontData[];
  empresaData?: EmpresaStorefrontData | null;
}

const ALL_METHODS: { key: MetodoPago; icon: typeof CreditCard; label: string }[] = [
  { key: 'Tarjeta', icon: CreditCard, label: 'Tarjeta' },
  { key: 'Yape', icon: Smartphone, label: 'Yape' },
  { key: 'Plin', icon: Banknote, label: 'Plin' },
  { key: 'Transferencia', icon: Building2, label: 'Transferencia' },
];

export default function PaymentForm({
  metodoPago,
  pagoData,
  onMetodoPagoChange,
  onPagoDataChange,
  availableMethods,
  empresaData,
}: PaymentFormProps) {

  // Filter methods: if API returned methods, show only those (excluding Efectivo); otherwise show all
  const visibleMethods = availableMethods && availableMethods.length > 0
    ? ALL_METHODS.filter(m =>
        availableMethods.some(am => am.nombre.toLowerCase() === m.key.toLowerCase())
      )
    : ALL_METHODS;

  const formatearTarjeta = (valor: string) => {
    const limpio = valor.replace(/\s/g, '');
    const grupos = limpio.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : limpio;
  };

  const formatearVencimiento = (valor: string) => {
    const limpio = valor.replace(/\D/g, '');
    if (limpio.length >= 2) {
      return limpio.slice(0, 2) + '/' + limpio.slice(2, 4);
    }
    return limpio;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (name === 'numeroTarjeta') {
      value = formatearTarjeta(value.replace(/\s/g, '').slice(0, 16));
    } else if (name === 'vencimiento') {
      value = formatearVencimiento(value);
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    onPagoDataChange({ ...e, target: { ...e.target, name, value } });
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Metodo de pago</h2>

      {/* Method selector buttons */}
      <div className={`grid grid-cols-2 md:grid-cols-${Math.min(visibleMethods.length, 5)} gap-3`}>
        {visibleMethods.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onMetodoPagoChange(key)}
            className={`
              p-4 rounded-xl border-2 flex flex-col items-center gap-2
              transition-all
              ${metodoPago === key
                ? 'border-black bg-black/5'
                : 'border-gray-200 hover:border-gray-400'
              }
            `}
          >
            <Icon size={24} />
            <span className="font-semibold text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Payment details per method */}
      {metodoPago === 'Tarjeta' && (
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2">Numero de tarjeta *</label>
            <input
              type="text"
              name="numeroTarjeta"
              value={pagoData.numeroTarjeta}
              onChange={handleInputChange}
              required
              className={inputClass}
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
              className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
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
            Escanea el codigo QR o realiza la transferencia al numero:
          </p>
          <p className="text-2xl font-bold text-center mb-4">{empresaData?.telefono || '---'}</p>
          <div>
            <label className="block text-sm font-medium mb-2">Codigo de operacion *</label>
            <input
              type="text"
              name="codigoYape"
              value={pagoData.codigoYape}
              onChange={onPagoDataChange}
              required
              className={inputClass}
              placeholder="Ingresa el codigo de 8 digitos"
            />
          </div>
        </div>
      )}

      {metodoPago === 'Plin' && (
        <div className="mt-6 p-6 bg-blue-50 rounded-xl">
          <p className="text-sm text-gray-700 mb-4">
            Escanea el codigo QR o realiza la transferencia al numero:
          </p>
          <p className="text-2xl font-bold text-center mb-4">{empresaData?.telefono || '---'}</p>
          <div>
            <label className="block text-sm font-medium mb-2">Codigo de operacion *</label>
            <input
              type="text"
              name="codigoPlin"
              value={pagoData.codigoPlin}
              onChange={onPagoDataChange}
              required
              className={inputClass}
              placeholder="Ingresa el codigo de operacion"
            />
          </div>
        </div>
      )}

      {metodoPago === 'Transferencia' && (
        <div className="mt-6 space-y-4">
          <div className="p-6 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700 mb-2">Datos bancarios:</p>
            <p className="font-semibold">Banco: BCP</p>
            <p className="font-semibold">Cuenta: {empresaData?.razonSocial ? 'Consultar con la tienda' : '---'}</p>
            {empresaData?.telefono && (
              <p className="text-sm text-gray-500 mt-2">Contacto: {empresaData.telefono}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banco origen *</label>
            <select
              name="bancoTransferencia"
              value={pagoData.bancoTransferencia}
              onChange={onPagoDataChange}
              required
              className={inputClass}
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
            <label className="block text-sm font-medium mb-2">Numero de operacion *</label>
            <input
              type="text"
              name="numeroOperacion"
              value={pagoData.numeroOperacion}
              onChange={onPagoDataChange}
              required
              className={inputClass}
              placeholder="123456789"
            />
          </div>
        </div>
      )}
    </div>
  );
}
