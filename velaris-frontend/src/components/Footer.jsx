// ================================================================
// VELARIS — Footer.jsx  (src/components/Footer.jsx)
// ================================================================
import { Link } from 'react-router-dom';

const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconInstagram = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const IconLinkedin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const SOCIAL = [
  { icon: <IconX />,         label: 'X / Twitter' },
  { icon: <IconInstagram />, label: 'Instagram' },
  { icon: <IconLinkedin />,  label: 'LinkedIn' },
];

const COLS = [
  {
    title: 'Explorar',
    links: [
      ['Destinos',           '/trips'],
      ['Vuelos',             '/flights'],
      ['Escapadas',          '/escapadas'],
      ['Recomendaciones IA', '/recommendations'],
    ],
  },
  {
    title: 'Mi cuenta',
    links: [
      ['Mis reservas',  '/bookings'],
      ['Favoritos',     '/favorites'],
      ['Mi perfil',     '/profile'],
      ['Iniciar sesión','/login'],
    ],
  },
  {
    title: 'Compañía',
    links: [
      ['Sobre Velaris',       '/about'],
      ['Blog',                '#'],
      ['Trabaja con nosotros','#'],
      ['Prensa',              '#'],
    ],
  },
  {
    title: 'Soporte & Legal',
    links: [
      ['Centro de ayuda', '#'],
      ['Contacto',        '#'],
      ['Privacidad',      '#'],
      ['Términos de uso', '#'],
      ['Cookies',         '#'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="velaris-footer">
      <div className="velaris-footer__grid">

        {/* Brand */}
        <div className="velaris-footer__brand">
          <div className="velaris-footer__brand-logo">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L11 7H16.5L12.2 10.5L13.8 16L9 12.8L4.2 16L5.8 10.5L1.5 7H7L9 1.5Z" fill="currentColor"/>
            </svg>
            VELARIS
          </div>
          <p>Viajes que inspiran.<br />Reservas que confían.</p>

          {/* Newsletter */}
          <div className="velaris-footer__newsletter">
            <input type="email" placeholder="Tu email para novedades..." />
            <button aria-label="Suscribirse"><IconSend /></button>
          </div>

          {/* Redes */}
          <div className="velaris-footer__icons">
            {SOCIAL.map(s => (
              <button key={s.label} className="velaris-footer__icon-btn" aria-label={s.label}>
                {s.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Columnas */}
        {COLS.map(col => (
          <div key={col.title} className="velaris-footer__col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="velaris-footer__bottom">
        <span>© {new Date().getFullYear()} Velaris. Todos los derechos reservados.</span>
        <span>Hecho con precisión en España</span>
        <div className="velaris-footer__bottom-links">
          <Link to="#">Privacidad</Link>
          <Link to="#">Términos</Link>
          <Link to="#">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}