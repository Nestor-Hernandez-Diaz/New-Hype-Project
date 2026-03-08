import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiObtenerPedido, apiCancelarPedido, type PedidoApiResponse } from '../services/storefrontApi';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { estaAutenticado, cargando: authCargando, logout: authLogout } = useAuth();
  const [pedido, setPedido] = useState<PedidoApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authCargando) return;
    if (!estaAutenticado) {
      navigate('/storefront/cuenta/login');
      return;
    }

    const cargarPedido = async () => {
      try {
        const numericId = Number(id);
        if (isNaN(numericId)) {
          setError('ID de pedido inválido');
          setLoading(false);
          return;
        }
        const data = await apiObtenerPedido(numericId);
        setPedido(data);
      } catch (err: any) {
        console.error('Error al cargar pedido:', err);
        setError(err.message || 'No se pudo cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    cargarPedido();
  }, [id, navigate, estaAutenticado, authCargando]);

  const handleCancelar = async () => {
    if (!pedido || cancelando) return;
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) return;

    setCancelando(true);
    try {
      const updated = await apiCancelarPedido(pedido.id);
      setPedido(updated);
    } catch (err: any) {
      alert(err.message || 'No se pudo cancelar el pedido');
    } finally {
      setCancelando(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      CONFIRMADO: 'bg-blue-100 text-blue-800',
      PREPARANDO: 'bg-purple-100 text-purple-800',
      ENVIADO: 'bg-indigo-100 text-indigo-800',
      ENTREGADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800',
    };
    return map[estado] || 'bg-gray-100 text-gray-800';
  };

  const getTimelineSteps = (estado: string) => {
    const steps = [
      { label: 'Pedido Confirmado', icon: <CheckCircle2 size={20} />, key: 'CONFIRMADO' },
      { label: 'En Preparación', icon: <Package size={20} />, key: 'PREPARANDO' },
      { label: 'Enviado', icon: <Truck size={20} />, key: 'ENVIADO' },
      { label: 'Entregado', icon: <CheckCircle2 size={20} />, key: 'ENTREGADO' },
    ];

    if (estado === 'CANCELADO') {
      return [{ label: 'Cancelado', icon: <XCircle size={20} />, completed: true }];
    }

    const stateOrder = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'];
    const currentIdx = stateOrder.indexOf(estado);

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIdx,
    }));
  };

  const puedeCancelar = pedido && (pedido.estado === 'PENDIENTE' || pedido.estado === 'CONFIRMADO');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">{error || 'Pedido no encontrado'}</p>
          <Link to="/storefront/cuenta/pedidos" className="text-blue-600 hover:underline">
            Volver a Mis Pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/storefront/cuenta/pedidos')}
            className="flex items-center text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver a Mis Pedidos
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bebas text-4xl mb-1">PEDIDO {pedido.codigo}</h1>
              <p className="text-sm text-gray-600">
                Realizado el{' '}
                {new Date(pedido.createdAt).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span className={`inline-block px-4 py-2 text-xs font-bold uppercase ${getEstadoBadge(pedido.estado)}`}>
              {pedido.estado}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-md space-y-2">
              <Link to="/storefront/cuenta/perfil" className="block py-3 px-4 hover:bg-gray-100">
                Mi Perfil
              </Link>
              <Link to="/storefront/cuenta/pedidos" className="block py-3 px-4 bg-black text-white font-medium">
                Mis Pedidos
              </Link>
              <Link to="/storefront/favoritos" className="block py-3 px-4 hover:bg-gray-100">
                Favoritos
              </Link>
              <button
                onClick={() => { authLogout(); navigate('/storefront'); }}
                className="w-full text-left py-3 px-4 hover:bg-gray-100 text-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Timeline */}
            <div className="bg-white p-6 shadow-md">
              <h2 className="font-bebas text-2xl mb-4">ESTADO DEL PEDIDO</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                {getTimelineSteps(pedido.estado).map((step, idx) => (
                  <div key={idx} className="relative flex items-center mb-6 last:mb-0">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full z-10 ${
                        step.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
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

            {/* Dirección de envío */}
            {pedido.direccionEnvio && (
              <div className="bg-white p-6 shadow-md">
                <h2 className="font-bebas text-2xl mb-3">DIRECCIÓN DE ENVÍO</h2>
                <p className="text-gray-700">{pedido.direccionEnvio}</p>
                {pedido.instrucciones && (
                  <p className="text-sm text-gray-500 mt-2">{pedido.instrucciones}</p>
                )}
              </div>
            )}

            {/* Productos */}
            <div className="bg-white p-6 shadow-md">
              <h2 className="font-bebas text-2xl mb-4">PRODUCTOS</h2>
              <div className="space-y-4">
                {pedido.detalles.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.nombreProducto}</h4>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.cantidad} x S/ {item.precioUnitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">S/ {item.subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>S/ {pedido.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IGV (18%)</span>
                    <span>S/ {pedido.igv.toFixed(2)}</span>
                  </div>
                  {pedido.descuento != null && pedido.descuento > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento</span>
                      <span>-S/ {pedido.descuento.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>S/ {pedido.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {puedeCancelar && (
              <div className="bg-white p-6 shadow-md">
                <button
                  onClick={handleCancelar}
                  disabled={cancelando}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:bg-gray-400"
                >
                  {cancelando ? 'Cancelando...' : 'Cancelar Pedido'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Solo puedes cancelar pedidos en estado PENDIENTE o CONFIRMADO
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
