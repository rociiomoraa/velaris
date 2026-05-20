// ================================================================
// VELARIS — FlightsPage.jsx
// ================================================================
import { useState, useEffect } from 'react';
import {
  Plane, Search, Clock, Hotel, X, ChevronDown, Filter,
} from 'lucide-react';
import { flightsApi } from '../api/client';
import FlightCard from '../components/FlightCard';
import CompareBar from '../components/CompareBar';

const CABIN_OPTIONS = [
  { value: '',         label: 'Todas las clases' },
  { value: 'turista',  label: 'Turista' },
  { value: 'business', label: 'Business' },
  { value: 'primera',  label: 'Primera clase' },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Más nuevo' },
  { value: 'price_asc',  label: 'Precio ↑' },
  { value: 'price_desc', label: 'Precio ↓' },
  { value: 'date',       label: 'Fecha' },
];

function sortFlights(arr, sort) {
  const a = [...arr];
  switch (sort) {
    case 'price_asc':  return a.sort((x, y) => Number(x.price) - Number(y.price));
    case 'price_desc': return a.sort((x, y) => Number(y.price) - Number(x.price));
    case 'date':       return a.sort((x, y) => new Date(x.departureDate) - new Date(y.departureDate));
    default:           return a.sort((x, y) => y.id - x.id);
  }
}

