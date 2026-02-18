/**
 * 🛒 PÁGINA DE CHECKOUT
 * 
 * Proceso completo de compra con:
 * - Información del cliente
 * - Dirección de envío
 * - Métodos de pago (Efectivo, Tarjeta, Yape, Plin, Transferencia)
 * - Resumen del carrito
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefront } from '../context/StorefrontContext';
import { MapPin, CreditCard, DollarSign, Smartphone, Building2 } from 'lucide-react';
import ProcessingOverlay from '../components/common/ProcessingOverlay';

type TipoEnvio = 'domicilio' | 'tienda';
type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin' | 'Transferencia';

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  referencia: string;
  distrito: string;
  provincia: string;
  departamento: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { state, vaciarCarrito } = useStorefront();
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>('domicilio');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [procesando, setProcesando] = useState(false);
  const [mostrarProcessing, setMostrarProcessing] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Datos, 2: Envío, 3: Pago
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    referencia: '',
    distrito: '',
    provincia: '',
    departamento: ''
  });

  // Campos de pago
  const [pagoData, setPagoData] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    vencimiento: '',
    cvv: '',
    codigoYape: '',
    codigoPlin: '',
    bancoTransferencia: '',
    numeroOperacion: ''
  });

  // Verificar que hay items en el carrito
  useEffect(() => {
    if (state.carrito.length === 0) {
      navigate('/storefront');
    }
  }, [state.carrito, navigate]);

  // Calcular totales
  const subtotal = state.carrito.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);
  const envio = tipoEnvio === 'tienda' || subtotal >= 150 ? 0 : 9.90;
  const total = subtotal + envio;

  // Manejar cambios en form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePagoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPagoData(prev => ({ ...prev, [name]: value }));
  };

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

  // Validar paso 1
  const validarDatosCliente = () => {
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono) {
      alert('Por favor completa todos los campos obligatorios');
      return false;
    }
    return true;
  };

  // Validar paso 2
  const validarDatosEnvio = () => {
    if (tipoEnvio === 'domicilio') {
      if (!formData.direccion || !formData.distrito || !formData.provincia || !formData.departamento) {
        alert('Por favor completa la dirección de envío');
        return false;
      }
    }
    return true;
  };

  // Validar paso 3
  const validarMetodoPago = () => {
    switch (metodoPago) {
      case 'Tarjeta':
        if (!pagoData.numeroTarjeta || !pagoData.nombreTitular || !pagoData.vencimiento || !pagoData.cvv) {
          alert('Por favor completa los datos de la tarjeta');
          return false;
        }
        break;
      case 'Yape':
        if (!pagoData.codigoYape) {
          alert('Por favor ingresa el código de operación Yape');
          return false;
        }
        break;
      case 'Plin':
        if (!pagoData.codigoPlin) {
          alert('Por favor ingresa el código de operación Plin');
          return false;
        }
        break;
      case 'Transferencia':
        if (!pagoData.bancoTransferencia || !pagoData.numeroOperacion) {
          alert('Por favor completa los datos de la transferencia');
          return false;
        }
        break;
    }
    return true;
  };

  // Procesar pedido
  const procesarPedido = async () => {
    if (!validarMetodoPago()) return;

    setProcesando(true);
    setMostrarProcessing(true);
  };
  
  // Completar pedido (llamado por ProcessingOverlay)
  const completarPedido = () => {
    // Generar código de pedido
    const fecha = new Date();
    const num = (Math.floor(Math.random() * 999) + 1).toString().padStart(3, '0');
    const codigo = `NH-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}-${num}`;

    // Guardar pedido en localStorage
    const pedido = {
      id: 'ped_' + Date.now(),
      codigoPedido: codigo,
      fechaEmision: fecha.toISOString(),
      tipoEnvio,
      direccion: tipoEnvio === 'domicilio' 
        ? `${formData.direccion}, ${formData.distrito}, ${formData.provincia}, ${formData.departamento}`
        : 'Retiro en tienda — Jr. Comercio 456, Tarapoto',
      referencia: formData.referencia || '',
      metodoPago,
      subtotal,
      envio,
      igv: total * 0.18,
      total,
      estado: 'Pendiente',
      items: state.carrito,
      datosCliente: {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono
      }
    };

    // Guardar en localStorage
    const pedidos = JSON.parse(localStorage.getItem('nh_pedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('nh_pedidos', JSON.stringify(pedidos));

    // Limpiar carrito
    vaciarCarrito();

    setProcesando(false);
    setMostrarProcessing(false);

    // Redirigir a confirmación
    navigate(`/storefront/confirmacion/${pedido.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li><a href="/storefront" className="hover:text-gray-900">Inicio</a></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Checkout</li>
          </ol>
        </nav>

        {/* Timeline */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {['Información', 'Envío', 'Pago'].map((label, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center ${idx < paso ? 'text-green-600' : idx === paso - 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${idx < paso ? 'bg-green-600 text-white border-green-600' : idx === paso - 1 ? 'border-gray-900' : 'border-gray-300'}`}>
                    {idx < paso ? '✓' : idx + 1}
                  </div>
                  <span className="ml-2 font-medium hidden sm:inline">{label}</span>
                </div>
                {idx < 2 && (
                  <div className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${idx < paso - 1 ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Paso 1: Información del cliente */}
            {paso === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Información Personal</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (validarDatosCliente()) setPaso(2);
                  }}
                  className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
                >
                  Continuar al envío
                </button>
              </div>
            )}

            {/* Paso 2: Datos de envío */}
            {paso === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Método de Envío</h2>
                
                {/* Opciones de envío */}
                <div className="space-y-4 mb-6">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${tipoEnvio === 'domicilio' ? 'border-gray-900 bg-gray-50' : 'border-gray-300'}`}>
                    <input
                      type="radio"
                      name="tipoEnvio"
                      value="domicilio"
                      checked={tipoEnvio === 'domicilio'}
                      onChange={(e) => setTipoEnvio(e.target.value as TipoEnvio)}
                      className="mr-3"
                    />
                    <MapPin size={24} className="mr-3 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-bold">Envío a domicilio</div>
                      <div className="text-sm text-gray-600">Recibe en tu dirección (S/. {subtotal >= 150 ? '0.00' : '9.90'})</div>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${tipoEnvio === 'tienda' ? 'border-gray-900 bg-gray-50' : 'border-gray-300'}`}>
                    <input
                      type="radio"
                      name="tipoEnvio"
                      value="tienda"
                      checked={tipoEnvio === 'tienda'}
                      onChange={(e) => setTipoEnvio(e.target.value as TipoEnvio)}
                      className="mr-3"
                    />
                    <Building2 size={24} className="mr-3 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-bold">Retiro en tienda</div>
                      <div className="text-sm text-gray-600">Jr. Comercio 456, Tarapoto (Gratis)</div>
                    </div>
                  </label>
                </div>

                {/* Formulario de dirección */}
                {tipoEnvio === 'domicilio' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg mb-4">Dirección de Entrega</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder="Calle, número, urbanización"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
                        <input
                          type="text"
                          name="departamento"
                          value={formData.departamento}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Provincia *</label>
                        <input
                          type="text"
                          name="provincia"
                          value={formData.provincia}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Distrito *</label>
                        <input
                          type="text"
                          name="distrito"
                          value={formData.distrito}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Referencia (opcional)</label>
                      <textarea
                        name="referencia"
                        value={formData.referencia}
                        onChange={handleInputChange}
                        placeholder="Ej: Frente al parque, casa de dos pisos color azul"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setPaso(1)}
                    className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={() => {
                      if (validarDatosEnvio()) setPaso(3);
                    }}
                    className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
                  >
                    Continuar al pago
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3: Método de pago */}
            {paso === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Método de Pago</h2>

                {/* Opciones de pago */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { id: 'Efectivo', label: 'Efectivo', icon: <DollarSign size={20} /> },
                    { id: 'Tarjeta', label: 'Tarjeta', icon: <CreditCard size={20} /> },
                    { id: 'Yape', label: 'Yape', icon: <Smartphone size={20} /> },
                    { id: 'Plin', label: 'Plin', icon: <Smartphone size={20} /> },
                    { id: 'Transferencia', label: 'Transferencia', icon: <Building2 size={20} /> },
                  ].map((metodo) => (
                    <label
                      key={metodo.id}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition ${metodoPago === metodo.id ? 'border-gray-900 bg-gray-50' : 'border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name="metodoPago"
                        value={metodo.id}
                        checked={metodoPago === metodo.id}
                        onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                        className="sr-only"
                      />
                      <div className="mb-2">{metodo.icon}</div>
                      <div className="text-sm font-medium">{metodo.label}</div>
                    </label>
                  ))}
                </div>

                {/* Formularios según método de pago */}
                {metodoPago === 'Tarjeta' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold">Datos de la Tarjeta</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número de tarjeta *</label>
                      <input
                        type="text"
                        name="numeroTarjeta"
                        value={pagoData.numeroTarjeta}
                        onChange={(e) => {
                          const formatted = formatearTarjeta(e.target.value.replace(/\s/g, '').slice(0, 16));
                          handlePagoInputChange({ ...e, target: { ...e.target, value: formatted } });
                        }}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del titular *</label>
                      <input
                        type="text"
                        name="nombreTitular"
                        value={pagoData.nombreTitular}
                        onChange={handlePagoInputChange}
                        placeholder="Como aparece en la tarjeta"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vencimiento *</label>
                        <input
                          type="text"
                          name="vencimiento"
                          value={pagoData.vencimiento}
                          onChange={(e) => {
                            const formatted = formatearVencimiento(e.target.value);
                            handlePagoInputChange({ ...e, target: { ...e.target, value: formatted } });
                          }}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          value={pagoData.cvv}
                          onChange={handlePagoInputChange}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {metodoPago === 'Yape' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold">Pago con Yape</h3>
                    <p className="text-sm text-gray-600">Realiza tu pago al número: <strong>999-888-777</strong></p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código de operación *</label>
                      <input
                        type="text"
                        name="codigoYape"
                        value={pagoData.codigoYape}
                        onChange={handlePagoInputChange}
                        placeholder="Ingresa el código de tu operación"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        required
                      />
                    </div>
                  </div>
                )}

                {metodoPago === 'Plin' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold">Pago con Plin</h3>
                    <p className="text-sm text-gray-600">Realiza tu pago al número: <strong>999-888-777</strong></p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código de operación *</label>
                      <input
                        type="text"
                        name="codigoPlin"
                        value={pagoData.codigoPlin}
                        onChange={handlePagoInputChange}
                        placeholder="Ingresa el código de tu operación"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        required
                      />
                    </div>
                  </div>
                )}

                {metodoPago === 'Transferencia' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold">Transferencia Bancaria</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Banco:</strong> BCP</p>
                      <p><strong>Cuenta Corriente:</strong> 194-1234567-0-89</p>
                      <p><strong>CCI:</strong> 002-19412345670089-12</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Banco *</label>
                      <select
                        name="bancoTransferencia"
                        value={pagoData.bancoTransferencia}
                        onChange={handlePagoInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        required
                      >
                        <option value="">Selecciona tu banco</option>
                        <option value="BCP">BCP</option>
                        <option value="BBVA">BBVA</option>
                        <option value="Interbank">Interbank</option>
                        <option value="Scotiabank">Scotiabank</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número de operación *</label>
                      <input
                        type="text"
                        name="numeroOperacion"
                        value={pagoData.numeroOperacion}
                        onChange={handlePagoInputChange}
                        placeholder="Ingresa el número de operación"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        required
                      />
                    </div>
                  </div>
                )}

                {metodoPago === 'Efectivo' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> El pago se realizará al momento de la entrega o retiro del producto.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setPaso(2)}
                    className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
                    disabled={procesando}
                  >
                    Atrás
                  </button>
                  <button
                    onClick={procesarPedido}
                    disabled={procesando}
                    className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400"
                  >
                    {procesando ? 'Procesando...' : 'Finalizar Pedido'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resumen del pedido (sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Resumen del Pedido</h3>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {state.carrito.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img 
                      src={item.imagen} 
                      alt={item.nombreProducto}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.nombreProducto}</div>
                      <div className="text-xs text-gray-500">
                        {item.tallaCodigo} · Cant: {item.cantidad}
                      </div>
                      <div className="text-sm font-bold">S/. {(item.precioUnitario * item.cantidad).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>S/. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span className={envio === 0 ? 'text-green-600 font-medium' : ''}>
                    {envio === 0 ? 'GRATIS' : `S/. ${envio.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>S/. {total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 150 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  Te faltan <strong>S/. {(150 - subtotal).toFixed(2)}</strong> para envío gratis
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay de Procesamiento */}
      <ProcessingOverlay
        isVisible={mostrarProcessing}
        metodoPago={metodoPago}
        onComplete={completarPedido}
      />
    </div>
  );
}
