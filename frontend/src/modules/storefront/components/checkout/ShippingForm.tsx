import { useState, useEffect } from 'react';
import { MapPin, Store } from 'lucide-react';
import { apiObtenerDepartamentos, apiObtenerProvincias, apiObtenerDistritos } from '../../services/storefrontApi';
import type { UbigeoItem } from '../../services/storefrontApi';

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
  formData: FormData;
  tipoEnvio: TipoEnvio;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onTipoEnvioChange: (tipo: TipoEnvio) => void;
}

export default function ShippingForm({
  formData,
  tipoEnvio,
  onChange,
  onTipoEnvioChange
}: ShippingFormProps) {
  const [departamentos, setDepartamentos] = useState<UbigeoItem[]>([]);
  const [provincias, setProvincias] = useState<UbigeoItem[]>([]);
  const [distritos, setDistritos] = useState<UbigeoItem[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedProvId, setSelectedProvId] = useState<number | null>(null);
  const [cargandoDepts, setCargandoDepts] = useState(false);
  const [cargandoProvs, setCargandoProvs] = useState(false);
  const [cargandoDists, setCargandoDists] = useState(false);

  // Load departments on mount
  useEffect(() => {
    setCargandoDepts(true);
    apiObtenerDepartamentos()
      .then(setDepartamentos)
      .catch(() => setDepartamentos([]))
      .finally(() => setCargandoDepts(false));
  }, []);

  // Load provinces when department changes
  useEffect(() => {
    if (!selectedDeptId) {
      setProvincias([]);
      setDistritos([]);
      return;
    }
    setCargandoProvs(true);
    apiObtenerProvincias(selectedDeptId)
      .then(setProvincias)
      .catch(() => setProvincias([]))
      .finally(() => setCargandoProvs(false));
    setSelectedProvId(null);
    setDistritos([]);
  }, [selectedDeptId]);

  // Load districts when province changes
  useEffect(() => {
    if (!selectedProvId) {
      setDistritos([]);
      return;
    }
    setCargandoDists(true);
    apiObtenerDistritos(selectedProvId)
      .then(setDistritos)
      .catch(() => setDistritos([]))
      .finally(() => setCargandoDists(false));
  }, [selectedProvId]);

  // Handle department select change
  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value ? Number(e.target.value) : null;
    const dept = departamentos.find(d => d.id === deptId);
    setSelectedDeptId(deptId);

    // Create synthetic event with the department name as value
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name: 'departamento', value: dept?.nombre || '' }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);

    // Clear provincia and distrito
    const clearProv = { ...e, target: { ...e.target, name: 'provincia', value: '' } } as React.ChangeEvent<HTMLSelectElement>;
    const clearDist = { ...e, target: { ...e.target, name: 'distrito', value: '' } } as React.ChangeEvent<HTMLSelectElement>;
    onChange(clearProv);
    onChange(clearDist);
  };

  // Handle province select change
  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provId = e.target.value ? Number(e.target.value) : null;
    const prov = provincias.find(p => p.id === provId);
    setSelectedProvId(provId);

    const syntheticEvent = {
      ...e,
      target: { ...e.target, name: 'provincia', value: prov?.nombre || '' }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);

    // Clear distrito
    const clearDist = { ...e, target: { ...e.target, name: 'distrito', value: '' } } as React.ChangeEvent<HTMLSelectElement>;
    onChange(clearDist);
  };

  // Handle district select change
  const handleDistritoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = e.target.value ? Number(e.target.value) : null;
    const dist = distritos.find(d => d.id === distId);

    const syntheticEvent = {
      ...e,
      target: { ...e.target, name: 'distrito', value: dist?.nombre || '' }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
  };

  const selectClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none";
  const inputClass = selectClass;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Informacion de envio</h2>

      {/* Tipo de Envio */}
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
          <span className="font-semibold">Envio a domicilio</span>
          <span className="text-xs text-gray-600">S/ 9.90 | Gratis desde S/150</span>
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Telefono *</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={onChange}
            required
            className={inputClass}
            placeholder="999 999 999"
          />
        </div>
      </div>

      {/* Datos de Direccion (solo si es envio a domicilio) */}
      {tipoEnvio === 'domicilio' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Direccion *</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={onChange}
              required
              className={inputClass}
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
              className={`${inputClass} resize-none`}
              placeholder="Ej: Casa amarilla con porton negro, al frente del parque"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Departamento *</label>
              <select
                value={selectedDeptId ?? ''}
                onChange={handleDepartamentoChange}
                required
                className={selectClass}
                disabled={cargandoDepts}
              >
                <option value="">{cargandoDepts ? 'Cargando...' : 'Seleccionar'}</option>
                {departamentos.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Provincia *</label>
              <select
                value={selectedProvId ?? ''}
                onChange={handleProvinciaChange}
                required
                className={selectClass}
                disabled={!selectedDeptId || cargandoProvs}
              >
                <option value="">
                  {cargandoProvs ? 'Cargando...' : !selectedDeptId ? 'Seleccione departamento' : 'Seleccionar'}
                </option>
                {provincias.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Distrito *</label>
              <select
                value={distritos.find(d => d.nombre === formData.distrito)?.id ?? ''}
                onChange={handleDistritoChange}
                required
                className={selectClass}
                disabled={!selectedProvId || cargandoDists}
              >
                <option value="">
                  {cargandoDists ? 'Cargando...' : !selectedProvId ? 'Seleccione provincia' : 'Seleccionar'}
                </option>
                {distritos.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
