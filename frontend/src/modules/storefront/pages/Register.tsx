import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    documento: string;
    tipoDocumento: 'DNI' | 'RUC' | 'CE';
    password: string;
    confirmarPassword: string;
    aceptaTerminos: boolean;
    aceptaNewsletter: boolean;
  }) => {
    setError('');
    setLoading(true);

    try {
      // TODO: Implementar llamada real al backend POST /storefront/auth/register
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock: Guardar datos del usuario registrado
      localStorage.setItem('nh_cliente_token', 'mock-jwt-token');
      localStorage.setItem('nh_cliente_email', formData.email);
      localStorage.setItem('nh_cliente_nombre', `${formData.nombre} ${formData.apellidos}`);
      
      navigate('/storefront/cuenta/perfil');
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
          onLogin={() => navigate('/storefront/cuenta/login')}
        />

        {/* Back to Store */}
        <div className="mt-6 text-center">
          <Link to="/storefront" className="text-sm text-gray-600 hover:text-black">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
