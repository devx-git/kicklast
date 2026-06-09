import { useState, useEffect, useRef, useCallback } from 'react';
import api, { UPLOADS_BASE } from '../services/api';

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{time}</>;
}

// Imágenes de fallback — se muestran si la API no devuelve ninguna
const SLIDES_DEFAULT = [
  { bg: '/img/11chica.png' },
  { bg: '/img/guerra1.png' },
  { bg: '/img/james2.jpg' },
  { bg: '/img/equ10.jpg' },
];

const infoPanels = [
  { cat: 'EL PRIMER JUEGO DE PREDICCIONES DE FÚTBOL', headline: 'Pon a Prueba tu Intuición y Conocimiento', tags: ['PREDICE EL MUNDIAL', 'GANA HASTA $100K', 'PITCHX'] },
  { cat: 'MUNDIAL DE FÚTBOL 2026', headline: 'Juega tu Propio Mundial y Gana Prediciendo los Resultados', tags: ['GANA', 'PREMIOS', 'JUGANDO'] },
  { cat: '¿ESTÁS LISTO PARA PREDECIR ESTE PARTIDO?', headline: 'UZBEKISTÁN VS COLOMBIA', desc: 'Vive la emoción de los 90 minutos más emocionantes fuera de la cancha.', tags: ['JUEGA', 'PREDICE', 'GANA'] },
  { cat: 'PREDICE ESTE PARTIDO', headline: 'SIGUE MINUTO A MINUTO ESTE EMOCIONANTE PARTIDO', desc: 'Regístrate gratis y realiza las predicciones según tu instinto.', tags: ['JUEGA', 'PREDICE', 'GANA'] },
];

