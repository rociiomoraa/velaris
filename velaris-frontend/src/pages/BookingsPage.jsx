// ================================================================
// VELARIS — BookingsPage.jsx  (src/pages/BookingsPage.jsx)
// ================================================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Calendar, Users, X,
  Clock, CheckCircle, XCircle, Compass,
} from 'lucide-react';
import { bookingsApi } from '../api/client';

const STATUS = {
  PENDING:   { label: 'Pendiente',  color: '#d97706', bg: '#fef3c7', icon: <Clock size={11} /> },
  CONFIRMED: { label: 'Confirmada', color: '#15803d', bg: '#dcfce7', icon: <CheckCircle size={11} /> },
  CANCELLED: { label: 'Cancelada',  color: '#6b7280', bg: '#f3f4f6', icon: <XCircle size={11} /> },
  COMPLETED: { label: 'Completado', color: '#1C4E78', bg: 'var(--blue-light)', icon: <CheckCircle size={11} /> },
};

const TABS = ['Todas', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const IMGS = {
  playa:    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70',
  ciudad:   'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=70',
  aventura: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=70',
  default:  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=70',
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BookingsPage() {
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('Todas');
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => { load(); }, [page]);

  const load = () => {
    setLoading(true);
    bookingsApi.myBookings(page)
      .then(r => {
        setBookings(r.data?.content || []);
        setTotalPages(r.data?.totalPages || 0);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  const cancel = async id => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      const { data } = await bookingsApi.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? data : b));
    } catch {}
  };

  const filtered = tab === 'Todas' ? bookings : bookings.filter(b => b.status === tab);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* ── BANNER ── */}
      <div style={{
        background: '#0c2340',
        marginTop: 'calc(-1 * var(--nav-h))',
        paddingTop: 'calc(var(--nav-h) + 2.5rem)',
        paddingBottom: '3.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(28,78,120,.25)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(28,78,120,.15)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.9)',
            fontSize: 11, fontWeight: 600, padding: '5px 14px',
            borderRadius: 'var(--r-full)', marginBottom: '1.25rem',
            border: '1px solid rgba(255,255,255,.2)',
          }}>
            <Calendar size={12} /> Mis reservas
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800, color: '#fff',
            lineHeight: 1.1, marginBottom: '.75rem',
            letterSpacing: '-0.02em',
          }}>
            Mis reservas
          </h1>
          <p style={{
            color: 'rgba(255,255,255,.6)',
            fontSize: 15, maxWidth: 460, lineHeight: 1.7, fontWeight: 300,
          }}>
            Gestiona todas tus reservas desde aquí.
          </p>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="container" style={{ padding: '2.5rem 1.5rem 6rem' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
          {TABS.map(t => {
            const isActive = tab === t;
            const st = STATUS[t];
            return (
              <button key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '7px 18px', borderRadius: 'var(--r-full)',
                  border: '1.5px solid',
                  borderColor: isActive ? 'var(--blue)' : 'var(--border)',
                  background: isActive ? 'var(--blue)' : 'var(--white)',
                  color: isActive ? '#fff' : 'var(--ink)',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                {t === 'Todas' ? 'Todas' : (
                  <>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      color: isActive ? '#fff' : st?.color,
                    }}>
                      {st?.icon}
                    </span>
                    {st?.label}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Skeleton */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} style={{
                height: 140, background: 'var(--paper2)',
                borderRadius: 'var(--r-xl)', animation: 'pulse 1.5s ease infinite',
              }} />
            ))}
          </div>

        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            background: 'var(--white)', borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺</div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.2rem',
              fontWeight: 700, marginBottom: '.5rem', color: 'var(--ink)',
            }}>
              {tab === 'Todas' ? 'Aún no tienes reservas' : `Sin reservas ${STATUS[tab]?.label?.toLowerCase()}s`}
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.75rem' }}>
              {tab === 'Todas'
                ? '¡Explora destinos y reserva tu próxima aventura!'
                : 'Prueba con otro filtro'}
            </p>
            <Link to="/trips" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '11px 24px', borderRadius: 'var(--r-full)',
              background: 'var(--blue)', color: '#fff',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}>
              <MapPin size={14} /> Explorar viajes
            </Link>
          </div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(b => {
              const st  = STATUS[b.status] || STATUS.PENDING;
              const img = b.trip?.imageUrl?.split(',')[0]?.trim()?.startsWith('http')
                ? b.trip.imageUrl.split(',')[0].trim()
                : (IMGS[b.trip?.category?.toLowerCase()] || IMGS.default);

              return (
                <div key={b.id} style={{
                  background: 'var(--white)',
                  borderRadius: 'var(--r-xl)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr',
                  transition: 'box-shadow .2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Imagen */}
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img src={img} alt={b.trip?.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,.15))',
                    }} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 10px', borderRadius: 'var(--r-full)',
                          background: st.bg, color: st.color,
                          fontSize: 11, fontWeight: 700, marginBottom: '.5rem',
                          border: `1px solid ${st.color}22`,
                        }}>
                          {st.icon} {st.label}
                        </span>
                        <Link to={`/trips/${b.trip?.id}`} style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.1rem', fontWeight: 700,
                          color: 'var(--ink)', display: 'block',
                          textDecoration: 'none', marginBottom: '.25rem',
                          lineHeight: 1.3,
                        }}>
                          {b.trip?.title}
                        </Link>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          fontSize: 13, color: 'var(--muted)',
                        }}>
                          <MapPin size={12} /> {b.trip?.destination}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>total</div>
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.5rem', fontWeight: 800,
                          color: 'var(--blue)', lineHeight: 1,
                        }}>
                          €{Number(b.totalPrice).toLocaleString('es-ES')}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '1rem',
                      fontSize: 13, color: 'var(--muted)',
                      paddingTop: '.5rem', borderTop: '1px solid var(--border)',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Users size={13} />
                        {b.numTravelers} {b.numTravelers === 1 ? 'viajero' : 'viajeros'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={13} /> Salida: {fmtDate(b.trip?.departureDate)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} /> Reservado el {fmtDate(b.bookedAt)}
                      </span>
                    </div>

                    {b.notes && (
                      <div style={{
                        fontSize: 13, color: 'var(--muted)', fontStyle: 'italic',
                        padding: '8px 12px', background: 'var(--paper2)',
                        borderRadius: 'var(--r-sm)',
                        borderLeft: '3px solid var(--border)',
                      }}>
                        "{b.notes}"
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: '.25rem' }}>
                      <Link to={`/trips/${b.trip?.id}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px', borderRadius: 'var(--r-full)',
                        border: '1.5px solid var(--border)', background: 'var(--white)',
                        color: 'var(--ink)', fontSize: 13, fontWeight: 500,
                        textDecoration: 'none', transition: 'all .15s',
                      }}>
                        Ver viaje
                      </Link>
                      {b.status === 'PENDING' && (
                        <button onClick={() => cancel(b.id)} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '7px 16px', borderRadius: 'var(--r-full)',
                          border: '1.5px solid var(--danger)',
                          background: 'transparent', color: 'var(--danger)',
                          fontSize: 13, fontWeight: 500, cursor: 'pointer',
                          transition: 'all .15s',
                        }}>
                          <X size={13} /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '2.5rem' }}>
            <button className="btn-pagination btn-pagination--arrow"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}>←</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = page <= 3 ? i : page - 3 + i;
              if (p >= totalPages) return null;
              return (
                <button key={p}
                  className={`btn-pagination ${p === page ? 'btn-pagination--active' : ''}`}
                  onClick={() => setPage(p)}>
                  {p + 1}
                </button>
              );
            })}
            <button className="btn-pagination btn-pagination--arrow"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}