/**
 * 🔐 FORMULARIO DE INICIO DE SESIÓN
 * 
 * Formulario reutilizable para login de clientes.
 * 
 * @example
 * <LoginForm
 *   onSubmit={handleLogin}
 *   loading={false}
 *   error="Credenciales incorrectas"
 * />
 */

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  /**
   * Callback cuando se envía el formulario
   */
  onSubmit: (email: string, password: string) => void | Promise<void>;
  
  /**
   * Si está cargando/procesando
   */
  loading?: boolean;
  
  /**
   * Mensaje de error a mostrar
   */
  error?: string;
  
  /**
   * Callback cuando se hace clic en "¿Olvidaste tu contraseña?"
   */
  onForgotPassword?: () => void;
  
  /**
   * Callback cuando se hace clic en "Registrarse"
   */
  onRegister?: () => void;
}

export default function LoginForm({ 
  onSubmit, 
  loading = false, 
  error,
  onForgotPassword,
  onRegister
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* Email */}
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
          disabled={loading}
          className="
            w-full px-4 py-3 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
          placeholder="tu@email.com"
        />
      </div>
      
      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="
              w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
            placeholder="••••••••"
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
      
      {/* Forgot Password Link */}
      {onForgotPassword && (
        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-gray-600 hover:text-black underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}
      
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
            Iniciando sesión...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </button>
      
      {/* Register Link */}
      {onRegister && (
        <div className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={onRegister}
            className="font-semibold text-black hover:underline"
          >
            Regístrate aquí
          </button>
        </div>
      )}
    </form>
  );
}
