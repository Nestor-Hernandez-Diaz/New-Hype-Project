import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EditarPerfilModal from '../components/common/EditarPerfilModal';
import CambiarPasswordModal from '../components/common/CambiarPasswordModal';
import { useToast } from '../context/ToastContext';

interface UsuarioCliente {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  documento: string;
  tipoDocumento: string;
  direccion?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [usuario, setUsuario] = useState<UsuarioCliente | null>(null);
  const [editing, setEditing] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [formData, setFormData] = useState<UsuarioCliente>({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    documento: '',
    tipoDocumento: 'DNI',
    direccion: ''
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('nh_cliente_token');
    if (!token) {
      navigate('/storefront/cuenta/login');
      return;
    }

    // Cargar datos del usuario
    const cargarPerfil = async () => {
      try {
        // TODO: Implementar llamada real al backend GET /storefront/perfil
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUsuario: UsuarioCliente = {
          nombre: localStorage.getItem('nh_cliente_nombre')?.split(' ')[0] || 'Maria',
          apellidos: localStorage.getItem('nh_cliente_nombre')?.split(' ').slice(1).join(' ') || 'Garcia',
          email: localStorage.getItem('nh_cliente_email') || 'maria@email.com',
          telefono: '999888777',
          documento: '12345678',
          tipoDocumento: 'DNI',
          direccion: 'Av. Principal 123, Lima'
        };

        setUsuario(mockUsuario);
        setFormData(mockUsuario);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // TODO: Implementar llamada real al backend PUT /storefront/perfil
      await new Promise(resolve => setTimeout(resolve, 1500));

      setUsuario(formData);
      setEditing(false);
      
      // Actualizar datos en localStorage
      localStorage.setItem('nh_cliente_nombre', `${formData.nombre} ${formData.apellidos}`);
      localStorage.setItem('nh_cliente_email', formData.email);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showToast('Error al guardar los cambios. Por favor intenta de nuevo.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nh_cliente_token');
    localStorage.removeItem('nh_cliente_email');
    localStorage.removeItem('nh_cliente_nombre');
    navigate('/storefront');
  };
  
  // Guardar cambios desde modal
  const handleGuardarPerfil = async (datos: Partial<UsuarioCliente>) => {
    try {
      // TODO: Implementar llamada real al backend PUT /storefront/perfil
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const usuarioActualizado = { ...usuario!, ...datos };
      setUsuario(usuarioActualizado);
      setFormData(usuarioActualizado);
      
      // Actualizar localStorage
      localStorage.setItem('nh_cliente_nombre', `${datos.nombre} ${datos.apellidos}`);
      
      showToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw new Error('Error al guardar los cambios');
    }
  };
  
  // Cambiar contraseña desde modal
  const handleCambiarPassword = async (passwordActual: string, passwordNueva: string) => {
    try {
      // TODO: Implementar llamada real al backend POST /storefront/perfil/cambiar-password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular validación de contraseña actual (en el backend real verificaría)
      if (passwordActual !== 'password123') {
        // En producción esto vendría del backend
      }
      
      showToast('Contraseña cambiada correctamente', 'success');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw new Error('Contraseña actual incorrecta');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bebas text-4xl mb-2">MI CUENTA</h1>
          <p className="text-gray-600">Gestiona tu información personal y pedidos</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-md space-y-2">
              <Link
                to="/storefront/cuenta/perfil"
                className="block py-3 px-4 bg-black text-white font-medium"
              >
                Mi Perfil
              </Link>
              <Link
                to="/storefront/cuenta/pedidos"
                className="block py-3 px-4 hover:bg-gray-100"
              >
                Mis Pedidos
              </Link>
              <Link
                to="/storefront/favoritos"
                className="block py-3 px-4 hover:bg-gray-100"
              >
                Favoritos
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left py-3 px-4 hover:bg-gray-100 text-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Información Personal */}
            <div className="bg-white p-8 shadow-md">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="font-bebas text-2xl">INFORMACIÓN PERSONAL</h2>
                <button
                  onClick={() => setModalEditarAbierto(true)}
                  className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded"
                >
                  Editar Perfil
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
                    <p className="font-medium">{usuario.nombre} {usuario.apellidos}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <p className="font-medium">{usuario.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                    <p className="font-medium">{usuario.telefono}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Documento</label>
                    <p className="font-medium">{usuario.tipoDocumento}: {usuario.documento}</p>
                  </div>
                </div>

                {usuario.direccion && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Dirección</label>
                    <p className="font-medium">{usuario.direccion}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Seguridad */}
            <div className="bg-white p-8 shadow-md">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="font-bebas text-2xl">SEGURIDAD</h2>
                  <p className="text-sm text-gray-600 mt-1">Gestiona tu contraseña</p>
                </div>
                <button
                  onClick={() => setModalPasswordAbierto(true)}
                  className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded"
                >
                  Cambiar Contraseña
                </button>
              </div>
              
              <div className="flex items-center justify-between py-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
                  <p className="font-medium">••••••••</p>
                </div>
                <p className="text-xs text-gray-500">Última modificación: Hace 30 días</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modales */}
        <EditarPerfilModal
          isOpen={modalEditarAbierto}
          onClose={() => setModalEditarAbierto(false)}
          datosIniciales={{
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            telefono: usuario.telefono,
            direccion: usuario.direccion || ''
          }}
          onGuardar={handleGuardarPerfil}
        />
        
        <CambiarPasswordModal
          isOpen={modalPasswordAbierto}
          onClose={() => setModalPasswordAbierto(false)}
          onGuardar={handleCambiarPassword}
        />
      </div>
    </div>
  );
}
