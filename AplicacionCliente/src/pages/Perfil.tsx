import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerPerfil, actualizarPerfil, obtenerPedidos } from '../services/api';
import type { PerfilCliente, Pedido } from '../types';

export default function Perfil() {
  const { estaAutenticado, logout } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formEdit, setFormEdit] = useState({ nombre: '', apellido: '', telefono: '' });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!estaAutenticado) { navigate('/login'); return; }
    cargarDatos();
  }, [estaAutenticado]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [p, ped] = await Promise.all([obtenerPerfil(), obtenerPedidos()]);
      setPerfil(p);
      setPedidos(ped.content);
      setFormEdit({ nombre: p.nombre, apellido: p.apellido, telefono: p.telefono || '' });
    } catch { /* ignore */ }
    setCargando(false);
  };

  const guardarPerfil = async () => {
    setGuardando(true);
    try {
      const actualizado = await actualizarPerfil(formEdit);
      setPerfil(actualizado);
      setEditando(false);
      setMensaje('Perfil actualizado correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch { setMensaje('Error al actualizar'); }
    setGuardando(false);
  };

  const cerrarSesion = () => { logout(); navigate('/'); };

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '200px 20px', color: 'var(--gris-400)' }}>
        <div className="procesando-spinner" style={{ margin: '0 auto 15px' }}></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <section style={{ paddingTop: '140px', maxWidth: '800px', margin: '0 auto', padding: '140px 20px 60px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '30px' }}>Mi Cuenta</h2>

      {mensaje && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px 15px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
          {mensaje}
        </div>
      )}

      {/* Datos del perfil */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Datos Personales</h3>
          <button className="btn-contorno" style={{ padding: '8px 20px', fontSize: '13px' }}
            onClick={() => setEditando(true)}>Editar</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--gris-400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Nombre</div>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>{perfil?.nombre} {perfil?.apellido}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--gris-400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Email</div>
            <div style={{ fontSize: '15px' }}>{perfil?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--gris-400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Teléfono</div>
            <div style={{ fontSize: '15px' }}>{perfil?.telefono || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--gris-400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Miembro desde</div>
            <div style={{ fontSize: '15px' }}>{perfil?.createdAt ? new Date(perfil.createdAt).toLocaleDateString('es-PE') : '—'}</div>
          </div>
        </div>
      </div>

      {/* Pedidos */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Mis Pedidos</h3>
        {pedidos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gris-400)' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📦</div>
            <p>Aún no tienes pedidos</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pedidos.map(p => (
              <div key={p.id} style={{ border: '1px solid var(--gris-200)', borderRadius: '12px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.codigoPedido}</div>
                  <div style={{ fontSize: '13px', color: 'var(--gris-400)' }}>{new Date(p.fechaEmision).toLocaleDateString('es-PE')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>S/. {p.total.toFixed(2)}</div>
                  <div style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: p.estado === 'CANCELADO' ? '#fef2f2' : '#f0fdf4', color: p.estado === 'CANCELADO' ? '#dc2626' : '#16a34a' }}>
                    {p.estado}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cerrar sesión */}
      <button onClick={cerrarSesion} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
        Cerrar Sesión
      </button>

      {/* Modal editar */}
      {editando && (
        <div className="modal-overlay" onClick={() => setEditando(false)}>
          <div className="modal-caja" onClick={e => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h3>Editar Datos</h3>
              <button className="modal-cerrar" onClick={() => setEditando(false)}>✕</button>
            </div>
            <div className="modal-cuerpo">
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Nombre</label>
                <input className="input-campo" value={formEdit.nombre} onChange={e => setFormEdit(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Apellido</label>
                <input className="input-campo" value={formEdit.apellido} onChange={e => setFormEdit(p => ({ ...p, apellido: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Teléfono</label>
                <input className="input-campo" value={formEdit.telefono} onChange={e => setFormEdit(p => ({ ...p, telefono: e.target.value }))} />
              </div>
            </div>
            <div className="modal-pie">
              <button className="btn-contorno" onClick={() => setEditando(false)}>Cancelar</button>
              <button className="btn-primario" onClick={guardarPerfil} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
