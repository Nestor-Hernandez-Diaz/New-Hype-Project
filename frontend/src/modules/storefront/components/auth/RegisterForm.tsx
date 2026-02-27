/**
 * 📝 FORMULARIO DE REGISTRO
 * 
 * Formulario reutilizable para registro de nuevos clientes.
 * 
 * @example
 * <RegisterForm
 *   onSubmit={handleRegister}
 *   loading={false}
 *   error="El email ya está registrado"
 * />
 */

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  /**
   * Callback cuando se envía el formulario
   */
  onSubmit: (data: RegisterData) => void | Promise<void>;
  
  /**
   * Si está cargando/procesando
   */
  loading?: boolean;
  
  /**
   * Mensaje de error a mostrar
   */
  error?: string;
  
  /**
   * Callback cuando se hace clic en "Iniciar sesión"
   */
  onLogin?: () => void;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  aceptaTerminos: boolean;
}

export default function RegisterForm({ 
  onSubmit, 
  loading = false, 
  error,
  onLogin
}: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    aceptaTerminos: false
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    // Validaciones
    if (formData.password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (formData.password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }
    
    if (!formData.aceptaTerminos) {
      setValidationError('Debes aceptar los términos y condiciones');
      return;
    }
    
    await onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Messages */}
      {(error || validationError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error || validationError}
        </div>
      )}
      
      {/* Nombres */}
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
            disabled={loading}
            className="
              w-full px-4 py-3 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
            placeholder="Tu nombre"
          />
        </div>
        
        <div>
          <label htmlFor="apellido" className="block text-sm font-medium mb-2">
            Apellido *
          </label>
          <input
            id="apellido"
            name="apellido"
            type="text"
            value={formData.apellido}
            onChange={handleChange}
            required
            disabled={loading}
            className="
              w-full px-4 py-3 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
            placeholder="Tu apellido"
          />
        </div>
      </div>
      
      {/* Email */}
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
          disabled={loading}
          className="
            w-full px-4 py-3 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
          placeholder="tu@email.com"
        />
      </div>
      
      {/* Teléfono */}
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
          disabled={loading}
          className="
            w-full px-4 py-3 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
          placeholder="999 999 999"
        />
      </div>
      
      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Contraseña *
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="
              w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
            placeholder="Mínimo 6 caracteres"
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          Confirmar contraseña *
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            className="
              w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
            placeholder="Repite tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      {/* Términos y Condiciones */}
      <div className="flex items-start gap-3">
        <input
          id="aceptaTerminos"
          name="aceptaTerminos"
          type="checkbox"
          checked={formData.aceptaTerminos}
          onChange={handleChange}
          required
          disabled={loading}
          className="mt-1 w-4 h-4 accent-black"
        />
        <label htmlFor="aceptaTerminos" className="text-sm text-gray-600">
          Acepto los{' '}
          <a href="#" className="text-black underline hover:no-underline">
            términos y condiciones
          </a>{' '}
          y la{' '}
          <a href="#" className="text-black underline hover:no-underline">
            política de privacidad
          </a>
        </label>
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full bg-black text-white py-3 rounded-lg font-semibold
          hover:bg-gray-800 transition-colors
          disabled:bg-gray-400 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Registrando...
          </>
        ) : (
          'Crear cuenta'
        )}
      </button>
      
      {/* Login Link */}
      {onLogin && (
        <div className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="font-semibold text-black hover:underline"
          >
            Inicia sesión aquí
          </button>
        </div>
      )}
    </form>
  );
}
