// ================================================================
// VELARIS — CompareBar.jsx
// ================================================================
import { X, ArrowRight, Star, Plane, Moon, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const IMGS = {
  playa:     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  ciudad:    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80',
  aventura:  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  cultura:   'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
  naturaleza:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  default:   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
};

function getImg(trip) {
  const first = trip.imageUrl?.split(',')[0]?.trim();
  if (first?.startsWith('http')) return first;
  return IMGS[trip.category?.toLowerCase()] || IMGS.default;
}

function TypeIcon({ type }) {
  if (type === 'vuelo')    return <Plane size={12} />;
  if (type === 'escapada') return <Moon size={12} />;
  return <Globe size={12} />;
}

function TypeLabel({ type }) {
  const configs = {
    vuelo:    { label:'Vuelo',    bg:'var(--blue-light)',   color:'var(--blue)' },
    escapada: { label:'Escapada', bg:'rgba(21,128,61,.12)', color:'#166534' },
    viaje:    { label:'Viaje',    bg:'var(--paper2)',       color:'var(--ink2)' },
  };
  const cfg = configs[type] || configs.viaje;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:'var(--r-full)', fontSize:10, fontWeight:700, background:cfg.bg, color:cfg.color }}>
      <TypeIcon type={type} /> {cfg.label}
    </span>
  );
}

function Row({ label, values, highlight }) {
  return (
    <tr style={{ borderBottom:'1px solid var(--border)' }}>
      <td style={{
        padding:'10px 16px', fontSize:11, fontWeight:700,
        letterSpacing:'.06em', textTransform:'uppercase',
        color:'var(--muted)', background:'var(--paper2)',
        whiteSpace:'nowrap', width:140,
      }}>
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} style={{
          padding:'10px 16px', fontSize:14, textAlign:'center',
          background: highlight?.[i] ? 'rgba(28,78,120,0.05)' : 'var(--white)',
          fontWeight: highlight?.[i] ? 700 : 400,
          color: highlight?.[i] ? 'var(--blue)' : 'var(--ink)',
        }}>
          {v ?? <span style={{ color:'var(--ink3)' }}>—</span>}
        </td>
      ))}
    </tr>
  );
}

