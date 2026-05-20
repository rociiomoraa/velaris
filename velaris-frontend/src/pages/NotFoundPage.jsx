// ================================================================
// VELARIS — NotFoundPage.jsx  (src/pages/NotFoundPage.jsx)
// ================================================================
import { Link } from 'react-router-dom';
import { MapPin, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--paper)',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>

        {/* Icono */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--blue-light)', border: '2px solid rgba(28,78,120,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem', color: 'var(--blue)',
        }}>
          <Compass size={36} />
        </div>

        {/* Número */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(5rem, 15vw, 8rem)',
          fontWeight: 800,
          color: 'var(--blue)',
          lineHeight: 1,
          marginBottom: '1rem',
          letterSpacing: '-4px',
        }}>
          404
        </div>

        {/* Título */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '.75rem',
        }}>
          Destino no encontrado
        </h1>

        <p style={{
          color: 'var(--muted)',
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
          Parece que esta página se ha perdido en el camino.<br />
          No te preocupes, Velaris tiene miles de destinos esperándote.
        </p>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            padding: '12px 28px',
            background: 'var(--blue)',
            color: '#fff',
            borderRadius: 'var(--r-full)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
            transition: 'opacity .18s',
          }}>
            Volver al inicio
          </Link>
          <Link to="/trips" style={{
            padding: '12px 28px',
            background: 'var(--white)',
            color: 'var(--blue)',
            border: '1.5px solid var(--blue)',
            borderRadius: 'var(--r-full)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <MapPin size={14} /> Explorar destinos
          </Link>
        </div>

      </div>
    </div>
  );
}