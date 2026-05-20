// ================================================================
// VELARIS — AdminPage.jsx
// ================================================================
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Plane, Calendar, Users, BarChart2,
  Plus, Edit, Trash2, Check, DollarSign, Download,
  TrendingUp, PieChart as PieIcon, MapPin, Moon, Globe,
  Power, UserX, UserCheck
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { adminApi, tripsApi } from '../api/client';

function fmt(n)    { return Number(n || 0).toLocaleString('es-ES'); }
function fmtEur(n) { return '€' + fmt(n); }
function fmtDate(d){ return d ? new Date(d).toLocaleDateString('es-ES') : '—'; }
function str(v)    { return v == null ? '' : String(v); }

const STATUS_COLORS = {
  PENDING:   { bg:'var(--warning-bg)',  color:'var(--warning)' },
  CONFIRMED: { bg:'var(--success-bg)',  color:'var(--success)' },
  CANCELLED: { bg:'var(--danger-bg)',   color:'var(--danger)'  },
  COMPLETED: { bg:'var(--blue-light)',  color:'var(--blue)'    },
};
const STATUS_LABELS = {
  PENDING:'Pendiente', CONFIRMED:'Confirmada',
  CANCELLED:'Cancelada', COMPLETED:'Completada'
};

const TYPE_CONFIG = {
  viaje:    { label:'Viaje',    bg:'var(--paper2)',       color:'var(--ink2)',  icon:<Globe size={11}/> },
  vuelo:    { label:'Vuelo',    bg:'var(--blue-light)',   color:'var(--blue)',  icon:<Plane size={11}/> },
  escapada: { label:'Escapada', bg:'rgba(21,128,61,.12)', color:'#166534',      icon:<Moon size={11}/>  },
};

const EMPTY_TRIP = {
  title:'', description:'', destination:'', origin:'Madrid',
  price:'', departureDate:'', returnDate:'',
  durationDays:'', availableSeats:'', imageUrl:'',
  category:'playa', type:'viaje',
  airline:'', flightNumber:'', cabinClass:'turista', includesHotel:false,
  hotelName:'', hotelStars:'', mealPlan:'desayuno', highlight:'',
  latitude:'', longitude:'',
};

const NAV = [
  { id:'dashboard', label:'Dashboard',    icon:<LayoutDashboard size={16}/> },
  { id:'trips',     label:'Viajes',       icon:<Globe size={16}/> },
  { id:'flights',   label:'Vuelos',       icon:<Plane size={16}/> },
  { id:'escapadas', label:'Escapadas',    icon:<Moon size={16}/> },
  { id:'bookings',  label:'Reservas',     icon:<Calendar size={16}/> },
  { id:'users',     label:'Usuarios',     icon:<Users size={16}/> },
  { id:'stats',     label:'Estadísticas', icon:<BarChart2 size={16}/> },
];

const PIE_COLORS = ['#1c4e78','#f59e0b','#10b981','#ef4444'];

// ── TypeBadge ────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.viaje;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'2px 9px', borderRadius:'var(--r-full)',
      fontSize:11, fontWeight:600,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── TripTable ────────────────────────────────────────────────────
function TripTable({ trips, onEdit, onToggle, typeFilter }) {
  const filtered = typeFilter ? trips.filter(t => (t.type || 'viaje') === typeFilter) : trips;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Título</th>
            {!typeFilter && <th>Tipo</th>}
            <th>Destino</th>
            <th>Precio</th>
            <th>Plazas</th>
            <th>Salida</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id}>
              <td style={{ fontWeight:600, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {t.title}
              </td>
              {!typeFilter && <td><TypeBadge type={t.type || 'viaje'} /></td>}
              <td style={{ maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--muted)', fontSize:13 }}>
                {t.destination}
              </td>
              <td><strong>{fmtEur(t.price)}</strong></td>
              <td style={{ color: t.availableSeats < 5 ? 'var(--danger)' : 'inherit' }}>
                {t.availableSeats}
              </td>
              <td style={{ color:'var(--muted)', fontSize:13 }}>{fmtDate(t.departureDate)}</td>
              <td>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  padding:'3px 10px', borderRadius:'var(--r-full)',
                  fontSize:11, fontWeight:600,
                  background: t.active ? 'var(--success-bg)' : 'var(--paper2)',
                  color: t.active ? 'var(--success)' : 'var(--ink2)',
                }}>
                  {t.active ? '● Activo' : '○ Inactivo'}
                </span>
              </td>
              <td>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => onEdit(t)} style={{ width:30, height:30, borderRadius:6, border:'1px solid var(--border)', background:'var(--white)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--blue)' }}>
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => onToggle(t.id)}
                    title={t.active ? 'Desactivar' : 'Activar'}
                    style={{ width:30, height:30, borderRadius:6, border:'1px solid', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                      borderColor: t.active ? 'var(--danger)' : 'var(--success)',
                      background:  t.active ? 'var(--danger-bg)' : 'var(--success-bg)',
                      color:       t.active ? 'var(--danger)' : 'var(--success)',
                    }}>
                    <Power size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'var(--muted)' }}>Sin resultados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── TypeStats ────────────────────────────────────────────────────
