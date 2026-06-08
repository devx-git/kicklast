import './index.css';
import './lk-styles.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Matches from './components/Matches';
import LiveScores from './components/LiveScores';
import HowToPlay from './components/HowToPlay';
import Sponsors from './components/Sponsors';
import Footer from './components/Footer';
import PromoterCTA from './components/PromoterCTA';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ComingSoon from './pages/ComingSoon';
import Recargar from './pages/Recargar';
import MisPredicciones from './pages/MisPredicciones';
import Movimientos from './pages/Movimientos';
import Retiros from './pages/Retiros';
import Campeonatos from './pages/Campeonatos';
import Premio from './pages/Premio';
import EnVivo from './pages/EnVivo';
import EventoDetalle from './pages/EventoDetalle';
import MisApuestas from './pages/MisApuestas';
import CanjearPin from './pages/CanjearPin';
import Fixture from './pages/Fixture';
import Leaderboard from './pages/Leaderboard';
import Champions from './pages/Champions';
import RegistroPromotor from './pages/RegistroPromotor';
import PanelPromotor from './pages/PanelPromotor';
import CrearEvento from './pages/CrearEvento';
import PanelDistribuidor from './pages/PanelDistribuidor';
import AdminPanel from './pages/AdminPanel';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import DemoPenaltis from './pages/DemoPenaltis';
import Patrocinador from './pages/Patrocinador';
import Ayuda from './pages/Ayuda';
import Reglamento from './pages/Reglamento';
import JuegoResponsable from './pages/JuegoResponsable';
import Contacto from './pages/Contacto';
import PaginaPatrocinadores from './pages/PaginaPatrocinadores';
import { dataService } from './services/dataService';

function HomePage({ acumulado, stats }) {
  return (
    <main className="bg-[#111827] text-white selection:bg-[#8dc63f] selection:text-black">
      <Navbar jackpotVal={acumulado} />
      <Hero stats={stats} acumulado={acumulado} />
      <Matches />
      <LiveScores />
      <HowToPlay />
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
      <Routes>
        <Route path="/" element={<HomePage acumulado={acumulado} stats={stats} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mundial" element={<Campeonatos />} />
        <Route path="/en-vivo" element={<EnVivo />} />
        <Route path="/crown" element={<ComingSoon />} />
        <Route path="/premio" element={<Premio />} />
        <Route path="/campeonatos" element={<Campeonatos />} />
        <Route path="/eventos/:id" element={<EventoDetalle />} />
        <Route path="/promociones" element={<ComingSoon />} />
        <Route path="/recargar" element={<Recargar />} />
        <Route path="/mis-predicciones" element={<MisPredicciones />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/retiros" element={<Retiros />} />
        <Route path="/mis-apuestas" element={<MisApuestas />} />
        <Route path="/canjear-pin" element={<CanjearPin />} />
        <Route path="/fixture" element={<Fixture />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/champions" element={<Champions />} />
        <Route path="/registro-promotor" element={<RegistroPromotor />} />
        <Route path="/promotor" element={<PanelPromotor />} />
        <Route path="/promotor/crear-evento" element={<CrearEvento />} />
        <Route path="/distribuidor" element={<PanelDistribuidor />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/demo-penaltis" element={<DemoPenaltis />} />
        <Route path="/patrocinador" element={<Patrocinador />} />
        <Route path="/ayuda" element={<Ayuda />} />
        <Route path="/reglas" element={<Reglamento />} />
        <Route path="/reglamento" element={<Reglamento />} />
        <Route path="/juego-responsable" element={<JuegoResponsable />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/patrocinadores" element={<PaginaPatrocinadores />} />
        {/* Aliases */}
        <Route path="/ranking" element={<Navigate to="/leaderboard" replace />} />
        <Route path="/jackpot" element={<Navigate to="/premio" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
