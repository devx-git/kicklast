import './index.css';
import './lk-styles.css';
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ── Componentes del landing — carga INMEDIATA (el usuario los ve al entrar) ──
import Navbar      from './components/Navbar';
import Hero        from './components/Hero';
import Matches     from './components/Matches';
import LiveScores  from './components/LiveScores';
import HowToPlay   from './components/HowToPlay';
import Sponsors    from './components/Sponsors';
import Footer      from './components/Footer';
import PromoterCTA from './components/PromoterCTA';
import { dataService } from './services/dataService';

// ── Páginas — carga DIFERIDA: el bundle se divide automáticamente ─────────────
// Cada import() crea un chunk separado; solo se descarga cuando el usuario
// navega a esa ruta por primera vez. Ahorro: ~550 KB en la carga inicial.
const Login              = lazy(() => import('./pages/Login'));
const Register           = lazy(() => import('./pages/Register'));
const RecuperarClave     = lazy(() => import('./pages/RecuperarClave'));
const NuevaClave         = lazy(() => import('./pages/NuevaClave'));
const Dashboard          = lazy(() => import('./pages/Dashboard'));
const MisPredicciones    = lazy(() => import('./pages/MisPredicciones'));
const Movimientos        = lazy(() => import('./pages/Movimientos'));
const Retiros            = lazy(() => import('./pages/Retiros'));
const MisApuestas        = lazy(() => import('./pages/MisApuestas'));
const CanjearPin         = lazy(() => import('./pages/CanjearPin'));
const Recargar           = lazy(() => import('./pages/Recargar'));
const PagoRetorno        = lazy(() => import('./pages/PagoRetorno'));
const Resultados         = lazy(() => import('./pages/Resultados'));
const Campeonatos        = lazy(() => import('./pages/Campeonatos'));
const Premio             = lazy(() => import('./pages/Premio'));
const EnVivo             = lazy(() => import('./pages/EnVivo'));
const EventoDetalle      = lazy(() => import('./pages/EventoDetalle'));
const Fixture            = lazy(() => import('./pages/Fixture'));
const Leaderboard        = lazy(() => import('./pages/Leaderboard'));
const Champions          = lazy(() => import('./pages/Champions'));
const RegistroPromotor   = lazy(() => import('./pages/RegistroPromotor'));
const PanelPromotor      = lazy(() => import('./pages/PanelPromotor'));
const CrearEvento        = lazy(() => import('./pages/CrearEvento'));
const PanelDistribuidor  = lazy(() => import('./pages/PanelDistribuidor'));
const AdminPanel         = lazy(() => import('./pages/AdminPanel'));
const Terminos           = lazy(() => import('./pages/Terminos'));
const Privacidad         = lazy(() => import('./pages/Privacidad'));
const DemoPenaltis       = lazy(() => import('./pages/DemoPenaltis'));
const Patrocinador       = lazy(() => import('./pages/Patrocinador'));
const Ayuda              = lazy(() => import('./pages/Ayuda'));
const Reglamento         = lazy(() => import('./pages/Reglamento'));
const JuegoResponsable   = lazy(() => import('./pages/JuegoResponsable'));
const Contacto           = lazy(() => import('./pages/Contacto'));
const PaginaPatrocinadores = lazy(() => import('./pages/PaginaPatrocinadores'));
const ComingSoon         = lazy(() => import('./pages/ComingSoon'));
const NotFound           = lazy(() => import('./pages/NotFound'));

// ── Fallback mientras carga un chunk diferido ─────────────────────────────────
function Cargando() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#08090f', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #1e2a3a', borderTopColor: '#8dc63f',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#4a5568', letterSpacing: '0.1em' }}>
        CARGANDO...
      </span>
    </div>
  );
}

/* ── Sección recarga en landing ─────────────────────────────────────────── */
/* ─── Paquetes de recarga — código conservado, listo para activar cuando
       se firmen los contratos con las pasarelas de pago globales.
       Para reactivar: descomentar PAQUETES_LANDING, quitar blur/overlay
       en SeccionRecargaOnline y restaurar los links a /recargar.  ───────── */
