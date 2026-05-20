// ================================================================
// VELARIS — RecommendationsPage.jsx
// ================================================================
import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, Trash2, MapPin, TrendingUp, Heart,
  Compass, ChevronRight, ChevronLeft, Check, Users,
  Calendar, DollarSign, ArrowRight,
} from 'lucide-react';
import { aiApi, tripsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';

// ── Datos ────────────────────────────────────────────────────────

const QUIZ_STEPS = [
  {
    id: 'style',
    question: '¿Cómo eres cuando viajas?',
    options: [
      { value: 'Aventurero',  label: 'Aventurero',  desc: 'Senderismo, deportes, naturaleza salvaje',   img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80' },
      { value: 'Relax',       label: 'Relax',        desc: 'Playa, spa, desconectar del todo',            img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
      { value: 'Cultural',    label: 'Cultural',     desc: 'Museos, historia, gastronomía local',         img: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80' },
      { value: 'Urbano',      label: 'Urbano',       desc: 'Ciudades, moda, vida nocturna, shopping',     img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80' },
    ],
  },
  {
    id: 'companion',
    question: '¿Con quién vas a viajar?',
    options: [
      { value: 'Solo',        label: 'Solo/a',       desc: 'Libertad total, mi ritmo',                   img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
      { value: 'Pareja',      label: 'En pareja',    desc: 'Romántico, íntimo, especial',                img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&q=80' },
      { value: 'Familia',     label: 'Familia',      desc: 'Con niños, actividades para todos',          img: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80' },
      { value: 'Amigos',      label: 'Amigos',       desc: 'Grupo, diversión, experiencias compartidas', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
    ],
  },
  {
    id: 'vibe',
    question: '¿Qué quieres sentir en este viaje?',
    options: [
      { value: 'Desconectar', label: 'Desconectar',  desc: 'Sin ruido, sin estrés, modo zen',            img: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600&q=80' },
      { value: 'Descubrir',   label: 'Descubrir',    desc: 'Lugares nuevos, culturas distintas',         img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80' },
      { value: 'Adrenalina',  label: 'Adrenalina',   desc: 'Emociones fuertes, salir de la zona segura', img: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=600&q=80' },
      { value: 'Lujo',        label: 'Lujo',         desc: 'Lo mejor de lo mejor, sin compromisos',      img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80' },
    ],
  },
];

const VERA_BENEFITS = [
  {
    icon: <Compass size={22} />,
    title: 'Búsqueda inteligente',
    desc: 'Describe tu viaje ideal en lenguaje natural y Vera encuentra las mejores opciones al instante.',
    img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Precios en tiempo real',
    desc: 'Vera compara precios y disponibilidad para que siempre reserves al mejor precio.',
    img: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80',
  },
  {
    icon: <Heart size={22} />,
    title: 'Personalizado para ti',
    desc: 'Aprende de tus preferencias con cada conversación para recomendarte mejor cada vez.',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  },
  {
    icon: <MapPin size={22} />,
    title: 'Itinerarios detallados',
    desc: 'Pide un plan día a día y Vera lo construye adaptado a tu presupuesto y estilo de viaje.',
    img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
  },
];

const PRICE_OPTIONS = [
  { value: 'low',    label: 'Económico',  sub: 'Menos de 500€',    icon: <DollarSign size={16}/> },
  { value: 'mid',    label: 'Estándar',   sub: '500€ – 1.500€',   icon: <DollarSign size={16}/> },
  { value: 'high',   label: 'Premium',    sub: '1.500€ – 3.000€', icon: <DollarSign size={16}/> },
  { value: 'luxury', label: 'Sin límite', sub: '+3.000€',          icon: <DollarSign size={16}/> },
];

// ── Helpers ──────────────────────────────────────────────────────

function buildVeraPrompt(quiz, form) {
  const styleMap = {
    'Aventurero': 'aventurero',
    'Relax':      'relajado',
    'Cultural':   'cultural',
    'Urbano':     'urbanita',
  };
  const companionMap = {
    'Solo':    'solo/a',
    'Pareja':  'en pareja',
    'Familia': 'en familia',
    'Amigos':  'con amigos',
  };
  const vibeMap = {
    'Desconectar': 'desconectar',
    'Descubrir':   'descubrir lugares nuevos',
    'Adrenalina':  'vivir adrenalina',
    'Lujo':        'disfrutar del lujo',
  };
  const priceMap = {
    low:    'menos de 500€',
    mid:    'entre 500€ y 1.500€',
    high:   'entre 1.500€ y 3.000€',
    luxury: 'más de 3.000€',
  };

  let prompt = `Soy un viajero ${styleMap[quiz.style] || quiz.style || ''} que viaja ${companionMap[quiz.companion] || quiz.companion || ''} y quiero ${vibeMap[quiz.vibe] || quiz.vibe || ''}.`;
  if (form.destination) prompt += ` Me gustaría ir a ${form.destination} o algo similar.`;
  if (form.from)        prompt += ` Viajo desde el ${form.from}`;
  if (form.to)          prompt += ` hasta el ${form.to}.`;
  if (form.travelers)   prompt += ` Somos ${form.travelers} persona${form.travelers > 1 ? 's' : ''}.`;
  if (form.budget)      prompt += ` Mi presupuesto es ${priceMap[form.budget] || ''} por persona.`;
  prompt += ' ¿Qué destinos de los que tienes disponibles me recomiendas?';
  return prompt;
}

// ── Componente principal ─────────────────────────────────────────

export default function RecommendationsPage() {
  const { isAuth } = useAuth();
  const chatRef   = useRef(null);
  const bottomRef = useRef(null);

  // Quiz
  const [quizStep,   setQuizStep]   = useState(0);
  const [quizData,   setQuizData]   = useState({});
  const [formData,   setFormData]   = useState({ destination:'', from:'', to:'', travelers:2, budget:'' });

  // Chat
  const [msgs,  setMsgs]  = useState([]);
  const [input, setInput] = useState('');
  const [busy,  setBusy]  = useState(false);

  // Recomendaciones IA
  const [recs,     setRecs]     = useState([]);
  const [recsLoad, setRecsLoad] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  // ── Avanzar en quiz ──
  const selectQuizOption = (stepId, value) => {
    const updated = { ...quizData, [stepId]: value };
    setQuizData(updated);
    if (quizStep < QUIZ_STEPS.length - 1) {
      setQuizStep(s => s + 1);
    } else {
      setQuizStep(QUIZ_STEPS.length);
    }
  };

  // ── Lanzar chat con contexto ──
  const launchChat = async () => {
    const prompt = buildVeraPrompt(quizData, formData);
    setQuizStep(QUIZ_STEPS.length + 1);
    const greeting = {
      role: 'vera',
      text: '¡Hola! Soy Vera 👋 He leído tu perfil de viajero y en un momento te daré mis mejores recomendaciones.',
    };
    setMsgs([greeting]);
    await sendMessage(prompt, [greeting]);
  };

  // ── Enviar mensaje ──
  const sendMessage = async (text, currentMsgs = msgs) => {
    if (!text.trim() || busy) return;
    const userMsg = { role: 'user', text };
    const newMsgs = [...currentMsgs, userMsg];
    setMsgs(newMsgs);
    setInput('');
    setBusy(true);

    setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    try {
      const history = newMsgs.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      const endpoint = isAuth ? aiApi.chatPersistent : aiApi.chat;
      const { data } = await endpoint({ message: text, history });
      setMsgs(prev => [...prev, { role: 'vera', text: data.message }]);

      // Cargar recomendaciones basadas en lo que Vera menciona (solo viajes y escapadas)
      if (newMsgs.length <= 3) {
        setRecsLoad(true);
        Promise.all([
          tripsApi.getAll({ size: 100, page: 0, type: 'viaje' }),
          tripsApi.getAll({ size: 100, page: 0, type: 'escapada' }),
        ])
          .then(([viajesRes, escapadasRes]) => {
            const allTrips = [
              ...(viajesRes.data?.content || []),
              ...(escapadasRes.data?.content || []),
            ];
            const veraText = data.message.toLowerCase();

            // Solo coincidencia por título completo
            const mentioned = allTrips.filter(t =>
              veraText.includes(t.title.toLowerCase())
            );

            setRecs(mentioned.length >= 2 ? mentioned.slice(0, 3) : allTrips.slice(0, 3));
          })
          .catch(() => {})
          .finally(() => setRecsLoad(false));
      }
    } catch {
      setMsgs(prev => [...prev, { role: 'vera', text: 'Lo siento, ha ocurrido un error. Inténtalo de nuevo.' }]);
    }
    setBusy(false);
  };

  const clearChat = async () => {
    if (isAuth) { try { await aiApi.clearHistory(); } catch {} }
    setMsgs([{ role: 'vera', text: '¡Chat reiniciado! ¿En qué puedo ayudarte?' }]);
    setRecs([]);
  };

  const resetAll = () => {
    setQuizStep(0);
    setQuizData({});
    setFormData({ destination:'', from:'', to:'', travelers:2, budget:'' });
    setMsgs([]);
    setRecs([]);
  };

  const isInChat = quizStep === QUIZ_STEPS.length + 1;
  const isInForm = quizStep === QUIZ_STEPS.length;
  const currentQuiz = QUIZ_STEPS[quizStep];

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative',
        minHeight: isInChat ? 320 : 560,
        overflow: 'hidden',
        marginTop: 'calc(-1 * var(--nav-h))',
        display: 'flex',
        alignItems: 'center',
        transition: 'min-height .5s ease',
      }}>
        <img
          src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1400&q=90"
          alt="Destinos del mundo"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,20,40,0.4) 0%, rgba(10,20,40,0.72) 55%, rgba(10,20,40,0.94) 100%)' }} />

        <div className="container" style={{
          position: 'relative', zIndex: 1, width: '100%',
          paddingTop: 'calc(var(--nav-h) + 3rem)',
          paddingBottom: isInChat ? '2.5rem' : '3.5rem',
          transition: 'padding .4s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.9)',
            fontSize: 11, fontWeight: 600, padding: '5px 14px',
            borderRadius: 'var(--r-full)', marginBottom: '1.25rem',
            border: '1px solid rgba(255,255,255,.2)',
          }}>
            <Sparkles size={12} /> Asistente IA · Vera
          </div>

          {!isInChat ? (
            <>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
                fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '.85rem',
                letterSpacing: '-0.02em', maxWidth: 620,
              }}>
                Encuentra tu viaje ideal<br />
                <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.75)' }}>guiado por IA</em>
              </h1>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, maxWidth: 500, lineHeight: 1.75, fontWeight: 300 }}>
                Responde 3 preguntas rápidas y Vera diseñará el viaje perfecto para ti,
                con resultados reales y precios actualizados.
              </p>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                  fontWeight: 800, color: '#fff', lineHeight: 1.15,
                  letterSpacing: '-0.02em', marginBottom: '.35rem',
                }}>
                  Vera está en línea
                </h1>
                <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>
                  Basado en tu perfil — {quizData.style}, {quizData.companion}, {quizData.vibe}
                </p>
              </div>
              <button onClick={resetAll} style={{
                padding: '9px 20px', borderRadius: 'var(--r-full)',
                background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,.25)',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                ← Empezar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ QUIZ ════════════════════════════════════════════════ */}
      {quizStep < QUIZ_STEPS.length && (
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ padding: '3.5rem 1.5rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2.5rem', alignItems: 'center' }}>
              {QUIZ_STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && (
                    <div style={{ flex: 1, height: 2, background: i <= quizStep ? 'var(--blue)' : 'var(--border)', borderRadius: 2, transition: 'background .3s' }} />
                  )}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: i <= quizStep ? 'var(--blue)' : 'var(--paper2)',
                    border: `2px solid ${i <= quizStep ? 'var(--blue)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s',
                  }}>
                    {i < quizStep
                      ? <Check size={13} color="#fff" />
                      : <span style={{ fontSize: 11, fontWeight: 700, color: i === quizStep ? '#fff' : 'var(--muted)' }}>{i + 1}</span>}
                  </div>
                  {i < QUIZ_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < quizStep ? 'var(--blue)' : 'var(--border)', borderRadius: 2, transition: 'background .3s' }} />
                  )}
                </div>
              ))}
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
              fontWeight: 800, color: 'var(--ink)', marginBottom: '1.75rem', letterSpacing: '-0.01em',
            }}>
              {currentQuiz.question}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {currentQuiz.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => selectQuizOption(currentQuiz.id, opt.value)}
                  style={{
                    borderRadius: 'var(--r-xl)',
                    border: `2px solid ${quizData[currentQuiz.id] === opt.value ? 'var(--blue)' : 'var(--border)'}`,
                    background: 'var(--white)', overflow: 'hidden', cursor: 'pointer',
                    transition: 'all .2s', textAlign: 'left', padding: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(28,78,120,.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = quizData[currentQuiz.id] === opt.value ? 'var(--blue)' : 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
                    <img src={opt.img} alt={opt.label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,20,40,.6) 0%, transparent 55%)' }} />
                    {quizData[currentQuiz.id] === opt.value && (
                      <div style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={13} color="#fff" />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem 1.1rem 1.1rem' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: '.3rem' }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {quizStep > 0 && (
              <button onClick={() => setQuizStep(s => s - 1)} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ChevronLeft size={15} /> Volver atrás
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ FORMULARIO GUIADO ════════════════════════════════════ */}
      {isInForm && (
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ padding: '3.5rem 1.5rem' }}>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
              {Object.entries(quizData).map(([k, v]) => (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 'var(--r-full)', background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(28,78,120,.1)' }}>
                  <Check size={11} /> {v}
                </span>
              ))}
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 800, color: 'var(--ink)', marginBottom: '.5rem', letterSpacing: '-0.01em' }}>
              Un poco más para afinar...
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '2rem' }}>
              Estos datos son opcionales — cuantos más des, mejor será la recomendación.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
                  ¿Tienes algún destino en mente?
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', background: 'var(--paper2)' }}>
                  <MapPin size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  <input
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }}
                    placeholder="Ej: Japón, Maldivas, Nueva York... (opcional)"
                    value={formData.destination}
                    onChange={e => setFormData(f => ({ ...f, destination: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>Fecha de salida</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', background: 'var(--paper2)' }}>
                  <Calendar size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  <input type="date" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }} value={formData.from} onChange={e => setFormData(f => ({ ...f, from: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>Fecha de vuelta</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', background: 'var(--paper2)' }}>
                  <Calendar size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  <input type="date" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }} value={formData.to} onChange={e => setFormData(f => ({ ...f, to: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>Número de viajeros</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', background: 'var(--paper2)' }}>
                  <Users size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  <input type="number" min={1} max={20} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }} value={formData.travelers} onChange={e => setFormData(f => ({ ...f, travelers: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>Presupuesto por persona</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PRICE_OPTIONS.map(p => (
                    <button key={p.value}
                      onClick={() => setFormData(f => ({ ...f, budget: f.budget === p.value ? '' : p.value }))}
                      style={{ flex: 1, padding: '7px 12px', borderRadius: 'var(--r-full)', border: `1.5px solid ${formData.budget === p.value ? 'var(--blue)' : 'var(--border)'}`, background: formData.budget === p.value ? 'var(--blue-light)' : 'var(--paper2)', color: formData.budget === p.value ? 'var(--blue)' : 'var(--ink)', fontSize: 12, fontWeight: formData.budget === p.value ? 700 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                      {p.label}
                      <span style={{ display: 'block', fontSize: 10, color: formData.budget === p.value ? 'var(--blue)' : 'var(--muted)', fontWeight: 400 }}>{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={launchChat} style={{ padding: '14px 32px', borderRadius: 'var(--r-full)', background: 'var(--blue)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(28,78,120,.3)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <Sparkles size={16} /> Preguntarle a Vera
              </button>
              <button onClick={() => setQuizStep(s => s - 1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ChevronLeft size={15} /> Volver al quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CHAT + RESULTADOS ════════════════════════════════════ */}
      {isInChat && (
        <div ref={chatRef} className="container" style={{ padding: '3rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2.5rem', alignItems: 'start' }}>

            {/* ── Resultados ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '.68rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'block' }} />
                  Selección de Vera
                </div>
              </div>

              {recsLoad ? (
                <div className="trips-grid">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} style={{ height: 300, background: 'var(--paper2)', borderRadius: 'var(--r-xl)', animation: 'pulse 1.5s ease infinite' }} />
                  ))}
                </div>
              ) : recs.length > 0 ? (
                <>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: '1.5rem' }}>
                    {recs.length} destinos seleccionados para tu perfil
                  </p>
                  <div className="trips-grid">
                    {recs.map(t => <TripCard key={t.id} trip={t} />)}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px dashed var(--border)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 'var(--r-xl)', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Sparkles size={28} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '.4rem', color: 'var(--ink)' }}>
                    Vera está analizando tus preferencias
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 360, margin: '0 auto' }}>
                    En un momento aparecerán aquí los viajes reales que mejor encajan contigo.
                  </p>
                </div>
              )}
            </div>

            {/* ── Chat ── */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,.08)', overflow: 'hidden', position: 'sticky', top: 'calc(var(--nav-h) + 1rem)' }}>
              <div style={{ background: 'var(--ink)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={17} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#fff' }}>Vera</div>
                  <div style={{ fontSize: 11, color: 'rgba(250,250,248,.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52C78A', display: 'inline-block' }} />
                    Disponible ahora
                  </div>
                </div>
                <button onClick={clearChat} title="Limpiar chat" style={{ color: 'rgba(255,255,255,.4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 6 }}>
                  <Trash2 size={15} />
                </button>
              </div>

              <div style={{ height: 380, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ maxWidth: '88%', padding: '10px 14px', borderRadius: m.role === 'user' ? 'var(--r-lg) var(--r-lg) 4px var(--r-lg)' : 'var(--r-lg) var(--r-lg) var(--r-lg) 4px', background: m.role === 'user' ? 'var(--blue)' : 'var(--paper2)', color: m.role === 'user' ? '#fff' : 'var(--ink)', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', fontSize: 14, lineHeight: 1.55, marginLeft: m.role === 'user' ? 'auto' : 0 }}>
                    {m.text}
                  </div>
                ))}
                {busy && (
                  <div style={{ display: 'flex', gap: 5, padding: '10px 14px', background: 'var(--paper2)', borderRadius: 'var(--r-lg)', alignSelf: 'flex-start' }}>
                    {[0, .2, .4].map((d, i) => (
                      <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ink3)', display: 'block', animation: `pulse 1.2s ease ${d}s infinite` }} />
                    ))}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div style={{ display: 'flex', gap: 8, padding: '.75rem 1rem 1rem', borderTop: '1px solid var(--border)' }}>
                <input
                  style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 'var(--r-full)', padding: '9px 14px', fontSize: 14, outline: 'none', background: 'var(--paper2)', color: 'var(--ink)' }}
                  placeholder="Pregúntale algo más a Vera..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button onClick={() => sendMessage(input)} disabled={!input.trim() || busy}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: input.trim() ? 'var(--blue)' : 'var(--paper3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all .18s', flexShrink: 0, color: '#fff' }}>
                  <Send size={15} />
                </button>
              </div>

              {!isAuth && (
                <div style={{ padding: '0 1rem 1rem', fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                  <a href="/register" style={{ color: 'var(--blue)', fontWeight: 600 }}>Crea una cuenta</a> para guardar el historial
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ BENEFICIOS ═══════════════════════════════════════════ */}
      {!isInChat && (
        <section style={{ padding: '6rem 0', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '.68rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: '.75rem' }}>
                <span style={{ width: 22, height: 1, background: 'var(--gold)', display: 'block' }} />
                Por qué Vera
                <span style={{ width: 22, height: 1, background: 'var(--gold)', display: 'block' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: 'var(--ink)' }}>
                Tu asistente de viajes inteligente
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: '.5rem', fontWeight: 300 }}>
                Vera no es un buscador más — es una IA que entiende lo que quieres
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem' }}>
              {VERA_BENEFITS.map((b, i) => (
                <div key={i}
                  style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--white)', transition: 'transform .22s, box-shadow .22s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                    <img src={b.img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,20,40,.55) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 12, left: 14, width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      {b.icon}
                    </div>
                  </div>
                  <div style={{ padding: '1.1rem 1.25rem 1.4rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.45rem' }}>{b.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, fontWeight: 300 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ CTA no logueados ═══════════════════════════════════ */}
      {!isAuth && (
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=85" alt="Paisaje"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,20,40,.6), rgba(10,20,40,.88))' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '6rem 1.5rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--r-xl)', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#fff' }}>
              <Sparkles size={28} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: '#fff', marginBottom: '.75rem', letterSpacing: '-0.02em' }}>
              Desbloquea recomendaciones<br />personalizadas
            </h2>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, maxWidth: 480, margin: '0 auto 2.5rem', fontWeight: 300, lineHeight: 1.7 }}>
              Crea tu cuenta gratis y Vera aprenderá tus preferencias para recomendarte destinos cada vez más ajustados a lo que buscas.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/register" className="btn btn--primary" style={{ padding: '13px 32px', fontSize: '1rem' }}>Crear cuenta gratis</a>
              <a href="/login" style={{ padding: '13px 32px', fontSize: '1rem', fontWeight: 600, borderRadius: 'var(--r-full)', border: '1.5px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', color: '#fff', textDecoration: 'none' }}>
                Ya tengo cuenta
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}