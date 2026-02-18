import { useState } from 'react';
import { Plus, Package, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';

/**
 * 📦 PLANS MANAGEMENT
 * 
 * Gestión de planes de suscripción de la plataforma.
 * Solo accesible por superadmin.
 */

interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  maxUsuarios: number;
  maxProductos: number;
  incluyeReportes: boolean;
  estado: number;
  createdAt: string;
}

export default function PlansManagement() {
  // TODO: Obtener datos reales del backend GET /api/v1/platform/plans
  const [plans] = useState<Plan[]>([
    {
      id: 1,
      nombre: 'Plan Básico',
      descripcion: 'Ideal para pequeños negocios que están comenzando',
      precioMensual: 99.00,
      maxUsuarios: 3,
      maxProductos: 500,
      incluyeReportes: false,
      estado: 1,
      createdAt: '2025-01-01T10:00:00Z'
    },
    {
      id: 2,
      nombre: 'Plan Emprendedor',
      descripcion: 'Para negocios en crecimiento que necesitan más funcionalidades',
      precioMensual: 199.00,
      maxUsuarios: 10,
      maxProductos: 2000,
      incluyeReportes: true,
      estado: 1,
      createdAt: '2025-01-01T10:00:00Z'
    },
    {
      id: 3,
      nombre: 'Plan Profesional',
      descripcion: 'Solución completa para empresas establecidas',
      precioMensual: 399.00,
      maxUsuarios: -1, // Ilimitado
      maxProductos: -1, // Ilimitado
      incluyeReportes: true,
      estado: 1,
      createdAt: '2025-01-01T10:00:00Z'
    }
  ]);

  const handleCreatePlan = () => {
    // TODO: Abrir modal de creación
    alert('Modal de creación de plan (TODO)');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plans Management</h1>
          <p className="text-gray-600 mt-2">Manage subscription plans</p>
        </div>
        <button
          onClick={handleCreatePlan}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className={`bg-white p-6 rounded-xl shadow-sm border-2 hover:shadow-lg transition ${
              plan.id === 2 ? 'border-indigo-500' : 'border-gray-200'
            }`}
          >
            {/* Badge Popular */}
            {plan.id === 2 && (
              <div className="mb-4">
                <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${plan.id === 2 ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Package className={plan.id === 2 ? 'text-indigo-600' : 'text-gray-600'} size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.nombre}</h3>
                </div>
              </div>
              {plan.estado === 1 ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-gray-600">S/</span>
                <span className="text-4xl font-bold text-gray-900">{plan.precioMensual.toFixed(0)}</span>
                <span className="text-sm text-gray-600">/mes</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6">{plan.descripcion}</p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  <strong>{plan.maxUsuarios === -1 ? 'Unlimited' : plan.maxUsuarios}</strong> users
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  <strong>{plan.maxProductos === -1 ? 'Unlimited' : plan.maxProductos}</strong> products
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {plan.incluyeReportes ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-gray-700">Advanced reports included</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-gray-400" />
                    <span className="text-gray-500">Basic reports only</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} className="text-gray-400" />
                <span>Since {new Date(plan.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                Edit
              </button>
              <button 
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  plan.id === 2 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
