/**
 * ✏️ MODAL DE EDICIÓN DE PERFIL
 * 
 * Modal para editar información del perfil de cliente.
 * 
 * @example
 * <ProfileEditModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   initialData={userData}
 *   onSave={handleSave}
 * />
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ProfileData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
}

interface ProfileEditModalProps {
  /**
   * Si el modal está abierto
   */
  isOpen: boolean;
  
  /**
   * Callback para cerrar el modal
   */
  onClose: () => void;
  
  /**
   * Datos iniciales del perfil
   */
  initialData: ProfileData;
  
  /**
   * Callback cuando se guardan los cambios
   */
  onSave: (data: ProfileData) => void | Promise<void>;
  
  /**
   * Si está guardando
   */
  loading?: boolean;
}

export default function ProfileEditModal({ 
  isOpen, 
  onClose, 
  initialData, 
  onSave,
  loading = false 
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  
  // Resetear form cuando cambia initialData
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Editar perfil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos Personales */}
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
              />
            </div>
          </div>
          
          {/* Contacto */}
          <div className="grid md:grid-cols-2 gap-4">
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
                disabled={loading}
                className="
                  w-full px-4 py-3 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                "
              />
            </div>
          </div>
          
          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium mb-2">
              Dirección
            </label>
            <input
              id="direccion"
              name="direccion"
              type="text"
              value={formData.direccion || ''}
              onChange={handleChange}
              disabled={loading}
              className="
                w-full px-4 py-3 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
                disabled:bg-gray-100 disabled:cursor-not-allowed
              "
              placeholder="Av. Principal 123"
            />
          </div>
          
          {/* Ubicación */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="departamento" className="block text-sm font-medium mb-2">
                Departamento
              </label>
              <select
                id="departamento"
                name="departamento"
                value={formData.departamento || ''}
                onChange={handleChange}
                disabled={loading}
                className="
                  w-full px-4 py-3 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                "
              >
                <option value="">Seleccionar</option>
                <option value="Lima">Lima</option>
                <option value="Arequipa">Arequipa</option>
                <option value="Cusco">Cusco</option>
                <option value="La Libertad">La Libertad</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="provincia" className="block text-sm font-medium mb-2">
                Provincia
              </label>
              <input
                id="provincia"
                name="provincia"
                type="text"
                value={formData.provincia || ''}
                onChange={handleChange}
                disabled={loading}
                className="
                  w-full px-4 py-3 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                "
                placeholder="Provincia"
              />
            </div>
            
            <div>
              <label htmlFor="distrito" className="block text-sm font-medium mb-2">
                Distrito
              </label>
              <input
                id="distrito"
                name="distrito"
                type="text"
                value={formData.distrito || ''}
                onChange={handleChange}
                disabled={loading}
                className="
                  w-full px-4 py-3 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                "
                placeholder="Distrito"
              />
            </div>
          </div>
          
          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg
                font-semibold hover:bg-gray-100 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="
                flex-1 px-6 py-3 bg-black text-white rounded-lg
                font-semibold hover:bg-gray-800 transition-colors
                disabled:bg-gray-400 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
