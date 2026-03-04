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
import ProcessingOverlay from '../components/common/ProcessingOverlay';
import StepIndicator from '../components/checkout/StepIndicator';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentForm from '../components/checkout/PaymentForm';
import OrderSummary from '../components/checkout/OrderSummary';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>('domicilio');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [procesando, setProcesando] = useState(false);
  const [mostrarProcessing, setMostrarProcessing] = useState(false);
  const [paso, setPaso] = useState(0); // 0: Envío, 1: Pago, 2: Confirmación
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
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

  // Validar datos de envío
  const validarDatosEnvio = () => {
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return false;
    }
    
    if (tipoEnvio === 'domicilio') {
      if (!formData.direccion || !formData.distrito || !formData.provincia || !formData.departamento) {
        showToast('Por favor completa la dirección de envío', 'error');
        return false;
      }
    }
    return true;
  };

  // Validar datos de pago
  const validarMetodoPago = () => {
    switch (metodoPago) {
      case 'Tarjeta':
        if (!pagoData.numeroTarjeta || !pagoData.nombreTitular || !pagoData.vencimiento || !pagoData.cvv) {
          showToast('Por favor completa los datos de la tarjeta', 'error');
          return false;
        }
        break;
      case 'Yape':
        if (!pagoData.codigoYape) {
          showToast('Por favor ingresa el código de operación Yape', 'error');
          return false;
        }
        break;
      case 'Plin':
        if (!pagoData.codigoPlin) {
          showToast('Por favor ingresa el código de operación Plin', 'error');
          return false;
        }
        break;
      case 'Transferencia':
        if (!pagoData.bancoTransferencia || !pagoData.numeroOperacion) {
          showToast('Por favor completa los datos de la transferencia', 'error');
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
            <li><button onClick={() => navigate('/storefront')} className="hover:text-gray-900">Inicio</button></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Checkout</li>
          </ol>
        </nav>

        {/* Indicador de Pasos */}
        <StepIndicator
          steps={['Envío', 'Pago']}
          currentStep={paso}
          completedSteps={completedSteps}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Paso 1: Formulario de Envío */}
            {paso === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <ShippingForm
                  formData={formData}
                  tipoEnvio={tipoEnvio}
                  onChange={handleInputChange}
                  onTipoEnvioChange={setTipoEnvio}
                />
                
                <button
                  onClick={() => {
                    if (validarDatosEnvio()) {
                      setCompletedSteps([0]);
                      setPaso(1);
                    }
                  }}
                  className="mt-6 w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition"
                >
                  Continuar al pago →
                </button>
              </div>
            )}

            {/* Paso 2: Método de Pago */}
            {paso === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <PaymentForm
                  metodoPago={metodoPago}
                  pagoData={pagoData}
                  onMetodoPagoChange={setMetodoPago}
                  onPagoDataChange={handlePagoInputChange}
                />

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => {
                      setCompletedSteps([]);
                      setPaso(0);
                    }}
                    className="flex-1 border-2 border-black text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition"
                    disabled={procesando}
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={procesarPedido}
                    disabled={procesando}
                    className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition disabled:bg-gray-400"
                  >
                    {procesando ? 'Procesando...' : 'Finalizar Pedido 🎉'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resumen del pedido (sidebar) */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={state.carrito}
              subtotal={subtotal}
              envio={envio}
              total={total}
            />
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
