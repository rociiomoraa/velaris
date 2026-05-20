// ================================================================
// VELARIS — HomePage.jsx  (src/pages/HomePage.jsx)
// ================================================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Shuffle, ArrowRight, Sparkles } from 'lucide-react';
import { tripsApi } from '../api/client';
import TripCard from '../components/TripCard';

const DESTINATIONS = [
  'Bali','Santorini','Maldivas','Kioto','Marrakech',
  'Amalfi','Reykjavik','Patagonia','Dubái','Lisboa',
  'Tailandia','Nueva York','Tokio','Praga','Cancún',
];

const HERO_SLIDES = [
  { src: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=2000&q=90&auto=format&fit=crop', pos: 'center 40%', label: 'Caribe' },
  { src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=2000&q=90&auto=format&fit=crop', pos: 'center 50%', label: 'Kioto' },
  { src: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=2000&q=90&auto=format&fit=crop', pos: 'center 30%', label: 'Aventura' },
  { src: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&q=90&auto=format&fit=crop', pos: 'center 60%', label: 'Dubái' },
  { src: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=2000&q=90&auto=format&fit=crop', pos: 'center 45%', label: 'Santorini' },
];

const CATEGORIES = [
  {
    label: 'Playa', value: 'playa',
    icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21c0-4 2-7 5-9M21 21c0-4-2-7-5-9M12 3c0 5-3 9-3 9s-3-4-3-9a6 6 0 0112 0c0 5-3 9-3 9s-3-4-3-9z"/><path strokeLinecap="round" d="M3 21h18"/></svg>,
  },
  {
    label: 'Ciudad', value: 'ciudad',
    icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21V9l6-6 6 6v12M3 21h18M9 21v-6h6v6"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v18"/></svg>,
  },
  {
    label: 'Aventura', value: 'aventura',
    icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-8 4 4 3-6 4 10"/></svg>,
  },
  {
    label: 'Cultura', value: 'cultura',
    icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  },
];

function Counter({ target, suffix = '' }) {
  const ref = useRef(null);
  const [val, setVal] = useState('0');
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
      let i = 0;
      const id = setInterval(() => {
        i++;
        const v = i >= 40 ? num : Math.round(num * (i / 40));
        setVal(String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + suffix);
        if (i >= 40) clearInterval(id);
      }, 22);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, suffix]);
  return <span ref={ref}>{val}</span>;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [dest, setDest]   = useState('');
  const [date, setDate]   = useState('');
  const [pax,  setPax]    = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rnd, setRnd]     = useState(false);
  const [slide, setSlide] = useState(0);
  const [next,  setNext]  = useState(null); // índice de la siguiente foto
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    tripsApi.getAll({ size: 6, page: 0 })
      .then(r => setTrips(r.data?.content || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  // Precargar todas las imágenes al montar
  useEffect(() => {
    HERO_SLIDES.forEach(s => { const img = new Image(); img.src = s.src; });
  }, []);

  // ── Transición cruzada (crossfade) entre slides ──
  const goToSlide = (i) => {
    if (i === slide || transitioning) return;
    setNext(i);
    setTransitioning(true);
    setTimeout(() => {
      setSlide(i);
      setNext(null);
      setTransitioning(false);
    }, 900);
  };

  useEffect(() => {
    const id = setInterval(() => {
      const nextSlide = (slide + 1) % HERO_SLIDES.length;
      goToSlide(nextSlide);
    }, 5500);
    return () => clearInterval(id);
  }, [slide, transitioning]);

  const handleSearch = e => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (dest) p.set('destination', dest);
    if (date) p.set('from', date);
    if (pax)  p.set('pax', pax);
    navigate(`/trips?${p}`);
  };

  const handleRandom = async () => {
    setRnd(true);
    try { const { data } = await tripsApi.getRandom(); navigate(`/trips/${data.id}`); }
    catch {}
    setRnd(false);
  };

  const current = HERO_SLIDES[slide];
  const nextSlide = next !== null ? HERO_SLIDES[next] : null;

  return (
    <div>
      {/* ── ESTILOS RESPONSIVE INLINE ── */}
      <style>{`
        .home-hero-search-form {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.97);
          border-radius: var(--r-full);
          padding: 6px 6px 6px 20px;
          gap: 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          max-width: 680px;
          width: 100%;
        }
        .home-hero-search-field {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
          padding: 4px 12px 4px 0;
        }
        .home-hero-search-divider {
          width: 1px;
          height: 32px;
          background: rgba(17,16,8,0.1);
          flex-shrink: 0;
          margin: 0 4px;
        }
        .home-hero-quick-links {
          display: flex;
          gap: .75rem;
          flex-wrap: wrap;
          margin-top: 1.25rem;
          align-items: center;
        }
        .home-trust-badges {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .home-cats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .home-how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .home-cta-btns {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .home-hero-search-form {
            flex-direction: column;
            border-radius: var(--r-xl);
            padding: 12px;
            gap: 4px;
            align-items: stretch;
          }
          .home-hero-search-field {
            padding: 8px 12px;
            border-radius: var(--r-md);
            background: var(--paper2);
          }
          .home-hero-search-divider { display: none; }
          .home-hero-search-btn-wrap {
            margin-top: 4px;
          }
          .home-hero-search-btn-wrap button {
            width: 100% !important;
            border-radius: var(--r-md) !important;
            justify-content: center;
          }
          .home-hero-quick-links { display: none; }
          .home-trust-badges { gap: 1rem; }
          .home-cats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .home-how-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .home-cta-btns a, .home-cta-btns button {
            width: 100%;
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .home-trust-badges span:not(:first-child) { display: none; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="home-hero" style={{ alignItems:'center', paddingBottom:'14vh', paddingTop:'calc(var(--nav-h) + 6vh)' }}>

        {/* Foto actual — siempre visible */}
        <img
          src={current.src}
          alt={current.label}
          className="home-hero__bg"
          style={{ objectPosition: current.pos, opacity: 1, transition: 'none' }}
        />

        {/* Foto siguiente — hace crossfade encima */}
        {nextSlide && (
          <img
            src={nextSlide.src}
            alt={nextSlide.label}
            className="home-hero__bg"
            style={{
              objectPosition: nextSlide.pos,
              opacity: transitioning ? 1 : 0,
              transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        )}

        <div className="home-hero__overlay" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.82) 100%)',
        }} />

        <div className="home-hero__content">
          <div className="home-hero__kicker" style={{ color:'rgba(255,255,255,0.75)' }}>
            <span style={{ width:28, height:1, background:'rgba(255,255,255,0.5)', display:'block' }} />
            Compara · Planifica · Reserva
          </div>

          <h1 className="home-hero__title">
            <span style={{ color:'#fff', display:'block' }}>El mundo entero,</span>
            <span style={{ color:'#7FB3D3', display:'block', fontStyle:'italic' }}>a tu alcance.</span>
          </h1>

          <p className="home-hero__sub" style={{ color:'rgba(255,255,255,0.82)', fontWeight:300 }}>
            <strong style={{ color:'#fff', fontWeight:600 }}>Velaris es el comparador inteligente de viajes.</strong><br />
            Encuentra vuelos, hoteles y experiencias al mejor precio —
            con Vera, tu asistente de IA disponible 24/7.
          </p>

          {/* Search bar responsive */}
          <form className="home-hero-search-form" onSubmit={handleSearch}>
            <div className="home-hero-search-field">
              <span className="home-hero__search-label">
                <MapPin size={10} style={{ display:'inline', marginRight:4 }} />Destino
              </span>
              <input
                className="home-hero__search-input"
                placeholder="¿A dónde quieres ir?"
                value={dest}
                onChange={e => setDest(e.target.value)}
              />
            </div>
            <div className="home-hero-search-divider" />
            <div className="home-hero-search-field">
              <span className="home-hero__search-label">
                <Calendar size={10} style={{ display:'inline', marginRight:4 }} />Salida
              </span>
              <input
                className="home-hero__search-input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="home-hero-search-divider" />
            <div className="home-hero-search-field" style={{ maxWidth:120 }}>
              <span className="home-hero__search-label">
                <Users size={10} style={{ display:'inline', marginRight:4 }} />Viajeros
              </span>
              <input
                className="home-hero__search-input"
                placeholder="2"
                value={pax}
                onChange={e => setPax(e.target.value)}
              />
            </div>
            <div className="home-hero-search-btn-wrap">
              <button type="submit" className="home-hero__search-btn">
                <Search size={15} style={{ marginRight:6 }} />Buscar
              </button>
            </div>
          </form>

          {/* Quick links — ocultos en móvil */}
          <div className="home-hero-quick-links">
            <span style={{ fontSize:'.75rem', color:'rgba(255,255,255,0.6)', letterSpacing:'.04em' }}>Popular:</span>
            {['Bali','Santorini','Maldivas','Tokio'].map(d => (
              <button key={d}
                onClick={() => navigate(`/trips?destination=${d}`)}
                style={{ padding:'5px 14px', borderRadius:'var(--r-full)', border:'1px solid rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:'.78rem', cursor:'pointer', backdropFilter:'blur(6px)', transition:'all .2s' }}>
                {d}
              </button>
            ))}
            <button onClick={handleRandom} disabled={rnd}
              style={{ padding:'5px 14px', borderRadius:'var(--r-full)', border:'1px solid rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:'.78rem', cursor:'pointer', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', gap:5 }}>
              <Shuffle size={12} />{rnd ? '...' : 'Sorpréndeme'}
            </button>
          </div>

          {/* Trust badges */}
          <div className="home-trust-badges">
            {['Sin comisiones ocultas','Cancelación flexible','Pago 100% seguro'].map(t => (
              <span key={t} style={{ fontSize:'.75rem', color:'rgba(255,255,255,0.65)', display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ color:'#7FB3D3', fontWeight:700 }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Dots del carrusel */}
        <div style={{
          position:'absolute', bottom:'2.5rem', left:'50%', transform:'translateX(-50%)',
          display:'flex', gap:8, alignItems:'center', zIndex:3,
        }}>
          {HERO_SLIDES.map((s, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              style={{
                width: i === slide ? 28 : 8, height: 8, borderRadius: 4, border:'none',
                background: i === slide ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor:'pointer', transition:'all 0.35s', padding:0,
              }} />
          ))}
        </div>

        {/* Label destino actual */}
        <div style={{
          position:'absolute', bottom:'2.5rem', right:'2rem', zIndex:3,
          background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)',
          border:'1px solid rgba(255,255,255,0.25)',
          color:'#fff', fontSize:12, fontWeight:600,
          padding:'4px 14px', borderRadius:'var(--r-full)',
          letterSpacing:'.05em', textTransform:'uppercase',
          opacity: transitioning ? 0 : 1, transition:'opacity 0.4s',
        }}>
          {current.label}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="home-marquee">
        <div className="home-marquee__track">
          {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
            <span key={i} className="home-marquee__item">
              {d}<span className="home-marquee__dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORÍAS ── */}
      <section className="home-cats">
        <div className="container">
          <div className="home-cats__eyebrow">Explora por tipo</div>
          <h2 className="home-cats__title">¿Qué tipo de viaje buscas?</h2>
          <div className="home-cats-grid">
            {CATEGORIES.map(c => (
              <button key={c.value} className="home-cat-card"
                onClick={() => navigate(`/trips?category=${c.value}`)}>
                <div className="home-cat-card__icon">{c.icon}</div>
                <span className="home-cat-card__label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRIPS DESTACADOS ── */}
      <section style={{ padding:'5rem 0', background:'var(--paper2)' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2.5rem', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'.68rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--gold)', fontWeight:500, marginBottom:'.5rem' }}>
                <span style={{ width:22, height:1, background:'var(--gold)', display:'block' }} />
                Selección editorial
              </div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:700, color:'var(--ink)' }}>
                Los más buscados ahora
              </h2>
            </div>
            <Link to="/trips" className="btn btn--ghost">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          {loading ? (
            <div className="trips-grid">
              {Array(6).fill(0).map((_,i) => (
                <div key={i} style={{ height:340, borderRadius:'var(--r-xl)', background:'var(--paper3)', animation:'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : (
            <div className="trips-grid">
              {trips.map(t => <TripCard key={t.id} trip={t} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="home-stats">
        <div className="home-stats__inner">
          <div className="home-stats__left">
            <div className="home-stat-big">
              <div className="home-stat-big__n"><Counter target={2.4} suffix="M+" /></div>
              <div className="home-stat-big__sep" />
              <div className="home-stat-big__l">Viajeros que confían en Velaris</div>
            </div>
            <div className="home-stat-big">
              <div className="home-stat-big__n"><Counter target={190} suffix="+" /></div>
              <div className="home-stat-big__sep" />
              <div className="home-stat-big__l">Países disponibles en la plataforma</div>
            </div>
          </div>
          <div className="home-stats__right">
            <div className="home-stats__intro">
              La plataforma de viajes más <em>fiable</em> de España
            </div>
            <div className="home-stats__mini">
              {[
                { n:'98%', l:'Satisfacción' },
                { n:'24/7', l:'Vera IA' },
                { n:'€0',  l:'Comisiones ocultas' },
                { n:'4.9★',l:'Valoración media' },
              ].map(s => (
                <div key={s.l} className="home-stat-mini">
                  <div className="home-stat-mini__n">{s.n}</div>
                  <div className="home-stat-mini__l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ padding:'5rem 0', background:'var(--paper)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, fontSize:'.68rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--gold)', fontWeight:500, marginBottom:'.75rem' }}>
              <span style={{ width:22, height:1, background:'var(--gold)', display:'block' }} />
              Proceso
              <span style={{ width:22, height:1, background:'var(--gold)', display:'block' }} />
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:700, color:'var(--ink)' }}>
              Reservar nunca fue tan fácil
            </h2>
          </div>
          <div className="home-how-grid">
            {[
              {
                num:'01', title:'Busca tu destino',
                desc:'Usa el buscador o pregúntale a Vera. Filtra por categoría, precio y fechas para encontrar tu viaje ideal.',
                icon:<svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>,
              },
              {
                num:'02', title:'Compara y elige',
                desc:'Compara hasta 3 viajes en paralelo. Precios transparentes, sin comisiones ocultas ni sorpresas.',
                icon:<svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
              },
              {
                num:'03', title:'Reserva con confianza',
                desc:'Pago seguro, cancelación flexible y soporte 24/7 con Vera IA. Tu próxima aventura está garantizada.',
                icon:<svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>,
              },
            ].map((s, i) => (
              <div key={i} style={{ padding:'2rem', background:'var(--white)', borderRadius:'var(--r-xl)', border:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:16, right:20, fontFamily:'var(--font-display)', fontSize:'3.5rem', fontWeight:900, color:'rgba(28,78,120,0.06)', lineHeight:1 }}>{s.num}</div>
                <div style={{ width:56, height:56, borderRadius:'var(--r-md)', background:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--blue)', marginBottom:'1.25rem' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', fontWeight:700, marginBottom:'.6rem', color:'var(--ink)' }}>{s.title}</h3>
                <p style={{ fontSize:'.88rem', color:'var(--muted)', lineHeight:1.7, fontWeight:300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER VERA ── */}
      <section className="home-vera-banner">
        <div className="container">
          <div className="home-vera-banner__inner">
            <div className="home-vera-banner__left">
              <div className="home-vera-banner__pill">
                <Sparkles size={12} /> Inteligencia artificial
              </div>
              <h2 className="home-vera-banner__title">
                Conoce a <em style={{ fontStyle:'italic', color:'var(--blue)' }}>Vera</em>,<br />
                tu asistente de viajes
              </h2>
              <p className="home-vera-banner__desc">
                Cuéntale en lenguaje natural qué buscas. Vera analiza miles de opciones,
                compara precios y diseña tu itinerario perfecto — disponible las 24 horas.
              </p>
              <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                <button className="home-vera-banner__btn"
                  onClick={() => document.querySelector('.ai-chat__toggle')?.click()}>
                  Hablar con Vera →
                </button>
                <Link to="/recommendations" className="btn btn--ghost">
                  Ver recomendaciones IA
                </Link>
              </div>
            </div>
            <div className="home-vera-banner__card">
              <div className="home-vera-banner__card-icon"><Sparkles size={20} /></div>
              <div className="home-vera-banner__card-label">Conversaciones hoy</div>
              <div className="home-vera-banner__card-value">12.847</div>
              <div className="home-vera-banner__bars">
                <div className="home-vera-banner__bar home-vera-banner__bar--green" />
                <div className="home-vera-banner__bar home-vera-banner__bar--pink" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:'5rem 0', background:'var(--paper)', textAlign:'center' }}>
        <div className="container">
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:700, marginBottom:'1rem', color:'var(--ink)' }}>
            ¿Listo para tu próxima<br />
            <em style={{ fontStyle:'italic', color:'var(--blue)' }}>aventura?</em>
          </h2>
          <p style={{ color:'var(--muted)', marginBottom:'2rem', fontWeight:300 }}>
            Únete a más de 2 millones de viajeros que ya confían en Velaris.
          </p>
          <div className="home-cta-btns">
            <Link to="/register" className="btn btn--primary" style={{ padding:'14px 32px', fontSize:'1rem' }}>
              Crear cuenta gratis <ArrowRight size={16} />
            </Link>
            <Link to="/trips" className="btn btn--ghost" style={{ padding:'14px 32px', fontSize:'1rem' }}>
              Explorar destinos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}