const PAQUETES_LANDING = [
  { id: 'pack5',   cr: 5,   usd: 5,   nombre: 'Starter', color: '#8dc63f', popular: false },
  { id: 'pack10',  cr: 10,  usd: 10,  nombre: 'Básico',  color: '#8dc63f', popular: false },
  { id: 'pack25',  cr: 25,  usd: 25,  nombre: 'Pro',     color: '#a78bfa', popular: true  },
  { id: 'pack50',  cr: 50,  usd: 50,  nombre: 'Plus',    color: '#8dc63f', popular: false },
  { id: 'pack100', cr: 100, usd: 100, nombre: 'Elite',   color: '#f59e0b', popular: false },
];

const METODOS_PAGO = ['💳 Tarjeta', '₿ Cripto', '💚 Nequi', '🏦 PSE', '📲 Transferencia'];
const REGIONES     = ['🌎 Latinoamérica', '🇪🇺 Europa', '🇺🇸 Norteamérica'];

function SeccionRecargaOnline() {
  return (
    <section style={{
      background: 'linear-gradient(180deg,#0a0d14 0%,#0d1420 100%)',
      padding: '48px 20px',
      borderTop: '1px solid #1e2a3a',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(167,139,250,0.1)',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 20, padding: '4px 16px',
            fontFamily: 'Oswald, sans-serif', fontSize: 11,
            color: '#a78bfa', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 14,
          }}>
            🌍 RECARGA ONLINE GLOBAL
          </div>
          <h2 style={{
            fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900,
            color: '#fff', margin: '0 0 8px', lineHeight: 1.1,
          }}>
            RECARGAS EN LÍNEA — PRÓXIMAMENTE
          </h2>
          <p style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d',
            maxWidth: 460, margin: '0 auto',
          }}>
            Pronto podrás recargar créditos desde cualquier país con tu método de pago favorito.
          </p>
        </div>

        {/* ── Cards de paquetes (fondo borroso) + overlay ── */}
        <div style={{ position: 'relative' }}>

          {/* Ghost cards — opacidad 15%, blur, sin interacción */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
            gap: 12,
            opacity: 0.15,
            filter: 'blur(3px)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            {PAQUETES_LANDING.map(p => (
              <div key={p.id} style={{
                background: p.popular ? 'linear-gradient(145deg,#141026,#0f1620)' : '#0f1420',
                border: `1px solid ${p.popular ? '#a78bfa40' : '#1e2a3a'}`,
                borderRadius: 12, padding: '20px 16px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 38, fontWeight: 900, color: p.color, lineHeight: 1, marginBottom: 2 }}>{p.cr}</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginBottom: 8 }}>créditos</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>${p.usd} USD</div>
              </div>
            ))}
          </div>

          {/* Overlay central */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: 'rgba(10,13,20,0.88)',
              border: '1px solid rgba(167,139,250,0.25)',
              borderRadius: 16,
              padding: '22px 36px',
              textAlign: 'center',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 0 40px rgba(167,139,250,0.08)',
              maxWidth: 420, width: '90%',
            }}>
              {/* Título */}
              <div style={{
                fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 900,
                color: '#a78bfa', letterSpacing: '0.06em', marginBottom: 14,
              }}>
                ⏳ PRÓXIMAMENTE
              </div>

              {/* Métodos de pago */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                {METODOS_PAGO.map(m => (
                  <span key={m} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid #1e2a3a',
                    borderRadius: 20, padding: '3px 10px',
                    fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#c0cad8',
                  }}>{m}</span>
                ))}
              </div>

              {/* Divisor */}
              <div style={{ borderTop: '1px solid #1e2a3a', margin: '12px 0' }} />

              {/* Regiones */}
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                {REGIONES.map(r => (
                  <span key={r} style={{
                    fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568',
                  }}>{r}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function HomePage({ acumulado, stats }) {
  return (
    <main className="bg-[#111827] text-white selection:bg-[#8dc63f] selection:text-black">
      <Navbar jackpotVal={acumulado} />
      <Hero stats={stats} acumulado={acumulado} />
      <Matches />
      <LiveScores />
      <HowToPlay />
      <SeccionRecargaOnline />
      <PromoterCTA />
      <Sponsors />
      <Footer />
    </main>
  );
}

export default function App() {
  const [acumulado, setAcumulado] = useState('$200.000');
  const [stats] = useState({ vivos: 20007, enComa: 121, eliminados: 542, premioMax: '$200K' });

  useEffect(() => {
    dataService.getEventosActivos()
      .then(eventos => {
        if (eventos?.length > 0) {
          const max = eventos.reduce((best, e) =>
            Number(e.acumulado_actual) > Number(best.acumulado_actual) ? e : best
          , eventos[0]);
          const val = Number(max.acumulado_actual);
          if (val > 0) {
            setAcumulado('$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val));
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      {/* Suspense envuelve TODAS las rutas; muestra spinner mientras carga el chunk */}
      <Suspense fallback={<Cargando />}>
        <Routes>
          {/* ── Landing — carga inmediata ── */}
          <Route path="/" element={<HomePage acumulado={acumulado} stats={stats} />} />

          {/* ── Auth ── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/recuperar-clave" element={<RecuperarClave />} />
          <Route path="/nueva-clave"     element={<NuevaClave />} />

          {/* ── Usuario ── */}
          <Route path="/dashboard"        element={<Dashboard />} />
          <Route path="/mis-predicciones" element={<MisPredicciones />} />
          <Route path="/movimientos"      element={<Movimientos />} />
          <Route path="/retiros"          element={<Retiros />} />
          <Route path="/mis-apuestas"     element={<MisApuestas />} />
          <Route path="/canjear-pin"      element={<CanjearPin />} />
          <Route path="/recargar"         element={<Recargar />} />
          <Route path="/pago/retorno"     element={<PagoRetorno />} />

          {/* ── Contenido deportivo ── */}
          <Route path="/resultados"      element={<Resultados />} />
          <Route path="/mundial"         element={<Campeonatos />} />
          <Route path="/campeonatos"     element={<Campeonatos />} />
          <Route path="/en-vivo"         element={<EnVivo />} />
          <Route path="/eventos/:id"     element={<EventoDetalle />} />
          <Route path="/fixture"         element={<Fixture />} />
          <Route path="/leaderboard"     element={<Leaderboard />} />
          <Route path="/champions"       element={<Champions />} />
          <Route path="/premio"          element={<Premio />} />

          {/* ── Paneles ── */}
          <Route path="/registro-promotor"   element={<RegistroPromotor />} />
          <Route path="/promotor"            element={<PanelPromotor />} />
          <Route path="/promotor/crear-evento" element={<CrearEvento />} />
          <Route path="/distribuidor"        element={<PanelDistribuidor />} />
          <Route path="/admin"               element={<AdminPanel />} />

          {/* ── Páginas estáticas ── */}
          <Route path="/terminos"         element={<Terminos />} />
          <Route path="/privacidad"       element={<Privacidad />} />
          <Route path="/ayuda"            element={<Ayuda />} />
          <Route path="/reglas"           element={<Reglamento />} />
          <Route path="/reglamento"       element={<Reglamento />} />
          <Route path="/juego-responsable" element={<JuegoResponsable />} />
          <Route path="/contacto"         element={<Contacto />} />
          <Route path="/patrocinadores"   element={<PaginaPatrocinadores />} />
          <Route path="/patrocinador"     element={<Patrocinador />} />
          <Route path="/demo-penaltis"    element={<DemoPenaltis />} />
          <Route path="/crown"            element={<ComingSoon />} />
          <Route path="/promociones"      element={<ComingSoon />} />

          {/* ── Aliases y 404 ── */}
          <Route path="/ranking"  element={<Navigate to="/leaderboard" replace />} />
          <Route path="/jackpot"  element={<Navigate to="/premio" replace />} />
          <Route path="*"         element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
