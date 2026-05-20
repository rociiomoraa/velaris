// ================================================================
// VELARIS — CheckoutPage.jsx  (src/pages/CheckoutPage.jsx)
// ================================================================
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, Lock, CheckCircle, Plane,
  Moon, MapPin, Calendar, Users, Shield, Sparkles
} from 'lucide-react';
import { tripsApi, bookingsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Confetti from '../components/Confetti';

const MEAL_LABELS = {
  sin_comidas:   'Solo alojamiento',
  desayuno:      'Desayuno incluido',
  media_pension: 'Media pensión',
  todo_incluido: 'Todo incluido',
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

// ── Modal de procesando pago ──────────────────────────────────────
function PaymentProcessingModal({ step }) {
  const steps = [
    { label: 'Verificando datos de pago...', icon: <Lock size={20} /> },
    { label: 'Contactando con el banco...',   icon: <Shield size={20} /> },
    { label: 'Confirmando reserva...',         icon: <CheckCircle size={20} /> },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--r-2xl)',
        padding: '2.5rem 2rem', maxWidth: 380, width: '100%',
        textAlign: 'center', boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--blue)',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1.5rem',
        }} />

        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.2rem',
          fontWeight: 700, color: 'var(--ink)', marginBottom: '1.5rem',
        }}>
          Procesando pago
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 'var(--r-md)',
              background: i < step ? 'var(--success-bg)' : i === step ? 'var(--blue-light)' : 'var(--paper2)',
              border: `1px solid ${i < step ? 'var(--success-bg)' : i === step ? 'rgba(28,78,120,0.2)' : 'var(--border)'}`,
              transition: 'all 0.4s',
            }}>
              <span style={{ color: i < step ? 'var(--success)' : i === step ? 'var(--blue)' : 'var(--muted)' }}>
                {i < step ? <CheckCircle size={18} /> : s.icon}
              </span>
              <span style={{
                fontSize: 13, fontWeight: i === step ? 600 : 400,
                color: i < step ? 'var(--success)' : i === step ? 'var(--blue)' : 'var(--muted)',
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: '1.25rem' }}>
          <Lock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Conexión cifrada SSL · No almacenamos tus datos
        </p>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────
