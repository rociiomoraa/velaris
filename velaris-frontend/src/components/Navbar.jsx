// ================================================================
// VELARIS — Navbar.jsx  (src/components/Navbar.jsx)
// ================================================================
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Menu, X, User, LogOut, LayoutDashboard,
  Heart, Calendar, Sparkles, Moon, Sun,
  Plane, MapPin, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { tripsApi, escapadasApi, flightsApi } from '../api/client';

const BASE_LINKS = [
  { label: 'Destinos',  to: '/trips' },
  { label: 'Vuelos',    to: '/flights' },
  { label: 'Escapadas', to: '/escapadas' },
  { label: 'Vera IA',   to: '/recommendations' },
];

export default function Navbar() {
  const { isAuth, isAdmin, user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate  = useNavigate();

  const [scrolled, setScrolled] = useState(() => window.scrollY > 50);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search,   setSearch]   = useState('');

  // ── Búsqueda en tiempo real ──
  const [suggestions, setSuggestions] = useState([]);
  const [sugOpen,     setSugOpen]     = useState(false);
  const [sugLoading,  setSugLoading]  = useState(false);
  const debounceRef = useRef(null);

  const isHome = location.pathname === '/'
  || location.pathname === '/trips'
  || location.pathname === '/flights'
  || location.pathname === '/escapadas'
  || location.pathname === '/recommendations'
  || location.pathname === '/about'
  || location.pathname === '/favorites'
  || location.pathname === '/profile'
  || location.pathname === '/bookings'
  || location.pathname.startsWith('/trips/');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > 50);
    setMenuOpen(false);
    setUserOpen(false);
    setSugOpen(false);
  }, [location]);

  useEffect(() => {
    if (!userOpen) return;
    const fn = (e) => {
      if (!e.target.closest('.navbar-v2__user-wrap')) setUserOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [userOpen]);

  // Cerrar sugerencias al click fuera
  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest('.navbar-v2__search-wrap')) setSugOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Debounce búsqueda en los tres tipos
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim() || search.trim().length < 2) {
      setSuggestions([]);
      setSugOpen(false);
      return;
    }

    setSugLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const q = search.trim();
        const [viajesRes, escapadasRes, vuelosRes] = await Promise.allSettled([
          tripsApi.getAll({ destination: q, size: 3, page: 0 }),
          escapadasApi.getAll({ destination: q, size: 3, page: 0 }),
          flightsApi.getAll({ size: 50, page: 0 }),
        ]);

        const viajes    = viajesRes.status    === 'fulfilled' ? (viajesRes.value.data?.content    || []) : [];
        const escapadas = escapadasRes.status === 'fulfilled' ? (escapadasRes.value.data?.content || []) : [];
        const todosVuelos = vuelosRes.status  === 'fulfilled' ? (vuelosRes.value.data?.content    || []) : [];

        const vuelos = todosVuelos.filter(f => {
          const ql = q.toLowerCase();
          return f.destination?.toLowerCase().includes(ql)
              || f.origin?.toLowerCase().includes(ql)
              || f.title?.toLowerCase().includes(ql)
              || f.airline?.toLowerCase().includes(ql);
        }).slice(0, 3);

        const results = [...viajes, ...escapadas, ...vuelos]
          .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)
          .slice(0, 6);
        setSuggestions(results);
        setSugOpen(results.length > 0);
      } catch {
        setSuggestions([]);
        setSugOpen(false);
      }
      setSugLoading(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const solid    = !isHome || scrolled;
  const isActive = (to) => location.pathname === to.split('?')[0];

  const handleSearch = e => {
    e?.preventDefault();
    if (search.trim()) {
      navigate(`/trips?destination=${encodeURIComponent(search.trim())}&allTypes=true`);
      setSearch('');
      setSugOpen(false);
    }
  };

  const handleSuggestionClick = (trip) => {
    navigate(`/trips/${trip.id}`);
    setSearch('');
    setSugOpen(false);
  };

  const getTypeIcon = (type) => {
    if (type === 'vuelo')    return <Plane size={13} />;
    if (type === 'escapada') return <Tag size={13} />;
    return <MapPin size={13} />;
  };

  const getTypeLabel = (type) => {
    if (type === 'vuelo')    return 'Vuelo';
    if (type === 'escapada') return 'Escapada';
    return 'Viaje';
  };

  const getTypeColors = (type) => {
    if (type === 'vuelo')    return { bg: 'var(--blue-light)',  color: 'var(--blue)' };
    if (type === 'escapada') return { bg: '#f0fdf4',            color: '#15803d'     };
    return                          { bg: 'var(--paper2)',      color: 'var(--muted)'};
  };

  return (
    <header className={`navbar-v2 ${solid ? 'navbar-v2--solid' : 'navbar-v2--transparent'}`}>
      <div className="navbar-v2__inner">

        {/* ── LOGO ── */}
        <Link to="/" className="navbar-v2__logo">
          <div className="navbar-v2__logo-mark">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L11 7H16.5L12.2 10.5L13.8 16L9 12.8L4.2 16L5.8 10.5L1.5 7H7L9 1.5Z" fill="#FAFAF8"/>
            </svg>
          </div>
          <span className="navbar-v2__logo-text">VELARIS</span>
        </Link>

        {/* ── NAV LINKS ── */}
        <nav className={`navbar-v2__links ${menuOpen ? 'navbar-v2__links--open' : ''}`}>
          {isAdmin && (
            <Link to="/admin" className="navbar-v2__link" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'var(--blue)', color: '#fff',
              borderRadius: 'var(--r-full)', padding: '5px 13px',
              fontSize: '.78rem', fontWeight: 600, letterSpacing: '.01em',
            }}>
              <LayoutDashboard size={13} /> Admin
            </Link>
          )}
          {BASE_LINKS.map(l => (
            <Link key={l.to} to={l.to}
              className={`navbar-v2__link ${isActive(l.to) ? 'navbar-v2__link--active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ── ACTIONS ── */}
        <div className="navbar-v2__actions">

          {/* Search con sugerencias */}
          <div className="navbar-v2__search-wrap" style={{ position: 'relative' }}>
            <form className="navbar-v2__search" onSubmit={handleSearch} style={{ position: 'relative' }}>
              <Search size={13} className="navbar-v2__search-icon" />
              <input
                className="navbar-v2__search-input"
                placeholder="Buscar destino..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => suggestions.length > 0 && setSugOpen(true)}
                autoComplete="off"
              />
              {sugLoading && (
                <div style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  width: 12, height: 12, borderRadius: '50%',
                  border: '2px solid var(--blue)', borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite', flexShrink: 0,
                }} />
              )}
              {search && !sugLoading && (
                <button type="button"
                  onClick={() => { setSearch(''); setSugOpen(false); }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 2 }}>
                  <X size={12} />
                </button>
              )}
            </form>

            {/* Dropdown sugerencias */}
            {sugOpen && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: 'var(--white)', borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden', zIndex: 9999, minWidth: 300,
              }}>
                {/* Header */}
                <div style={{
                  padding: '8px 14px 6px',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '.1em', color: 'var(--muted)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  Resultados para "{search}"
                </div>

                {/* Items */}
                {suggestions.map(trip => {
                  const tc = getTypeColors(trip.type);
                  return (
                    <button key={`${trip.type}-${trip.id}`}
                      onClick={() => handleSuggestionClick(trip)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: 'none', border: 'none',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer', textAlign: 'left', transition: 'background .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--paper2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {/* Icono tipo */}
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: tc.bg, color: tc.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {getTypeIcon(trip.type)}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {trip.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                          <MapPin size={10} />
                          {trip.destination}
                          <span style={{ opacity: .4 }}>·</span>
                          {getTypeLabel(trip.type)}
                        </div>
                      </div>

                      {/* Precio */}
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>
                        €{Number(trip.price).toLocaleString('es-ES')}
                      </div>
                    </button>
                  );
                })}

                {/* Ver todos */}
                <button onClick={handleSearch}
                  style={{
                    width: '100%', padding: '9px 14px', background: 'var(--paper2)',
                    border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--paper2)'}
                >
                  <Search size={12} />
                  Ver todos los resultados de "{search}"
                </button>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button className="navbar-v2__icon-btn" onClick={toggleTheme}
            title={dark ? 'Modo claro' : 'Modo oscuro'}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Auth */}
          {isAuth ? (
            <div className="navbar-v2__user-wrap" style={{ position: 'relative' }}>
              <button className="navbar-v2__avatar"
                onClick={() => setUserOpen(v => !v)}
                title={user?.name}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </button>

              {userOpen && (
                <div className="navbar-v2__dropdown">
                  <div className="navbar-v2__dropdown-header">
                    <div className="navbar-v2__dropdown-name">{user?.name}</div>
                    <div className="navbar-v2__dropdown-email">{user?.email}</div>
                    {isAdmin && (
                      <span className="navbar-v2__dropdown-badge">
                        <LayoutDashboard size={10} /> Administrador
                      </span>
                    )}
                  </div>

                  {[
                    { to: '/profile',        icon: <User size={14}/>,     label: 'Mi perfil' },
                    { to: '/bookings',       icon: <Calendar size={14}/>, label: 'Mis reservas' },
                    { to: '/favorites',      icon: <Heart size={14}/>,    label: 'Favoritos' },
                    { to: '/recommendations',icon: <Sparkles size={14}/>, label: 'Vera IA' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} className="navbar-v2__dropdown-item">
                      <span className="navbar-v2__dropdown-item-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  {isAdmin && (
                    <Link to="/admin" className="navbar-v2__dropdown-item navbar-v2__dropdown-item--admin">
                      <span className="navbar-v2__dropdown-item-icon"><LayoutDashboard size={14}/></span>
                      Panel de administración
                    </Link>
                  )}

                  <div className="navbar-v2__dropdown-divider" />

                  <button
                    className="navbar-v2__dropdown-item navbar-v2__dropdown-item--danger"
                    onClick={() => { logout(); navigate('/'); }}>
                    <span className="navbar-v2__dropdown-item-icon"><LogOut size={14}/></span>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-v2__auth-btns">
              <Link to="/login"    className="navbar-v2__btn navbar-v2__btn--ghost">Entrar</Link>
              <Link to="/register" className="navbar-v2__btn navbar-v2__btn--solid">Registro gratis</Link>
            </div>
          )}

          {/* Mobile burger */}
          <button className="navbar-v2__hamburger"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="navbar-v2__mobile-menu">
          {isAdmin && (
            <Link to="/admin" className="navbar-v2__mobile-link navbar-v2__mobile-link--admin">
              <LayoutDashboard size={15} /> Panel de administración
            </Link>
          )}
          {BASE_LINKS.map(l => (
            <Link key={l.to} to={l.to}
              className={`navbar-v2__mobile-link ${isActive(l.to) ? 'navbar-v2__mobile-link--active' : ''}`}>
              {l.label}
            </Link>
          ))}
          <div style={{ height:1, background:'var(--border)', margin:'.5rem 0' }} />
          {isAuth ? (
            <>
              <Link to="/profile"   className="navbar-v2__mobile-link">Mi perfil</Link>
              <Link to="/bookings"  className="navbar-v2__mobile-link">Mis reservas</Link>
              <Link to="/favorites" className="navbar-v2__mobile-link">Favoritos</Link>
              <button
                className="navbar-v2__mobile-link"
                style={{ color:'var(--danger)', textAlign:'left', width:'100%', background:'none', border:'none', cursor:'pointer' }}
                onClick={() => { logout(); navigate('/'); }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <div style={{ display:'flex', gap:'.75rem', padding:'.5rem 0' }}>
              <Link to="/login"    className="navbar-v2__btn navbar-v2__btn--ghost" style={{ flex:1, textAlign:'center' }}>Entrar</Link>
              <Link to="/register" className="navbar-v2__btn navbar-v2__btn--solid" style={{ flex:1, textAlign:'center' }}>Registro gratis</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}