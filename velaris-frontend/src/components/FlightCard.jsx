// ================================================================
// VELARIS — FlightCard.jsx
// ================================================================
import { Plane, ArrowRight, Clock, Users, Briefcase, Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CABIN_OPTIONS = [
  { value: 'turista',  label: 'Turista' },
  { value: 'business', label: 'Business' },
  { value: 'primera',  label: 'Primera clase' },
];

const CABIN_BADGE = {
  turista:  { bg: 'var(--paper2)',     color: 'var(--ink2)' },
  business: { bg: 'var(--blue-light)', color: 'var(--blue)' },
  primera:  { bg: '#fef9c3',           color: '#854d0e' },
};

export default function FlightCard({ flight, onCompare, isComparing }) {
  const navigate = useNavigate();
  const badge = CABIN_BADGE[flight.cabinClass] || CABIN_BADGE.turista;
  const img   = flight.imageUrl?.split(',')[0]?.trim()
    || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80';

  return (
    <div
      onClick={() => navigate(`/trips/${flight.id}`)}
      style={{
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', overflow: 'hidden', cursor: 'pointer',
        transition: 'transform .2s, box-shadow .2s',
        boxShadow: '0 1px 4px rgba(0,0,0,.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)';
      }}
    >
      {/* Imagen */}
      <div style={{ position: 'relative', height: 168, overflow: 'hidden' }}>
        <img src={img} alt={flight.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,16,8,.55) 0%, transparent 55%)' }} />

        <span style={{
          position: 'absolute', top: 12, left: 12,
          padding: '4px 11px', borderRadius: 'var(--r-full)',
          fontSize: 11, fontWeight: 700,
          background: badge.bg, color: badge.color,
          border: '1px solid rgba(0,0,0,.07)',
        }}>
          {CABIN_OPTIONS.find(c => c.value === flight.cabinClass)?.label || 'Turista'}
        </span>

        {flight.includesHotel && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            padding: '4px 10px', borderRadius: 'var(--r-full)',
            fontSize: 11, fontWeight: 700,
            background: '#dcfce7', color: '#15803d',
            border: '1px solid rgba(0,0,0,.07)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Hotel size={10} /> + Hotel
          </span>
        )}

        <div style={{
          position: 'absolute', bottom: 12, left: 14, right: 14,
          display: 'flex', alignItems: 'center', gap: 8, color: '#fff',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            {flight.origin}
          </span>
          <ArrowRight size={13} style={{ opacity: .75, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {flight.destination?.split(',')[0]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.45rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {flight.title}
        </h3>

        {flight.airline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: '.7rem' }}>
            <Plane size={12} />
            <span>{flight.airline}</span>
            {flight.flightNumber && (
              <span style={{ background: 'var(--paper2)', padding: '1px 8px', borderRadius: 'var(--r-sm)', fontWeight: 600, fontSize: 11 }}>
                {flight.flightNumber}
              </span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: 12, color: 'var(--muted)', marginBottom: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            {flight.departureDate
              ? new Date(flight.departureDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
              : '—'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={12} /> {flight.availableSeats} plazas
          </span>
          {flight.includesHotel && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Briefcase size={12} /> Paquete
            </span>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '.75rem' }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>desde</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>
              {Number(flight.price).toLocaleString('es-ES')}€
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Botón comparar */}
            {onCompare && (
              <button
                onClick={e => { e.stopPropagation(); onCompare(flight); }}
                title={isComparing ? 'Quitar de comparación' : 'Añadir a comparación'}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1.5px solid',
                  borderColor: isComparing ? 'var(--blue)' : 'var(--border)',
                  background: isComparing ? 'var(--blue-light)' : 'var(--white)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'all .18s',
                  color: isComparing ? 'var(--blue)' : 'var(--muted)',
                  flexShrink: 0,
                }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </button>
            )}

            <button
              style={{
                padding: '8px 16px', background: 'var(--blue)', color: '#fff',
                border: 'none', borderRadius: 'var(--r-full)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
              Ver vuelo <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}