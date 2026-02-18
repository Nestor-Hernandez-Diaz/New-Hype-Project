/**
 * ✅ PÁGINA DE CONFIRMACIÓN DE PEDIDO
 * 
 * Muestra el resumen del pedido después de completar la compra
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Truck, CreditCard, MapPin, Phone, Mail } from 'lucide-react';

interface PedidoConfirmacion {
  id: string;
  codigoPedido: string;
  fechaEmision: string;
  tipoEnvio: string;
  direccion: string;
  referencia: string;
  metodoPago: string;
  subtotal: number;
  envio: number;
  igv: number;
  total: number;
  estado: string;
  items: Array<{
    productoId: number;
    sku: string;
    nombreProducto: string;
    marca: string;
    precioUnitario: number;
    imagen: string;
    tallaCodigo: string;
    colorNombre: string;
    cantidad: number;
  }>;
  datosCliente: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
}

export default function OrderConfirmation() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoConfirmacion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        // Simular carga
        await new Promise(resolve => setTimeout(resolve, 800));

        // Buscar en localStorage
        const pedidos = JSON.parse(localStorage.getItem('nh_pedidos') || '[]');
        const pedidoEncontrado = pedidos.find((p: PedidoConfirmacion) => p.id === pedidoId);

        if (!pedidoEncontrado) {
          navigate('/storefront');
          return;
        }

        setPedido(pedidoEncontrado);
      } catch (error) {
        console.error('Error al cargar pedido:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarPedido();
  }, [pedidoId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Pedido no encontrado</p>
          <Link to="/storefront" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado de éxito */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h1 className="text-4xl font-bebas tracking-wider mb-2">¡PEDIDO CONFIRMADO!</h1>
          <p className="text-gray-600 mb-2">
            Gracias por tu compra, <strong>{pedido.datosCliente.nombre}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Hemos enviado un correo de confirmación a <strong>{pedido.datosCliente.email}</strong>
          </p>
        </div>

        {/* Información del pedido */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold mb-1">Pedido #{pedido.codigoPedido}</h2>
              <p className="text-sm text-gray-500">
                Realizado el {new Date(pedido.fechaEmision).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Estado</div>
              <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {pedido.estado}
              </span>
            </div>
          </div>

          {/* Timeline del pedido */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4">Estado del Pedido</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {[
                { label: 'Pedido Confirmado', icon: <CheckCircle2 size={20} />, completed: true },
                { label: 'En Preparación', icon: <Package size={20} />, completed: false },
                { label: 'Enviado', icon: <Truck size={20} />, completed: false },
                { label: 'Entregado', icon: <CheckCircle2 size={20} />, completed: false }
              ].map((step, idx) => (
                <div key={idx} className="relative flex items-center mb-6 last:mb-0">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full z-10 ${step.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step.icon}
                  </div>
                  <div className="ml-4">
                    <div className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Información de envío y contacto */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center">
                <MapPin size={20} className="mr-2" />
                Información de Envío
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">{pedido.tipoEnvio === 'domicilio' ? 'Envío a domicilio' : 'Retiro en tienda'}</p>
                <p>{pedido.direccion}</p>
                {pedido.referencia && <p className="text-gray-500">Ref: {pedido.referencia}</p>}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center">
                <Phone size={20} className="mr-2" />
                Información de Contacto
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  {pedido.datosCliente.email}
                </p>
                <p className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  {pedido.datosCliente.telefono}
                </p>
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <CreditCard size={20} className="mr-2" />
              Método de Pago
            </h3>
            <p className="text-sm text-gray-600">{pedido.metodoPago}</p>
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-bold text-lg mb-4">Productos</h3>
            <div className="space-y-4">
              {pedido.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                  <img 
                    src={item.imagen} 
                    alt={item.nombreProducto}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.nombreProducto}</h4>
                    <p className="text-sm text-gray-500">{item.marca}</p>
                    <p className="text-sm text-gray-500">
                      Talla: {item.tallaCodigo} · Cantidad: {item.cantidad}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">S/. {(item.precioUnitario * item.cantidad).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="mt-6 pt-6 border-t">
            <div className="space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>S/. {pedido.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className={pedido.envio === 0 ? 'text-green-600 font-medium' : ''}>
                  {pedido.envio === 0 ? 'GRATIS' : `S/. ${pedido.envio.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IGV (18%)</span>
                <span>S/. {pedido.igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total</span>
                <span>S/. {pedido.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/storefront"
            className="flex-1 text-center px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition"
          >
            Seguir Comprando
          </Link>
          <Link
            to="/storefront/cuenta/pedidos"
            className="flex-1 text-center px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition"
          >
            Ver Mis Pedidos
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">¿Qué sigue?</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Recibirás un correo con el código de seguimiento cuando tu pedido sea enviado</li>
            <li>• Puedes ver el estado de tu pedido en la sección "Mis Pedidos"</li>
            <li>• Si tienes alguna duda, contáctanos al WhatsApp: <strong>999-888-777</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