function TypeStats({ trips, type, total, activeCount }) {
  const cfg = TYPE_CONFIG[type];
  const avgPrice = trips.length > 0
    ? Math.round(trips.reduce((s, t) => s + Number(t.price), 0) / trips.length)
    : 0;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
      {[
        { label:'Total',        val: fmt(total) },
        { label:'Activos',      val: fmt(activeCount) },
        { label:'Precio medio', val: fmtEur(avgPrice) },
      ].map((k,i) => (
        <div key={i} style={{
          background: cfg.bg, border:`1px solid ${cfg.color}22`,
          borderRadius:'var(--r-xl)', padding:'1rem 1.25rem',
        }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:cfg.color, marginBottom:4 }}>
            {k.label}
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, color:cfg.color }}>
            {k.val}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── FormModal ────────────────────────────────────────────────────
function FormModal({ initialData, editId, onClose, onSave }) {
  const [form, setForm]     = useState(initialData);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState('');

  const prevEditId = useRef(editId);
  useEffect(() => {
    if (prevEditId.current !== editId) prevEditId.current = editId;
    setForm(initialData);
    setError('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleOverlayMouseDown = e => { if (e.target === e.currentTarget) onClose(); };

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = {
        ...form,
        price:          Number(form.price),
        durationDays:   Number(form.durationDays),
        availableSeats: Number(form.availableSeats),
        hotelStars:     form.hotelStars !== '' ? Number(form.hotelStars) : null,
        latitude:       form.latitude   !== '' ? Number(form.latitude)   : null,
        longitude:      form.longitude  !== '' ? Number(form.longitude)  : null,
      };
      await onSave(payload);
    } catch (ex) {
      setError(ex.response?.data?.message || 'Error al guardar');
    }
    setBusy(false);
  };

  const f = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div className="modal" style={{ maxWidth:700 }} onMouseDown={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>

              <div className="form-group">
                <label>Tipo *</label>
                <select className="input" value={form.type} onChange={e => f('type', e.target.value)}>
                  <option value="viaje">Viaje</option>
                  <option value="vuelo">Vuelo</option>
                  <option value="escapada">Escapada</option>
                </select>
              </div>

              <div className="form-group">
                <label>Categoría *</label>
                <select className="input" required value={form.category} onChange={e => f('category', e.target.value)}>
                  {['playa','ciudad','aventura','cultura','naturaleza'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label>Título *</label>
                <input className="input" required maxLength={200} value={form.title} onChange={e => f('title', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Destino *</label>
                <input className="input" required maxLength={150} placeholder="Ej: Bali, Indonesia" value={form.destination} onChange={e => f('destination', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Origen</label>
                <input className="input" maxLength={150} placeholder="Madrid" value={form.origin} onChange={e => f('origin', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Precio (€) *</label>
                <input className="input" type="number" required min="0" step="0.01" value={form.price} onChange={e => f('price', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Plazas *</label>
                <input className="input" type="number" required min="0" value={form.availableSeats} onChange={e => f('availableSeats', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Fecha de salida *</label>
                <input className="input" type="date" required value={form.departureDate} onChange={e => f('departureDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Fecha de regreso *</label>
                <input className="input" type="date" required value={form.returnDate} onChange={e => f('returnDate', e.target.value)} />
              </div>

              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label>Duración (días) *</label>
                <input className="input" type="number" required min="1" value={form.durationDays} onChange={e => f('durationDays', e.target.value)} />
              </div>

              {form.type === 'vuelo' && (<>
                <div className="form-group">
                  <label>Aerolínea</label>
                  <input className="input" placeholder="Iberia" value={form.airline} onChange={e => f('airline', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Número de vuelo</label>
                  <input className="input" placeholder="IB3547" value={form.flightNumber} onChange={e => f('flightNumber', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Clase</label>
                  <select className="input" value={form.cabinClass} onChange={e => f('cabinClass', e.target.value)}>
                    <option value="turista">Turista</option>
                    <option value="business">Business</option>
                    <option value="primera">Primera clase</option>
                  </select>
                </div>
                <div className="form-group" style={{ display:'flex', alignItems:'center', gap:10, paddingTop:'1.5rem' }}>
                  <input type="checkbox" id="includesHotel" checked={form.includesHotel} onChange={e => f('includesHotel', e.target.checked)} />
                  <label htmlFor="includesHotel" style={{ cursor:'pointer', fontWeight:500 }}>Incluye hotel</label>
                </div>
              </>)}

              {form.type === 'escapada' && (<>
                <div className="form-group">
                  <label>Nombre del hotel</label>
                  <input className="input" placeholder="Hotel Alfonso XIII" value={form.hotelName} onChange={e => f('hotelName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Estrellas (1-5)</label>
                  <input className="input" type="number" min="1" max="5" value={form.hotelStars} onChange={e => f('hotelStars', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Régimen</label>
                  <select className="input" value={form.mealPlan} onChange={e => f('mealPlan', e.target.value)}>
                    <option value="sin_comidas">Solo alojamiento</option>
                    <option value="desayuno">Desayuno incluido</option>
                    <option value="media_pension">Media pensión</option>
                    <option value="todo_incluido">Todo incluido</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Destacado</label>
                  <input className="input" placeholder="Vista al mar incluida" value={form.highlight} onChange={e => f('highlight', e.target.value)} />
                </div>
              </>)}

              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label>URL de imagen</label>
                <input className="input" type="url" placeholder="https://images.unsplash.com/..." value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Latitud (opcional)</label>
                <input className="input" type="number" step="0.0001" placeholder="Ej: 41.3851" value={form.latitude} onChange={e => f('latitude', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Longitud (opcional)</label>
                <input className="input" type="number" step="0.0001" placeholder="Ej: 2.1734" value={form.longitude} onChange={e => f('longitude', e.target.value)} />
              </div>

              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label>Descripción</label>
                <textarea className="input" rows={4} value={form.description} onChange={e => f('description', e.target.value)} style={{ resize:'vertical' }} />
              </div>
            </div>

            {error && (
              <div style={{ color:'var(--danger)', fontSize:13, padding:'8px 12px', background:'var(--danger-bg)', borderRadius:'var(--r-sm)' }}>
                {error}
              </div>
            )}

            <div style={{ display:'flex', gap:'.75rem', justifyContent:'flex-end', paddingTop:'.5rem', borderTop:'1px solid var(--border)' }}>
              <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
                <Check size={14} /> {busy ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [tab, setTab]     = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);           // solo para dashboard/stats
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalData, setModalData] = useState(null);
  const [editId, setEditId]       = useState(null);

  const [bookingsPage, setBookingsPage]               = useState(0);
  const [bookingsTotalPages, setBookingsTotalPages]   = useState(0);

  // ← NUEVO: estado de paginación por tipo
  const [tripsByType, setTripsByType]         = useState({ viaje:[], vuelo:[], escapada:[] });
  const [pageByType, setPageByType]           = useState({ viaje:0,  vuelo:0,  escapada:0  });
  const [totalPagesByType, setTotalPagesByType] = useState({ viaje:0, vuelo:0, escapada:0  });
  const [totalElementsByType, setTotalElementsByType] = useState({ viaje:0, vuelo:0, escapada:0 });

  // ← NUEVO: carga paginada por tipo
  const loadByType = async (type, page = 0) => {
  try {
    const { data } = await adminApi.getTripsByType(type, page);
    setTripsByType(prev => ({ ...prev, [type]: data.content || [] }));
    setTotalPagesByType(prev => ({ ...prev, [type]: data.totalPages || 0 }));
    setTotalElementsByType(prev => ({ ...prev, [type]: data.totalElements || 0 })); // ← NUEVO
    setPageByType(prev => ({ ...prev, [type]: page }));
  } catch {}
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, t, b, u] = await Promise.all([
        adminApi.getStats(),
        tripsApi.getAllAdmin(),
        adminApi.allBookings(0),
        adminApi.getAllUsers(),
      ]);
      setStats(s.data);
      setTrips(Array.isArray(t.data) ? t.data : (t.data?.content || []));
      setBookings(b.data?.content || []);
      setBookingsTotalPages(b.data?.totalPages || 0);
      setUsers(Array.isArray(u.data) ? u.data : []);
      // Cargar la primera página de cada tipo
      await Promise.all([
        loadByType('viaje', 0),
        loadByType('vuelo', 0),
        loadByType('escapada', 0),
      ]);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const loadBookings = () => {
    adminApi.allBookings(bookingsPage)
      .then(r => {
        setBookings(r.data?.content || []);
        setBookingsTotalPages(r.data?.totalPages || 0);
      });
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (tab === 'bookings') loadBookings(); }, [bookingsPage]);
  useEffect(() => { if (tab === 'trips')     loadByType('viaje',    pageByType.viaje);    }, [tab === 'trips'     ? tab : null]);
  useEffect(() => { if (tab === 'flights')   loadByType('vuelo',    pageByType.vuelo);    }, [tab === 'flights'   ? tab : null]);
  useEffect(() => { if (tab === 'escapadas') loadByType('escapada', pageByType.escapada); }, [tab === 'escapadas' ? tab : null]);

  const openNew = (type = 'viaje') => {
    setEditId(null);
    setModalData({ ...EMPTY_TRIP, type });
  };

  const openEdit = t => {
    setEditId(t.id);
    setModalData({
      ...EMPTY_TRIP, ...t,
      price:          str(t.price),
      durationDays:   str(t.durationDays),
      availableSeats: str(t.availableSeats),
      hotelStars:     str(t.hotelStars),
      latitude:       str(t.latitude),
      longitude:      str(t.longitude),
      airline:        str(t.airline),
      flightNumber:   str(t.flightNumber),
      cabinClass:     t.cabinClass  || 'turista',
      hotelName:      str(t.hotelName),
      mealPlan:       t.mealPlan    || 'desayuno',
      highlight:      str(t.highlight),
      imageUrl:       str(t.imageUrl),
      origin:         str(t.origin),
      description:    str(t.description),
      includesHotel:  !!t.includesHotel,
    });
  };

  const closeModal = () => { setModalData(null); setEditId(null); };

  const handleSave = async payload => {
  const type = payload.type || 'viaje';
  if (editId) {
    await adminApi.updateTrip(editId, payload);
  } else {
    await adminApi.createTrip(payload);
    if (stats) setStats(s => ({ ...s, totalTrips: (s.totalTrips || 0) + 1 }));
  }
  closeModal();
  loadByType(type, pageByType[type] || 0);
  tripsApi.getAllAdmin().then(r => setTrips(Array.isArray(r.data) ? r.data : (r.data?.content || [])));
};

const toggleTrip = async (id, type) => {
  try {
    await adminApi.toggleTrip(id);
    loadByType(type, pageByType[type] || 0);
    tripsApi.getAllAdmin().then(r => setTrips(Array.isArray(r.data) ? r.data : (r.data?.content || [])));
  } catch {}
};

  const updateBookingStatus = async (id, status) => {
    try {
      const { data } = await adminApi.updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? data : b));
      adminApi.getStats().then(r => setStats(r.data)).catch(() => {});
    } catch {}
  };

  const exportCSV = async () => {
    try {
      const { data } = await adminApi.exportBookings();
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a'); a.href = url;
      a.download = 'reservas-velaris.csv'; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Error al exportar'); }
  };

  const toggleUser = async id => {
    try {
      const { data } = await adminApi.toggleUser(id);
      setUsers(prev => prev.map(u => u.id === id ? data : u));
    } catch {}
  };

const countByType = type => {
  const fromAll = trips.filter(t => (t.type || 'viaje') === type).length;
  return fromAll || totalElementsByType[type] || 0;
};

  // ← NUEVO: componente de paginación reutilizable para las tabs de productos
  const TypePagination = ({ type }) => {
    const page  = pageByType[type];
    const total = totalPagesByType[type];
    if (total <= 1) return null;
    return (
      <div className="pagination">
        <button className="btn-pagination btn-pagination--arrow" disabled={page === 0} onClick={() => loadByType(type, page - 1)}>←</button>
        <span style={{ fontSize:14, color:'var(--muted)', padding:'0 1rem' }}>Página {page + 1} de {total}</span>
        <button className="btn-pagination btn-pagination--arrow" disabled={page >= total - 1} onClick={() => loadByType(type, page + 1)}>→</button>
      </div>
    );
  };

  const pieData = stats ? [
    { name:'Confirmadas', value: stats.confirmedBookings || 0 },
    { name:'Pendientes',  value: stats.pendingBookings   || 0 },
    { name:'Completadas', value: stats.completedBookings || 0 },
    { name:'Canceladas',  value: stats.cancelledBookings || 0 },
  ] : [];

  if (loading) return (
    <div className="admin-layout">
      <aside className="admin-sidebar" />
      <main className="admin-content" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', color:'var(--muted)' }}>
          <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--blue)', borderTopColor:'transparent', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }} />
          Cargando panel...
        </div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout">

      {modalData && (
        <FormModal
          initialData={modalData}
          editId={editId}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div style={{ padding:'1.5rem 1rem 1rem', marginBottom:'0.25rem' }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.18em', color:'rgba(250,250,248,0.28)', textTransform:'uppercase', marginBottom:'0.5rem' }}>
            Panel de control
          </div>
          <div style={{ height:1, background:'linear-gradient(to right, rgba(158,123,58,0.5), rgba(158,123,58,0.12), transparent)' }} />
        </div>

        <nav className="admin-nav">
          {NAV.map(n => (
            <button key={n.id}
              className={`admin-nav-btn ${tab === n.id ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setTab(n.id)}>
              {n.icon}
              <span style={{ flex:1 }}>{n.label}</span>
              {n.id === 'trips'     && <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background:'rgba(250,250,248,.1)', color:'rgba(250,250,248,.5)' }}>{countByType('viaje')}</span>}
              {n.id === 'flights'   && <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background:'rgba(250,250,248,.1)', color:'rgba(250,250,248,.5)' }}>{countByType('vuelo')}</span>}
              {n.id === 'escapadas' && <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background:'rgba(250,250,248,.1)', color:'rgba(250,250,248,.5)' }}>{countByType('escapada')}</span>}
              {n.id === 'users'     && <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background:'rgba(250,250,248,.1)', color:'rgba(250,250,248,.5)' }}>{users.length}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__ai-status">
          <div className="admin-sidebar__ai-label">Estado del sistema</div>
          <div className="admin-sidebar__ai-status-row">
            <div className="admin-sidebar__ai-dot" /> Vera IA · Online
          </div>
        </div>

        <div className="admin-sidebar__user">
          <div className="admin-sidebar__user-avatar">A</div>
          <div>
            <div className="admin-sidebar__user-name">Administrador</div>
            <div className="admin-sidebar__user-role">ROLE_ADMIN</div>
          </div>
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <main className="admin-content">

        {/* ══ DASHBOARD ══ */}
        {tab === 'dashboard' && stats && (
          <>
            <div className="admin-content__header">
              <div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700, color:'var(--ink)' }}>Dashboard</h1>
                <p style={{ color:'var(--muted)', fontSize:14 }}>
                  {new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                </p>
              </div>
              <div className="admin-content__header-actions">
                <button className="btn btn--ghost btn--sm" onClick={loadAll}>↺ Actualizar</button>
                <button className="btn btn--primary btn--sm" onClick={() => { setTab('trips'); openNew(); }}>
                  <Plus size={14} /> Nuevo producto
                </button>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.25rem', marginBottom:'1.5rem' }}>
              {[
                { icon:<DollarSign size={20}/>, cls:'admin-kpi__icon--pink',  label:'Ingresos totales',  val: fmtEur(stats.totalRevenue) },
                { icon:<Calendar size={20}/>,   cls:'admin-kpi__icon--green', label:'Total reservas',    val: fmt(stats.totalBookings) },
                { icon:<Globe size={20}/>,      cls:'admin-kpi__icon--teal',  label:'Productos activos', val: fmt(stats.totalTrips) },
                { icon:<Users size={20}/>,      cls:'admin-kpi__icon--pink',  label:'Usuarios',          val: fmt(stats.totalUsers) },
              ].map((k,i) => (
                <div key={i} className="admin-kpi">
                  <div className={`admin-kpi__icon ${k.cls}`}>{k.icon}</div>
                  <div className="admin-kpi__label">{k.label}</div>
                  <div className="admin-kpi__value">{k.val}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
              {['viaje','vuelo','escapada'].map(type => {
                const cfg = TYPE_CONFIG[type];
                const count = countByType(type);
                const avg = count > 0
                  ? Math.round(trips.filter(t=>(t.type||'viaje')===type).reduce((s,t)=>s+Number(t.price),0)/count)
                  : 0;
                return (
                  <div key={type} style={{ background:'var(--white)', borderRadius:'var(--r-xl)', border:'1px solid var(--border)', padding:'1.25rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:cfg.bg, color:cfg.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                      {cfg.icon}
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--muted)', marginBottom:2 }}>{cfg.label}s</div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:800, color:'var(--ink)', lineHeight:1 }}>{fmt(count)}</div>
                      <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>Precio medio: {fmtEur(avg)}</div>
                    </div>
                    <button
                      onClick={() => setTab(type === 'viaje' ? 'trips' : type === 'vuelo' ? 'flights' : 'escapadas')}
                      style={{ marginLeft:'auto', fontSize:12, color:cfg.color, fontWeight:600, background:cfg.bg, border:'none', cursor:'pointer', padding:'5px 12px', borderRadius:'var(--r-full)' }}>
                      Ver →
                    </button>
                  </div>
                );
              })}
            </div>

            {stats.revenueByMonth?.length > 0 && (
              <div className="admin-chart-card" style={{ marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                  <TrendingUp size={16} color="var(--blue)" />
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', margin:0 }}>Ingresos por mes</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--muted)' }} />
                    <YAxis tick={{ fontSize:11, fill:'var(--muted)' }} tickFormatter={v => '€'+Number(v).toLocaleString('es-ES')} />
                    <Tooltip formatter={v => ['€'+Number(v).toLocaleString('es-ES'), 'Ingresos']} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--blue)" strokeWidth={2.5} dot={{ fill:'var(--blue)', r:4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="admin-charts__grid" style={{ marginBottom:'1.5rem' }}>
              <div className="admin-chart-card">
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                  <PieIcon size={16} color="var(--blue)" />
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', margin:0 }}>Estado de reservas</h3>
                </div>
                {stats.totalBookings > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={190}>
                      <PieChart>
                        <Pie data={pieData.filter(d=>d.value>0)} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({percent}) => percent>0.05 ? `${(percent*100).toFixed(0)}%` : ''} labelLine={false}>
                          {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:8 }}>
                      {pieData.map((d,i) => (
                        <span key={d.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--ink2)' }}>
                          <span style={{ width:8, height:8, borderRadius:'50%', background:PIE_COLORS[i], display:'inline-block' }} />
                          {d.name} ({d.value})
                        </span>
                      ))}
                    </div>
                  </>
                ) : <p style={{ color:'var(--muted)', fontSize:14, textAlign:'center', padding:'3rem 0' }}>Sin reservas aún</p>}
              </div>

              <div className="admin-chart-card">
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                  <MapPin size={16} color="var(--blue)" />
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', margin:0 }}>Top destinos</h3>
                </div>
                {stats.topDestinations?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.topDestinations.slice(0,5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fontSize:10, fill:'var(--muted)' }} allowDecimals={false} />
                      <YAxis type="category" dataKey="destination" width={100} tick={{ fontSize:10, fill:'var(--muted)' }} tickFormatter={v=>v.split(',')[0]} />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--blue)" radius={[0,4,4,0]} name="Reservas" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p style={{ color:'var(--muted)', fontSize:14, textAlign:'center', padding:'3rem 0' }}>Sin datos aún</p>}
              </div>
            </div>

            <div className="admin-table-wrap">
              <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700 }}>Últimas reservas</h3>
                <button className="btn btn--ghost btn--sm" onClick={() => setTab('bookings')}>Ver todas →</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Producto</th><th>Viajeros</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
                <tbody>
                  {bookings.slice(0,6).map(b => {
                    const sc = STATUS_COLORS[b.status] || STATUS_COLORS.PENDING;
                    return (
                      <tr key={b.id}>
                        <td style={{ color:'var(--ink3)', fontSize:12 }}>#{b.id}</td>
                        <td style={{ fontWeight:500, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.trip?.title}</td>
                        <td>{b.numTravelers}</td>
                        <td><strong>{fmtEur(b.totalPrice)}</strong></td>
                        <td><span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:'var(--r-full)', fontSize:11, fontWeight:600, background:sc.bg, color:sc.color }}>{STATUS_LABELS[b.status]}</span></td>
                        <td style={{ color:'var(--muted)', fontSize:13 }}>{fmtDate(b.bookedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ══ VIAJES ══ */}
        {tab === 'trips' && (
          <>
            <div className="admin-content__header">
              <div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700 }}>Gestión de viajes</h1>
                <p style={{ color:'var(--muted)', fontSize:14 }}>{countByType('viaje')} viajes</p>
              </div>
              <button className="btn btn--primary btn--sm" onClick={() => openNew('viaje')}><Plus size={14} /> Nuevo viaje</button>
            </div>
            <TypeStats trips={tripsByType.viaje} type="viaje" total={totalElementsByType.viaje} activeCount={tripsByType.viaje.filter(t => t.active).length} />
            <TripTable trips={tripsByType.viaje} onEdit={openEdit} onToggle={id => toggleTrip(id, 'viaje')} typeFilter="viaje" />
            <TypePagination type="viaje" />
          </>
        )}

        {/* ══ VUELOS ══ */}
        {tab === 'flights' && (
          <>
            <div className="admin-content__header">
              <div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700 }}>Gestión de vuelos</h1>
                <p style={{ color:'var(--muted)', fontSize:14 }}>{countByType('vuelo')} vuelos</p>
              </div>
              <button className="btn btn--primary btn--sm" onClick={() => openNew('vuelo')}><Plus size={14} /> Nuevo vuelo</button>
            </div>
            <TypeStats trips={tripsByType.vuelo} type="vuelo" total={totalElementsByType.vuelo} activeCount={tripsByType.vuelo.filter(t => t.active).length} />
            <TripTable trips={tripsByType.vuelo} onEdit={openEdit} onToggle={id => toggleTrip(id, 'vuelo')} typeFilter="vuelo" />
            <TypePagination type="vuelo" />
          </>
        )}

        {/* ══ ESCAPADAS ══ */}
        {tab === 'escapadas' && (
          <>
            <div className="admin-content__header">
              <div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700 }}>Gestión de escapadas</h1>
                <p style={{ color:'var(--muted)', fontSize:14 }}>{countByType('escapada')} escapadas</p>
              </div>
              <button className="btn btn--primary btn--sm" onClick={() => openNew('escapada')}><Plus size={14} /> Nueva escapada</button>
            </div>
            <TypeStats trips={tripsByType.escapada} type="escapada" total={totalElementsByType.escapada} activeCount={tripsByType.escapada.filter(t => t.active).length} />
            <TripTable trips={tripsByType.escapada} onEdit={openEdit} onToggle={id => toggleTrip(id, 'escapada')} typeFilter="escapada" />
            <TypePagination type="escapada" />
          </>
        )}

        {/* ══ RESERVAS ══ */}
        {tab === 'bookings' && (
          <>
            <div className="admin-content__header">
              <div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700 }}>Gestión de reservas</h1>
                <p style={{ color:'var(--muted)', fontSize:14 }}>Todas las reservas de la plataforma</p>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Download size={14} /> Exportar CSV
              </button>
            </div>

            {stats && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
                {[
                  { label:'Total',       val: fmt(stats.totalBookings),    color:'var(--blue)',    bg:'var(--blue-light)' },
                  { label:'Confirmadas', val: fmt(stats.confirmedBookings), color:'var(--success)', bg:'var(--success-bg)' },
                  { label:'Pendientes',  val: fmt(stats.pendingBookings),   color:'var(--warning)', bg:'var(--warning-bg)' },
                  { label:'Canceladas',  val: fmt(stats.cancelledBookings), color:'var(--danger)',  bg:'var(--danger-bg)' },
                ].map((k,i) => (
                  <div key={i} style={{ background:k.bg, border:`1px solid ${k.color}22`, borderRadius:'var(--r-xl)', padding:'1rem 1.25rem' }}>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:k.color, marginBottom:4 }}>{k.label}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Producto</th><th>Tipo</th><th>Viajeros</th><th>Total</th><th>Estado</th><th>Fecha</th></tr>
                </thead>
                <tbody>
                  {bookings.map(b => {
                    const sc = STATUS_COLORS[b.status] || STATUS_COLORS.PENDING;
                    return (
                      <tr key={b.id}>
                        <td style={{ color:'var(--ink3)', fontSize:12 }}>#{b.id}</td>
                        <td style={{ fontWeight:500, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.trip?.title}</td>
                        <td><TypeBadge type={b.trip?.type || 'viaje'} /></td>
                        <td>{b.numTravelers}</td>
                        <td><strong>{fmtEur(b.totalPrice)}</strong></td>
                        <td>
                          <select value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value)}
                            style={{ padding:'3px 10px', borderRadius:'var(--r-full)', border:'1px solid var(--border)', fontSize:11, fontWeight:600, background:sc.bg, color:sc.color, cursor:'pointer' }}>
                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ color:'var(--muted)', fontSize:13 }}>{fmtDate(b.bookedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {bookingsTotalPages > 1 && (
              <div className="pagination">
                <button className="btn-pagination btn-pagination--arrow" disabled={bookingsPage===0} onClick={() => setBookingsPage(p=>p-1)}>←</button>
                <span style={{ fontSize:14, color:'var(--muted)', padding:'0 1rem' }}>Página {bookingsPage+1} de {bookingsTotalPages}</span>
                <button className="btn-pagination btn-pagination--arrow" disabled={bookingsPage>=bookingsTotalPages-1} onClick={() => setBookingsPage(p=>p+1)}>→</button>
              </div>
            )}
          </>
        )}

        {/* ══ USUARIOS ══ */}
        {tab === 'users' && (
          <>
            <div className="admin-content__header">
              <div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700 }}>Gestión de usuarios</h1>
                <p style={{ color:'var(--muted)', fontSize:14 }}>{users.length} usuarios registrados</p>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
              {[
                { label:'Total',        val: fmt(users.length),                           color:'var(--blue)',    bg:'var(--blue-light)' },
                { label:'Activos',      val: fmt(users.filter(u => u.enabled).length),    color:'var(--success)', bg:'var(--success-bg)' },
                { label:'Desactivados', val: fmt(users.filter(u => !u.enabled).length),   color:'var(--danger)',  bg:'var(--danger-bg)' },
              ].map((k,i) => (
                <div key={i} style={{ background:k.bg, border:`1px solid ${k.color}22`, borderRadius:'var(--r-xl)', padding:'1rem 1.25rem' }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:k.color, marginBottom:4 }}>{k.label}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
                </div>
              ))}
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Registro</th><th>Estado</th><th>Acción</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ color:'var(--ink3)', fontSize:12 }}>#{u.id}</td>
                      <td style={{ fontWeight:600 }}>{u.name}</td>
                      <td style={{ color:'var(--muted)', fontSize:13 }}>{u.email}</td>
                      <td>
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:4,
                          padding:'2px 9px', borderRadius:'var(--r-full)',
                          fontSize:11, fontWeight:600,
                          background: u.role === 'ADMIN' ? 'var(--blue-light)' : 'var(--paper2)',
                          color:      u.role === 'ADMIN' ? 'var(--blue)'       : 'var(--ink2)',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color:'var(--muted)', fontSize:13 }}>{fmtDate(u.createdAt)}</td>
                      <td>
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:5,
                          padding:'3px 10px', borderRadius:'var(--r-full)',
                          fontSize:11, fontWeight:600,
                          background: u.enabled ? 'var(--success-bg)' : 'var(--paper2)',
                          color:      u.enabled ? 'var(--success)'    : 'var(--ink2)',
                        }}>
                          {u.enabled ? '● Activo' : '○ Desactivado'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleUser(u.id)}
                          disabled={u.role === 'ADMIN'}
                          title={u.role === 'ADMIN' ? 'No se puede desactivar un admin' : u.enabled ? 'Desactivar cuenta' : 'Activar cuenta'}
                          style={{
                            display:'inline-flex', alignItems:'center', gap:5,
                            padding:'5px 12px', borderRadius:'var(--r-full)',
                            border:'1px solid', fontSize:12, fontWeight:600,
                            cursor: u.role === 'ADMIN' ? 'not-allowed' : 'pointer',
                            opacity: u.role === 'ADMIN' ? 0.4 : 1,
                            borderColor: u.enabled ? 'var(--danger)' : 'var(--success)',
                            background:  u.enabled ? 'var(--danger-bg)' : 'var(--success-bg)',
                            color:       u.enabled ? 'var(--danger)'    : 'var(--success)',
                          }}>
                          {u.enabled ? <><UserX size={12}/> Desactivar</> : <><UserCheck size={12}/> Activar</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'var(--muted)' }}>Sin usuarios</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ══ STATS ══ */}
        {tab === 'stats' && stats && (
          <>
            <div className="admin-content__header">
              <div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700 }}>Estadísticas detalladas</h1>
                <p style={{ color:'var(--muted)', fontSize:14 }}>Resumen completo de la plataforma</p>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.25rem', marginBottom:'2rem' }}>
              {[
                { icon:<DollarSign size={18}/>, label:'Ingresos totales', val: fmtEur(stats.totalRevenue) },
                { icon:<Calendar size={18}/>,   label:'Total reservas',   val: fmt(stats.totalBookings) },
                { icon:<Check size={18}/>,      label:'Tasa completadas', val: stats.totalBookings>0 ? Math.round((stats.completedBookings/stats.totalBookings)*100)+'%':'0%' },
                { icon:<Trash2 size={18}/>,     label:'Tasa cancelación', val: stats.totalBookings>0 ? Math.round((stats.cancelledBookings/stats.totalBookings)*100)+'%':'0%' },
              ].map((k,i) => (
                <div key={i} className="admin-kpi">
                  <div className="admin-kpi__icon admin-kpi__icon--teal">{k.icon}</div>
                  <div className="admin-kpi__label">{k.label}</div>
                  <div className="admin-kpi__value">{k.val}</div>
                </div>
              ))}
            </div>

            {stats.revenueByMonth?.length > 0 && (
              <div className="admin-chart-card" style={{ marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                  <TrendingUp size={16} color="var(--blue)" />
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', margin:0 }}>Ingresos por mes</h3>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--muted)' }} />
                    <YAxis tick={{ fontSize:11, fill:'var(--muted)' }} tickFormatter={v => '€'+Number(v).toLocaleString('es-ES')} />
                    <Tooltip formatter={v => ['€'+Number(v).toLocaleString('es-ES'), 'Ingresos']} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--blue)" strokeWidth={2.5} dot={{ fill:'var(--blue)', r:4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
              <div className="admin-chart-card">
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                  <PieIcon size={16} color="var(--blue)" />
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', margin:0 }}>Reservas por estado</h3>
                </div>
                {stats.totalBookings > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData.filter(d=>d.value>0)} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({percent}) => percent>0.05?`${(percent*100).toFixed(0)}%`:''} labelLine={false}>
                          {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:8 }}>
                      {pieData.map((d,i) => (
                        <span key={d.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--ink2)' }}>
                          <span style={{ width:8, height:8, borderRadius:'50%', background:PIE_COLORS[i], display:'inline-block' }} />
                          {d.name} ({d.value})
                        </span>
                      ))}
                    </div>
                  </>
                ) : <p style={{ color:'var(--muted)', fontSize:14, textAlign:'center', padding:'3rem 0' }}>Sin reservas aún</p>}
              </div>

              <div className="admin-chart-card">
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                  <PieIcon size={16} color="var(--blue)" />
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', margin:0 }}>Productos por tipo</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name:'Viajes',    value: countByType('viaje') },
                        { name:'Vuelos',    value: countByType('vuelo') },
                        { name:'Escapadas', value: countByType('escapada') },
                      ].filter(d=>d.value>0)}
                      cx="50%" cy="50%" outerRadius={80} dataKey="value"
                      label={({name, value}) => `${name}: ${value}`}>
                      {['#1c4e78','#2471A3','#166534'].map((c,i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {stats.topDestinations?.length > 0 && (
              <div className="admin-chart-card" style={{ marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                  <MapPin size={16} color="var(--blue)" />
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', margin:0 }}>Top destinos</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.topDestinations.slice(0,5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize:10, fill:'var(--muted)' }} allowDecimals={false} />
                    <YAxis type="category" dataKey="destination" width={100} tick={{ fontSize:10, fill:'var(--muted)' }} tickFormatter={v=>v.split(',')[0]} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--blue)" radius={[0,4,4,0]} name="Reservas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {stats.bookingsByCategory?.length > 0 && (
              <div className="admin-chart-card" style={{ marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                  <BarChart2 size={16} color="var(--blue)" />
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', margin:0 }}>Reservas por categoría</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.bookingsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="category" tick={{ fontSize:12, fill:'var(--muted)' }} tickFormatter={v=>v.charAt(0).toUpperCase()+v.slice(1)} />
                    <YAxis tick={{ fontSize:12, fill:'var(--muted)' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} name="Reservas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {stats.revenueByMonth?.length > 0 && (
              <div className="admin-table-wrap">
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700 }}>Ingresos mensuales detallados</h3>
                </div>
                <table className="admin-table">
                  <thead><tr><th>Mes</th><th>Ingresos</th><th>Reservas</th><th>Ticket medio</th></tr></thead>
                  <tbody>
                    {stats.revenueByMonth.map(m => (
                      <tr key={m.month}>
                        <td style={{ fontWeight:500 }}>{m.month}</td>
                        <td><strong style={{ color:'var(--blue)' }}>{fmtEur(m.revenue)}</strong></td>
                        <td>{fmt(m.bookings)}</td>
                        <td>{m.bookings>0 ? fmtEur(Math.round(m.revenue/m.bookings)):'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}