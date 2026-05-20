// ================================================================
// VELARIS — EscapadasPage.jsx
// ================================================================
import { useState, useEffect } from 'react';
import {
  MapPin, Sparkles,
  Moon, Filter, X, ChevronDown, Search, DollarSign,
} from 'lucide-react';
import { escapadasApi } from '../api/client';
import EscapadaCard, { MEAL_LABELS, MEAL_ICONS } from '../components/EscapadaCard';
import CompareBar from '../components/CompareBar';

const PRICE_RANGES = [
  { label: 'Menos de 200€',  min: '',     max: '200'  },
  { label: '200€ – 500€',    min: '200',  max: '500'  },
  { label: '500€ – 1.000€',  min: '500',  max: '1000' },
  { label: 'Más de 1.000€',  min: '1000', max: ''     },
];

const SORT_OPTIONS = [
  { label: 'Más nuevo',  value: 'newest'     },
  { label: 'Precio ↑',   value: 'price_asc'  },
  { label: 'Precio ↓',   value: 'price_desc' },
  { label: 'Duración',   value: 'duration'   },
];

function sortEscapadas(list, sort) {
  const arr = [...list];
  switch (sort) {
    case 'price_asc':  return arr.sort((a, b) => Number(a.price) - Number(b.price));
    case 'price_desc': return arr.sort((a, b) => Number(b.price) - Number(a.price));
    case 'duration':   return arr.sort((a, b) => (a.durationDays || 0) - (b.durationDays || 0));
    default:           return arr.sort((a, b) => b.id - a.id);
  }
}

