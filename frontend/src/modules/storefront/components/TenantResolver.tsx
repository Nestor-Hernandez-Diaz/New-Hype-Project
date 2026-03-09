/**
 *  TENANT RESOLVER
 * 
 * Reads :subdominio from the URL, calls the backend to resolve it
 * to a tenantId, and configures the storefront module before rendering children.
 */

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setTenantConfig } from '../services/storefrontFetch';
import { apiResolverTenant } from '../services/storefrontApi';

type ResolverState = 'loading' | 'ready' | 'error';

export default function TenantResolver({ children }: { children: React.ReactNode }) {
  const { subdominio } = useParams<{ subdominio: string }>();
  const [estado, setEstado] = useState<ResolverState>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!subdominio) {
      setError('No se especificó una tienda');
      setEstado('error');
      return;
    }

    let cancelled = false;

    async function resolver() {
      try {
        const tenant = await apiResolverTenant(subdominio!);
        if (cancelled) return;
        setTenantConfig(String(tenant.id), tenant.subdominio, tenant.nombre);
        setEstado('ready');
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || 'Tienda no encontrada');
        setEstado('error');
      }
    }

    setEstado('loading');
    resolver();

    return () => { cancelled = true; };
  }, [subdominio]);

  if (estado === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (estado === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center max-w-md px-6">
          <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Tienda no encontrada</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <p className="text-gray-400 text-sm">
            Verifica que la URL sea correcta. Ejemplo: <code className="bg-gray-100 px-2 py-1 rounded">/tienda/mi-tienda</code>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
