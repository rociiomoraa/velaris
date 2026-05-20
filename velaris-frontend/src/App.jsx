// ================================================================
// VELARIS — App.jsx  (src/App.jsx)
// ================================================================
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Component, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';   // ← AÑADIR
import Navbar   from './components/Navbar';
import Footer   from './components/Footer';
import AiChat   from './components/AiChat';
import ProtectedRoute from './routes/ProtectedRoute';
import CheckoutPage from './pages/CheckoutPage';

import HomePage            from './pages/HomePage';
import TripsPage           from './pages/TripsPage';
import TripDetail          from './pages/TripDetail';
import FlightsPage         from './pages/FlightsPage';
import EscapadasPage       from './pages/EscapadasPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ProfilePage         from './pages/ProfilePage';
import BookingsPage        from './pages/BookingsPage';
import FavoritesPage       from './pages/FavoritesPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AdminPage           from './pages/AdminPage';
import NotFoundPage        from './pages/NotFoundPage';
import AboutPage           from './pages/AboutPage';

class ErrorBoundary extends Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    if (this.state.err) return (
      <div style={{ padding:'20vh 2rem', textAlign:'center' }}>
        <h2 style={{ fontFamily:'Georgia, serif', marginBottom:'1rem' }}>Algo salió mal</h2>
        <button
          onClick={() => window.location.href = '/'}
          style={{ padding:'10px 24px', background:'#1C4E78', color:'#fff', border:'none', borderRadius:100, cursor:'pointer' }}>
          Volver al inicio
        </button>
      </div>
    );
    return this.props.children;
  }
}

const NO_NAV    = ['/login', '/register'];
const NO_FOOTER = ['/login', '/register', '/admin'];

function Layout() {
  const { ready } = useAuth();
  const { pathname } = useLocation();

  const showNav    = !NO_NAV.includes(pathname);
  const showFooter = !NO_FOOTER.includes(pathname);
  const noPadding  = ['/login', '/register', '/admin'].includes(pathname)
    || pathname.startsWith('/trips/')
    || pathname === '/trips'
    || pathname === '/flights'
    || pathname === '/escapadas';

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  if (!ready) return (
    <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #1C4E78', borderTopColor:'transparent', animation:'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <>
      {showNav && <Navbar />}
      <main style={{ minHeight:'100vh', paddingTop: showNav && !noPadding ? 'var(--nav-h)' : 0 }}>
        <Routes>
          <Route path="/"                element={<HomePage />} />
          <Route path="/trips"           element={<TripsPage />} />
          <Route path="/trips/:id"       element={<TripDetail />} />
          <Route path="/flights"         element={<FlightsPage />} />
          <Route path="/escapadas"       element={<EscapadasPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/bookings"        element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path="/favorites"       element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
          <Route path="/checkout/:id"    element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/admin"           element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="/about"           element={<AboutPage />} />
          <Route path="*"               element={<NotFoundPage />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      <AiChat />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>          {/* ← AÑADIR */}
          <ErrorBoundary>
            <Layout />
          </ErrorBoundary>
        </ThemeProvider>         {/* ← AÑADIR */}
      </AuthProvider>
    </BrowserRouter>
  );
}