import { useState } from 'react';
import { Plus, Search, Building2, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';

/**
 * 🏢 TENANTS MANAGEMENT
 * 
 * Gestión de tenants (empresas) de la plataforma.
 * Solo accesible por superadmin.
 */

interface Tenant {
  id: number;
  nombre: string;
  subdominio: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: number;
  planNombre: string;
  createdAt: string;
}

export default function TenantsManagement() {
  // TODO: Obtener datos reales del backend GET /api/v1/platform/tenants
  const [tenants] = useState<Tenant[]>([
    {
      id: 1,
      nombre: 'Fashion Store Lima',
      subdominio: 'fashionlima',
      email: 'admin@fashionstore.pe',
      telefono: '987654321',
      direccion: 'Av. Javier Prado 1234, San Isidro, Lima',
      estado: 1,
      planNombre: 'Plan Emprendedor',
      createdAt: '2025-02-10T10:00:00Z'
    },
    {
      id: 2,
      nombre: 'Boutique Express',
      subdominio: 'boutiqueexpress',
      email: 'contact@boutiqueexpress.pe',
      telefono: '998877665',
      direccion: 'Jr. La Mar 567, Miraflores, Lima',
      estado: 1,
      planNombre: 'Plan Profesional',
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 3,
      nombre: 'Style Shop',
      subdominio: 'styleshop',
      email: 'info@styleshop.pe',
      telefono: '955443322',
      direccion: 'Av. Larco 890, Miraflores, Lima',
      estado: 0,
      planNombre: 'Plan Básico',
      createdAt: '2024-12-01T10:00:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTenants = tenants.filter(t =>
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subdominio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTenant = () => {
    // TODO: Abrir modal de creación
    alert('Modal de creación de tenant (TODO)');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants Management</h1>
          <p className="text-gray-600 mt-2">Manage all registered businesses</p>
        </div>
        <button
          onClick={handleCreateTenant}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          Create Tenant
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, subdomain, or email..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTenants.map(tenant => (
          <div key={tenant.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Building2 className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tenant.nombre}</h3>
                  <p className="text-sm text-gray-500">@{tenant.subdominio}</p>
                </div>
              </div>
              {tenant.estado === 1 ? (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle size={14} />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  <XCircle size={14} />
                  Inactive
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span>{tenant.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span>{tenant.telefono}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span className="line-clamp-1">{tenant.direccion}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span>Created: {new Date(tenant.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Plan Badge */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="inline-block bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1 rounded-full">
                {tenant.planNombre}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                View Details
              </button>
              <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No tenants found</p>
        </div>
      )}
    </div>
  );
}
