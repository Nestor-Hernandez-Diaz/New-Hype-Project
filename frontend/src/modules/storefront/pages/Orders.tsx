import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EstadoPedido } from '@monorepo/shared-types';

interface Pedido {
  id: number;
  codigo: string;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  cantidadItems: number;
  imagenPrimerProducto?: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'TODOS'>('TODOS');

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('nh_cliente_token');
    if (!token) {
      navigate('/storefront/cuenta/login');
      return;
    }

    const cargarPedidos = async () => {
      try {
        // TODO: Implementar llamada real al backend GET /storefront/pedidos
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Mock data
        const mockPedidos: Pedido[] = [
          {
            id: 1,
            codigo: 'PED-2026-00123',
            fecha: '2026-02-15T10:30:00',
            estado: EstadoPedido.ENVIADO,
            total: 239.70,
            cantidadItems: 3,
            imagenPrimerProducto: '/images/producto-1.jpg'
          },
          {
            id: 2,
            codigo: 'PED-2026-00089',
            fecha: '2026-02-10T14:20:00',
            estado: EstadoPedido.ENTREGADO,
            total: 159.80,
            cantidadItems: 2,
            imagenPrimerProducto: '/images/producto-2.jpg'
          },
          {
            id: 3,
            codigo: 'PED-2026-00045',
            fecha: '2026-01-28T09:15:00',
            estado: EstadoPedido.CANCELADO,
            total: 79.90,
            cantidadItems: 1,
            imagenPrimerProducto: '/images/producto-3.jpg'
          }
        ];

        setPedidos(mockPedidos);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('nh_cliente_token');
    localStorage.removeItem('nh_cliente_email');
    localStorage.removeItem('nh_cliente_nombre');
    navigate('/storefront');
  };

  const getEstadoBadgeClass = (estado: EstadoPedido) => {
    switch (estado) {
      case EstadoPedido.PENDIENTE:
        return 'bg-yellow-100 text-yellow-800';
      case EstadoPedido.CONFIRMADO:
        return 'bg-blue-100 text-blue-800';
      case EstadoPedido.PROCESANDO:
        return 'bg-purple-100 text-purple-800';
      case EstadoPedido.ENVIADO:
        return 'bg-indigo-100 text-indigo-800';
      case EstadoPedido.ENTREGADO:
        return 'bg-green-100 text-green-800';
      case EstadoPedido.CANCELADO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pedidosFiltrados = filtroEstado === 'TODOS'
    ? pedidos
    : pedidos.filter(p => p.estado === filtroEstado);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bebas text-4xl mb-2">MIS PEDIDOS</h1>
          <p className="text-gray-600">Consulta el estado de tus compras</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-md space-y-2">
              <Link
                to="/storefront/cuenta/perfil"
                className="block py-3 px-4 hover:bg-gray-100"
              >
                Mi Perfil
              </Link>
              <Link
                to="/storefront/cuenta/pedidos"
                className="block py-3 px-4 bg-black text-white font-medium"
              >
                Mis Pedidos
              </Link>
              <Link
                to="/storefront/cuenta/favoritos"
                className="block py-3 px-4 hover:bg-gray-100"
              >
                Favoritos
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left py-3 px-4 hover:bg-gray-100 text-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filtros */}
            <div className="bg-white p-4 shadow-md mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFiltroEstado('TODOS')}
                  className={`px-4 py-2 text-sm ${
                    filtroEstado === 'TODOS' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroEstado(EstadoPedido.PENDIENTE)}
                  className={`px-4 py-2 text-sm ${
                    filtroEstado === EstadoPedido.PENDIENTE ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setFiltroEstado(EstadoPedido.ENVIADO)}
                  className={`px-4 py-2 text-sm ${
                    filtroEstado === EstadoPedido.ENVIADO ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Enviados
                </button>
                <button
                  onClick={() => setFiltroEstado(EstadoPedido.ENTREGADO)}
                  className={`px-4 py-2 text-sm ${
                    filtroEstado === EstadoPedido.ENTREGADO ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Entregados
                </button>
              </div>
            </div>

            {/* Lista de Pedidos */}
            {pedidosFiltrados.length === 0 ? (
              <div className="bg-white p-12 shadow-md text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <h3 className="font-bebas text-2xl mb-2">NO TIENES PEDIDOS</h3>
                <p className="text-gray-600 mb-6">
                  {filtroEstado === 'TODOS' 
                    ? 'Aún no has realizado ninguna compra'
                    : `No tienes pedidos con estado "${filtroEstado}"`
                  }
                </p>
                <Link
                  to="/storefront/catalogo"
                  className="inline-block bg-black text-white px-8 py-3 font-bebas text-lg hover:bg-gray-800"
                >
                  EXPLORAR PRODUCTOS
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidosFiltrados.map((pedido) => (
                  <div key={pedido.id} className="bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bebas text-xl mb-1">{pedido.codigo}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(pedido.fecha).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-4 py-2 text-xs font-bold uppercase ${getEstadoBadgeClass(
                          pedido.estado
                        )}`}
                      >
                        {pedido.estado}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">
                          {pedido.cantidadItems} {pedido.cantidadItems === 1 ? 'producto' : 'productos'}
                        </p>
                        <p className="text-xl font-bebas">S/ {pedido.total.toFixed(2)}</p>
                      </div>
                      <Link
                        to={`/storefront/cuenta/pedidos/${pedido.id}`}
                        className="bg-black text-white px-6 py-2 text-sm font-bebas hover:bg-gray-800"
                      >
                        VER DETALLES
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
