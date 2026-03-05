import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (email: string, password: string) => {
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/storefront/cuenta/perfil');
      } else {
        setError('Credenciales incorrectas. Por favor intenta de nuevo.');
      }
    } catch {
      setError('Credenciales incorrectas. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-4xl mb-2">INICIAR SESIÓN</h1>
          <p className="text-gray-600 text-sm">
            Accede a tu cuenta de NEW HYPE
          </p>
        </div>

        {/* Form */}
        <LoginForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onForgotPassword={() => navigate('/storefront/cuenta/recuperar')}
          onRegister={() => navigate('/storefront/cuenta/registro')}
        />

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">o</span>
          </div>
        </div>

        {/* Back to Store */}
        <div className="text-center">
          <Link to="/storefront" className="text-sm text-gray-600 hover:text-black">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
