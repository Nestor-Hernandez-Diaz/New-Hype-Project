import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiObtenerMisPedidos } from '../services/storefrontApi';
import type { PedidoApiResponse } from '../services/storefrontApi';

interface PedidoRastreo {
  codigoPedido: string;
  estado: string;
  fechaEmision: string;
  items: Array<{
    nombreProducto: string;
    cantidad: number;
  }>;
  direccion: string;
  total: number;
  timeline: Array<{
    estado: string;
    fecha: string;
    descripcion: string;
    completado: boolean;
  }>;
}

function buildTimeline(estado: string, fechaEmision: string) {
  const estadoUpper = (estado || '').toUpperCase();
  return [
    {
      estado: 'Pedido Confirmado',
      fecha: fechaEmision,
      descripcion: 'Tu pedido ha sido confirmado y esta siendo preparado',
      completado: true,
    },
    {
      estado: 'En Preparacion',
      fecha: '',
      descripcion: 'Estamos preparando tus productos',
      completado: !['PENDIENTE'].includes(estadoUpper),
    },
    {
      estado: 'Enviado',
      fecha: '',
      descripcion: 'Tu pedido esta en camino',
      completado: ['ENVIADO', 'ENTREGADO'].includes(estadoUpper),
    },
    {
      estado: 'Entregado',
      fecha: '',
      descripcion: 'Tu pedido ha sido entregado',
      completado: estadoUpper === 'ENTREGADO',
    },
  ];
}

export default function TrackOrder() {
  const navigate = useNavigate();
  const { estaAutenticado } = useAuth();
  const [codigoPedido, setCodigoPedido] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [pedido, setPedido] = useState<PedidoRastreo | null>(null);
  const [error, setError] = useState('');

  const buscarPedido = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigoPedido.trim()) {
      setError('Por favor ingresa un codigo de pedido');
      return;
    }

    if (!estaAutenticado) {
      setError('Inicia sesion para rastrear tu pedido');
      return;
    }

    setBuscando(true);
    setError('');
    setPedido(null);

    try {
      // Fetch all user's orders and search by code
      const page = await apiObtenerMisPedidos(0, 100);
      const pedidos: PedidoApiResponse[] = page.content || [];
      const encontrado = pedidos.find(
        (p) => p.codigo.toLowerCase() === codigoPedido.trim().toLowerCase()
      );

      if (encontrado) {
        setPedido({
          codigoPedido: encontrado.codigo,
          estado: encontrado.estado,
          fechaEmision: encontrado.createdAt,
          items: encontrado.detalles.map((d) => ({
            nombreProducto: d.nombreProducto,
            cantidad: d.cantidad,
          })),
          direccion: encontrado.direccionEnvio || '',
          total: encontrado.total,
          timeline: buildTimeline(encontrado.estado, encontrado.createdAt),
        });
      } else {
        setError('No se encontro ningun pedido con ese codigo. Verifica que el codigo sea correcto.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar el pedido. Intentalo de nuevo.');
    } finally {
      setBuscando(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    const e = (estado || '').toUpperCase();
    if (e === 'PENDIENTE') return <Clock size={24} className="text-yellow-600" />;
    if (e === 'ENVIADO') return <Truck size={24} className="text-blue-600" />;
    if (e === 'ENTREGADO') return <CheckCircle2 size={24} className="text-green-600" />;
    if (e === 'CANCELADO') return <XCircle size={24} className="text-red-600" />;
    return <Package size={24} className="text-gray-600" />;
  };

  const getEstadoColor = (estado: string) => {
    const e = (estado || '').toUpperCase();
    if (e === 'PENDIENTE') return 'bg-yellow-100 text-yellow-800';
    if (e === 'ENVIADO') return 'bg-blue-100 text-blue-800';
    if (e === 'ENTREGADO') return 'bg-green-100 text-green-800';
    if (e === 'CANCELADO') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-5xl font-bebas tracking-wider mb-4">SEGUIR MI PEDIDO</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ingresa tu codigo de pedido para rastrear el estado de tu compra
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
          <form onSubmit={buscarPedido} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={codigoPedido}
                  onChange={(e) => setCodigoPedido(e.target.value)}
                  placeholder="Ej: PED-001"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={buscando}
                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {buscando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>El codigo de pedido se encuentra en el correo de confirmacion</p>
          </div>
        </div>

        {/* Results */}
        {pedido && (
          <div className="space-y-6">
            {/* General info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Pedido #{pedido.codigoPedido}</h2>
                  <p className="text-sm text-gray-500">
                    Realizado el{' '}
                    {new Date(pedido.fechaEmision).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {getEstadoIcon(pedido.estado)}
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getEstadoColor(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </div>
                  <p className="text-sm font-bold">Total: S/ {pedido.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">Estado del Envio</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {pedido.timeline.map((step, idx) => (
                    <div key={idx} className="relative flex items-start mb-6 last:mb-0">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full z-10 flex-shrink-0 ${
                          step.completado ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        {step.completado ? (
                          <CheckCircle2 size={16} className="text-white" />
                        ) : (
                          <Clock size={16} className="text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className={`font-medium ${step.completado ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.estado}
                        </div>
                        <div className={`text-sm ${step.completado ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.descripcion}
                        </div>
                        {step.fecha && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(step.fecha).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address */}
              {pedido.direccion && (
                <div className="pt-6 border-t">
                  <h3 className="font-bold mb-2">Direccion de Envio</h3>
                  <p className="text-sm text-gray-600">{pedido.direccion}</p>
                </div>
              )}
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">Productos</h3>
              <div className="space-y-4">
                {pedido.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Package size={32} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{item.nombreProducto}</div>
                      <div className="text-sm text-gray-500">Cantidad: {item.cantidad}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold mb-2">Necesitas ayuda?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/storefront/contacto')}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Contactar Soporte
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
