// ================================================================
// VELARIS — TripsPage.jsx
// ================================================================
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal, X, Search, Clock, DollarSign,
  ArrowUpDown, Compass, MapPin, Filter, ChevronDown, Map
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { tripsApi } from '../api/client';
import TripCard from '../components/TripCard';
import CompareBar from '../components/CompareBar';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const velarisIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:#1C4E78;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(28,78,120,0.4);
    transform:rotate(-45deg);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

const CATEGORIES = [
  { value: 'playa',      label: 'Playa' },
  { value: 'ciudad',     label: 'Ciudad' },
  { value: 'aventura',   label: 'Aventura' },
  { value: 'cultura',    label: 'Cultura' },
  { value: 'naturaleza', label: 'Naturaleza' },
];

const SORT_OPTIONS = [
  { label: 'Fecha ↑',   value: 'date'       },
  { label: 'Fecha ↓',   value: 'date_desc'  },
  { label: 'Precio ↑',  value: 'price_asc'  },
  { label: 'Precio ↓',  value: 'price_desc' },
  { label: 'Duración',  value: 'duration'   },
];

const PRICE_RANGES = [
  { label: 'Menos de 500€',    min: '',     max: '500'  },
  { label: '500€ – 1.000€',   min: '500',  max: '1000' },
  { label: '1.000€ – 2.000€', min: '1000', max: '2000' },
  { label: 'Más de 2.000€',   min: '2000', max: ''     },
];

