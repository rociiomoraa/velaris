// ================================================================
// VELARIS — RegisterPage.jsx  (src/pages/RegisterPage.jsx)
// ================================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const handle = async e => {
    e.preventDefault();
    if (form.password.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres'); return; }
    setBusy(true); setErr('');
    try {
      await register(form);
      navigate('/');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
    }
    setBusy(false);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh',
      height: '100vh',
      overflow: 'hidden',
    }}>

      {/* ── PANEL IZQUIERDO — Foto ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=90"
          alt="Avión en el cielo"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
        />
        {/* Overlay degradado */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(17,16,8,0.55) 0%, rgba(28,78,120,0.6) 100%)',
        }} />

        {/* Contenido sobre la foto */}
        <div style={{
          position: 'relative', zIndex: 2,
          height: '100%', padding: '2.5rem',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* Logo — clickable */}
          <Link to="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem', fontWeight: 700,
            color: '#fff', textDecoration: 'none',
            letterSpacing: '.1em',
            display: 'inline-block',
          }}>
            VELARIS
          </Link>

          {/* Headline central */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 700, color: '#fff',
              lineHeight: 1.15, marginBottom: '.75rem',
            }}>
              Empieza<br />a explorar.
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', maxWidth: 340, lineHeight: 1.65 }}>
              Crea tu cuenta gratis y accede a miles de destinos con la ayuda de Vera IA.
            </p>
          </div>

          {/* Badge Vera abajo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            borderRadius: 'var(--r-xl)', padding: '.875rem 1.25rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: '#fff',
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 2, letterSpacing: '.04em' }}>
                VERA IA · GRATIS PARA TODOS
              </div>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>
                Tu asistente de viajes personal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO — Formulario ── */}
      <div style={{
        background: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2.5rem 3rem',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem', fontWeight: 700,
              color: 'var(--ink)', marginBottom: 6,
            }}>
              Crear cuenta
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 300 }}>
              Únete a más de 2 millones de viajeros en Velaris
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>

            {/* Nombre */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Nombre completo
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '10px 14px',
                transition: 'border-color .18s',
              }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <User size={16} style={{ color: 'var(--ink3)', flexShrink: 0 }} />
                <input
                  type="text" placeholder="Tu nombre" required minLength={2}
                  value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: 'var(--ink)' }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Correo electrónico
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '10px 14px',
                transition: 'border-color .18s',
              }}>
                <Mail size={16} style={{ color: 'var(--ink3)', flexShrink: 0 }} />
                <input
                  type="email" placeholder="tu@email.com" required
                  value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: 'var(--ink)' }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Contraseña (mín. 6 caracteres)
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '10px 14px',
                transition: 'border-color .18s',
              }}>
                <Lock size={16} style={{ color: 'var(--ink3)', flexShrink: 0 }} />
                <input
                  type={show ? 'text' : 'password'} placeholder="••••••••" required minLength={6}
                  value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: 'var(--ink)' }}
                />
                <button type="button" onClick={() => setShow(!show)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0 }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {err && (
              <div style={{ color: 'var(--danger)', fontSize: 13, background: 'var(--danger-bg)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
                {err}
              </div>
            )}

            <button type="submit" className="btn btn--primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', borderRadius: 'var(--r-md)', marginTop: 4 }}
              disabled={busy}>
              {busy ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Al registrarte aceptas nuestros{' '}
            <a href="/terminos" style={{ color: 'var(--blue)' }}>Términos de uso</a>{' '}
            y{' '}
            <a href="/privacidad" style={{ color: 'var(--blue)' }}>Política de privacidad</a>
          </p>

          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}