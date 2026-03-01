import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginCliente } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Completa todos los campos'); return; }
    setCargando(true);
    try {
      const data = await loginCliente({ email, password });
      login(data.accessToken, data.user);
      navigate('/perfil');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
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
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginTop: '15px' }}>Iniciar Sesión</h2>
          <p style={{ color: 'var(--gris-400)', fontSize: '14px', marginTop: '5px' }}>Accede a tu cuenta</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 15px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" className="input-campo" autoComplete="email" />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Tu contraseña" className="input-campo" autoComplete="current-password" />
          </div>
          <button type="submit" className="btn-primario" disabled={cargando}
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'var(--gris-400)' }}>
          ¿No tienes cuenta? <Link to="/registro" style={{ color: 'var(--texto-primario)', fontWeight: 600 }}>Regístrate aquí</Link>
        </p>
      </div>
    </section>
  );
}