export default function FlightsPage() {
  const [flights, setFlights]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [sort, setSort]                 = useState('newest');
  const [showFilters, setShowFilters]   = useState(false);
  const [compareItems, setCompareItems] = useState([]);

  const [filters, setFilters] = useState({
    search: '', cabin: '', hotel: false, from: '', to: '', page: 0, size: 9,
  });

  useEffect(() => { load(); }, [filters.search, filters.cabin, filters.hotel, filters.page]);

  const load = () => {
    setLoading(true);
    const params = { page: filters.page, size: filters.size };
    if (filters.search) params.destination   = filters.search;
    if (filters.cabin)  params.cabinClass    = filters.cabin;
    if (filters.hotel)  params.includesHotel = true;

    flightsApi.getAll(params)
      .then(r => {
        setFlights(r.data?.content || []);
        setTotalPages(r.data?.totalPages || 0);
        setTotal(r.data?.totalElements || 0);
      })
      .catch(() => setFlights([]))
      .finally(() => setLoading(false));
  };

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 0 }));

  const reset = () => setFilters(f => ({
    ...f, search: '', cabin: '', hotel: false, from: '', to: '', page: 0,
  }));

  const toggleCompare = (trip) => {
    setCompareItems(prev => {
      const exists = prev.find(t => t.id === trip.id);
      if (exists) return prev.filter(t => t.id !== trip.id);
      if (prev.length >= 3) return prev;
      return [...prev, trip];
    });
  };

  // Filtro de fechas en local sobre la página actual
  const localFiltered = flights.filter(f => {
    if (filters.from && f.departureDate && f.departureDate < filters.from) return false;
    if (filters.to   && f.departureDate && f.departureDate > filters.to)   return false;
    return true;
  });

  const displayed = sortFlights(localFiltered, sort);

  const activeCount = [
    filters.search, filters.cabin, filters.hotel || '',
    filters.from, filters.to,
  ].filter(Boolean).length;

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', minHeight: 580, overflow: 'hidden',
        marginTop: 'calc(-1 * var(--nav-h))', display: 'flex', alignItems: 'center',
      }}>
        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=90" alt="Vuelos"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,20,40,0.35) 0%, rgba(10,20,40,0.65) 60%, rgba(10,20,40,0.88) 100%)' }} />

        <div className="container" style={{
          position: 'relative', zIndex: 1, width: '100%',
          paddingTop: showFilters ? 'calc(var(--nav-h) + 5rem)' : 'calc(var(--nav-h) + 3rem)',
          paddingBottom: '3.5rem', transition: 'padding-top .3s ease',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.9)', fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 'var(--r-full)', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,.2)' }}>
            <Plane size={12} /> Vuelos disponibles
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '.75rem', letterSpacing: '-0.02em' }}>
            {filters.search
              ? <>Vuelos a <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.8)' }}>{filters.search}</em></>
              : filters.cabin
              ? <>Vuelos en <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.8)' }}>{CABIN_OPTIONS.find(c => c.value === filters.cabin)?.label}</em></>
              : <>Tu próximo vuelo<br /><em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.8)' }}>te espera</em></>}
          </h1>

          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, maxWidth: 500, lineHeight: 1.7, marginBottom: '2rem', fontWeight: 300 }}>
            Vuelos directos, con escala, turista o business. Solos o combinados con hotel. Tú decides.
          </p>

          {/* Buscador + filtros */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: 680, marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 'var(--r-full)', padding: '12px 20px' }}>
              <Search size={15} style={{ color: 'rgba(255,255,255,.6)', flexShrink: 0 }} />
              <input style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 15, width: '100%' }} placeholder="Origen, destino o aerolínea..." value={filters.search} onChange={e => set('search', e.target.value)} />
              {filters.search && <button onClick={() => set('search', '')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>}
            </div>

            <button onClick={() => setShowFilters(v => !v)} style={{ padding: '12px 22px', borderRadius: 'var(--r-full)', background: showFilters ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)', transition: 'all .18s' }}>
              <Filter size={15} /> Filtros {activeCount > 0 && `(${activeCount})`}
              <ChevronDown size={13} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
          </div>

          {/* Panel filtros */}
          <div style={{ maxHeight: showFilters ? '500px' : '0px', overflow: 'hidden', transition: 'max-height .35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 'var(--r-xl)', padding: '1.5rem', maxWidth: 820, opacity: showFilters ? 1 : 0, transform: showFilters ? 'translateY(0)' : 'translateY(-8px)', transition: 'opacity .3s ease, transform .3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: '.6rem' }}>Clase</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {CABIN_OPTIONS.filter(c => c.value !== '').map(c => (
                      <button key={c.value} onClick={() => set('cabin', filters.cabin === c.value ? '' : c.value)}
                        style={{ padding: '5px 14px', borderRadius: 'var(--r-full)', border: '1.5px solid', borderColor: filters.cabin === c.value ? '#fff' : 'rgba(255,255,255,.25)', background: filters.cabin === c.value ? '#fff' : 'rgba(255,255,255,.08)', color: filters.cabin === c.value ? 'var(--blue)' : 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: filters.cabin === c.value ? 700 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: '.6rem' }}>Extras</div>
                  <button onClick={() => set('hotel', !filters.hotel)}
                    style={{ padding: '5px 14px', borderRadius: 'var(--r-full)', border: '1.5px solid', borderColor: filters.hotel ? '#fff' : 'rgba(255,255,255,.25)', background: filters.hotel ? '#fff' : 'rgba(255,255,255,.08)', color: filters.hotel ? 'var(--blue)' : 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: filters.hotel ? 700 : 400, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Hotel size={13} /> Vuelo + Hotel
                  </button>
                </div>

                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: '.6rem' }}>Fecha de salida</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input type="date" style={{ width: '100%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 13, color: '#fff', outline: 'none', colorScheme: 'dark' }} value={filters.from} onChange={e => set('from', e.target.value)} />
                    <input type="date" style={{ width: '100%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 13, color: '#fff', outline: 'none', colorScheme: 'dark' }} value={filters.to} onChange={e => set('to', e.target.value)} />
                  </div>
                </div>
              </div>

              {activeCount > 0 && (
                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>{activeCount} {activeCount === 1 ? 'filtro activo' : 'filtros activos'}</span>
                  <button onClick={reset} style={{ fontSize: 12, color: '#fff', fontWeight: 600, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', padding: '6px 14px', borderRadius: 'var(--r-full)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <X size={11} /> Limpiar todos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="container" style={{ padding: '2.5rem 1.5rem 6rem' }}>

        {/* Pills + sort */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CABIN_OPTIONS.map(c => (
              <button key={c.value} onClick={() => set('cabin', c.value)}
                style={{ padding: '6px 16px', borderRadius: 'var(--r-full)', border: '1.5px solid', borderColor: filters.cabin === c.value ? 'var(--blue)' : 'var(--border)', background: filters.cabin === c.value ? 'var(--blue)' : 'var(--white)', color: filters.cabin === c.value ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .18s' }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              {loading ? 'Buscando...' : <><strong style={{ color: 'var(--blue)' }}>{total.toLocaleString('es-ES')}</strong> vuelos</>}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {SORT_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setSort(o.value)}
                  style={{ padding: '5px 12px', borderRadius: 'var(--r-full)', border: '1.5px solid', borderColor: sort === o.value ? 'var(--blue)' : 'var(--border)', background: sort === o.value ? 'var(--blue-light)' : 'var(--white)', color: sort === o.value ? 'var(--blue)' : 'var(--ink)', fontSize: 12, fontWeight: sort === o.value ? 600 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chips filtros activos */}
        {activeCount > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
            {filters.search && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}>
                <Search size={11} /> {filters.search}
                <button onClick={() => set('search', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', display: 'flex', padding: 0 }}><X size={11} /></button>
              </span>
            )}
            {filters.cabin && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}>
                <Plane size={11} /> {CABIN_OPTIONS.find(c => c.value === filters.cabin)?.label}
                <button onClick={() => set('cabin', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', display: 'flex', padding: 0 }}><X size={11} /></button>
              </span>
            )}
            {filters.hotel && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--r-full)', background: '#dcfce7', color: '#15803d', fontSize: 12, fontWeight: 600 }}>
                <Hotel size={11} /> Vuelo + Hotel
                <button onClick={() => set('hotel', false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', display: 'flex', padding: 0 }}><X size={11} /></button>
              </span>
            )}
            {filters.from && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}>
                <Clock size={11} /> Desde {filters.from}
                <button onClick={() => set('from', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', display: 'flex', padding: 0 }}><X size={11} /></button>
              </span>
            )}
            {filters.to && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}>
                <Clock size={11} /> Hasta {filters.to}
                <button onClick={() => set('to', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', display: 'flex', padding: 0 }}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="trips-grid">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} style={{ height: 320, borderRadius: 'var(--r-xl)', background: 'var(--paper2)', animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--r-xl)', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Plane size={28} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '.5rem' }}>No encontramos vuelos</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem' }}>Prueba con otros filtros</p>
            <button className="btn btn--ghost" onClick={reset}>Limpiar filtros</button>
          </div>
        ) : (
          <div className="trips-grid">
            {displayed.map(f => (
              <FlightCard
                key={f.id}
                flight={f}
                onCompare={toggleCompare}
                isComparing={compareItems.some(c => c.id === f.id)}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn-pagination btn-pagination--arrow" disabled={filters.page === 0} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>←</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = filters.page <= 3 ? i : filters.page - 3 + i;
              if (p >= totalPages) return null;
              return <button key={p} className={`btn-pagination ${p === filters.page ? 'btn-pagination--active' : ''}`} onClick={() => setFilters(f => ({ ...f, page: p }))}>{p + 1}</button>;
            })}
            <button className="btn-pagination btn-pagination--arrow" disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>→</button>
          </div>
        )}
      </div>

      {/* ── COMPARADOR ── */}
      <CompareBar
        items={compareItems}
        onRemove={id => setCompareItems(prev => prev.filter(t => t.id !== id))}
        onClear={() => setCompareItems([])}
      />
    </div>
  );
}