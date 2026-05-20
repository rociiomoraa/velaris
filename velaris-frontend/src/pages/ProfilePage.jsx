// ================================================================
// VELARIS — ProfilePage.jsx  (src/pages/ProfilePage.jsx)
// ================================================================
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Heart, Calendar, Lock, Save, Check,
  LogOut, ChevronRight, Sparkles, MapPin, Shield,
} from 'lucide-react';
import { usersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'profile',  label: 'Mi perfil',   icon: <User size={16} /> },
  { id: 'password', label: 'Contraseña',  icon: <Lock size={16} /> },
];

const QUICK_LINKS = [
  { to: '/bookings',        icon: <Calendar size={17} />, label: 'Mis reservas',     desc: 'Consulta y gestiona tus viajes' },
  { to: '/favorites',       icon: <Heart size={17} />,    label: 'Mis favoritos',    desc: 'Destinos que te han gustado' },
  { to: '/recommendations', icon: <Sparkles size={17} />, label: 'Hablar con Vera',  desc: 'Tu asistente IA de viajes' },
];

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const [tab,     setTab]     = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const [form,    setForm]    = useState({ name: '', phone: '', avatarUrl: '' });
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwdErr,  setPwdErr]  = useState('');
  const [pwdOk,   setPwdOk]   = useState(false);

  useEffect(() => {
    usersApi.getMe()
      .then(r => {
        setProfile(r.data);
        setForm({ name: r.data.name || '', phone: r.data.phone || '', avatarUrl: r.data.avatarUrl || '' });
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersApi.updateMe(form);
      setProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const savePassword = async e => {
    e.preventDefault();
    setPwdErr(''); setPwdOk(false);
    if (pwdForm.newPassword.length < 6) { setPwdErr('Mínimo 6 caracteres'); return; }
    setSaving(true);
    try {
      await usersApi.changePassword(pwdForm);
      setPwdForm({ oldPassword: '', newPassword: '' });
      setPwdOk(true);
    } catch (ex) {
      setPwdErr(ex.response?.data?.message || 'Contraseña actual incorrecta');
    }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ padding: '8rem 2rem', textAlign: 'center', color: 'var(--muted)' }}>
      Cargando perfil...
    </div>
  );

  const initials = profile?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* ── BANNER ── */}
      <div style={{
        background: '#0c2340',
        marginTop: 'calc(-1 * var(--nav-h))',
        paddingTop: 'calc(var(--nav-h) + 2.5rem)',
        paddingBottom: '4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decoración fondo */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(28,78,120,.25)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -40,
          width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(28,78,120,.15)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--blue)',
              border: '3px solid rgba(255,255,255,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
              fontSize: 22, fontWeight: 700, color: '#fff',
              fontFamily: 'var(--font-display)',
            }}>
              {form.avatarUrl
                ? <img src={form.avatarUrl} alt={profile?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>

            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: isAdmin ? 'rgba(255,215,0,.15)' : 'rgba(255,255,255,.1)',
                border: `1px solid ${isAdmin ? 'rgba(255,215,0,.3)' : 'rgba(255,255,255,.15)'}`,
                color: isAdmin ? '#ffd700' : 'rgba(255,255,255,.7)',
                fontSize: 10, fontWeight: 700, padding: '3px 10px',
                borderRadius: 'var(--r-full)', marginBottom: '.4rem',
                textTransform: 'uppercase', letterSpacing: '.08em',
              }}>
                {isAdmin ? <><Shield size={10} /> Administrador</> : <><MapPin size={10} /> Viajero</>}
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 800, color: '#fff',
                lineHeight: 1.1, marginBottom: '.2rem',
              }}>
                {profile?.name}
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>
                {profile?.email} · Miembro desde {new Date(profile?.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="container" style={{ padding: '2.5rem 1.5rem 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* ── SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Navegación principal */}
            <div style={{
              background: 'var(--white)',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '.75rem 1rem',
                fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
              }}>
                Configuración
              </div>
              {TABS.map(t => (
                <button key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '.85rem 1rem',
                    background: tab === t.id ? 'var(--blue-light)' : 'transparent',
                    border: 'none', borderBottom: '1px solid var(--border)',
                    color: tab === t.id ? 'var(--blue)' : 'var(--ink)',
                    fontSize: 14, fontWeight: tab === t.id ? 600 : 400,
                    cursor: 'pointer', transition: 'all .15s',
                    textAlign: 'left',
                  }}>
                  <span style={{ color: tab === t.id ? 'var(--blue)' : 'var(--muted)' }}>{t.icon}</span>
                  {t.label}
                  {tab === t.id && <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--blue)' }} />}
                </button>
              ))}
              {/* Cerrar sesión */}
              <button
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '.85rem 1rem',
                  background: 'transparent', border: 'none',
                  color: 'var(--danger)', fontSize: 14, fontWeight: 400,
                  cursor: 'pointer', transition: 'all .15s', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>

            {/* Accesos rápidos */}
            <div style={{
              background: 'var(--white)',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '.75rem 1rem',
                fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
              }}>
                Accesos rápidos
              </div>
              {QUICK_LINKS.map(l => (
                <Link key={l.to} to={l.to} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '.85rem 1rem',
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none', color: 'var(--ink)',
                  transition: 'background .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--paper2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 'var(--r-md)',
                    background: 'var(--blue-light)', color: 'var(--blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {l.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{l.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.desc}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* ── PANEL PRINCIPAL ── */}
          <div>

            {/* Pestaña — Perfil */}
            {tab === 'profile' && (
              <div style={{
                background: 'var(--white)',
                borderRadius: 'var(--r-xl)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '1.5rem 1.75rem',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>
                    Información personal
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3 }}>
                    Actualiza tus datos de perfil
                  </p>
                </div>

                <form onSubmit={saveProfile} style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
                        Nombre completo
                      </label>
                      <input className="input" required minLength={2}
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
                        Email
                      </label>
                      <input className="input" disabled value={profile?.email || ''}
                        style={{ opacity: .55, cursor: 'not-allowed' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
                        Teléfono
                      </label>
                      <input className="input" placeholder="+34 600 000 000"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
                        URL de avatar
                      </label>
                      <input className="input" placeholder="https://..."
                        value={form.avatarUrl}
                        onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
                      />
                      {form.avatarUrl && (
                        <div style={{ marginTop: '.75rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={form.avatarUrl} alt="preview"
                            style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                            onError={e => e.target.style.display = 'none'}
                          />
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Vista previa del avatar</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                  }}>
                    <button type="submit" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      padding: '10px 24px', borderRadius: 'var(--r-full)',
                      background: 'var(--blue)', color: '#fff',
                      border: 'none', fontSize: 14, fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? .7 : 1, transition: 'all .18s',
                    }} disabled={saving}>
                      <Save size={14} /> {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    {saved && (
                      <span style={{
                        color: 'var(--success)', fontSize: 13, fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <Check size={14} /> Guardado correctamente
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Pestaña — Contraseña */}
            {tab === 'password' && (
              <div style={{
                background: 'var(--white)',
                borderRadius: 'var(--r-xl)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '1.5rem 1.75rem',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>
                    Cambiar contraseña
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3 }}>
                    Elige una contraseña segura de al menos 6 caracteres
                  </p>
                </div>

                <form onSubmit={savePassword} style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 420, marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
                        Contraseña actual
                      </label>
                      <input className="input" type="password" required placeholder="••••••••"
                        value={pwdForm.oldPassword}
                        onChange={e => setPwdForm(f => ({ ...f, oldPassword: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
                        Nueva contraseña
                      </label>
                      <input className="input" type="password" required minLength={6} placeholder="••••••••"
                        value={pwdForm.newPassword}
                        onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))}
                      />
                      {pwdForm.newPassword.length > 0 && (
                        <div style={{ marginTop: '.5rem', display: 'flex', gap: 4 }}>
                          {[1, 2, 3, 4].map(level => (
                            <div key={level} style={{
                              flex: 1, height: 3, borderRadius: 2,
                              background: pwdForm.newPassword.length >= level * 2
                                ? level <= 1 ? '#ef4444'
                                  : level <= 2 ? '#f97316'
                                  : level <= 3 ? '#eab308'
                                  : '#22c55e'
                                : 'var(--border)',
                              transition: 'background .2s',
                            }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {pwdErr && (
                      <div style={{
                        color: 'var(--danger)', fontSize: 13,
                        padding: '10px 14px', background: 'var(--danger-bg)',
                        borderRadius: 'var(--r-md)', border: '1px solid rgba(239,68,68,.15)',
                      }}>
                        {pwdErr}
                      </div>
                    )}
                    {pwdOk && (
                      <div style={{
                        color: 'var(--success)', fontSize: 13,
                        padding: '10px 14px', background: 'var(--success-bg)',
                        borderRadius: 'var(--r-md)', border: '1px solid rgba(34,197,94,.15)',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <Check size={14} /> Contraseña actualizada correctamente
                      </div>
                    )}
                  </div>

                  <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    <button type="submit" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      padding: '10px 24px', borderRadius: 'var(--r-full)',
                      background: 'var(--blue)', color: '#fff',
                      border: 'none', fontSize: 14, fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? .7 : 1, transition: 'all .18s',
                    }} disabled={saving}>
                      <Lock size={14} /> {saving ? 'Guardando...' : 'Cambiar contraseña'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}