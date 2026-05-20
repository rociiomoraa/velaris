// ================================================================
// VELARIS — FavoritesPage.jsx  (src/pages/FavoritesPage.jsx)
// ================================================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Sparkles } from 'lucide-react';
import { favoritesApi } from '../api/client';
import TripCard from '../components/TripCard';

export default function FavoritesPage() {
  const [trips,   setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesApi.getAll()
      .then(r => setTrips(r.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  // Se llama desde TripCard cuando se desmarca el favorito
  const handleUnfav = (tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* ── BANNER ── */}
      <div style={{
        background: '#0c2340',
        marginTop: 'calc(-1 * var(--nav-h))',
        paddingTop: 'calc(var(--nav-h) + 2.5rem)',
        paddingBottom: '3.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(28,78,120,.25)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(28,78,120,.15)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.9)',
            fontSize: 11, fontWeight: 600, padding: '5px 14px',
            borderRadius: 'var(--r-full)', marginBottom: '1.25rem',
            border: '1px solid rgba(255,255,255,.2)',
          }}>
            <Heart size={12} fill="currentColor" /> Mi lista
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800, color: '#fff',
            lineHeight: 1.1, marginBottom: '.75rem',
            letterSpacing: '-0.02em',
          }}>
            Mis viajes favoritos
          </h1>
          <p style={{
            color: 'rgba(255,255,255,.6)',
            fontSize: 15, maxWidth: 460, lineHeight: 1.7, fontWeight: 300,
          }}>
            Guarda los destinos que te interesan y compáralos cuando quieras.
          </p>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="container" style={{ padding: '2.5rem 1.5rem 6rem' }}>

        {loading ? (
          <div className="trips-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{
                height: 320, background: 'var(--paper2)',
                borderRadius: 'var(--r-xl)', animation: 'pulse 1.5s ease infinite',
              }} />
            ))}
          </div>

        ) : trips.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            background: 'var(--white)', borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 'var(--r-xl)',
              background: 'var(--blue-light)', color: 'var(--blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <Heart size={28} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.2rem',
              fontWeight: 700, marginBottom: '.5rem', color: 'var(--ink)',
            }}>
              Aún no tienes favoritos
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.75rem' }}>
              Explora destinos y pulsa el corazón para guardarlos aquí.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/trips" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '11px 24px', borderRadius: 'var(--r-full)',
                background: 'var(--blue)', color: '#fff',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                <MapPin size={14} /> Explorar destinos
              </Link>
              <Link to="/recommendations" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '11px 24px', borderRadius: 'var(--r-full)',
                border: '1.5px solid var(--border)', background: 'var(--white)',
                color: 'var(--ink)', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                <Sparkles size={14} /> Preguntarle a Vera
              </Link>
            </div>
          </div>

        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>
              <strong style={{ color: 'var(--blue)' }}>{trips.length}</strong>{' '}
              {trips.length === 1 ? 'viaje guardado' : 'viajes guardados'}
            </p>
            <div className="trips-grid">
              {trips.map(t => (
                <TripCard
                  key={t.id}
                  trip={t}
                  isFav
                  onUnfav={handleUnfav}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}