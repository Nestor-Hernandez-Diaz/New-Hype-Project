/**
 * 🔒 MODAL PARA CAMBIAR CONTRASEÑA
 * 
 * Modal con formulario de validación de contraseña.
 */

import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

interface CambiarPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (passwordActual: string, passwordNueva: string) => Promise<void>;
}

export default function CambiarPasswordModal({ isOpen, onClose, onGuardar }: CambiarPasswordModalProps) {
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: ''
  });
  const [mostrar, setMostrar] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validaciones
    if (formData.passwordNueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (formData.passwordNueva !== formData.passwordConfirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.passwordActual === formData.passwordNueva) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }
    
    setGuardando(true);
    try {
      await onGuardar(formData.passwordActual, formData.passwordNueva);
      setFormData({ passwordActual: '', passwordNueva: '', passwordConfirmar: '' });
      onClose();
    } catch (error: any) {
      setError(error.message || 'Error al cambiar la contraseña');
    } finally {
      setGuardando(false);
    }
  };
  
  const toggleMostrar = (campo: 'actual' | 'nueva' | 'confirmar') => {
    setMostrar(prev => ({ ...prev, [campo]: !prev[campo] }));
  };
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-md animate-scale-in">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold">Cambiar Contraseña</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}
          
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual *
            </label>
            <div className="relative">
              <input
                type={mostrar.actual ? 'text' : 'password'}
                name="passwordActual"
                value={formData.passwordActual}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => toggleMostrar('actual')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrar.actual ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {/* Contraseña Nueva */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña *
            </label>
            <div className="relative">
              <input
                type={mostrar.nueva ? 'text' : 'password'}
                name="passwordNueva"
                value={formData.passwordNueva}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => toggleMostrar('nueva')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrar.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
          </div>
          
          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <input
                type={mostrar.confirmar ? 'text' : 'password'}
                name="passwordConfirmar"
                value={formData.passwordConfirmar}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => toggleMostrar('confirmar')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrar.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
