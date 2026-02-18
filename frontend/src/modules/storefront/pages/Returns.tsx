/**
 * 🔄 PÁGINA DE DEVOLUCIONES
 * 
 * Solicitud de devolución para un pedido
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Item {
  productoId: number;
  nombreProducto: string;
  imagen: string;
  cantidad: number;
  precioUnitario: number;
}

interface Pedido {
  id: string;
  codigoPedido: string;
  fechaEmision: string;
  items: Item[];
  total: number;
  estado: string;
}

const MOTIVOS_DEVOLUCION = [
  'Producto defectuoso o dañado',
  'No es lo que esperaba',
  'Talla incorrecta',
  'Color diferente al mostrado',
  'Producto equivocado',
  'Ya no lo necesito',
  'Otro'
];

export default function Returns() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const navigate = useNavigate();
  
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  
  const [formData, setFormData] = useState({
    motivo: '',
    detalleMotivo: '',
    itemsSeleccionados: [] as number[]
  });

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        setLoading(true);
        
        // Verificar sesión
        const token = localStorage.getItem('nh_cliente_token');
        if (!token) {
          navigate('/storefront/cuenta/login');
          return;
        }

        // Simular carga
        await new Promise(resolve => setTimeout(resolve, 800));

        // Buscar pedido en localStorage
        const pedidos = JSON.parse(localStorage.getItem('nh_pedidos') || '[]');
        const pedidoEncontrado = pedidos.find((p: Pedido) => p.id === pedidoId);

        if (!pedidoEncontrado) {
          navigate('/storefront/cuenta/pedidos');
          return;
        }

        setPedido(pedidoEncontrado);
        
        // Seleccionar todos los items por defecto
        setFormData(prev => ({
          ...prev,
          itemsSeleccionados: pedidoEncontrado.items.map((_: any, idx: number) => idx)
        }));
      } catch (error) {
        console.error('Error al cargar pedido:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarPedido();
  }, [pedidoId, navigate]);

  const toggleItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itemsSeleccionados: prev.itemsSeleccionados.includes(index)
        ? prev.itemsSeleccionados.filter(i => i !== index)
        : [...prev.itemsSeleccionados, index]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (formData.itemsSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un producto');
      return;
    }

    if (!formData.motivo) {
      alert('Por favor selecciona un motivo de devolución');
      return;
    }

    if (!formData.detalleMotivo.trim()) {
      alert('Por favor describe en detalle el motivo de la devolución');
      return;
    }

    setEnviando(true);

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Crear solicitud de devolución
    const solicitud = {
      id: 'dev_' + Date.now(),
      pedidoId: pedido?.id,
      codigoPedido: pedido?.codigoPedido,
      fechaSolicitud: new Date().toISOString(),
      motivo: formData.motivo,
      detalleMotivo: formData.detalleMotivo,
      items: formData.itemsSeleccionados.map(idx => pedido?.items[idx]),
      estado: 'SOLICITADO'
    };

    // Guardar en localStorage
    const devoluciones = JSON.parse(localStorage.getItem('nh_devoluciones') || '[]');
    devoluciones.push(solicitud);
    localStorage.setItem('nh_devoluciones', JSON.stringify(devoluciones));

    setEnviando(false);
    setEnviado(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle2 size={48} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bebas tracking-wider mb-4">SOLICITUD ENVIADA</h1>
            <p className="text-gray-600 mb-2">
              Tu solicitud de devolución ha sido registrada con éxito
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Pedido #{pedido?.codigoPedido}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold mb-2">¿Qué sigue?</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Revisaremos tu solicitud en las próximas 24-48 horas</li>
                <li>• Te contactaremos por email con las instrucciones para el envío</li>
                <li>• Una vez recibido y validado el producto, procesaremos tu reembolso</li>
                <li>• El reembolso se acreditará en 5-7 días hábiles</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/storefront/cuenta/pedidos"
                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition"
              >
                Ver Mis Pedidos
              </Link>
              <Link
                to="/storefront"
                className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Pedido no encontrado</p>
          <Link to="/storefront/cuenta/pedidos" className="text-blue-600 hover:underline">
            Volver a Mis Pedidos
          </Link>
        </div>
      </div>
    );
  }

  // Verificar que el pedido sea elegible para devolución
  const diasDesdeCompra = Math.floor((new Date().getTime() - new Date(pedido.fechaEmision).getTime()) / (1000 * 60 * 60 * 24));
  const elegibleDevolucion = diasDesdeCompra <= 30 && pedido.estado !== 'Cancelado';

  if (!elegibleDevolucion) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle size={48} className="text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Pedido no elegible para devolución</h1>
            <p className="text-gray-600 mb-2">
              Este pedido no puede ser devuelto porque:
            </p>
            <ul className="text-sm text-gray-600 mb-8 space-y-1">
              {diasDesdeCompra > 30 && <li>• Han pasado más de 30 días desde la compra</li>}
              {pedido.estado === 'Cancelado' && <li>• El pedido ya fue cancelado</li>}
            </ul>
            <p className="text-sm text-gray-500 mb-8">
              Si tienes alguna consulta, puedes contactarnos
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/storefront/contacto"
                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition"
              >
                Contactar Soporte
              </Link>
              <Link
                to="/storefront/cuenta/pedidos"
                className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Mis Pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <RefreshCw size={32} className="mr-3 text-gray-900" />
            <h1 className="text-4xl font-bebas tracking-wider">SOLICITAR DEVOLUCIÓN</h1>
          </div>
          <p className="text-gray-600">
            Pedido #{pedido.codigoPedido} • Realizado el {new Date(pedido.fechaEmision).toLocaleDateString('es-PE')}
          </p>
        </div>

        {/* Información importante */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <h3 className="font-bold text-lg mb-3 text-blue-900">Política de Devoluciones:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Tienes 30 días desde la fecha de compra para solicitar una devolución</li>
            <li>• Los productos deben estar sin usar, con etiquetas originales</li>
            <li>• El empaque original debe estar en perfecto estado</li>
            <li>• El reembolso se procesará una vez validado el producto</li>
            <li>• Los costos de envío de devolución corren por cuenta del cliente</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de productos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Productos a Devolver</h2>
            <div className="space-y-3">
              {pedido.items.map((item, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.itemsSeleccionados.includes(idx)
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.itemsSeleccionados.includes(idx)}
                    onChange={() => toggleItem(idx)}
                    className="w-5 h-5"
                  />
                  <img
                    src={item.imagen}
                    alt={item.nombreProducto}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.nombreProducto}</div>
                    <div className="text-sm text-gray-500">Cantidad: {item.cantidad}</div>
                    <div className="text-sm font-bold">S/. {(item.precioUnitario * item.cantidad).toFixed(2)}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Motivo de devolución */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Motivo de la Devolución</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona el motivo *
              </label>
              <select
                value={formData.motivo}
                onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              >
                <option value="">Selecciona un motivo</option>
                {MOTIVOS_DEVOLUCION.map((motivo, idx) => (
                  <option key={idx} value={motivo}>{motivo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe en detalle el motivo *
              </label>
              <textarea
                value={formData.detalleMotivo}
                onChange={(e) => setFormData(prev => ({ ...prev, detalleMotivo: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="Por favor, describe con detalle el motivo de tu devolución. Esto nos ayudará a procesar tu solicitud más rápido."
                required
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/storefront/cuenta/pedidos')}
              className="flex-1 px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || formData.itemsSeleccionados.length === 0}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando solicitud...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