export default function CompareBar({ items, onRemove, onClear }) {
  const [showModal, setShowModal] = useState(false);

  if (items.length === 0) return null;

  // Calcular highlights (mejor valor)
  const prices    = items.map(t => Number(t.price));
  const minPrice  = Math.min(...prices);
  const durations = items.map(t => t.durationDays || 0);
  const maxDur    = Math.max(...durations);
  const seats     = items.map(t => t.availableSeats || 0);
  const maxSeats  = Math.max(...seats);

  return (
    <>
      {/* ── BARRA FIJA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--ink)', zIndex: 90,
        borderTop: '2px solid var(--blue)',
        animation: 'slideUp .3s ease',
        padding: '12px 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* Items seleccionados */}
        <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
          {items.map(trip => (
            <div key={trip.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: 'var(--r-lg)', padding: '6px 10px',
            }}>
              <img src={getImg(trip)} alt={trip.title}
                style={{ width:32, height:32, borderRadius:'var(--r-sm)', objectFit:'cover', flexShrink:0 }} />
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'#fff', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {trip.title}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.5)' }}>
                  €{Number(trip.price).toLocaleString('es-ES')}
                </div>
              </div>
              <button onClick={() => onRemove(trip.id)} style={{
                background:'none', border:'none', color:'rgba(255,255,255,.4)',
                cursor:'pointer', display:'flex', padding:2,
              }}>
                <X size={13} />
              </button>
            </div>
          ))}

          {/* Slots vacíos */}
          {Array.from({ length: 3 - items.length }).map((_, i) => (
            <div key={i} style={{
              width: 180, height: 52,
              border: '1.5px dashed rgba(255,255,255,.15)',
              borderRadius: 'var(--r-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,.25)', fontSize: 12,
            }}>
              + Añadir producto
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>
            {items.length}/3 seleccionados
          </span>
          <button onClick={onClear} style={{
            padding:'8px 16px', borderRadius:'var(--r-full)',
            border:'1px solid rgba(255,255,255,.2)',
            background:'transparent', color:'rgba(255,255,255,.6)',
            fontSize:13, cursor:'pointer',
          }}>
            Limpiar
          </button>
          <button
            onClick={() => setShowModal(true)}
            disabled={items.length < 2}
            style={{
              padding:'10px 22px', borderRadius:'var(--r-full)',
              background: items.length < 2 ? 'rgba(255,255,255,.1)' : 'var(--blue)',
              border:'none', color: items.length < 2 ? 'rgba(255,255,255,.3)' : '#fff',
              fontSize:14, fontWeight:600, cursor: items.length < 2 ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', gap:6,
              transition:'all .18s',
            }}>
            Comparar {items.length >= 2 && <ArrowRight size={14} />}
          </button>
        </div>
      </div>

      {/* ── MODAL COMPARADOR ── */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex:200 }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--r-2xl)',
            width: '100%', maxWidth: 900,
            maxHeight: '90vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            animation: 'scaleIn .25s ease',
          }}>
            {/* Header */}
            <div style={{
              padding:'1.25rem 1.5rem',
              borderBottom:'1px solid var(--border)',
              display:'flex', justifyContent:'space-between', alignItems:'center',
              background:'var(--white)', flexShrink:0,
            }}>
              <div>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, color:'var(--ink)', margin:0 }}>
                  Comparando {items.length} productos
                </h2>
                <p style={{ fontSize:13, color:'var(--muted)', margin:0, marginTop:2 }}>
                  Encuentra el que mejor se adapta a ti
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background:'var(--paper2)', border:'none', borderRadius:'50%',
                width:34, height:34, cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center', color:'var(--ink2)',
              }}>
                <X size={16} />
              </button>
            </div>

            {/* Contenido scrollable */}
            <div style={{ overflow:'auto', flex:1 }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                {/* Fotos + títulos */}
                <thead>
                  <tr>
                    <th style={{ width:140, background:'var(--paper2)', padding:'1rem', borderBottom:'1px solid var(--border)' }} />
                    {items.map(trip => (
                      <th key={trip.id} style={{
                        padding:'1.25rem 1rem', textAlign:'center',
                        borderBottom:'1px solid var(--border)',
                        background:'var(--white)', verticalAlign:'top',
                      }}>
                        <img src={getImg(trip)} alt={trip.title}
                          style={{ width:'100%', maxWidth:200, height:120, objectFit:'cover', borderRadius:'var(--r-lg)', marginBottom:10, display:'block', margin:'0 auto 10px' }} />
                        <TypeLabel type={trip.type || 'viaje'} />
                        <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, color:'var(--ink)', margin:'8px 0 4px', lineHeight:1.3 }}>
                          {trip.title}
                        </div>
                        <div style={{ fontSize:12, color:'var(--muted)' }}>{trip.destination}</div>
                        <Link to={`/trips/${trip.id}`}
                          style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:10, fontSize:12, fontWeight:600, color:'var(--blue)', textDecoration:'none' }}>
                          Ver detalle <ArrowRight size={11} />
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* Precio */}
                  <Row
                    label="Precio"
                    values={items.map(t => (
                      <span style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800, color: Number(t.price) === minPrice ? 'var(--blue)' : 'var(--ink)' }}>
                        €{Number(t.price).toLocaleString('es-ES')}
                        <span style={{ fontSize:11, fontWeight:400, color:'var(--muted)', marginLeft:3 }}>
                          {t.type === 'vuelo' ? '/billete' : '/persona'}
                        </span>
                      </span>
                    ))}
                  />

                  {/* Duración */}
                  <Row
                    label="Duración"
                    values={items.map(t => t.durationDays ? `${t.durationDays} ${t.type === 'escapada' ? 'noches' : 'días'}` : '—')}
                    highlight={items.map(t => (t.durationDays || 0) === maxDur)}
                  />

                  {/* Plazas */}
                  <Row
                    label="Plazas"
                    values={items.map(t => t.availableSeats ?? '—')}
                    highlight={items.map(t => (t.availableSeats || 0) === maxSeats)}
                  />

                  {/* Categoría */}
                  <Row
                    label="Categoría"
                    values={items.map(t => t.category
                      ? t.category.charAt(0).toUpperCase() + t.category.slice(1)
                      : '—'
                    )}
                  />

                  {/* Salida */}
                  <Row
                    label="Fecha salida"
                    values={items.map(t => t.departureDate
                      ? new Date(t.departureDate).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })
                      : '—'
                    )}
                  />

                  {/* Origen */}
                  <Row
                    label="Origen"
                    values={items.map(t => t.origin || '—')}
                  />

                  {/* Campos específicos de vuelo */}
                  {items.some(t => t.type === 'vuelo') && (<>
                    <Row
                      label="Aerolínea"
                      values={items.map(t => t.airline || '—')}
                    />
                    <Row
                      label="Clase"
                      values={items.map(t => t.cabinClass
                        ? t.cabinClass.charAt(0).toUpperCase() + t.cabinClass.slice(1)
                        : '—'
                      )}
                    />
                    <Row
                      label="Incluye hotel"
                      values={items.map(t => t.type === 'vuelo'
                        ? (t.includesHotel ? '✓ Sí' : '✗ No')
                        : '—'
                      )}
                      highlight={items.map(t => t.type === 'vuelo' && t.includesHotel)}
                    />
                  </>)}

                  {/* Campos específicos de escapada */}
                  {items.some(t => t.type === 'escapada') && (<>
                    <Row
                      label="Hotel"
                      values={items.map(t => t.hotelName || '—')}
                    />
                    <Row
                      label="Estrellas"
                      values={items.map(t => t.hotelStars
                        ? '★'.repeat(t.hotelStars)
                        : '—'
                      )}
                      highlight={items.map(t => t.hotelStars === Math.max(...items.map(x => x.hotelStars || 0)))}
                    />
                    <Row
                      label="Régimen"
                      values={items.map(t => {
                        const plans = { sin_comidas:'Solo alojamiento', desayuno:'Desayuno', media_pension:'Media pensión', todo_incluido:'Todo incluido' };
                        return t.mealPlan ? (plans[t.mealPlan] || t.mealPlan) : '—';
                      })}
                    />
                  </>)}

                  {/* Botones de reserva */}
                  <tr>
                    <td style={{ background:'var(--paper2)', padding:'1rem 16px' }} />
                    {items.map(trip => (
                      <td key={trip.id} style={{ padding:'1rem', textAlign:'center', background:'var(--white)' }}>
                        <Link to={`/trips/${trip.id}`}
                          style={{
                            display:'inline-flex', alignItems:'center', gap:6,
                            padding:'10px 24px', borderRadius:'var(--r-full)',
                            background:'var(--blue)', color:'#fff',
                            fontWeight:600, fontSize:14, textDecoration:'none',
                            transition:'background .18s',
                          }}>
                          Reservar <ArrowRight size={13} />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}