function Countdown() {
  const [time, setTime] = useState({ days: '00', hrs: '00', min: '00', seg: '00' });
  useEffect(() => {
    const target = new Date('2026-06-11T18:00:00');
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ days: String(d).padStart(2, '0'), hrs: String(h).padStart(2, '0'), min: String(m).padStart(2, '0'), seg: String(s).padStart(2, '0') });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="lk-countdown">
      <div className="lk-cd-label">INICIO MUNDIAL 2026</div>
      <div className="lk-cd-units">
        {[['days', 'DÍAS'], ['hrs', 'HRS'], ['min', 'MIN'], ['seg', 'SEG']].map(([k, l]) => (
          <div key={k} className="lk-cd-unit">
            <div className="lk-cd-num">{time[k]}</div>
            <div className="lk-cd-lbl">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero({ stats = { vivos: 20007, enComa: 121, eliminados: 542, premioMax: '$200K' }, acumulado = '$200.000' }) {
  const [slides, setSlides] = useState(SLIDES_DEFAULT);
  const [current, setCurrent] = useState(0);
  const [infoIdx, setInfoIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  // Carga imágenes del carrusel desde el admin — fallback a SLIDES_DEFAULT
  useEffect(() => {
    api.get('/admin/media?categoria=carrusel')
      .then(({ data }) => {
        if (data.archivos?.length > 0) {
          setSlides(data.archivos.map(f => ({ bg: `${UPLOADS_BASE}${f.url}` })));
        }
      })
      .catch(() => {}); // sin errores en consola si la API no responde
  }, []);
  const progressRef = useRef(null);
  const startRef = useRef(Date.now());
  const SLIDE_DURATION = 5000;

  useEffect(() => {
    startRef.current = Date.now();
    setProgress(0);
    const rafId = { id: null };
    const animate = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafId.id = requestAnimationFrame(animate);
    };
    rafId.id = requestAnimationFrame(animate);
    const slideId = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
      setInfoIdx(i => (i + 1) % infoPanels.length);
      startRef.current = Date.now();
      setProgress(0);
    }, SLIDE_DURATION);
    return () => { clearInterval(slideId); cancelAnimationFrame(rafId.id); };
  }, []);

  const goTo = (i) => { setCurrent(i); setInfoIdx(i % infoPanels.length); };

  return (
    <div className="lk-hero">
      <div className="lk-alert-container" />

      <div className="lk-viewport">
        <canvas className="lk-pcanvas" />
        <div className="lk-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {slides.map((s, i) => (
            <div key={i} className={`lk-slide${i === current ? ' lk-slide--active' : ''}`}>
              <div className="lk-slide-bg" style={{ backgroundImage: `url(${s.bg})` }} />
              <div className="lk-slide-overlay" />
            </div>
          ))}
        </div>

        <div className="lk-overlay-content lk-content--in">
          <div className="lk-left">
            <div className="lk-headline-anim">
              <div className="lk-eyebrow">
                <div className="lk-eyebrow-line" />
                <span className="lk-eyebrow-text">Juego de predicciones de fútbol</span>
              </div>
              <h1 className="lk-headline">ATRÉVETE<br /><span className="lk-headline-red">A GANAR</span></h1>
            </div>
            <p className="lk-sub lk-sub-anim">
              Siente la adrenalina de cada gol, anticipa cada resultado y conviértete en parte del juego mientras millones de aficionados viven la intensidad del Mundial 2026.
            </p>
            {/*<div className="lk-btns lk-btns-anim">
              <a href="/register" className="lk-btn-register-hero">Crear cuenta gratis</a>
              <a href="/login" className="lk-btn-login-hero">Acceder</a>
            </div>*/}
            <div className="lk-proof lk-proof-anim">
              <div className="lk-proof-item">
                <div className="lk-proof-dot live" />
                <span>{stats.vivos.toLocaleString('es-CO')} Operadores activos</span>
              </div>
              <div className="lk-proof-item">
                <div className="lk-proof-dot" />
                <span>Conexión cifrada</span>
              </div>
            </div>
          </div>

          <div className="lk-right">
            <Countdown />
            <div className="lk-stats">
              <div className="lk-stat"><div className="lk-stat-accent green" /><div className="lk-stat-val green">{stats.vivos.toLocaleString('es-CO')}</div><div className="lk-stat-lbl">Vivos</div></div>
              <div className="lk-stat"><div className="lk-stat-accent yellow" /><div className="lk-stat-val yellow">{stats.enComa}</div><div className="lk-stat-lbl">En Coma</div></div>
              <div className="lk-stat"><div className="lk-stat-accent red" /><div className="lk-stat-val red">{stats.eliminados}</div><div className="lk-stat-lbl">Eliminados</div></div>
              <div className="lk-stat"><div className="lk-stat-accent cyan" /><div className="lk-stat-val cyan">{stats.premioMax}</div><div className="lk-stat-lbl">Premio Máx</div></div>
            </div>
            <div className="lk-status">
              <div className="lk-status-header">
                <span className="lk-status-title">MONITOR DE RANGO</span>
                <div className="lk-status-live"><div className="lk-status-live-dot" /> LIVE</div>
              </div>
              <div className="lk-status-row"><span className="lk-status-key">FASE</span><span className="lk-status-val accent-cyan">FASE DE GRUPOS</span></div>
              <div className="lk-status-row"><span className="lk-status-key">INICIO</span><span className="lk-status-val">11 JUN · 18:00</span></div>
              <div className="lk-status-row"><span className="lk-status-key">ACUMULADO</span><span className="lk-status-val accent-green">{acumulado}</span></div>
              <div className="lk-status-row"><span className="lk-status-key">SISTEMA</span><span className="lk-status-val accent-green">ESTABLE</span></div>
            </div>
          </div>
        </div>

        <div className="lk-corner lk-corner--tl" /><div className="lk-corner lk-corner--tr" />
        <div className="lk-corner lk-corner--bl" /><div className="lk-corner lk-corner--br" />
        <button className="lk-nav-arrow lk-nav-arrow--prev" onClick={() => goTo((current - 1 + slides.length) % slides.length)} aria-label="Anterior">‹</button>
        <button className="lk-nav-arrow lk-nav-arrow--next" onClick={() => goTo((current + 1) % slides.length)} aria-label="Siguiente">›</button>
        <div className="lk-dots">
          {slides.map((_, i) => (
            <button key={i} className={`lk-dot${i === current ? ' lk-dot--active' : ''}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
        <div className="lk-slide-counter"><strong>{String(current + 1).padStart(2, '0')}</strong> / {slides.length.toString().padStart(2, '0')}</div>
        <div className="lk-energy" />
      </div>

      <div className="lk-progress-bar">
        <div className="lk-progress-fill" ref={progressRef} style={{ width: `${progress}%` }} />
      </div>

      {/* Info panels */}
      <div className="lk-info-wrap">
        <div className="lk-info-track" style={{ transform: `translateX(-${infoIdx * 100}%)` }}>
          {infoPanels.map((p, i) => (
            <div key={i} className="lk-info-panel">
              <div className="lk-info-left">
                <div className="lk-info-cat">{p.cat}</div>
                <div className="lk-info-headline">{p.headline}</div>
                {p.desc && <div className="lk-info-desc">{p.desc}</div>}
                <div className="lk-info-tags">
                  {p.tags.map(t => <span key={t} className="lk-info-tag">{t}</span>)}
                </div>
              </div>
              <div className="lk-info-num">{String(i + 1).padStart(2, '0')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="lk-bottom">
        <span className="lk-bottom-label">Kick Last © OPERACIÓN MUNDIAL 2026</span>
        <div className="lk-bottom-pills">
          <span className="lk-pill">FÚTBOL</span>
          <span className="lk-pill">CONEXIÓN SEGURA</span>
          <span className="lk-pill">PREDICCIONES</span>
        </div>
        <span className="lk-bottom-label"><LiveClock /></span>
      </div>
    </div>
  );
}
