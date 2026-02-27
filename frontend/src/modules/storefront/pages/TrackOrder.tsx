/**
 * 📦 PÁGINA DE SEGUIMIENTO DE PEDIDO (Público)
 * 
 * Permite rastrear un pedido sin necesidad de iniciar sesión
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface PedidoRastreo {
  codigoPedido: string;
  estado: string;
  fechaEmision: string;
  items: Array<{
    nombreProducto: string;
    cantidad: number;
    imagen: string;
  }>;
  direccion: string;
  numeroSeguimiento?: string;
  timeline: Array<{
    estado: string;
    fecha: string;
    descripcion: string;
    completado: boolean;
  }>;
}

export default function TrackOrder() {
  const navigate = useNavigate();
  const [codigoPedido, setCodigoPedido] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [pedido, setPedido] = useState<PedidoRastreo | null>(null);
  const [error, setError] = useState('');

  const buscarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigoPedido.trim()) {
      setError('Por favor ingresa un código de pedido');
      return;
    }

    setBuscando(true);
    setError('');
    setPedido(null);

    // Simular búsqueda
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Buscar en localStorage
    const pedidos = JSON.parse(localStorage.getItem('nh_pedidos') || '[]');
    const pedidoEncontrado = pedidos.find((p: any) => 
      p.codigoPedido.toLowerCase() === codigoPedido.trim().toLowerCase()
    );

    if (pedidoEncontrado) {
      // Construir timeline según estado
      const timeline = [
        {
          estado: 'Pedido Confirmado',
          fecha: pedidoEncontrado.fechaEmision,
          descripcion: 'Tu pedido ha sido confirmado y está siendo preparado',
          completado: true
        },
        {
          estado: 'En Preparación',
          fecha: pedidoEncontrado.fechaEmision,
          descripcion: 'Estamos preparando tus productos',
          completado: pedidoEncontrado.estado !== 'Pendiente'
        },
        {
          estado: 'Enviado',
          fecha: '',
          descripcion: 'Tu pedido está en camino',
          completado: ['Enviado', 'Entregado'].includes(pedidoEncontrado.estado)
        },
        {
          estado: 'Entregado',
          fecha: '',
          descripcion: 'Tu pedido ha sido entregado',
          completado: pedidoEncontrado.estado === 'Entregado'
        }
      ];

      setPedido({
        codigoPedido: pedidoEncontrado.codigoPedido,
        estado: pedidoEncontrado.estado,
        fechaEmision: pedidoEncontrado.fechaEmision,
        items: pedidoEncontrado.items,
        direccion: pedidoEncontrado.direccion,
        numeroSeguimiento: pedidoEncontrado.numeroSeguimiento,
        timeline
      });
    } else {
      setError('No se encontró ningún pedido con ese código. Verifica que el código sea correcto.');
    }

    setBuscando(false);
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return <Clock size={24} className="text-yellow-600" />;
      case 'Enviado':
        return <Truck size={24} className="text-blue-600" />;
      case 'Entregado':
        return <CheckCircle2 size={24} className="text-green-600" />;
      case 'Cancelado':
        return <XCircle size={24} className="text-red-600" />;
      default:
        return <Package size={24} className="text-gray-600" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Enviado':
        return 'bg-blue-100 text-blue-800';
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-5xl font-bebas tracking-wider mb-4">SEGUIR MI PEDIDO</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ingresa tu código de pedido para rastrear el estado de tu compra
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
          <form onSubmit={buscarPedido} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={codigoPedido}
                  onChange={(e) => setCodigoPedido(e.target.value)}
                  placeholder="Ej: NH-20260218-001"
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
            <p>El código de pedido se encuentra en el correo de confirmación</p>
          </div>
        </div>

        {/* Resultados */}
        {pedido && (
          <div className="space-y-6">
            {/* Información general */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Pedido #{pedido.codigoPedido}</h2>
                  <p className="text-sm text-gray-500">
                    Realizado el {new Date(pedido.fechaEmision).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
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
                  {pedido.numeroSeguimiento && (
                    <p className="text-xs text-gray-500">
                      N° Seguimiento: {pedido.numeroSeguimiento}
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">Estado del Envío</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {pedido.timeline.map((step, idx) => (
                    <div key={idx} className="relative flex items-start mb-6 last:mb-0">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full z-10 flex-shrink-0 ${
                        step.completado ? 'bg-green-600' : 'bg-gray-200'
                      }`}>
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
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dirección de envío */}
              <div className="pt-6 border-t">
                <h3 className="font-bold mb-2">Dirección de Envío</h3>
                <p className="text-sm text-gray-600">{pedido.direccion}</p>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">Productos</h3>
              <div className="space-y-4">
                {pedido.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <img
                      src={item.imagen}
                      alt={item.nombreProducto}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.nombreProducto}</div>
                      <div className="text-sm text-gray-500">Cantidad: {item.cantidad}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ayuda */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold mb-2">¿Necesitas ayuda?</h3>
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
                <a
                  href="https://wa.me/51999888777"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