export default function TripsPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  // ← NUEVO: detectar si viene del buscador global
  const allTypes = sp.get('allTypes') === 'true';

  // Sincronizar filtros cuando cambian los searchParams (ej: búsqueda desde navbar estando ya en /trips)
  useEffect(() => {
    setFilters(f => ({
      ...f,
      destination: sp.get('destination') || '',
      category:    sp.get('category')    || '',
      from:        sp.get('from')        || '',
      page: 0,
    }));
  }, [sp.toString()]);

  const [trips, setTrips]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [totalPages, setTotalPages]   = useState(0);
  const [total, setTotal]             = useState(0);
  const [sort, setSort]               = useState('date');
  const [showMap, setShowMap]         = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [mapTrips, setMapTrips]       = useState([]);

  const [compareItems, setCompareItems] = useState([]);
  const toggleCompare = trip => {
    setCompareItems(prev =>
      prev.some(t => t.id === trip.id)
        ? prev.filter(t => t.id !== trip.id)
        : prev.length < 3 ? [...prev, trip] : prev
    );
  };

  const [filters, setFilters] = useState({
    destination: sp.get('destination') || '',
    category:    sp.get('category')    || '',
    minPrice:    '',
    maxPrice:    '',
    from:        sp.get('from') || '',
    to:          '',
    page:        0,
    size:        9,
  });

  useEffect(() => { load(); }, [filters.destination, filters.category, filters.minPrice, filters.maxPrice, filters.from, filters.to, filters.page, sort]);

  useEffect(() => {
    tripsApi.getAll({ size: 200, page: 0, type: 'viaje' })
      .then(r => setMapTrips(r.data?.content || []))
      .catch(() => setMapTrips([]));
  }, []);

  const load = () => {
    setLoading(true);
    const params = {};
    // ← CAMBIADO: solo filtrar por tipo viaje si no viene del buscador global
    if (!allTypes) params.type = 'viaje';
    if (filters.destination) params.destination = filters.destination;
    if (filters.category)    params.category    = filters.category;
    if (filters.minPrice)    params.minPrice    = filters.minPrice;
    if (filters.maxPrice)    params.maxPrice    = filters.maxPrice;
    if (filters.from)        params.from        = filters.from;
    if (filters.to)          params.to          = filters.to;
    if (sort)                params.sort        = sort;
    params.page = filters.page;
    params.size = filters.size;

    tripsApi.getAll(params)
      .then(r => {
        setTrips(r.data?.content || []);
        setTotalPages(r.data?.totalPages || 0);
        setTotal(r.data?.totalElements || 0);
      })
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  };

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 0 }));

  const reset = () => {
    setFilters({ destination:'', category:'', minPrice:'', maxPrice:'', from:'', to:'', page:0, size:9 });
    setSelectedPriceRange('');
  };

  const applyPriceRange = (range) => {
    if (selectedPriceRange === range.label) {
      setSelectedPriceRange('');
      setFilters(f => ({ ...f, minPrice:'', maxPrice:'', page:0 }));
    } else {
      setSelectedPriceRange(range.label);
      setFilters(f => ({ ...f, minPrice: range.min, maxPrice: range.max, page:0 }));
    }
  };

  const activeCount = [
    filters.destination, filters.category,
    filters.minPrice || filters.maxPrice,
    filters.from, filters.to,
  ].filter(Boolean).length;

  const mappableTrips = mapTrips.filter(t => t.latitude && t.longitude);

  return (
    <div style={{ background:'var(--paper)', minHeight:'100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', minHeight: 640, overflow: 'hidden',
        marginTop: 'calc(-1 * var(--nav-h))', display: 'flex', alignItems: 'center',
      }}>
        <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=90" alt="Destinos"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 40%' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(17,16,8,0.3) 0%, rgba(17,16,8,0.6) 60%, rgba(17,16,8,0.85) 100%)' }} />

        <div className="container" style={{
          position:'relative', zIndex:1, width:'100%',
          paddingTop: showFilters ? 'calc(var(--nav-h) + 5rem)' : 'calc(var(--nav-h) + 3rem)',
          paddingBottom:'3.5rem', transition:'padding-top .3s ease',
        }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,.12)', color:'rgba(255,255,255,.9)', fontSize:11, fontWeight:600, padding:'5px 14px', borderRadius:'var(--r-full)', marginBottom:'1.25rem', border:'1px solid rgba(255,255,255,.2)' }}>
            <Compass size={12} /> {allTypes ? 'Resultados de búsqueda' : 'Explorar destinos'}
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.2rem, 4vw, 3.5rem)', fontWeight:800, color:'#fff', lineHeight:1.1, marginBottom:'.75rem', letterSpacing:'-0.02em' }}>
            {filters.destination
              ? `Resultados para "${filters.destination}"`
              : filters.category
              ? `Viajes de ${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}`
              : <>Descubre el mundo<br /><em style={{ fontStyle:'italic', color:'rgba(255,255,255,.8)' }}>con Velaris</em></>}
          </h1>

          <p style={{ color:'rgba(255,255,255,.7)', fontSize:16, maxWidth:500, lineHeight:1.7, marginBottom:'2rem', fontWeight:300 }}>
            {allTypes
              ? 'Viajes, vuelos y escapadas que coinciden con tu búsqueda.'
              : 'Viajes únicos, experiencias auténticas. Filtra por categoría, presupuesto y fecha para encontrar el tuyo.'}
          </p>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap', maxWidth:680, marginBottom:'1.5rem' }}>
            <div style={{ flex:1, minWidth:220, display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.12)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,.25)', borderRadius:'var(--r-full)', padding:'12px 20px' }}>
              <Search size={15} style={{ color:'rgba(255,255,255,.6)', flexShrink:0 }} />
              <input style={{ background:'none', border:'none', outline:'none', color:'#fff', fontSize:15, width:'100%' }} placeholder="¿A dónde quieres ir?" value={filters.destination} onChange={e => set('destination', e.target.value)} />
              {filters.destination && <button onClick={() => set('destination', '')} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', cursor:'pointer', display:'flex' }}><X size={14} /></button>}
            </div>

            <button onClick={() => setShowMap(v => !v)} style={{ padding:'12px 22px', borderRadius:'var(--r-full)', background: showMap ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.25)', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:6, backdropFilter:'blur(8px)', transition:'all .18s' }}>
              <Map size={15} /> {showMap ? 'Ocultar mapa' : 'Ver mapa'}
            </button>

            <button onClick={() => setShowFilters(v => !v)} style={{ padding:'12px 22px', borderRadius:'var(--r-full)', background: showFilters ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.25)', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:6, backdropFilter:'blur(8px)', transition:'all .18s' }}>
              <Filter size={15} /> Filtros {activeCount > 0 && `(${activeCount})`}
              <ChevronDown size={13} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition:'transform .2s' }} />
            </button>
          </div>

          <div style={{ maxHeight: showFilters ? '600px' : '0px', overflow:'hidden', transition:'max-height .35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div style={{ background:'rgba(255,255,255,.1)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,.15)', borderRadius:'var(--r-xl)', padding:'1.5rem', maxWidth:900, opacity: showFilters ? 1 : 0, transform: showFilters ? 'translateY(0)' : 'translateY(-8px)', transition:'opacity .3s ease, transform .3s ease' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1.5rem', marginBottom:'1rem' }}>

                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.55)', marginBottom:'.6rem' }}>Categoría</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {CATEGORIES.map(c => (
                      <button key={c.value} onClick={() => set('category', filters.category === c.value ? '' : c.value)}
                        style={{ padding:'5px 14px', borderRadius:'var(--r-full)', border:'1.5px solid', borderColor: filters.category === c.value ? '#fff' : 'rgba(255,255,255,.25)', background: filters.category === c.value ? '#fff' : 'rgba(255,255,255,.08)', color: filters.category === c.value ? 'var(--blue)' : 'rgba(255,255,255,.85)', fontSize:13, fontWeight: filters.category === c.value ? 700 : 400, cursor:'pointer', transition:'all .15s' }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.55)', marginBottom:'.6rem' }}>Presupuesto</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {PRICE_RANGES.map(r => (
                      <button key={r.label} onClick={() => applyPriceRange(r)}
                        style={{ padding:'5px 14px', borderRadius:'var(--r-full)', border:'1.5px solid', borderColor: selectedPriceRange === r.label ? '#fff' : 'rgba(255,255,255,.25)', background: selectedPriceRange === r.label ? '#fff' : 'rgba(255,255,255,.08)', color: selectedPriceRange === r.label ? 'var(--blue)' : 'rgba(255,255,255,.85)', fontSize:13, fontWeight: selectedPriceRange === r.label ? 700 : 400, cursor:'pointer', transition:'all .15s' }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.55)', marginBottom:'.6rem' }}>Fecha de salida</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <input type="date" style={{ width:'100%', background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.25)', borderRadius:'var(--r-md)', padding:'8px 12px', fontSize:13, color:'#fff', outline:'none', colorScheme:'dark' }} value={filters.from} onChange={e => set('from', e.target.value)} />
                    <input type="date" style={{ width:'100%', background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.25)', borderRadius:'var(--r-md)', padding:'8px 12px', fontSize:13, color:'#fff', outline:'none', colorScheme:'dark' }} value={filters.to} onChange={e => set('to', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ paddingTop:'1rem', borderTop:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'flex-end', gap:'1.5rem', flexWrap:'wrap' }}>
                <div style={{ flex:'0 0 auto' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.55)', marginBottom:'.6rem' }}>Precio personalizado</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <input type="number" placeholder="Mín €" style={{ width:110, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.25)', borderRadius:'var(--r-md)', padding:'8px 12px', fontSize:13, color:'#fff', outline:'none' }} value={filters.minPrice} onChange={e => { setSelectedPriceRange(''); set('minPrice', e.target.value); }} />
                    <input type="number" placeholder="Máx €" style={{ width:110, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.25)', borderRadius:'var(--r-md)', padding:'8px 12px', fontSize:13, color:'#fff', outline:'none' }} value={filters.maxPrice} onChange={e => { setSelectedPriceRange(''); set('maxPrice', e.target.value); }} />
                  </div>
                </div>
                {activeCount > 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:2 }}>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,.5)' }}>{activeCount} {activeCount === 1 ? 'filtro activo' : 'filtros activos'}</span>
                    <button onClick={reset} style={{ fontSize:12, color:'#fff', fontWeight:600, background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.2)', cursor:'pointer', padding:'6px 14px', borderRadius:'var(--r-full)', display:'flex', alignItems:'center', gap:4 }}>
                      <X size={11} /> Limpiar todos
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAPA ── */}
      {showMap && (
        <div className="container" style={{ padding:'2rem 1.5rem 0' }}>
          <div style={{ borderRadius:'var(--r-2xl)', overflow:'hidden', border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', background:'var(--white)' }}>
            <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--white)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background:'var(--blue-light)', color:'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Map size={16} />
                </div>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--ink)' }}>Mapa de destinos</div>
                  <div style={{ fontSize:12, color:'var(--muted)' }}>{mappableTrips.length} destinos disponibles · Haz click en un pin para ver el viaje</div>
                </div>
              </div>
              <button onClick={() => setShowMap(false)} style={{ width:30, height:30, borderRadius:'50%', border:'1px solid var(--border)', background:'var(--paper2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--muted)' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ height:400, position:'relative' }}>
              <MapContainer center={[30, 15]} zoom={2} style={{ height:'100%', width:'100%' }} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' />
                {mappableTrips.map(trip => {
                  const img = trip.imageUrl?.split(',')[0]?.trim();
                  return (
                    <Marker key={trip.id} position={[trip.latitude, trip.longitude]} icon={velarisIcon}>
                      <Popup maxWidth={220}>
                        <div style={{ fontFamily:'system-ui, sans-serif', padding:'2px 0' }}>
                          {img && <img src={img} alt={trip.title} style={{ width:'100%', height:100, objectFit:'cover', borderRadius:8, marginBottom:8, display:'block' }} />}
                          <div style={{ fontSize:13, fontWeight:700, color:'#111', marginBottom:3, lineHeight:1.3 }}>{trip.title}</div>
                          <div style={{ fontSize:11, color:'#888', marginBottom:8, display:'flex', alignItems:'center', gap:3 }}>📍 {trip.destination}</div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div>
                              <div style={{ fontSize:10, color:'#aaa' }}>desde</div>
                              <div style={{ fontSize:16, fontWeight:800, color:'#1C4E78' }}>€{Number(trip.price).toLocaleString('es-ES')}</div>
                            </div>
                            <a href={`/trips/${trip.id}`} style={{ fontSize:12, fontWeight:600, color:'#fff', background:'#1C4E78', padding:'6px 14px', borderRadius:999, textDecoration:'none' }}>Ver →</a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENIDO ── */}
      <div className="container" style={{ padding:'2.5rem 1.5rem 6rem' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={() => set('category', '')} style={{ padding:'6px 16px', borderRadius:'var(--r-full)', border:'1.5px solid', borderColor: !filters.category ? 'var(--blue)' : 'var(--border)', background: !filters.category ? 'var(--blue)' : 'var(--white)', color: !filters.category ? '#fff' : 'var(--ink)', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all .18s' }}>
              Todos
            </button>
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => set('category', filters.category === c.value ? '' : c.value)}
                style={{ padding:'6px 16px', borderRadius:'var(--r-full)', border:'1.5px solid', borderColor: filters.category === c.value ? 'var(--blue)' : 'var(--border)', background: filters.category === c.value ? 'var(--blue)' : 'var(--white)', color: filters.category === c.value ? '#fff' : 'var(--ink)', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all .18s' }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <span style={{ fontSize:13, color:'var(--muted)' }}>
              {loading ? 'Buscando...' : <><strong style={{ color:'var(--blue)' }}>{total.toLocaleString('es-ES')}</strong> resultados</>}
            </span>
            <div style={{ display:'flex', gap:4 }}>
              {SORT_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setSort(o.value)}
                  style={{ padding:'5px 12px', borderRadius:'var(--r-full)', border:'1.5px solid', borderColor: sort === o.value ? 'var(--blue)' : 'var(--border)', background: sort === o.value ? 'var(--blue-light)' : 'var(--white)', color: sort === o.value ? 'var(--blue)' : 'var(--ink)', fontSize:12, fontWeight: sort === o.value ? 600 : 400, cursor:'pointer', transition:'all .15s' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeCount > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1rem' }}>
            {filters.destination && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:'var(--r-full)', background:'var(--blue-light)', color:'var(--blue)', fontSize:12, fontWeight:600 }}>
                <MapPin size={11}/> {filters.destination}
                <button onClick={() => set('destination', '')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--blue)', display:'flex', padding:0 }}><X size={11}/></button>
              </span>
            )}
            {filters.category && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:'var(--r-full)', background:'var(--blue-light)', color:'var(--blue)', fontSize:12, fontWeight:600 }}>
                {filters.category}
                <button onClick={() => set('category', '')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--blue)', display:'flex', padding:0 }}><X size={11}/></button>
              </span>
            )}
            {selectedPriceRange && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:'var(--r-full)', background:'var(--blue-light)', color:'var(--blue)', fontSize:12, fontWeight:600 }}>
                <DollarSign size={11}/> {selectedPriceRange}
                <button onClick={() => { setSelectedPriceRange(''); setFilters(f => ({...f, minPrice:'', maxPrice:'', page:0})); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--blue)', display:'flex', padding:0 }}><X size={11}/></button>
              </span>
            )}
            {filters.from && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:'var(--r-full)', background:'var(--blue-light)', color:'var(--blue)', fontSize:12, fontWeight:600 }}>
                <Clock size={11}/> Desde {filters.from}
                <button onClick={() => set('from', '')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--blue)', display:'flex', padding:0 }}><X size={11}/></button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="trips-grid">
            {Array(9).fill(0).map((_,i) => (
              <div key={i} style={{ height:320, borderRadius:'var(--r-xl)', background:'var(--paper2)', animation:'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem 2rem', background:'var(--white)', borderRadius:'var(--r-xl)', border:'1px solid var(--border)' }}>
            <div style={{ width:64, height:64, borderRadius:'var(--r-xl)', background:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', color:'var(--blue)' }}>
              <Compass size={28} />
            </div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, marginBottom:'.5rem' }}>No encontramos resultados</h3>
            <p style={{ color:'var(--muted)', fontSize:14, marginBottom:'1.5rem' }}>Prueba con otros filtros o explora todos nuestros destinos</p>
            <button className="btn btn--ghost" onClick={reset}>Limpiar filtros</button>
          </div>
        ) : (
          <div className="trips-grid">
            {trips.map(t => (
              <TripCard
                key={t.id}
                trip={t}
                onCompare={toggleCompare}
                isComparing={compareItems.some(c => c.id === t.id)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn-pagination btn-pagination--arrow" disabled={filters.page === 0} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}>←</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_,i) => {
              const p = filters.page <= 3 ? i : filters.page - 3 + i;
              if (p >= totalPages) return null;
              return (
                <button key={p} className={`btn-pagination ${p === filters.page ? 'btn-pagination--active' : ''}`} onClick={() => setFilters(f => ({...f, page: p}))}>
                  {p + 1}
                </button>
              );
            })}
            <button className="btn-pagination btn-pagination--arrow" disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>→</button>
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