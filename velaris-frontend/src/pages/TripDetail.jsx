// ================================================================
// VELARIS — TripDetail.jsx
// ================================================================
import { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Calendar, Clock, Users, Star, ArrowLeft,
  Shield, Heart, Share2, CheckCircle, Plane, Wifi,
  Coffee, Camera, ChevronDown, ChevronUp, Sparkles,
  Hotel, Utensils, Moon, Tag, AlertCircle
} from 'lucide-react';
import { tripsApi, reviewsApi, favoritesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import VeraSuggestions from '../components/VeraSuggestions';

const IMGS = {
  playa:    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=90',
  ciudad:   'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1400&q=90',
  aventura: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=90',
  cultura:  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&q=90',
  default:  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=90',
};

const MEAL_LABELS = {
  sin_comidas:   'Solo alojamiento',
  desayuno:      'Desayuno incluido',
  media_pension: 'Media pensión',
  todo_incluido: 'Todo incluido',
};

const CABIN_LABELS = {
  turista:  'Clase Turista',
  business: 'Clase Business',
  primera:  'Primera Clase',
};

// Includes dinámicos según tipo
function getIncludes(trip) {
  if (trip.type === 'vuelo') {
    return [
      { icon: <Plane size={16}/>,       text: `${trip.airline || 'Vuelo'} ${trip.flightNumber || ''}`.trim() },
      { icon: <Tag size={16}/>,         text: CABIN_LABELS[trip.cabinClass] || 'Clase Turista' },
      { icon: <Shield size={16}/>,      text: 'Seguro de viaje' },
      { icon: <CheckCircle size={16}/>, text: 'Equipaje de mano' },
      ...(trip.includesHotel ? [{ icon: <Hotel size={16}/>, text: 'Hotel incluido' }] : []),
    ];
  }
  if (trip.type === 'escapada') {
    return [
      { icon: <Hotel size={16}/>,       text: trip.hotelName || 'Hotel seleccionado' },
      { icon: <Moon size={16}/>,        text: `${trip.durationDays} ${trip.durationDays === 1 ? 'noche' : 'noches'}` },
      { icon: <Utensils size={16}/>,    text: MEAL_LABELS[trip.mealPlan] || 'Alojamiento' },
      { icon: <Shield size={16}/>,      text: 'Seguro de viaje' },
      { icon: <CheckCircle size={16}/>, text: 'Traslados incluidos' },
      ...(trip.highlight ? [{ icon: <Sparkles size={16}/>, text: trip.highlight }] : []),
    ];
  }
  // viaje normal
  return [
    { icon: <Plane size={16}/>,       text: 'Vuelo de ida y vuelta' },
    { icon: <Coffee size={16}/>,      text: 'Desayuno incluido' },
    { icon: <Wifi size={16}/>,        text: 'Wifi en el hotel' },
    { icon: <Camera size={16}/>,      text: 'Guía turístico' },
    { icon: <Shield size={16}/>,      text: 'Seguro de viaje' },
    { icon: <CheckCircle size={16}/>, text: 'Traslados incluidos' },
  ];
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
}
function fmtDateShort(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day:'numeric', month:'short' });
}

function StarRating({ value, onChange, hover, onHover }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onHover?.(s)}
          onMouseLeave={() => onHover?.(0)}
          style={{
            fontSize:'1.75rem', cursor: onChange ? 'pointer' : 'default',
            color: s <= (hover || value) ? 'var(--gold)' : 'var(--paper3)',
            transition: 'color .12s',
          }}>★</span>
      ))}
    </div>
  );
}

