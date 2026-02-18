import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implementar llamada real al backend /storefront/auth/login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock: Guardar token en localStorage
      localStorage.setItem('nh_cliente_token', 'mock-jwt-token');
      localStorage.setItem('nh_cliente_email', email);
      
      navigate('/storefront/cuenta/perfil');
    } catch {
      setError('Credenciales incorrectas. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-4xl mb-2">INICIAR SESIÓN</h1>
          <p className="text-gray-600 text-sm">
            Accede a tu cuenta de NEW HYPE
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-gray-600">Recordarme</span>
            </label>
            <Link to="/storefront/cuenta/recuperar" className="text-black hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 font-bebas text-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">o</span>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-4">
            ¿No tienes cuenta?
          </p>
          <Link
            to="/storefront/cuenta/registro"
            className="block w-full border-2 border-black text-black py-3 font-bebas text-lg hover:bg-black hover:text-white transition-colors"
          >
            CREAR CUENTA
          </Link>
        </div>

        {/* Back to Store */}
        <div className="mt-8 text-center">
          <Link to="/storefront" className="text-sm text-gray-600 hover:text-black">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
