// ================================================================
// VELARIS — AiChat.jsx  (src/components/AiChat.jsx)
// ================================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Trash2, Sparkles } from 'lucide-react';
import { aiApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const INITIAL_MSG = { id: 0, role: 'vera', text: '¡Hola! Soy Vera ✨ Tu asistente de viajes con IA. ¿A dónde quieres ir?' };
const SUGGESTIONS = ['¿Qué destinos son tendencia?', 'Vuelo + hotel en Bali', 'Viaje con presupuesto de 1000€'];

let msgIdCounter = 1;
const nextId = () => msgIdCounter++;

export default function AiChat() {
  const { isAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [busy, setBusy]   = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const send = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || busy) return;

    const userMsg = { id: nextId(), role: 'user', text };
    setInput('');
    setMsgs(prev => [...prev, userMsg]);
    setBusy(true);

    try {
      const history = msgs.slice(-6).map(m => ({
        role:    m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      const fn = isAuth ? aiApi.chatPersistent : aiApi.chat;
      const { data } = await fn({ message: text, history });
      setMsgs(prev => [...prev, { id: nextId(), role: 'vera', text: data.message }]);
    } catch {
      setMsgs(prev => [...prev, {
        id:   nextId(),
        role: 'vera',
        text: 'Lo siento, hubo un error. Inténtalo de nuevo.',
      }]);
    } finally {
      setBusy(false);
    }
  }, [input, busy, msgs, isAuth]);

  const clear = async () => {
    if (isAuth) { try { await aiApi.clearHistory(); } catch {} }
    msgIdCounter = 1;
    setMsgs([{ ...INITIAL_MSG, id: 0, text: '¡Chat reiniciado! ¿En qué puedo ayudarte?' }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="ai-chat">
      {open && (
        <div className="ai-chat__panel" role="dialog" aria-label="Chat con Vera">
          <div className="ai-chat__header">
            <div className="ai-chat__avatar">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="ai-chat__name">Vera IA</div>
              <div className="ai-chat__status">
                {busy ? '● Escribiendo...' : '● Disponible'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={clear}
                title="Limpiar conversación"
                aria-label="Limpiar conversación"
                style={{ color: 'rgba(255,255,255,.5)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={14} />
              </button>
              <button
                className="ai-chat__close"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="ai-chat__messages" role="log" aria-live="polite" aria-label="Mensajes">
            {msgs.map(m => (
              <div
                key={m.id}
                className={`ai-chat__msg ai-chat__msg--${m.role === 'user' ? 'user' : 'assistant'}`}
              >
                {m.role !== 'user'  // ← MODIFICADO
                  ? m.text.split('\n').map((line, i) => (
                      <span key={i} style={{ display: 'block', marginBottom: line.startsWith('-') ? '6px' : '0' }}>
                        {line}
                      </span>
                    ))
                  : m.text}
              </div>
            ))}
            {busy && (
              <div className="ai-chat__typing" aria-label="Vera está escribiendo">
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {msgs.length <= 1 && (
            <div className="ai-chat__suggestions">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="ai-chat__suggestion"
                  onClick={() => send(s)}
                  disabled={busy}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="ai-chat__input-row">
            <input
              ref={inputRef}
              className="ai-chat__input"
              placeholder="Pregúntale a Vera..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={busy}
              aria-label="Mensaje para Vera"
              maxLength={500}
            />
            <button
              className="ai-chat__send"
              onClick={() => send()}
              disabled={!input.trim() || busy}
              aria-label="Enviar mensaje"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      <button
        className="ai-chat__toggle"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Cerrar Vera' : 'Abrir Vera'}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>
    </div>
  );
}