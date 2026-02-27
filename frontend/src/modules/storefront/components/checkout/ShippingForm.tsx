/**
 * 📦 FORMULARIO DE ENVÍO
 * 
 * Formulario para capturar datos de envío (domicilio o tienda).
 * 
 * @example
 * <ShippingForm
 *   formData={formData}
 *   tipoEnvio="domicilio"
 *   onChange={handleChange}
 *   onTipoEnvioChange={setTipoEnvio}
 * />
 */

import { MapPin, Store } from 'lucide-react';

type TipoEnvio = 'domicilio' | 'tienda';

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  referencia: string;
  distrito: string;
  provincia: string;
  departamento: string;
}

interface ShippingFormProps {
  /**
   * Datos del formulario
   */
  formData: FormData;
  
  /**
   * Tipo de envío seleccionado
   */
  tipoEnvio: TipoEnvio;
  
  /**
   * Callback cuando cambia un campo
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  /**
   * Callback cuando cambia el tipo de envío
   */
  onTipoEnvioChange: (tipo: TipoEnvio) => void;
}

export default function ShippingForm({ 
  formData, 
  tipoEnvio, 
  onChange, 
  onTipoEnvioChange 
}: ShippingFormProps) {
  
  return (
    <div className="space-y-6">
      {/* Título */}
      <h2 className="text-2xl font-bold">Información de envío</h2>
      
      {/* Tipo de Envío */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onTipoEnvioChange('domicilio')}
          className={`
            p-4 rounded-xl border-2 flex flex-col items-center gap-2
            transition-all
            ${tipoEnvio === 'domicilio'
              ? 'border-black bg-black/5'
              : 'border-gray-200 hover:border-gray-400'
            }
          `}
        >
          <MapPin size={24} />
          <span className="font-semibold">Envío a domicilio</span>
          <span className="text-xs text-gray-600">S/ 9.90 • Gratis + S/150</span>
        </button>
        
        <button
          type="button"
          onClick={() => onTipoEnvioChange('tienda')}
          className={`
            p-4 rounded-xl border-2 flex flex-col items-center gap-2
            transition-all
            ${tipoEnvio === 'tienda'
              ? 'border-black bg-black/5'
              : 'border-gray-200 hover:border-gray-400'
            }
          `}
        >
          <Store size={24} />
          <span className="font-semibold">Recoger en tienda</span>
          <span className="text-xs text-gray-600">Gratis</span>
        </button>
      </div>
      
      {/* Datos Personales */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
            placeholder="Tu nombre"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Apellido *</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
            placeholder="Tu apellido"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
            placeholder="tu@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Teléfono *</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={onChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
            placeholder="999 999 999"
          />
        </div>
      </div>
      
      {/* Datos de Dirección (solo si es envío a domicilio) */}
      {tipoEnvio === 'domicilio' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Dirección *</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={onChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
              placeholder="Av. Principal 123, Dpto. 456"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Referencia</label>
            <textarea
              name="referencia"
              value={formData.referencia}
              onChange={onChange}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none resize-none"
              placeholder="Ej: Casa amarilla con portón negro, al frente del parque"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Departamento *</label>
              <select
                name="departamento"
                value={formData.departamento}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
              >
                <option value="">Seleccionar</option>
                <option value="Lima">Lima</option>
                <option value="Arequipa">Arequipa</option>
                <option value="Cusco">Cusco</option>
                <option value="La Libertad">La Libertad</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Provincia *</label>
              <input
                type="text"
                name="provincia"
                value={formData.provincia}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                placeholder="Provincia"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Distrito *</label>
              <input
                type="text"
                name="distrito"
                value={formData.distrito}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                placeholder="Distrito"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
