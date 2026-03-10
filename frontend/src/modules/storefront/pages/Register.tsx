import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import RegisterForm from '../components/auth/RegisterForm';
import type { RegisterData } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { getBasePath, getTenantId } from '../services/storefrontFetch';

export default function Register() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    
    setError('');
    setLoading(true);

    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const { email, given_name, family_name, sub } = decoded;
      const googlePassword = `GOOGLE_${sub}`;
      
      // Intentar login primero
      const loginSuccess = await login(email, googlePassword);
      
      if (loginSuccess) {
        navigate(`${getBasePath()}/cuenta/perfil`);
      } else {
        // Si falla el login, hacer auto-registro
        const registerSuccess = await register({
          email,
          password: googlePassword,
          nombre: given_name || 'Usuario',
          apellido: family_name || 'Google',
          telefono: '',
        });
        
        if (registerSuccess) {
          navigate(`${getBasePath()}/cuenta/perfil`);
        } else {
          setError('Error al registrarse con Google. Intenta de nuevo.');
        }
      }
    } catch (err) {
      console.error('[Register] Google OAuth error:', err);
      setError('Error al procesar registro con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: RegisterData) => {
    setError('');
    setLoading(true);

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
      });

      if (success) {
        navigate(`${getBasePath()}/cuenta/perfil`);
      } else {
        setError('Error al crear la cuenta. Por favor intenta de nuevo.');
      }
    } catch {
      setError('Error al crear la cuenta. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-4xl mb-2">CREAR CUENTA</h1>
          <p className="text-gray-600 text-sm">
            Únete a NEW HYPE y disfruta de beneficios exclusivos
          </p>
        </div>

        {/* Form */}
        <RegisterForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onLogin={() => navigate(`${getBasePath()}/cuenta/login`)}
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

        {/* Google Register */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Error al registrarse con Google')}
            theme="outline"
            size="large"
            text="signup_with"
            width="640"
          />
        </div>

        {/* Back to Store */}
        <div className="mt-6 text-center">
          <Link to={getBasePath()} className="text-sm text-gray-600 hover:text-black">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
