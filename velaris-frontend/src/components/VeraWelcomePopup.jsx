import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripsApi } from '../api/client';

const StarSVG = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <path d="M9 1.5L11 7H16.5L12.2 10.5L13.8 16L9 12.8L4.2 16L5.8 10.5L1.5 7H7L9 1.5Z" fill="white"/>
  </svg>
);

export default function VeraWelcomePopup({ onOpenChat }) {
  const { user } = useAuth();
  const [visible,   setVisible]   = useState(false);
  const [hiding,    setHiding]    = useState(false);
  const [tripCount, setTripCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem('vera_popup_closed')) return;

    tripsApi.getAll({ size: 1 })
      .then(res => {
        setTripCount(res.data.totalElements || 0);
        setTimeout(() => setVisible(true), 1500);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => close(), 8000);
    return () => clearTimeout(t);
  }, [visible]);

  const close = () => {
    setHiding(true);
    setTimeout(() => {
      sessionStorage.setItem('vera_popup_closed', '1');
      setVisible(false);
      setHiding(false);
    }, 350);
  };

  if (!visible) return null;

  return (
    <div className={`vera-popup${hiding ? ' vera-popup--hiding' : ''}`}>
      <div className="vera-popup__inner">
        <button className="vera-popup__close" onClick={close}>✕</button>

        <div className="vera-popup__header">
          <div className="vera-popup__avatar">
            <StarSVG />
          </div>
          <div>
            <p className="vera-popup__name">Vera IA</p>
            <div className="vera-popup__online">
              <span className="vera-popup__online-dot" />
              Disponible ahora
            </div>
          </div>
        </div>

        <p className="vera-popup__msg">
          <strong>¡Hola, {user?.name?.split(' ')[0]}!</strong>{' '}
          Hay <strong>{tripCount}</strong> destinos disponibles esta semana.
          ¿Quieres que te recomiende alguno?
        </p>

        <div className="vera-popup__actions">
          <button
            className="btn btn--primary"
            onClick={() => { close(); onOpenChat?.(); }}>
            Sí, recomiéndame
          </button>
          <button className="btn btn--ghost" onClick={close}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
