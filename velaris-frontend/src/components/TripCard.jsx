// ================================================================
// VELARIS — TripCard.jsx  (src/components/TripCard.jsx)
// ================================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Calendar, Plane, Moon } from 'lucide-react';
import { favoritesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const IMGS = {
  playa:     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  ciudad:    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80',
  aventura:  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  cultura:   'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
  naturaleza:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  default:   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
};

const TYPE_CONFIG = {
  vuelo: {
    icon:  <Plane size={10} />,
    label: 'Vuelo',
    bg:    'rgba(28,78,120,0.85)',
    color: '#fff',
  },
  escapada: {
    icon:  <Moon size={10} />,
    label: 'Escapada',
    bg:    'rgba(45,106,79,0.85)',
    color: '#fff',
  },
};

function getImg(trip) {
  const first = trip.imageUrl?.split(',')[0]?.trim();
  if (first?.startsWith('http')) return first;
  return IMGS[trip.category?.toLowerCase()] || IMGS.default;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' });
}

export default function TripCard({ trip, isFav: initFav = false, onUnfav, onCompare, isComparing }) {
  const { isAuth } = useAuth();
  const [fav,  setFav]  = useState(initFav);
  const [busy, setBusy] = useState(false);

  const toggleFav = async e => {
    e.preventDefault();
    if (!isAuth || busy) return;
    setBusy(true);
    try {
      if (fav) {
        await favoritesApi.remove(trip.id);
        setFav(false);
        onUnfav?.(trip.id);
      } else {
        await favoritesApi.add(trip.id);
        setFav(true);
      }
    } catch {}
    setBusy(false);
  };

  const seatsLow = trip.availableSeats < 5;
  const typeConf = TYPE_CONFIG[trip.type];

  const subtitle = trip.type === 'vuelo'
    ? `${trip.airline || ''}${trip.flightNumber ? ' · ' + trip.flightNumber : ''}`
    : trip.type === 'escapada'
    ? `${trip.hotelName || trip.destination}${trip.hotelStars ? ' · ' + '★'.repeat(trip.hotelStars) : ''}`
    : trip.destination;

  const infoLine = trip.type === 'vuelo'
    ? trip.cabinClass
        ? trip.cabinClass.charAt(0).toUpperCase() + trip.cabinClass.slice(1)
        : null
    : trip.type === 'escapada'
    ? `${trip.durationDays} ${trip.durationDays === 1 ? 'noche' : 'noches'}`
    : trip.durationDays
    ? `${trip.durationDays} días`
    : null;

  return (
    <Link to={`/trips/${trip.id}`} className="trip-card">
      <div className="trip-card__img-wrap">
        <img src={getImg(trip)} alt={trip.title} className="trip-card__img" loading="lazy" />

        {typeConf && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 4,
            background: typeConf.bg, color: typeConf.color,
            fontSize: 10, fontWeight: 700, padding: '3px 9px',
            borderRadius: 'var(--r-full)', backdropFilter: 'blur(4px)',
            letterSpacing: '.04em', textTransform: 'uppercase',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {typeConf.icon} {typeConf.label}
          </span>
        )}

        {trip.availableSeats === 0 && (
          <span className="trip-card__badge trip-card__badge--soldout"
            style={{ top: typeConf ? 40 : 12, left: 12, bottom: 'auto', right: 'auto' }}>
            Agotado
          </span>
        )}

        {seatsLow && trip.availableSeats > 0 && (
          <span className="trip-card__badge trip-card__badge--last">
            ¡Últimas {trip.availableSeats} plazas!
          </span>
        )}

        {!typeConf && trip.category && (
          <span className="trip-card__badge" style={{ bottom: 12, left: 12, top: 'auto', right: 'auto' }}>
            {trip.category}
          </span>
        )}

        {trip.type === 'vuelo' && trip.includesHotel && (
          <span style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'rgba(21,128,61,0.85)', color: '#fff',
            fontSize: 10, fontWeight: 700, padding: '3px 9px',
            borderRadius: 'var(--r-full)', backdropFilter: 'blur(4px)',
          }}>
            + Hotel
          </span>
        )}

        {trip.type === 'escapada' && trip.highlight && (
          <span style={{
            position: 'absolute', bottom: 12, left: 12, right: 40,
            background: 'rgba(255,255,255,0.92)', color: 'var(--ink)',
            fontSize: 10, fontWeight: 600, padding: '3px 9px',
            borderRadius: 'var(--r-full)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            ✦ {trip.highlight}
          </span>
        )}

        {isAuth && (
          <button
            className={`trip-card__fav-btn ${fav ? 'trip-card__fav-btn--active' : ''}`}
            onClick={toggleFav}
            aria-label="Favorito">
            <Heart size={15} fill={fav ? 'currentColor' : 'none'} color={fav ? '#1C4E78' : '#666'} />
          </button>
        )}
      </div>

      <div className="trip-card__body">
        <div className="trip-card__dest">
          <MapPin size={12} />
          <span>{subtitle || trip.destination}</span>
          {trip.type === 'vuelo' && trip.origin && (
            <span style={{ color:'var(--ink3)' }}> · desde {trip.origin}</span>
          )}
        </div>

        <div className="trip-card__title">{trip.title}</div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '.75rem',
          fontSize: 13, color: 'var(--muted)', marginBottom: '.5rem',
        }}>
          {trip.departureDate && (
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}>
              <Calendar size={12} />
              {fmtDate(trip.departureDate)}
            </span>
          )}
          {infoLine && <span>· {infoLine}</span>}
        </div>

        <div className="trip-card__footer">
          <div>
            <div className="trip-card__price-sub">desde</div>
            <div className="trip-card__price">
              €{Number(trip.price).toLocaleString('es-ES')}
            </div>
            <div className="trip-card__price-sub">
              {trip.type === 'vuelo' ? '/ billete' : '/ persona'}
            </div>
          </div>

          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {/* Botón comparar */}
            {onCompare && (
              <button
                onClick={e => { e.preventDefault(); onCompare(trip); }}
                title={isComparing ? 'Quitar de comparación' : 'Añadir a comparación'}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
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

            {/* Botón CTA */}
            <div className="trip-card__cta" onClick={e => e.preventDefault()}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}