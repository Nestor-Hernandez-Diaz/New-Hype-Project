import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Users, Package, LayoutDashboard, LogOut } from 'lucide-react';

/**
 * 🏢 PLATFORM LAYOUT
 * 
 * Layout principal para el módulo de plataforma (Superadmin).
 */
export default function PlatformLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('nh_platform_token');
    localStorage.removeItem('nh_platform_user');
    navigate('/platform/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <h1 className="font-bebas text-3xl tracking-wider">NEW HYPE</h1>
          <p className="text-xs text-white/70 mt-1">Platform Control</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Link
            to="/platform/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/platform/tenants"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            <Users size={20} />
            <span>Tenants</span>
          </Link>

          <Link
            to="/platform/plans"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            <Package size={20} />
            <span>Plans</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition w-full text-left"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