export default function CheckoutPage() {
  const { id: tripId }   = useParams();
  const [params]         = useSearchParams();
  const navigate         = useNavigate();
  const { isAuth, user } = useAuth();

  const travelers = Number(params.get('travelers') || 1);
  const notes     = params.get('notes') || '';

  const [trip, setTrip]       = useState(null);
  const [loading, setLoading] = useState(true);

  const [card,   setCard]   = useState('');
  const [name,   setName]   = useState(user?.name || '');
  const [expiry, setExpiry] = useState('');
  const [cvv,    setCvv]    = useState('');
  const [errors, setErrors] = useState({});

  const [processing, setProcessing] = useState(false);
  const [procStep,   setProcStep]   = useState(0);
  const [success,    setSuccess]    = useState(false);
  const [confetti,   setConfetti]   = useState(false);
  const [payErr,     setPayErr]     = useState('');

  const timers = useRef([]);

  useEffect(() => {
    if (!isAuth) { navigate('/login'); return; }
    tripsApi.getById(tripId)
      .then(r => setTrip(r.data))
      .catch(() => navigate('/trips'))
      .finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const total = trip ? (Number(trip.price) * travelers).toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '—';

  const validate = () => {
    const e = {};
    const rawCard = card.replace(/\s/g, '');
    if (rawCard.length < 16)             e.card   = 'Número de tarjeta inválido';
    if (!name.trim())                    e.name   = 'Introduce el nombre del titular';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = 'Fecha inválida (MM/AA)';
    if (cvv.length < 3)                 e.cvv    = 'CVV inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setPayErr('');
    setProcessing(true);
    setProcStep(0);
    timers.current = [];

    timers.current.push(setTimeout(() => setProcStep(1), 1200));
    timers.current.push(setTimeout(() => setProcStep(2), 2400));

    timers.current.push(setTimeout(async () => {
      try {
        await bookingsApi.create({ tripId: Number(tripId), numTravelers: travelers, notes });
        setProcessing(false);
        setSuccess(true);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 5000);
      } catch (e) {
        setProcessing(false);
        setPayErr(e.response?.data?.message || 'Error al confirmar la reserva. Inténtalo de nuevo.');
      }
    }, 3600));
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--blue)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!trip) return null;

  const isVuelo    = trip.type === 'vuelo';
  const isEscapada = trip.type === 'escapada';
  const typeIcon   = isVuelo ? <Plane size={16} /> : isEscapada ? <Moon size={16} /> : <MapPin size={16} />;
  const typeLabel  = isVuelo ? 'Vuelo' : isEscapada ? 'Escapada' : 'Viaje';

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {confetti && <Confetti />}
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--success-bg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          animation: 'scaleIn 0.4s ease',
        }}>
          <CheckCircle size={36} color="var(--success)" />
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>
          {isVuelo ? '¡Vuelo confirmado!' : isEscapada ? '¡Escapada confirmada!' : '¡Reserva confirmada!'}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Tu pago de <strong>€{total}</strong> ha sido procesado correctamente.<br />
          Recibirás un email de confirmación en breve. ¡Que disfrutes del viaje!
        </p>

        <div style={{
          background: 'var(--white)', borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)', padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <img
            src={trip.imageUrl?.split(',')[0]?.trim() || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&q=80'}
            alt={trip.title}
            style={{ width: 72, height: 72, borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{trip.title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 10 }}>
              <span>{typeLabel}</span>
              <span>·</span>
              <span>{travelers} {travelers === 1 ? 'viajero' : 'viajeros'}</span>
              <span>·</span>
              <span>€{total}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/bookings" className="btn btn--primary" style={{ flex: 1, justifyContent: 'center' }}>
            Ver mis reservas
          </Link>
          <Link to="/trips" className="btn btn--ghost" style={{ flex: 1, justifyContent: 'center' }}>
            Seguir explorando
          </Link>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
          <Sparkles size={14} color="var(--blue)" />
          <span>¿Necesitas ayuda? <Link to="/recommendations" style={{ color: 'var(--blue)', fontWeight: 600 }}>Pregúntale a Vera</Link></span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)'}}>
      {processing && <PaymentProcessingModal step={procStep} />}

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={16} /> Volver al viaje
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '.7rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: '.4rem' }}>
            Pago seguro
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--ink)' }}>
            Completar reserva
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--blue)' }}>{typeIcon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Resumen de tu {typeLabel.toLowerCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, padding: '1.25rem' }}>
                <img
                  src={trip.imageUrl?.split(',')[0]?.trim() || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&q=80'}
                  alt={trip.title}
                  style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 'var(--r-md)', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{trip.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, color: 'var(--muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{trip.destination}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{fmtDate(trip.departureDate)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} />{travelers} {travelers === 1 ? 'viajero' : 'viajeros'}</span>
                  </div>
                  {isEscapada && trip.mealPlan && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{MEAL_LABELS[trip.mealPlan]}</div>
                  )}
                  {notes && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>"{notes}"</div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={16} color="var(--blue)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Datos de pago</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  {['VISA', 'MC', 'AMEX'].map(b => (
                    <span key={b} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--muted)' }}>{b}</span>
                  ))}
                </div>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Número de tarjeta</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className={`input${errors.card ? ' input--error' : ''}`}
                      placeholder="1234 5678 9012 3456"
                      value={card}
                      onChange={e => setCard(formatCard(e.target.value))}
                      inputMode="numeric"
                      style={{ paddingRight: 44, borderColor: errors.card ? 'var(--danger)' : undefined }}
                    />
                    <CreditCard size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  </div>
                  {errors.card && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.card}</span>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Nombre del titular</label>
                  <input
                    className="input"
                    placeholder="Como aparece en la tarjeta"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ borderColor: errors.name ? 'var(--danger)' : undefined }}
                  />
                  {errors.name && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.name}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Fecha de caducidad</label>
                    <input
                      className="input"
                      placeholder="MM/AA"
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      inputMode="numeric"
                      maxLength={5}
                      style={{ borderColor: errors.expiry ? 'var(--danger)' : undefined }}
                    />
                    {errors.expiry && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.expiry}</span>}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>CVV</label>
                    <input
                      className="input"
                      placeholder="123"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      inputMode="numeric"
                      maxLength={4}
                      style={{ borderColor: errors.cvv ? 'var(--danger)' : undefined }}
                    />
                    {errors.cvv && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.cvv}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, padding: '10px 12px', background: 'var(--paper2)', borderRadius: 'var(--r-md)', marginTop: 4 }}>
                  {[
                    { icon: <Lock size={13} />, text: 'Pago cifrado SSL' },
                    { icon: <Shield size={13} />, text: 'Protección 3D Secure' },
                    { icon: <CheckCircle size={13} />, text: 'No guardamos datos' },
                  ].map(g => (
                    <div key={g.text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)', flex: 1 }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0 }}>{g.icon}</span>
                      {g.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 1.5rem)' }}>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.25rem' }}>
                Resumen del pedido
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)' }}>
                  <span>Precio por persona</span>
                  <span>€{Number(trip.price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)' }}>
                  <span>Viajeros</span>
                  <span>× {travelers}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)' }}>
                  <span>Tasas e impuestos</span>
                  <span>Incluidos</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>
                  <span>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)' }}>€{total}</span>
                </div>
              </div>

              {payErr && (
                <div style={{ color: 'var(--danger)', fontSize: 13, padding: '8px 12px', background: 'var(--danger-bg)', borderRadius: 'var(--r-sm)', marginBottom: '1rem' }}>
                  {payErr}
                </div>
              )}

              <button
                className="btn btn--primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', borderRadius: 'var(--r-md)' }}
                onClick={handlePay}
                disabled={processing}
              >
                <Lock size={16} />
                Pagar €{total}
              </button>

              <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: '.75rem', lineHeight: 1.5 }}>
                Al confirmar aceptas nuestros <span style={{ color: 'var(--blue)' }}>términos y condiciones</span>.<br />
                Este es un entorno de demostración. No se realizará ningún cargo real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}