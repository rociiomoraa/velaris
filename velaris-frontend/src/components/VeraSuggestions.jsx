// ================================================================
// VELARIS — VeraSuggestions.jsx
// ================================================================
import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Utensils, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { aiApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

// ── Prompt personalizado según tipo ─────────────────────────────
function buildPrompt(trip) {
  const dest = trip.destination;
  const origin = trip.origin || 'España';

  if (trip.type === 'vuelo') {
    return `Voy a coger el vuelo ${trip.flightNumber || ''} de ${trip.airline || ''} desde ${origin} hasta ${dest}. 
Dame consejos prácticos y personalizados sobre:
1. Cómo llegar del aeropuerto al centro de ${dest} (opciones de transporte, precio aproximado, tiempo)
2. Los 3 mejores barrios o zonas donde alojarse y por qué
3. Las 5 cosas imprescindibles que hacer o ver en ${dest}
4. Mejor época para ir y qué tiempo esperar
5. Un consejo local que no encuentres en las guías turísticas
Sé específico, práctico y entusiasta. Usa emojis para hacerlo más visual.`;
  }

  if (trip.type === 'escapada') {
    const hotel = trip.hotelName || 'el hotel';
    const nights = trip.durationDays || 2;
    const meal = {
      sin_comidas:   'sin comidas incluidas',
      desayuno:      'con desayuno incluido',
      media_pension: 'con media pensión',
      todo_incluido: 'en régimen todo incluido',
    }[trip.mealPlan] || '';

    return `Me voy de escapada a ${dest}, ${nights} noches en ${hotel} ${meal}.
Dame recomendaciones muy específicas y locales:
1. Los 3 mejores restaurantes cerca del hotel (con tipo de cocina y precio medio)
2. El mejor plan para cada día (mañana, tarde y noche) en ${nights} días
3. Actividades o experiencias únicas en ${dest} que no sean turismo masivo
4. Qué comprar o qué producto típico probar sí o sí
5. Un sitio secreto o poco conocido que valga la pena visitar
Hazlo muy práctico, como si me lo recomendara un amigo que vive allí. Usa emojis.`;
  }

  // viaje normal
  const days = trip.durationDays || 7;
  const category = trip.category || 'turismo';
  return `Me voy ${days} días a ${dest} (${category}). Salgo desde ${origin}.
Crea un itinerario detallado y personalizado:
1. Itinerario día a día (qué ver cada día, en qué orden para no perder tiempo)
2. Dónde comer cada día: desayuno, comida y cena con restaurantes reales
3. Transporte interno: cómo moverse por ${dest} de forma eficiente
4. Presupuesto orientativo por día (alojamiento, comida, actividades)
5. Lo que no puede faltar en la maleta para este viaje específico
6. Los errores típicos del turista que hay que evitar en ${dest}
Sé muy detallado y específico. Usa emojis y estructura bien la respuesta.`;
}

// ── Icono según tipo ─────────────────────────────────────────────
function getTypeConfig(type) {
  if (type === 'vuelo')    return { label: 'Guía del destino',      icon: <MapPin size={16} />,    color: 'var(--blue)',   bg: 'var(--blue-light)' };
  if (type === 'escapada') return { label: 'Planes y restaurantes', icon: <Utensils size={16} />,  color: '#15803d',       bg: '#f0fdf4' };
  return                          { label: 'Itinerario personalizado', icon: <Star size={16} />,   color: 'var(--blue)',   bg: 'var(--blue-light)' };
}

// ── Renderiza el texto de Vera con formato ───────────────────────
function VeraText({ text }) {
  if (!text) return null;
  return (
    <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink2)' }}>
      {text.split('\n').map((line, i) => {
        // Títulos numerados tipo "1. Cómo llegar"
        if (/^\d+\./.test(line.trim())) {
          return (
            <p key={i} style={{
              fontWeight: 700, color: 'var(--ink)',
              fontSize: 14, margin: '1rem 0 .35rem',
            }}>
              {line.trim()}
            </p>
          );
        }
        // Líneas vacías
        if (!line.trim()) return <br key={i} />;
        // Texto normal
        return <p key={i} style={{ margin: '0 0 .3rem' }}>{line}</p>;
      })}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────
export default function VeraSuggestions({ trip }) {
  const { isAuth } = useAuth();
  const [response, setResponse] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  const cfg = getTypeConfig(trip?.type);

  const load = async () => {
    if (loaded || loading) return;
    setLoading(true);
    setError(false);
    try {
      const prompt = buildPrompt(trip);
      const endpoint = isAuth ? aiApi.chatPersistent : aiApi.chat;
      const { data } = await endpoint({ message: prompt, history: [] });
      setResponse(data.message || '');
      setExpanded(true);
      setLoaded(true);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  // Resetear cuando cambia el viaje
  useEffect(() => {
    setResponse('');
    setLoaded(false);
    setExpanded(false);
    setError(false);
  }, [trip?.id]);

  if (!trip) return null;

  return (
<div style={{
  borderRadius: 'var(--r-xl)',
  border: `1px solid ${cfg.color === '#15803d' ? '#bbf7d0' : 'rgba(28,78,120,0.15)'}`,
  background: 'var(--white)',
  overflow: 'hidden',
  marginTop: '2rem',    // ← añade esto
  marginBottom: '2rem',
}}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '1.25rem 1.5rem',
        background: cfg.bg,
        borderBottom: loaded && expanded ? `1px solid ${cfg.color === '#15803d' ? '#bbf7d0' : 'rgba(28,78,120,0.1)'}` : 'none',
        cursor: loaded ? 'pointer' : 'default',
      }}
        onClick={() => loaded && setExpanded(e => !e)}
      >
        {/* Avatar Vera */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: cfg.color, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
        }}>
          <Sparkles size={18} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 15,
            fontWeight: 700, color: 'var(--ink)', marginBottom: 2,
          }}>
            Vera · {cfg.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            {cfg.icon}
            {loaded
              ? `Análisis personalizado de ${trip.destination}`
              : `Pide a Vera que analice ${trip.destination} para ti`}
          </div>
        </div>

        {/* Botón o chevron */}
        {!loaded && !loading && (
          <button
            onClick={e => { e.stopPropagation(); load(); }}
            style={{
              padding: '8px 18px', borderRadius: 'var(--r-full)',
              background: cfg.color, color: '#fff',
              border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'opacity .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Sparkles size={13} />
            {trip.type === 'vuelo'    ? 'Ver guía del destino' :
             trip.type === 'escapada' ? 'Ver planes y restaurantes' :
             'Ver itinerario'}
          </button>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              border: `2px solid ${cfg.color}`, borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }} />
            Vera está pensando...
          </div>
        )}

        {loaded && (
          <div style={{ color: 'var(--muted)', flexShrink: 0 }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        )}
      </div>

      {/* ── Contenido ── */}
      {error && (
        <div style={{ padding: '1.25rem 1.5rem', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
          No se pudo conectar con Vera. <button onClick={load} style={{ color: cfg.color, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Reintentar</button>
        </div>
      )}

      {loaded && expanded && response && (
        <div style={{ padding: '1.5rem' }}>
          {/* Badge "Generado por Vera" */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 'var(--r-full)',
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 600, marginBottom: '1rem',
            border: `1px solid ${cfg.color === '#15803d' ? '#bbf7d0' : 'rgba(28,78,120,0.15)'}`,
          }}>
            <Sparkles size={10} /> Generado por Vera IA · {new Date().toLocaleDateString('es-ES')}
          </div>

          <VeraText text={response} />

          {/* Footer */}
          <div style={{
            marginTop: '1.25rem', paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
            fontSize: 12, color: 'var(--muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Clock size={12} />
            Las recomendaciones de Vera son orientativas. Verifica horarios y precios antes de tu viaje.
          </div>
        </div>
      )}
    </div>
  );
}