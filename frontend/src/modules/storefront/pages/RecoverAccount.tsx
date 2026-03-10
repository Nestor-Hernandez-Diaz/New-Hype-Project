import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../hooks/useAuth';
import { getBasePath } from '../services/storefrontFetch';

export default function RecoverAccount() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
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
        // Si falla el login (401), hacer auto-registro
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
          setError('Error al recuperar cuenta con Google. Intenta de nuevo.');
        }
      }
    } catch (err) {
      console.error('[RecoverAccount] Google OAuth error:', err);
      setError('Error al procesar recuperación con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-4xl mb-2">RECUPERAR ACCESO</h1>
          <p className="text-gray-600 text-sm">
            Si olvidaste tu contraseña, puedes acceder a tu cuenta usando Google
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Google Login */}
        <div className="mb-8">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Error al recuperar cuenta con Google')}
            theme="outline"
            size="large"
            text="continue_with"
            width="384"
          />
          <p className="text-xs text-gray-500 text-center mt-3">
            Usaremos tu cuenta de Google para verificar tu identidad y darte acceso
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">o</span>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Si recuerdas tu contraseña,{' '}
            <Link 
              to={`${getBasePath()}/cuenta/login`}
              className="font-semibold text-black hover:underline"
            >
              inicia sesión aquí
            </Link>
          </p>
          
          <Link to={getBasePath()} className="block text-sm text-gray-600 hover:text-black">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
