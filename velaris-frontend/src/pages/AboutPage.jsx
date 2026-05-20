// ================================================================
// VELARIS — AboutPage.jsx  (src/pages/AboutPage.jsx)
// ================================================================
import { Sparkles, MapPin, Globe, Heart, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATS = [
  { value: '12.000+', label: 'Viajeros felices' },
  { value: '180+',    label: 'Destinos disponibles' },
  { value: '4.9★',    label: 'Valoración media' },
  { value: '98%',     label: 'Recomendarían Velaris' },
];

const VALUES = [
  {
    icon: <Sparkles size={22} />,
    title: 'Tecnología al servicio del viajero',
    desc: 'Usamos inteligencia artificial no para reemplazar la experiencia humana, sino para potenciarla. Vera, nuestro asistente IA, entiende lo que buscas y te ayuda a encontrarlo.',
    img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  },
  {
    icon: <Heart size={22} />,
    title: 'Cada viaje es único',
    desc: 'No creemos en los paquetes genéricos. Cada persona tiene un estilo de viaje diferente, y Velaris existe para encontrar exactamente lo que encaja contigo.',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  },
  {
    icon: <Globe size={22} />,
    title: 'Transparencia total',
    desc: 'Sin sorpresas en el precio, sin letra pequeña. Lo que ves es lo que pagas. Creemos que la confianza se construye siendo honestos desde el primer clic.',
    img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  },
];

const TIMELINE = [
  { year: '2022', title: 'El problema', desc: 'Todo empezó con una mala experiencia. Después de horas buscando en distintas plataformas, comparando precios, leyendo reseñas contradictorias y llenando formularios interminables, el viaje que debía ser emocionante se había convertido en agotador. Algo estaba roto en la industria.', img: 'https://images.unsplash.com/photo-1499946981954-c8579ef42588?w=800&q=80', side: 'left' },
  { year: '2023', title: 'La idea', desc: 'La pregunta era simple: ¿y si hubiera una plataforma que te escuchara de verdad? No que te filtrara por fechas y precio, sino que entendiera que quieres desconectar, que viajas en pareja, que odias las masificaciones y que tienes un presupuesto ajustado. Así nació la idea de Vera.', img: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800&q=80', side: 'right' },
  { year: '2024', title: 'Los primeros pasos', desc: 'Con un prototipo básico y muchas ganas, Velaris empezó a tomar forma como proyecto de final de grado. Las primeras pruebas con usuarios reales confirmaron lo que intuíamos: la gente no quiere más opciones, quiere mejores recomendaciones.', img: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800&q=80', side: 'left' },
  { year: '2025', title: 'El lanzamiento', desc: 'Velaris abrió sus puertas al público con más de 180 destinos, vuelos y escapadas reales. Vera se convirtió en el corazón de la plataforma — un asistente que aprendía con cada conversación y mejoraba sus recomendaciones con cada viajero.', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', side: 'right' },
  { year: '2026', title: 'Velaris hoy', desc: 'Hoy Velaris es una plataforma consolidada con más de 12.000 viajeros felices y una comunidad que crece cada día. Vera sigue evolucionando, cada vez más inteligente y más precisa. Pero nuestra misión sigue siendo la misma que el primer día.', img: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&q=80', side: 'left' },
];

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      <style>{`
        .about-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
        .about-mision-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .about-timeline-item {
          display: grid;
          grid-template-columns: 1fr 60px 1fr;
          gap: 2rem;
          align-items: center;
        }
        .about-cta-btns {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .about-mision-float {
          position: absolute;
          bottom: -24px;
          left: -24px;
        }
        @media (max-width: 900px) {
          .about-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
          .about-mision-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .about-mision-float {
            position: static;
            margin-top: 1rem;
          }
          .about-values-grid {
            grid-template-columns: 1fr;
          }
          .about-timeline-item {
            grid-template-columns: 40px 1fr;
            gap: 1rem;
          }
          .about-timeline-empty { display: none; }
          .about-timeline-center {
            grid-column: 1;
            grid-row: 1;
          }
          .about-timeline-content {
            grid-column: 2;
            grid-row: 1;
          }
          .about-timeline-line {
            left: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .about-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .about-cta-btns a {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', minHeight: 580, overflow: 'hidden',
        marginTop: 'calc(-1 * var(--nav-h))',
        display: 'flex', alignItems: 'center',
      }}>
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=90"
          alt="Sobre Velaris"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 50%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,20,40,0.4) 0%, rgba(10,20,40,0.7) 55%, rgba(10,20,40,0.92) 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%', paddingTop: 'calc(var(--nav-h) + 3rem)', paddingBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.9)', fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 'var(--r-full)', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,.2)' }}>
            <MapPin size={12} /> Nuestra historia
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '.85rem', letterSpacing: '-0.02em', maxWidth: 680 }}>
            Nacimos para hacer<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.75)' }}>los viajes más humanos</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, maxWidth: 540, lineHeight: 1.75, fontWeight: 300 }}>
            Velaris nació de una frustración simple: reservar un viaje que de verdad te encaje no debería ser tan difícil. Así que lo construimos nosotros.
          </p>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ background: '#0c2340', padding: '3.5rem 0' }}>
        <div className="container">
          <div className="about-stats-grid">
            {STATS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '.4rem' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', fontWeight: 300 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MISIÓN ── */}
      <section style={{ padding: '6rem 0', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="about-mision-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '.68rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: '.75rem' }}>
                <span style={{ width: 22, height: 1, background: 'var(--gold)', display: 'block' }} />
                Nuestra misión
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: 'var(--ink)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                Viajar debería ser<br />la mejor parte del viaje
              </h2>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem', fontWeight: 300 }}>
                Cuando empezamos a construir Velaris, nos dimos cuenta de que la industria de los viajes online había olvidado algo fundamental: las personas no buscan vuelos y hoteles, buscan experiencias.
              </p>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 300 }}>
                Por eso creamos Vera, un asistente de inteligencia artificial que no te lanza resultados genéricos, sino que te escucha, entiende tu contexto y te ayuda a encontrar exactamente lo que estás buscando.
              </p>
              <Link to="/recommendations" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 'var(--r-full)', background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all .2s' }}>
                Habla con Vera <ArrowRight size={15} />
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800&q=85"
                alt="Planificando viajes"
                style={{ width: '100%', borderRadius: 'var(--r-2xl)', aspectRatio: '4/3', objectFit: 'cover' }}
              />
              <div className="about-mision-float" style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,.12)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Star size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>4.9 de 5 estrellas</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Más de 3.200 reseñas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALORES ── */}
      <section style={{ padding: '6rem 0', background: 'var(--paper)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '.68rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: '.75rem' }}>
              <span style={{ width: 22, height: 1, background: 'var(--gold)', display: 'block' }} />
              Lo que nos mueve
              <span style={{ width: 22, height: 1, background: 'var(--gold)', display: 'block' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: 'var(--ink)' }}>
              Nuestros valores
            </h2>
          </div>
          <div className="about-values-grid">
            {VALUES.map((v, i) => (
              <div key={i} style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--white)', transition: 'transform .22s, box-shadow .22s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                  <img src={v.img} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,20,40,.6) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 16, width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {v.icon}
                  </div>
                </div>
                <div style={{ padding: '1.25rem 1.4rem 1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem' }}>{v.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ padding: '6rem 0', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '.68rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: '.75rem' }}>
              <span style={{ width: 22, height: 1, background: 'var(--gold)', display: 'block' }} />
              Cómo llegamos aquí
              <span style={{ width: 22, height: 1, background: 'var(--gold)', display: 'block' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: 'var(--ink)' }}>Nuestra historia</h2>
            <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: '.5rem', fontWeight: 300 }}>De una frustración a una plataforma que usan miles de viajeros</p>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Línea central — oculta en móvil via clase */}
            <div className="about-timeline-line" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'var(--border)', transform: 'translateX(-50%)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
              {TIMELINE.map((item, i) => (
                <div key={i} className="about-timeline-item">

                  {/* Lado izquierdo — en móvil se oculta si es 'right' */}
                  {item.side === 'left' ? (
                    <TimelineCard item={item} />
                  ) : (
                    <div className="about-timeline-empty" />
                  )}

                  {/* Punto central */}
                  <div className="about-timeline-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0c2340', border: '3px solid var(--white)', boxShadow: '0 0 0 2px var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '.02em' }}>{item.year}</span>
                    </div>
                  </div>

                  {/* Lado derecho */}
                  {item.side === 'right' ? (
                    <TimelineCard item={item} />
                  ) : (
                    <div className="about-timeline-empty" />
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1400&q=85"
          alt="Viaja con Velaris"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,20,40,.55), rgba(10,20,40,.88))' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '6rem 1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.9)', fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 'var(--r-full)', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,.2)' }}>
            <Sparkles size={12} /> Empieza hoy
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: '.85rem', letterSpacing: '-0.02em' }}>
            ¿Listo para encontrar<br />tu próximo viaje?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, maxWidth: 460, margin: '0 auto 2.5rem', fontWeight: 300, lineHeight: 1.7 }}>
            Cuéntale a Vera qué buscas y en menos de un minuto tendrás una selección de viajes hecha para ti.
          </p>
          <div className="about-cta-btns">
            <Link to="/recommendations" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 'var(--r-full)', background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(28,78,120,.4)', transition: 'all .2s' }}>
              <Sparkles size={16} /> Hablar con Vera
            </Link>
            <Link to="/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 'var(--r-full)', border: '1.5px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Ver destinos <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Componente reutilizable para las cards del timeline ──
function TimelineCard({ item }) {
  return (
    <div className="about-timeline-content" style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--white)', boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
      <div style={{ height: 180, overflow: 'hidden' }}>
        <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
      </div>
      <div style={{ padding: '1.25rem 1.4rem 1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem' }}>{item.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>{item.desc}</p>
      </div>
    </div>
  );
}