import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    documento: '',
    tipoDocumento: 'DNI' as 'DNI' | 'RUC' | 'CE',
    password: '',
    confirmarPassword: '',
    aceptaTerminos: false,
    aceptaNewsletter: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!formData.aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

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
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-4xl mb-2">CREAR CUENTA</h1>
          <p className="text-gray-600 text-sm">
            Únete a NEW HYPE y disfruta de beneficios exclusivos
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
          {/* Datos Personales */}
          <div className="space-y-4">
            <h2 className="font-bebas text-xl border-b pb-2">DATOS PERSONALES</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium mb-2">
                  Nombre *
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label htmlFor="apellidos" className="block text-sm font-medium mb-2">
                  Apellidos *
                </label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Tus apellidos"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tipoDocumento" className="block text-sm font-medium mb-2">
                  Tipo Doc. *
                </label>
                <select
                  id="tipoDocumento"
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">C.E.</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="documento" className="block text-sm font-medium mb-2">
                  Número de Documento *
                </label>
                <input
                  id="documento"
                  name="documento"
                  type="text"
                  value={formData.documento}
                  onChange={handleChange}
                  required
                  maxLength={formData.tipoDocumento === 'DNI' ? 8 : formData.tipoDocumento === 'RUC' ? 11 : 20}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder={formData.tipoDocumento === 'DNI' ? '12345678' : formData.tipoDocumento === 'RUC' ? '20123456789' : 'Número'}
                />
              </div>
            </div>
          </div>

          {/* Datos de Contacto */}
          <div className="space-y-4">
            <h2 className="font-bebas text-xl border-b pb-2">DATOS DE CONTACTO</h2>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium mb-2">
                Teléfono *
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                required
                maxLength={9}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="999888777"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-4">
            <h2 className="font-bebas text-xl border-b pb-2">SEGURIDAD</h2>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmarPassword" className="block text-sm font-medium mb-2">
                Confirmar Contraseña *
              </label>
              <input
                id="confirmarPassword"
                name="confirmarPassword"
                type="password"
                value={formData.confirmarPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Repite tu contraseña"
              />
            </div>
          </div>

          {/* Términos */}
          <div className="space-y-3 pt-4 border-t">
            <label className="flex items-start">
              <input
                type="checkbox"
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleChange}
                className="mt-1 mr-3"
                required
              />
              <span className="text-sm text-gray-700">
                Acepto los{' '}
                <Link to="/storefront/terminos" className="text-black underline">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/storefront/privacidad" className="text-black underline">
                  política de privacidad
                </Link>
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                name="aceptaNewsletter"
                checked={formData.aceptaNewsletter}
                onChange={handleChange}
                className="mt-1 mr-3"
              />
              <span className="text-sm text-gray-700">
                Quiero recibir ofertas y novedades por email
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 font-bebas text-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/storefront/cuenta/login" className="text-black hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>

        {/* Back to Store */}
        <div className="mt-4 text-center">
          <Link to="/storefront" className="text-sm text-gray-600 hover:text-black">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