function HotelStars({ count }) {
  return (
    <span style={{ color:'#f59e0b', fontSize:14 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  );
}

export default function TripDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { isAuth } = useAuth();

  const [trip, setTrip]       = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav]     = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [shared, setShared]   = useState(false);

  const [travelers, setTravelers] = useState(1);
  const [notes, setNotes]         = useState('');
  const [booking, setBooking]     = useState(false);
  const [booked, setBooked]       = useState(false);
  const [bookErr, setBookErr]     = useState('');

  const [stars, setStars]         = useState(5);
  const [starHover, setStarHover] = useState(0);
  const [comment, setComment]     = useState('');
  const [revLoad, setRevLoad]     = useState(false);
  const [revDone, setRevDone]     = useState(false);

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setBooked(false);
    setRevDone(false);

    const requests = [
      tripsApi.getById(id),
      tripsApi.getSimilar(id),
      reviewsApi.getByTrip(id),
      reviewsApi.getRating(id),
    ];
    if (isAuth) requests.push(favoritesApi.getAll());

    Promise.all(requests)
      .then(([t, s, r, rat, favs]) => {
        setTrip(t.data);
        setSimilar(s.data?.slice(0, 3) || []);
        setReviews(r.data?.content || []);
        setRating(rat.data);
        if (favs) setIsFav((favs.data || []).some(f => String(f.id) === String(id)));
      })
      .catch(() => navigate('/trips'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFav = async () => {
    if (!isAuth) return navigate('/login');
    setFavBusy(true);
    try {
      if (isFav) { await favoritesApi.remove(id); setIsFav(false); }
      else        { await favoritesApi.add(id);    setIsFav(true);  }
    } catch {}
    setFavBusy(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleBook = () => {
  if (!isAuth) return navigate('/login');
  navigate(`/checkout/${id}?travelers=${travelers}&notes=${encodeURIComponent(notes)}`);
  };

  const handleReview = async e => {
    e.preventDefault();
    if (!isAuth) return navigate('/login');
    setRevLoad(true);
    try {
      const { data } = await reviewsApi.create({ tripId: Number(id), rating: stars, comment });
      setReviews(prev => [data, ...prev]);
      setComment(''); setRevDone(true);
    } catch {}
    setRevLoad(false);
  };

  if (loading) return (
    <div style={{ minHeight:'100vh' }}>
      <div style={{ height:500, background:'var(--paper2)', animation:'pulse 1.5s ease infinite' }} />
      <div className="container" style={{ paddingTop:'2rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'2rem' }}>
          <div style={{ height:400, background:'var(--paper2)', animation:'pulse 1.5s ease infinite', borderRadius:'var(--r-xl)' }} />
          <div style={{ height:400, background:'var(--paper2)', animation:'pulse 1.5s ease infinite', borderRadius:'var(--r-xl)' }} />
        </div>
      </div>
    </div>
  );

  if (!trip) return null;

  const isVuelo    = trip.type === 'vuelo';
  const isEscapada = trip.type === 'escapada';
  const isViaje    = !isVuelo && !isEscapada;

  const imgSrc = trip.imageUrl?.split(',')[0]?.trim() ||
    IMGS[trip.category?.toLowerCase()] || IMGS.default;

  const totalPrice  = (Number(trip.price) * travelers).toLocaleString('es-ES');
  const descLong    = trip.description?.length > 300;
  const displayDesc = descLong && !descExpanded
    ? trip.description.slice(0, 300) + '...'
    : trip.description;
  const seatsLow = trip.availableSeats > 0 && trip.availableSeats < 5;
  const soldOut  = trip.availableSeats === 0;
  const includes = getIncludes(trip);

  // Breadcrumb back link según tipo
  const backLink  = isVuelo ? '/flights' : isEscapada ? '/escapadas' : '/trips';
  const backLabel = isVuelo ? 'Vuelos'   : isEscapada ? 'Escapadas'  : 'Destinos';

  // Label del tipo para el badge
  const typeLabel = isVuelo ? 'Vuelo' : isEscapada ? 'Escapada' : trip.category;
  const typeColor = isVuelo
    ? { bg:'rgba(28,78,120,0.25)', color:'#fff' }
    : isEscapada
    ? { bg:'rgba(45,106,79,0.3)', color:'#fff' }
    : { bg:'rgba(255,255,255,0.2)', color:'#fff' };

  // Quick stats según tipo
  const quickStats = [
    ...(isVuelo ? [
      { label:'Aerolínea',  val: trip.airline || '—' },
      { label:'Vuelo',      val: trip.flightNumber || '—' },
      { label:'Clase',      val: CABIN_LABELS[trip.cabinClass] || 'Turista' },
      { label:'Fecha',      val: fmtDateShort(trip.departureDate) },
      { label:'Plazas',     val: soldOut ? 'Agotado' : `${trip.availableSeats}`, danger: soldOut, warn: seatsLow },
    ] : isEscapada ? [
      { label:'Hotel',      val: trip.hotelName || '—' },
      { label:'Estrellas',  val: trip.hotelStars ? '★'.repeat(trip.hotelStars) : '—' },
      { label:'Régimen',    val: MEAL_LABELS[trip.mealPlan] || '—' },
      { label:'Noches',     val: `${trip.durationDays}` },
      { label:'Plazas',     val: soldOut ? 'Agotado' : `${trip.availableSeats}`, danger: soldOut, warn: seatsLow },
    ] : [
      { label:'Salida',     val: fmtDateShort(trip.departureDate) },
      { label:'Regreso',    val: fmtDateShort(trip.returnDate) },
      { label:'Duración',   val: `${trip.durationDays} días` },
      { label:'Plazas',     val: soldOut ? 'Agotado' : `${trip.availableSeats} disponibles`, danger: soldOut, warn: seatsLow },
      ...(rating?.total > 0 ? [{ label:'Valoración', val: `${rating.average?.toFixed(1)} ★` }] : []),
    ]),
  ];

  return (
    <div>
      {/* ── HERO ── */}
      {/* ── HERO ── */}
<div style={{
  position: 'relative',
  height: 600,
  overflow: 'hidden',
  marginTop: 'calc(-1 * var(--nav-h))',
}}>
        <img src={imgSrc} alt={trip.title}
          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 40%' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(17,16,8,0.7) 0%, rgba(17,16,8,0.1) 50%, transparent 100%)' }} />

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          position:'absolute', top:24, left:24, width:42, height:42, borderRadius:'50%',
          background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)',
          border:'1px solid rgba(255,255,255,0.25)', color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', transition:'all .2s',
        }}>
          <ArrowLeft size={18} />
        </button>

        {/* Fav + Share */}
        <div style={{ position:'absolute', top:24, right:24, display:'flex', gap:8 }}>
          <button onClick={toggleFav} disabled={favBusy} style={{
            width:42, height:42, borderRadius:'50%',
            background: isFav ? 'var(--blue)' : 'rgba(255,255,255,0.15)',
            backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,0.25)', color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'all .2s',
          }}>
            <Heart size={18} fill={isFav ? '#fff' : 'none'} />
          </button>
          <button onClick={handleShare} title={shared ? '¡Enlace copiado!' : 'Compartir'} style={{
            width:42, height:42, borderRadius:'50%',
            background: shared ? 'var(--blue)' : 'rgba(255,255,255,0.15)',
            backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,0.25)', color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'all .2s',
          }}>
            {shared ? <CheckCircle size={18} /> : <Share2 size={18} />}
          </button>
        </div>

        {/* Info hero */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'2rem' }}>
          <div className="container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                {/* Badge tipo */}
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  background: typeColor.bg, backdropFilter:'blur(4px)',
                  border:'1px solid rgba(255,255,255,0.3)', color: typeColor.color,
                  fontSize:11, fontWeight:700, padding:'4px 14px',
                  borderRadius:'var(--r-full)', textTransform:'uppercase',
                  letterSpacing:'.06em', marginBottom:'.75rem',
                }}>
                  {isVuelo && <Plane size={11} />}
                  {isEscapada && <Moon size={11} />}
                  {typeLabel}
                </span>

                <h1 style={{
                  fontFamily:'var(--font-display)',
                  fontSize:'clamp(1.8rem,4vw,2.8rem)',
                  fontWeight:700, color:'#fff',
                  lineHeight:1.15, marginBottom:'.5rem',
                }}>
                  {trip.title}
                </h1>

                {/* Subtítulo según tipo */}
                {isVuelo ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.8)', fontSize:15 }}>
                    <MapPin size={14} />
                    <span>{trip.origin}</span>
                    <Plane size={13} style={{ opacity:.7 }} />
                    <span style={{ fontWeight:600, color:'#fff' }}>{trip.destination?.split(',')[0]}</span>
                    {trip.airline && <span style={{ opacity:.6 }}>· {trip.airline}</span>}
                  </div>
                ) : isEscapada ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.8)', fontSize:15 }}>
                    <Hotel size={14} />
                    <span>{trip.hotelName || trip.destination}</span>
                    {trip.hotelStars && (
                      <span style={{ color:'#f59e0b', fontSize:13 }}>{'★'.repeat(trip.hotelStars)}</span>
                    )}
                    <span style={{ opacity:.5 }}>·</span>
                    <MapPin size={13} />
                    <span>{trip.destination?.split(',')[0]}</span>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.8)', fontSize:15 }}>
                    <MapPin size={14} />
                    <span>{trip.origin || 'España'}</span>
                    <span style={{ opacity:.5 }}>→</span>
                    <span style={{ fontWeight:600, color:'#fff' }}>{trip.destination}</span>
                  </div>
                )}
              </div>

              {/* Precio hero */}
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)', marginBottom:2 }}>desde</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'2.5rem', fontWeight:900, color:'#fff', lineHeight:1 }}>
                  €{Number(trip.price).toLocaleString('es-ES')}
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)' }}>
                  {isVuelo ? 'por billete' : isEscapada ? 'por persona' : 'por persona'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK INFO BAR ── */}
      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--border)', padding:'.875rem 0' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            {/* Breadcrumb */}
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--muted)' }}>
              <Link to="/" style={{ color:'var(--muted)', textDecoration:'none' }}>Inicio</Link>
              <span>/</span>
              <Link to={backLink} style={{ color:'var(--muted)', textDecoration:'none' }}>{backLabel}</Link>
              <span>/</span>
              <span style={{ color:'var(--ink)', fontWeight:500 }}>{trip.destination?.split(',')[0]}</span>
            </div>

            {/* Quick stats */}
            <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
              {quickStats.map((s, i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ink3)', marginBottom:2 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color: s.danger ? 'var(--danger)' : s.warn ? 'var(--warning)' : 'var(--ink)' }}>
                    {s.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="container" style={{ paddingTop:'2.5rem', paddingBottom:'5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'2.5rem', alignItems:'start' }}>

          {/* ── COLUMNA IZQUIERDA ── */}
          <div>

            {/* Ficha específica de VUELO */}
            {isVuelo && (
              <div style={{ marginBottom:'2rem', padding:'1.5rem', background:'var(--blue-light)', borderRadius:'var(--r-xl)', border:'1px solid rgba(28,78,120,0.15)' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem', color:'var(--blue)', display:'flex', alignItems:'center', gap:8 }}>
                  <Plane size={18} /> Información del vuelo
                </h2>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  {[
                    { label:'Aerolínea',       val: trip.airline || '—' },
                    { label:'Número de vuelo', val: trip.flightNumber || '—' },
                    { label:'Clase',           val: CABIN_LABELS[trip.cabinClass] || 'Turista' },
                    { label:'Fecha de salida', val: fmtDate(trip.departureDate) },
                    { label:'Origen',          val: trip.origin || '—' },
                    { label:'Destino',         val: trip.destination || '—' },
                  ].map((f, i) => (
                    <div key={i} style={{ background:'var(--white)', borderRadius:'var(--r-md)', padding:'10px 14px', border:'1px solid rgba(28,78,120,0.1)' }}>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--blue)', opacity:.7, marginBottom:4 }}>{f.label}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)' }}>{f.val}</div>
                    </div>
                  ))}
                </div>
                {trip.includesHotel && (
                  <div style={{ marginTop:'1rem', padding:'10px 14px', background:'var(--white)', borderRadius:'var(--r-md)', border:'1px solid rgba(28,78,120,0.1)', display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, color:'var(--blue)' }}>
                    <Hotel size={15} /> Este vuelo incluye hotel en destino
                  </div>
                )}
              </div>
            )}

            {/* Ficha específica de ESCAPADA */}
            {isEscapada && (
              <div style={{ marginBottom:'2rem', padding:'1.5rem', background:'#f0fdf4', borderRadius:'var(--r-xl)', border:'1px solid #bbf7d0' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem', color:'#15803d', display:'flex', alignItems:'center', gap:8 }}>
                  <Hotel size={18} /> Información del alojamiento
                </h2>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  {[
                    { label:'Hotel',     val: trip.hotelName || '—' },
                    { label:'Categoría', val: trip.hotelStars ? <HotelStars count={trip.hotelStars} /> : '—' },
                    { label:'Régimen',   val: MEAL_LABELS[trip.mealPlan] || '—' },
                    { label:'Noches',    val: `${trip.durationDays} ${trip.durationDays === 1 ? 'noche' : 'noches'}` },
                    { label:'Destino',   val: trip.destination || '—' },
                    { label:'Salida',    val: fmtDate(trip.departureDate) },
                  ].map((f, i) => (
                    <div key={i} style={{ background:'var(--white)', borderRadius:'var(--r-md)', padding:'10px 14px', border:'1px solid #bbf7d0' }}>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'#15803d', opacity:.7, marginBottom:4 }}>{f.label}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)' }}>{f.val}</div>
                    </div>
                  ))}
                </div>
                {trip.highlight && (
                  <div style={{ marginTop:'1rem', padding:'10px 14px', background:'var(--white)', borderRadius:'var(--r-md)', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, color:'#15803d' }}>
                    <Sparkles size={15} /> {trip.highlight}
                  </div>
                )}
              </div>
            )}

            {/* Descripción */}
            {trip.description && (
              <div style={{ marginBottom:'2.5rem' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, marginBottom:'1rem', color:'var(--ink)' }}>
                  {isVuelo ? 'Sobre este vuelo' : isEscapada ? 'Sobre esta escapada' : 'Sobre este viaje'}
                </h2>
                <p style={{ fontSize:15, lineHeight:1.8, color:'var(--ink2)', fontWeight:300 }}>
                  {displayDesc}
                </p>
                {/* ── VERA SUGGESTIONS ── */}
                <VeraSuggestions trip={trip} />
                {descLong && (
                  <button onClick={() => setDescExpanded(!descExpanded)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--blue)', fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:5, marginTop:'.75rem', padding:0 }}>
                    {descExpanded ? <><ChevronUp size={16}/> Ver menos</> : <><ChevronDown size={16}/> Leer más</>}
                  </button>
                )}
              </div>
            )}

            {/* Qué incluye */}
            <div style={{ marginBottom:'2.5rem', padding:'1.75rem', background:'var(--paper2)', borderRadius:'var(--r-xl)', border:'1px solid var(--border)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, marginBottom:'1.25rem', color:'var(--ink)' }}>
                ¿Qué incluye?
              </h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                {includes.map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'var(--ink)' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--success-bg)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--success)', flexShrink:0 }}>
                      {item.icon}
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Política cancelación — solo viajes y escapadas */}
            {!isVuelo && (
              <div style={{ marginBottom:'2.5rem', padding:'1.25rem 1.5rem', background:'var(--blue-light)', borderRadius:'var(--r-lg)', border:'1px solid rgba(28,78,120,0.15)', display:'flex', gap:14, alignItems:'flex-start' }}>
                <Shield size={22} color="var(--blue)" style={{ flexShrink:0, marginTop:2 }} />
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--blue)', marginBottom:4 }}>
                    Cancelación flexible incluida
                  </div>
                  <div style={{ fontSize:13, color:'var(--blue)', opacity:.75, lineHeight:1.6 }}>
                    Cancela hasta 48 horas antes de la salida sin coste. Cambios de fecha gratuitos hasta 7 días antes.
                  </div>
                </div>
              </div>
            )}

            {/* Aviso vuelo — política específica */}
            {isVuelo && (
              <div style={{ marginBottom:'2.5rem', padding:'1.25rem 1.5rem', background:'#fef9c3', borderRadius:'var(--r-lg)', border:'1px solid #fde68a', display:'flex', gap:14, alignItems:'flex-start' }}>
                <AlertCircle size={22} color="#854d0e" style={{ flexShrink:0, marginTop:2 }} />
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:'#854d0e', marginBottom:4 }}>
                    Política de cambios y cancelación
                  </div>
                  <div style={{ fontSize:13, color:'#854d0e', opacity:.85, lineHeight:1.6 }}>
                    Los vuelos pueden modificarse hasta 24 horas antes de la salida. Las cancelaciones están sujetas a las condiciones de la aerolínea.
                  </div>
                </div>
              </div>
            )}

            {/* Consejo Vera */}
            <div style={{ marginBottom:'2.5rem', padding:'1.25rem 1.5rem', background:'var(--ink)', borderRadius:'var(--r-lg)', display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Sparkles size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'rgba(250,250,248,0.5)', marginBottom:4, letterSpacing:'.06em', textTransform:'uppercase' }}>
                  Consejo de Vera IA
                </div>
                <div style={{ fontSize:14, color:'rgba(250,250,248,0.85)', lineHeight:1.6, fontStyle:'italic' }}>
                  {isVuelo
                    ? `"Reserva con al menos 3 semanas de antelación para conseguir el mejor precio en este vuelo con ${trip.airline || 'la aerolínea'}."`
                    : isEscapada
                    ? `"Esta escapada a ${trip.destination?.split(',')[0]} es perfecta para un fin de semana de desconexión. ${trip.highlight ? trip.highlight + '.' : ''} ¡No esperes más para reservar!"`
                    : `"Este destino es especialmente recomendable entre ${trip.departureDate ? new Date(trip.departureDate).toLocaleDateString('es-ES', { month:'long' }) : 'primavera y otoño'}. Reserva con antelación para asegurarte las mejores plazas."`
                  }
                </div>
              </div>
            </div>

            {/* Valoraciones */}
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:'2.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, color:'var(--ink)' }}>
                  Valoraciones
                </h2>
                {rating?.total > 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'.5rem 1rem', background:'var(--paper2)', borderRadius:'var(--r-full)', border:'1px solid var(--border)' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'var(--ink)' }}>
                      {rating.average?.toFixed(1)}
                    </span>
                    <span style={{ color:'var(--gold)', fontSize:'1rem' }}>{'★'.repeat(Math.round(rating.average || 0))}</span>
                    <span style={{ fontSize:13, color:'var(--muted)' }}>{rating.total} {rating.total === 1 ? 'reseña' : 'reseñas'}</span>
                  </div>
                )}
              </div>

              {isAuth && !revDone && (
                <form onSubmit={handleReview}
                  style={{ padding:'1.5rem', background:'var(--paper2)', borderRadius:'var(--r-xl)', border:'1px solid var(--border)', marginBottom:'1.5rem' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, marginBottom:'1rem', color:'var(--ink)' }}>
                    Comparte tu experiencia
                  </div>
                  <StarRating value={stars} onChange={setStars} hover={starHover} onHover={setStarHover} />
                  <textarea className="input" rows={3} required
                    style={{ marginTop:'1rem', marginBottom:'1rem', resize:'vertical', minHeight:80 }}
                    placeholder="Cuéntanos qué te pareció..."
                    value={comment}
                    onChange={e => setComment(e.target.value)} />
                  <button type="submit" className="btn btn--primary btn--sm" disabled={revLoad}>
                    {revLoad ? 'Publicando...' : 'Publicar valoración'}
                  </button>
                </form>
              )}

              {revDone && (
                <div style={{ padding:'1rem 1.25rem', background:'var(--success-bg)', borderRadius:'var(--r-lg)', color:'var(--success)', fontSize:14, fontWeight:500, display:'flex', alignItems:'center', gap:8, marginBottom:'1.5rem' }}>
                  <CheckCircle size={16} /> ¡Valoración publicada! Gracias por tu opinión.
                </div>
              )}

              {!isAuth && (
                <div style={{ padding:'1rem 1.25rem', background:'var(--paper2)', borderRadius:'var(--r-lg)', fontSize:14, color:'var(--muted)', marginBottom:'1.5rem', textAlign:'center' }}>
                  <Link to="/login" style={{ color:'var(--blue)', fontWeight:600 }}>Inicia sesión</Link> para dejar una valoración
                </div>
              )}

              {reviews.length === 0 ? (
                <div style={{ textAlign:'center', padding:'2.5rem', color:'var(--muted)', background:'var(--paper2)', borderRadius:'var(--r-xl)', border:'1px solid var(--border)' }}>
                  <Star size={28} color="var(--gold)" style={{ margin:'0 auto .75rem' }} />
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:4 }}>Sin valoraciones aún</div>
                  <div style={{ fontSize:13 }}>Sé el primero en valorar</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ background:'var(--white)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', padding:'1.25rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.75rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--blue)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, flexShrink:0 }}>
                            {r.userName?.[0]?.toUpperCase() || 'V'}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:14, color:'var(--ink)' }}>{r.userName || 'Viajero'}</div>
                            <div style={{ fontSize:12, color:'var(--muted)' }}>
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' }) : ''}
                            </div>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <span style={{ color:'var(--gold)', fontSize:'1rem' }}>{'★'.repeat(r.rating)}</span>
                          <span style={{ color:'var(--paper3)', fontSize:'1rem' }}>{'★'.repeat(5 - r.rating)}</span>
                        </div>
                      </div>
                      {r.comment && (
                        <p style={{ fontSize:14, lineHeight:1.65, color:'var(--ink2)', fontStyle:'italic', margin:0 }}>
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── BOOKING BOX ── */}
          <aside>
            <div style={{
              background:'var(--white)', borderRadius:'var(--r-xl)',
              border:'1px solid var(--border)', padding:'1.75rem',
              boxShadow:'var(--shadow-lg)',
              position:'sticky', top:'calc(var(--nav-h) + 1rem)',
            }}>
              {/* Precio */}
              <div style={{ marginBottom:'1.25rem', paddingBottom:'1.25rem', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:12, color:'var(--muted)', marginBottom:2 }}>
                  {isVuelo ? 'Precio por billete' : 'Precio por persona'}
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'2.2rem', fontWeight:900, color:'var(--ink)', lineHeight:1 }}>
                  €{Number(trip.price).toLocaleString('es-ES')}
                </div>
                {seatsLow && !soldOut && (
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:8, fontSize:12, fontWeight:600, color:'var(--warning)', background:'var(--warning-bg)', padding:'4px 10px', borderRadius:'var(--r-full)', width:'fit-content' }}>
                    ¡Solo quedan {trip.availableSeats} plazas!
                  </div>
                )}
              </div>

              {!booked ? (
                <>
                  {/* Info resumida según tipo */}
                  {isVuelo ? (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1rem' }}>
                      {[
                        { label:'Aerolínea',  val: trip.airline || '—' },
                        { label:'Vuelo',      val: trip.flightNumber || '—' },
                        { label:'Clase',      val: CABIN_LABELS[trip.cabinClass] || 'Turista' },
                        { label:'Fecha',      val: fmtDateShort(trip.departureDate) },
                      ].map(f => (
                        <div key={f.label} style={{ padding:'10px 12px', background:'var(--paper2)', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
                          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginBottom:3 }}>{f.label}</div>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--ink)' }}>{f.val}</div>
                        </div>
                      ))}
                    </div>
                  ) : isEscapada ? (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1rem' }}>
                      {[
                        { label:'Hotel',   val: trip.hotelName?.split(' ').slice(0,2).join(' ') || '—' },
                        { label:'Noches',  val: `${trip.durationDays}` },
                        { label:'Régimen', val: MEAL_LABELS[trip.mealPlan]?.split(' ')[0] || '—' },
                        { label:'Entrada', val: fmtDateShort(trip.departureDate) },
                      ].map(f => (
                        <div key={f.label} style={{ padding:'10px 12px', background:'var(--paper2)', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
                          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginBottom:3 }}>{f.label}</div>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--ink)' }}>{f.val}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1rem' }}>
                      {[
                        { label:'Salida',  val: fmtDateShort(trip.departureDate) },
                        { label:'Regreso', val: fmtDateShort(trip.returnDate) },
                      ].map(f => (
                        <div key={f.label} style={{ padding:'10px 12px', background:'var(--paper2)', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
                          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginBottom:3 }}>{f.label}</div>
                          <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)' }}>{f.val}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Viajeros */}
                  <div className="form-group">
                    <label>{isVuelo ? 'Número de pasajeros' : 'Número de viajeros'}</label>
                    <select className="input" value={travelers}
                      onChange={e => setTravelers(Number(e.target.value))}
                      disabled={soldOut}>
                      {Array.from({ length: Math.min(trip.availableSeats || 10, 10) }, (_,i) => i+1).map(n => (
                        <option key={n} value={n}>
                          {n} {isVuelo ? (n === 1 ? 'pasajero' : 'pasajeros') : (n === 1 ? 'viajero' : 'viajeros')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notas */}
                  <div className="form-group">
                    <label>Notas (opcional)</label>
                    <textarea className="input" rows={2}
                      placeholder={isVuelo ? 'Preferencia de asiento, menú especial...' : isEscapada ? 'Preferencias de habitación, alergias...' : 'Alergias, preferencias especiales...'}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      style={{ resize:'vertical' }} />
                  </div>

                  {/* Total */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', marginBottom:'1rem' }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'var(--ink)' }}>Total</span>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:700, color:'var(--ink)' }}>€{totalPrice}</span>
                  </div>

                  {bookErr && (
                    <div style={{ color:'var(--danger)', fontSize:13, padding:'8px 12px', background:'var(--danger-bg)', borderRadius:'var(--r-sm)', marginBottom:'.75rem' }}>
                      {bookErr}
                    </div>
                  )}

                  <button className="btn btn--primary"
                    style={{ width:'100%', justifyContent:'center', padding:'14px 24px', fontSize:'1rem', borderRadius:'var(--r-md)' }}
                    onClick={handleBook}
                    disabled={soldOut}>
                    {soldOut ? 'Sin plazas disponibles' :
                    isAuth  ? (isVuelo ? 'Reservar vuelo' : isEscapada ? 'Reservar escapada' : 'Reservar ahora') :
                    'Inicia sesión para reservar'}
                  </button>

                  {!isAuth && (
                    <p style={{ fontSize:12, color:'var(--muted)', textAlign:'center', marginTop:'.75rem' }}>
                      <Link to="/login" style={{ color:'var(--blue)', fontWeight:600 }}>Inicia sesión</Link> o{' '}
                      <Link to="/register" style={{ color:'var(--blue)', fontWeight:600 }}>regístrate gratis</Link>
                    </p>
                  )}

                  {/* Garantías */}
                  <div style={{ marginTop:'1.25rem', display:'flex', flexDirection:'column', gap:8 }}>
                    {(isVuelo ? [
                      'Precio garantizado',
                      'Pago 100% seguro',
                      'Soporte 24/7 con Vera IA',
                    ] : [
                      'Cancelación flexible 48h antes',
                      'Pago 100% seguro',
                      'Soporte 24/7 con Vera IA',
                    ]).map(g => (
                      <div key={g} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--muted)' }}>
                        <CheckCircle size={13} color="var(--success)" />
                        {g}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
                  <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--success-bg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                    <CheckCircle size={28} color="var(--success)" />
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:700, marginBottom:'.5rem', color:'var(--ink)' }}>
                    {isVuelo ? '¡Vuelo reservado!' : isEscapada ? '¡Escapada reservada!' : '¡Reserva confirmada!'}
                  </h3>
                  <p style={{ fontSize:14, color:'var(--muted)', marginBottom:'1.25rem', lineHeight:1.6 }}>
                    Recibirás un email de confirmación en breve. ¡Que disfrutes!
                  </p>
                  <Link to="/bookings" className="btn btn--primary" style={{ width:'100%', justifyContent:'center' }}>
                    Ver mis reservas
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ── SIMILARES ── */}
        {similar.length > 0 && (
          <div style={{ marginTop:'4rem', paddingTop:'3rem', borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'.68rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--gold)', fontWeight:500, marginBottom:'.75rem' }}>
              <span style={{ width:22, height:1, background:'var(--gold)', display:'block' }} />
              Puede interesarte
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:700, marginBottom:'1.75rem', color:'var(--ink)' }}>
              {isVuelo ? 'Otros vuelos' : isEscapada ? 'Otras escapadas' : 'Destinos similares'}
            </h2>
            <div className="trips-grid">
              {similar.map(t => <TripCard key={t.id} trip={t} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}