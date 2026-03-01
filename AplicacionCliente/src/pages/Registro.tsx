import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarCliente } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const actualizar = (campo: string, valor: string) => setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nombre || !form.apellido || !form.email || !form.password) {
      setError('Completa los campos obligatorios'); return;
    }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden'); return; }

    setCargando(true);
    try {
      const data = await registrarCliente({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        password: form.password,
      });
      login(data.accessToken, data.user);
      navigate('/perfil');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <section style={{ paddingTop: '160px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <span className="logo" style={{ fontSize: '28px' }}>
            <span className="logo-new">NEW</span><span className="logo-hype">HYPE</span>
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginTop: '15px' }}>Crear Cuenta</h2>
          <p style={{ color: 'var(--gris-400)', fontSize: '14px', marginTop: '5px' }}>Únete a New Hype</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 15px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Nombre *</label>
              <input type="text" value={form.nombre} onChange={e => actualizar('nombre', e.target.value)}
                placeholder="Tu nombre" className="input-campo" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Apellido *</label>
              <input type="text" value={form.apellido} onChange={e => actualizar('apellido', e.target.value)}
                placeholder="Tu apellido" className="input-campo" />
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email *</label>
            <input type="email" value={form.email} onChange={e => actualizar('email', e.target.value)}
              placeholder="tu@email.com" className="input-campo" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Teléfono</label>
            <input type="tel" value={form.telefono} onChange={e => actualizar('telefono', e.target.value)}
              placeholder="999 888 777" className="input-campo" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Contraseña *</label>
            <input type="password" value={form.password} onChange={e => actualizar('password', e.target.value)}
              placeholder="Mínimo 8 caracteres" className="input-campo" />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Confirmar Contraseña *</label>
            <input type="password" value={form.confirmar} onChange={e => actualizar('confirmar', e.target.value)}
              placeholder="Repite tu contraseña" className="input-campo" />
          </div>
          <button type="submit" className="btn-primario" disabled={cargando}
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'var(--gris-400)' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--texto-primario)', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </section>
  );
}
