// ================================================================
// VELARIS — EscapadaCard.jsx
// ================================================================
import { MapPin, Coffee, Utensils, UtensilsCrossed, Sparkles, ArrowRight, Moon, Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MEAL_LABELS = {
  sin_comidas:   'Solo alojamiento',
  desayuno:      'Desayuno incluido',
  media_pension: 'Media pensión',
  todo_incluido: 'Todo incluido',
};

export const MEAL_ICONS = {
  sin_comidas:   <UtensilsCrossed size={12} />,
  desayuno:      <Coffee size={12} />,
  media_pension: <Utensils size={12} />,
  todo_incluido: <Sparkles size={12} />,
};

const MEAL_COLORS = {
  sin_comidas:   { bg: 'var(--paper2)',    color: 'var(--ink2)' },
  desayuno:      { bg: '#fef9c3',           color: '#854d0e' },
  media_pension: { bg: 'var(--blue-light)', color: 'var(--blue)' },
  todo_incluido: { bg: '#dcfce7',           color: '#15803d' },
};

function StarRating({ stars }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array(5).fill(0).map((_, i) => (
        <span key={i} style={{ fontSize: 12, color: i < stars ? '#f59e0b' : 'var(--paper3)' }}>★</span>
      ))}
    </div>
  );
}

export default function EscapadaCard({ trip, onCompare, isComparing }) {
  const navigate = useNavigate();
  const img    = trip.imageUrl?.split(',')[0]?.trim() || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  const meal   = MEAL_COLORS[trip.mealPlan] || MEAL_COLORS.sin_comidas;
  const nights = trip.durationDays || 1;

  return (
    <div
      onClick={() => navigate(`/trips/${trip.id}`)}
      style={{
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', overflow: 'hidden', cursor: 'pointer',
        transition: 'transform .2s, box-shadow .2s',
        boxShadow: '0 1px 4px rgba(0,0,0,.05)',
        display: 'flex', flexDirection: 'column',
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
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0 }}>
        <img src={img} alt={trip.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(17,16,8,.55) 0%, transparent 55%)',
        }} />

        {/* Noches badge */}
        <span style={{
          position: 'absolute', top: 12, left: 12,
          padding: '4px 10px', borderRadius: 'var(--r-full)',
          fontSize: 11, fontWeight: 700,
          background: 'rgba(17,16,8,.55)', backdropFilter: 'blur(6px)',
          color: '#fff', border: '1px solid rgba(255,255,255,.15)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Moon size={10} /> {nights} {nights === 1 ? 'noche' : 'noches'}
        </span>

        {/* Highlight badge */}
        {trip.highlight && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            padding: '4px 10px', borderRadius: 'var(--r-full)',
            fontSize: 10, fontWeight: 700,
            background: 'rgba(255,255,255,.92)', color: 'var(--ink)',
            maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            ✨ {trip.highlight}
          </span>
        )}

        {/* Destino */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          display: 'flex', alignItems: 'center', gap: 5, color: '#fff',
        }}>
          <MapPin size={13} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
            {trip.destination?.split(',')[0]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>

        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
          color: 'var(--ink)', marginBottom: '.4rem',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {trip.title}
        </h3>

        {trip.hotelName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '.6rem' }}>
            <Hotel size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--muted)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trip.hotelName}
            </span>
            {trip.hotelStars && <StarRating stars={trip.hotelStars} />}
          </div>
        )}

        {trip.mealPlan && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 'var(--r-full)',
            fontSize: 11, fontWeight: 600,
            background: meal.bg, color: meal.color,
            border: '1px solid rgba(0,0,0,.07)',
            marginBottom: '.75rem', alignSelf: 'flex-start',
          }}>
            {MEAL_ICONS[trip.mealPlan]} {MEAL_LABELS[trip.mealPlan]}
          </span>
        )}

        <p style={{
          fontSize: 13, color: 'var(--ink2)', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: '.9rem', flex: 1,
        }}>
          {trip.description}
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid var(--border)', paddingTop: '.85rem', marginTop: 'auto',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>desde / persona</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>
              {Number(trip.price).toLocaleString('es-ES')}€
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Botón comparar */}
            {onCompare && (
              <button
                onClick={e => { e.stopPropagation(); onCompare(trip); }}
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

            {/* Botón ver */}
            <button
              style={{
                padding: '8px 16px', background: 'var(--blue)', color: '#fff',
                border: 'none', borderRadius: 'var(--r-full)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
              Ver escapada <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}