import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 🔐 PLATFORM LOGIN (Superadmin)
 * 
 * Login exclusivo para el superadmin de la plataforma.
 * Endpoint: POST /api/v1/platform/auth/login
 */
export default function PlatformLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implementar llamada real al backend
      // const response = await fetch('http://localhost:8080/api/v1/platform/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Mock temporal
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (formData.emailOrUsername === 'superadmin@newhype.pe' && formData.password === 'SuperAdmin2026') {
        localStorage.setItem('nh_platform_token', 'mock-superadmin-token');
        localStorage.setItem('nh_platform_user', JSON.stringify({
          email: 'superadmin@newhype.pe',
          role: 'SUPERADMIN',
          scope: 'platform'
        }));
        navigate('/platform/dashboard');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/10 backdrop-blur-lg px-6 py-3 rounded-lg mb-4">
            <h1 className="font-bebas text-4xl text-white tracking-wider">NEW HYPE</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Platform Control</h2>
          <p className="text-white/70 text-sm">Superadmin Access Only</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email or Username
              </label>
              <input
                type="text"
                value={formData.emailOrUsername}
                onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:border-white/60 focus:bg-white/30"
                placeholder="superadmin@newhype.pe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:border-white/60 focus:bg-white/30"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-purple-900 py-3 rounded-lg font-semibold hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Access Platform'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-xs">
              🔒 Secure platform access • NewHype ERP v1.0
            </p>
          </div>
        </div>

        {/* Hint en desarrollo */}
        <div className="mt-6 text-center bg-yellow-500/10 backdrop-blur-lg border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-200 text-xs font-mono">
            <strong>Dev Credentials:</strong><br />
            superadmin@newhype.pe / SuperAdmin2026
          </p>
        </div>
      </div>
    </div>
  );
}