export default function EscapadasPage() {
  const [escapadas, setEscapadas]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [totalPages, setTotalPages]     = useState(0);
  const [total, setTotal]               = useState(0);
  const [sort, setSort]                 = useState('newest');
  const [showFilters, setShowFilters]   = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [compareItems, setCompareItems] = useState([]);

  const [filters, setFilters] = useState({
    destination: '', mealPlan: '', minPrice: '', maxPrice: '', page: 0, size: 9,
  });

  useEffect(() => { load(); }, [filters.destination, filters.mealPlan, filters.minPrice, filters.maxPrice, filters.page]);

  const load = () => {
    setLoading(true);
    const params = {};
    if (filters.destination) params.destination = filters.destination;
    if (filters.mealPlan)    params.mealPlan    = filters.mealPlan;
    if (filters.minPrice)    params.minPrice    = filters.minPrice;
    if (filters.maxPrice)    params.maxPrice    = filters.maxPrice;
    params.page = filters.page;
    params.size = filters.size;

    escapadasApi.getAll(params)
      .then(r => {
        setEscapadas(r.data?.content || []);
        setTotalPages(r.data?.totalPages || 0);
        setTotal(r.data?.totalElements || 0);
      })
      .catch(() => setEscapadas([]))
      .finally(() => setLoading(false));
  };

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 0 }));

  const reset = () => {
    setFilters({ destination: '', mealPlan: '', minPrice: '', maxPrice: '', page: 0, size: 9 });
    setSelectedPriceRange('');
  };

  const applyPriceRange = (range) => {
    if (selectedPriceRange === range.label) {
      setSelectedPriceRange('');
      setFilters(f => ({ ...f, minPrice: '', maxPrice: '', page: 0 }));
    } else {
      setSelectedPriceRange(range.label);
      setFilters(f => ({ ...f, minPrice: range.min, maxPrice: range.max, page: 0 }));
    }
  };

  const toggleCompare = (trip) => {
    setCompareItems(prev => {
      const exists = prev.find(t => t.id === trip.id);
      if (exists) return prev.filter(t => t.id !== trip.id);
      if (prev.length >= 3) return prev;
      return [...prev, trip];
    });
  };

  const activeCount = [
    filters.destination, filters.mealPlan, filters.minPrice || filters.maxPrice,
  ].filter(Boolean).length;

  const displayedEscapadas = sortEscapadas(escapadas, sort);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', minHeight: 580, overflow: 'hidden',
        marginTop: 'calc(-1 * var(--nav-h))', display: 'flex', alignItems: 'center',
      }}>
        <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400&q=90" alt="Escapadas"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(17,16,8,.3) 0%, rgba(17,16,8,.6) 60%, rgba(17,16,8,.85) 100%)' }} />

        <div className="container" style={{
          position: 'relative', zIndex: 1, width: '100%',
          paddingTop: showFilters ? 'calc(var(--nav-h) + 5rem)' : 'calc(var(--nav-h) + 3rem)',
          paddingBottom: '3.5rem', transition: 'padding-top .3s ease',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.9)', fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 'var(--r-full)', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,.2)' }}>
            <Moon size={12} /> Escapadas de fin de semana
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '.75rem', letterSpacing: '-0.02em' }}>
            {filters.destination ? `Escapadas a ${filters.destination}`
              : filters.mealPlan ? `Escapadas con ${MEAL_LABELS[filters.mealPlan]?.toLowerCase()}`
              : <>Desconecta este<br /><em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.8)' }}>fin de semana</em></>}
          </h1>

          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, maxWidth: 500, lineHeight: 1.7, marginBottom: '2rem', fontWeight: 300 }}>
            Hotel seleccionado, régimen a elegir y experiencias únicas. Filtra por presupuesto y tipo de pensión para encontrar la tuya.
          </p>

          {/* Buscador + filtros */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: 680, marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 'var(--r-full)', padding: '12px 20px' }}>
              <Search size={15} style={{ color: 'rgba(255,255,255,.6)', flexShrink: 0 }} />
              <input style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 15, width: '100%' }} placeholder="¿A dónde quieres escaparte?" value={filters.destination} onChange={e => set('destination', e.target.value)} />
              {filters.destination && <button onClick={() => set('destination', '')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>}
            </div>

            <button onClick={() => setShowFilters(v => !v)} style={{ padding: '12px 22px', borderRadius: 'var(--r-full)', background: showFilters ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)', transition: 'all .18s' }}>
              <Filter size={15} /> Filtros {activeCount > 0 && `(${activeCount})`}
              <ChevronDown size={13} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
          </div>

          {/* Panel filtros */}
          <div style={{ maxHeight: showFilters ? '500px' : '0px', overflow: 'hidden', transition: 'max-height .35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 'var(--r-xl)', padding: '1.5rem', maxWidth: 900, opacity: showFilters ? 1 : 0, transform: showFilters ? 'translateY(0)' : 'translateY(-8px)', transition: 'opacity .3s ease, transform .3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: '.6rem' }}>Régimen</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(MEAL_LABELS).map(([val, label]) => (
                      <button key={val} onClick={() => set('mealPlan', filters.mealPlan === val ? '' : val)}
                        style={{ padding: '5px 14px', borderRadius: 'var(--r-full)', border: '1.5px solid', borderColor: filters.mealPlan === val ? '#fff' : 'rgba(255,255,255,.25)', background: filters.mealPlan === val ? '#fff' : 'rgba(255,255,255,.08)', color: filters.mealPlan === val ? 'var(--blue)' : 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: filters.mealPlan === val ? 700 : 400, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {MEAL_ICONS[val]} {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: '.6rem' }}>Presupuesto</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {PRICE_RANGES.map(r => (
                      <button key={r.label} onClick={() => applyPriceRange(r)}
                        style={{ padding: '5px 14px', borderRadius: 'var(--r-full)', border: '1.5px solid', borderColor: selectedPriceRange === r.label ? '#fff' : 'rgba(255,255,255,.25)', background: selectedPriceRange === r.label ? '#fff' : 'rgba(255,255,255,.08)', color: selectedPriceRange === r.label ? 'var(--blue)' : 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: selectedPriceRange === r.label ? 700 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 auto' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: '.6rem' }}>Precio personalizado</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" placeholder="Mín €" style={{ width: 110, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 13, color: '#fff', outline: 'none' }} value={filters.minPrice} onChange={e => { setSelectedPriceRange(''); set('minPrice', e.target.value); }} />
                    <input type="number" placeholder="Máx €" style={{ width: 110, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 13, color: '#fff', outline: 'none' }} value={filters.maxPrice} onChange={e => { setSelectedPriceRange(''); set('maxPrice', e.target.value); }} />
                  </div>
                </div>
                {activeCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 2 }}>
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
      </div>

      {/* ── CONTENIDO ── */}
      <div className="container" style={{ padding: '2.5rem 1.5rem 6rem' }}>

        {/* Pills + sort */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => set('mealPlan', '')} style={{ padding: '6px 16px', borderRadius: 'var(--r-full)', border: '1.5px solid', borderColor: !filters.mealPlan ? 'var(--blue)' : 'var(--border)', background: !filters.mealPlan ? 'var(--blue)' : 'var(--white)', color: !filters.mealPlan ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .18s' }}>
              Todos
            </button>
            {Object.entries(MEAL_LABELS).map(([val, label]) => (
              <button key={val} onClick={() => set('mealPlan', filters.mealPlan === val ? '' : val)}
                style={{ padding: '6px 16px', borderRadius: 'var(--r-full)', border: '1.5px solid', borderColor: filters.mealPlan === val ? 'var(--blue)' : 'var(--border)', background: filters.mealPlan === val ? 'var(--blue)' : 'var(--white)', color: filters.mealPlan === val ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .18s', display: 'flex', alignItems: 'center', gap: 5 }}>
                {MEAL_ICONS[val]} {label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              {loading ? 'Buscando...' : <><strong style={{ color: 'var(--blue)' }}>{total.toLocaleString('es-ES')}</strong> escapadas</>}
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
            {filters.destination && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}>
                <MapPin size={11} /> {filters.destination}
                <button onClick={() => set('destination', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', display: 'flex', padding: 0 }}><X size={11} /></button>
              </span>
            )}
            {filters.mealPlan && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}>
                {MEAL_ICONS[filters.mealPlan]} {MEAL_LABELS[filters.mealPlan]}
                <button onClick={() => set('mealPlan', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', display: 'flex', padding: 0 }}><X size={11} /></button>
              </span>
            )}
            {selectedPriceRange && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}>
                <DollarSign size={11} /> {selectedPriceRange}
                <button onClick={() => { setSelectedPriceRange(''); setFilters(f => ({ ...f, minPrice: '', maxPrice: '', page: 0 })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', display: 'flex', padding: 0 }}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="trips-grid">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} style={{ height: 380, borderRadius: 'var(--r-xl)', background: 'var(--paper2)', animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : displayedEscapadas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--r-xl)', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Moon size={28} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '.5rem' }}>No encontramos escapadas</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem' }}>Prueba con otros filtros</p>
            <button className="btn btn--ghost" onClick={reset}>Limpiar filtros</button>
          </div>
        ) : (
          <div className="trips-grid">
            {displayedEscapadas.map(e => (
              <EscapadaCard
                key={e.id}
                trip={e}
                onCompare={toggleCompare}
                isComparing={compareItems.some(c => c.id === e.id)}
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