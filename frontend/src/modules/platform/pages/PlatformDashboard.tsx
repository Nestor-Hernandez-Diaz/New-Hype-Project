import { Users, Building2, CreditCard, TrendingUp } from 'lucide-react';

/**
 * 📊 PLATFORM DASHBOARD
 * 
 * Dashboard principal del superadmin con métricas globales de la plataforma.
 */
export default function PlatformDashboard() {
  // TODO: Obtener datos reales del backend
  const stats = {
    totalTenants: 3,
    activeTenants: 2,
    totalRevenue: 4500.00,
    activeSubscriptions: 2
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-600 mt-2">Global overview of NewHype ERP Platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tenants</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTenants}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Tenants</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeTenants}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
              <p className="text-3xl font-bold text-purple-600">{stats.activeSubscriptions}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <CreditCard className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-orange-600">S/ {stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded-full">
              <Building2 className="text-green-600" size={16} />
            </div>
            <div className="flex-1">
              <p className="font-medium">New tenant created</p>
              <p className="text-sm text-gray-600">Fashion Store Lima • 2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full">
              <CreditCard className="text-blue-600" size={16} />
            </div>
            <div className="flex-1">
              <p className="font-medium">Subscription renewed</p>
              <p className="text-sm text-gray-600">Boutique Express • 5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
