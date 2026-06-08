import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TOTAL_TIROS = 5;

// 9 zonas en grilla 3×3 (columna, fila) — usamos índices 0-8
const ZONAS = [
  { id: 0, col: 0, row: 0 },
  { id: 1, col: 1, row: 0 },
  { id: 2, col: 2, row: 0 },
  { id: 3, col: 0, row: 1 },
  { id: 4, col: 1, row: 1 },
  { id: 5, col: 2, row: 1 },
  { id: 6, col: 0, row: 2 },
  { id: 7, col: 1, row: 2 },
  { id: 8, col: 2, row: 2 },
];

// Columna 0 = izq, 1 = centro, 2 = der
function getKeeperZone(zonaId) {
  const col = ZONAS[zonaId].col;
  return col; // 0=izq, 1=centro, 2=der
}

// Posición X del portero según donde se lanza (porcentaje del contenedor)
const KEEPER_X = { 0: '20%', 1: '50%', 2: '80%' };
const KEEPER_X_REST = '50%';

// Posición del balón cuando va a una zona (% del contenedor de la portería)
const BALL_TARGET = [
  { left: '18%', top: '10%' },  // 0
  { left: '50%', top:  '5%' },  // 1
  { left: '82%', top: '10%' },  // 2
  { left: '18%', top: '45%' },  // 3
  { left: '50%', top: '45%' },  // 4
  { left: '82%', top: '45%' },  // 5
  { left: '20%', top: '78%' },  // 6
  { left: '50%', top: '78%' },  // 7
  { left: '80%', top: '78%' },  // 8
];

function Rating({ goles }) {
  if (goles === TOTAL_TIROS) return { emoji: '🏆', label: '¡PERFECTO!',  color: '#8dc63f' };
  if (goles >= 4)            return { emoji: '🌟', label: '¡EXCELENTE!', color: '#8dc63f' };
  if (goles >= 3)            return { emoji: '⚡', label: 'BUEN TIRO',   color: '#f59e0b' };
  if (goles >= 2)            return { emoji: '😤', label: 'REGULAR',     color: '#f59e0b' };
  return                            { emoji: '💀', label: 'SIN GOL',     color: '#f87171' };
}

export default function DemoPenaltis() {
  const navigate = useNavigate();

  const [fase,       setFase]       = useState('intro');
  const [turno,      setTurno]      = useState(1);
  const [goles,      setGoles]      = useState(0);
  const [historial,  setHistorial]  = useState([]);
  const [hover,      setHover]      = useState(null);
  const [animando,   setAnimando]   = useState(false);
  const [resultado,  setResultado]  = useState(null); // null | 'gol' | 'atajado'
  const [keeperCol,  setKeeperCol]  = useState(null); // 0|1|2 cuando salta
  const [zonaActual, setZonaActual] = useState(null);
  const [ballPos,    setBallPos]    = useState(null);  // null = punto de penalti

  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const reiniciar = () => {
    clearTimeout(timer.current);
    setFase('jugando'); setTurno(1); setGoles(0); setHistorial([]);
    setAnimando(false); setResultado(null); setKeeperCol(null);
    setZonaActual(null); setBallPos(null);
  };

  const disparar = (zonaId) => {
    if (animando || fase !== 'jugando') return;

    const dispCol = getKeeperZone(zonaId);

    // Portero elige columna con sesgo: 50% coincide con el tiro, 25% cada otro
    const r = Math.random();
    let kCol;
    if (r < 0.50)      kCol = dispCol;
    else if (r < 0.75) kCol = (dispCol + 1) % 3;
    else               kCol = (dispCol + 2) % 3;

    const esGol = kCol !== dispCol; // el portero NO va al mismo lado

    setAnimando(true);
    setZonaActual(zonaId);
    setKeeperCol(kCol);
    setResultado(null);
    setBallPos(null);

    // t=80ms — balón sale
    timer.current = setTimeout(() => {
      setBallPos(BALL_TARGET[zonaId]);
    }, 80);

    // t=700ms — mostrar resultado
    timer.current = setTimeout(() => {
      setResultado(esGol ? 'gol' : 'atajado');
      if (esGol) setGoles(g => g + 1);
      setHistorial(h => [...h, { zonaId, kCol, gol: esGol }]);
    }, 680);

    // t=1700ms — avanzar
    timer.current = setTimeout(() => {
      const siguienteTurno = turno + 1;
      if (siguienteTurno > TOTAL_TIROS) {
        setFase('resultado');
      } else {
        setTurno(siguienteTurno);
        setResultado(null); setKeeperCol(null);
        setZonaActual(null); setBallPos(null);
      }
      setAnimando(false);
    }, 1700);
  };

  /* ── INTRO ──────────────────────────────────────────────────────────────── */
  if (fase === 'intro') return (
    <div style={PAGE}>
      <Volver onClick={() => navigate('/')} />
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 16 }}>⚽</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.2em', marginBottom: 8 }}>MODO DEMO · KICK LAST</p>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 44, fontWeight: 700, margin: '0 0 16px', lineHeight: 1.05 }}>
          TANDA DE<br />PENALTIS
        </h1>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#6b7a8d', marginBottom: 36, lineHeight: 1.7 }}>
          Tienes <strong style={{ color: '#fff' }}>{TOTAL_TIROS} tiros</strong> para demostrar tu puntería.
          Elige la zona antes de que el portero se lance. ¿Cuántos metes?
        </p>
        <button onClick={() => setFase('jugando')}
          style={{ ...BTN_PRIMARY, fontSize: 18, padding: '16px 52px', boxShadow: '0 0 40px #8dc63f40' }}>
          ¡JUGAR AHORA!
        </button>
        <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
          {[['🎯','9 zonas de tiro'],['🧤','Portero inteligente'],['🏆','Puntaje inmediato']].map(([ic,lb]) => (
            <div key={lb} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{ic}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>{lb}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── RESULTADO ──────────────────────────────────────────────────────────── */
  if (fase === 'resultado') {
    const r = Rating({ goles });
    return (
      <div style={PAGE}>
        <Volver onClick={() => navigate('/')} />
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ fontSize: 72, marginBottom: 10 }}>{r.emoji}</div>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.18em', marginBottom: 4 }}>RESULTADO FINAL</p>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 80, fontWeight: 700, color: r.color, lineHeight: 1 }}>
            {goles}<span style={{ fontSize: 32, color: '#4a5568' }}>/{TOTAL_TIROS}</span>
          </div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: r.color, letterSpacing: '0.14em', marginBottom: 24 }}>
            {r.label}
          </div>

          {/* Historial de tiros */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
            {historial.map((h, i) => (
              <div key={i} style={{
                width: 44, height: 44, borderRadius: 8, fontSize: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: h.gol ? 'rgba(141,198,63,0.12)' : 'rgba(248,113,113,0.12)',
                border: `2px solid ${h.gol ? '#8dc63f' : '#f87171'}`,
              }}>
                {h.gol ? '⚽' : '🧤'}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 14, padding: '28px 28px 24px' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>
              ¿Listo para el desafío real?
            </div>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', lineHeight: 1.65, marginBottom: 20 }}>
              En Kick Last predices resultados de partidos reales y compites por premios en efectivo.
              ¡Regístrate gratis y demuestra que sabes más que los demás!
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => navigate('/register')} style={{ ...BTN_PRIMARY, fontSize: 14, padding: '13px 28px' }}>
                + CREAR CUENTA GRATIS
              </button>
              <button onClick={reiniciar} style={{ ...BTN_GHOST, fontSize: 13, padding: '13px 22px' }}>
                🔄 OTRA VEZ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── JUGANDO ────────────────────────────────────────────────────────────── */
  const keeperLeft = keeperCol === null ? KEEPER_X_REST : KEEPER_X[keeperCol];

  return (
    <div style={PAGE}>
      <Volver onClick={() => navigate('/')} />

      {/* Marcador superior */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
        <Stat label="GOLES" value={goles} color="#8dc63f" />
        <div style={{ width: 1, height: 40, background: '#1e2a3a' }} />
        <Stat label="TIRO" value={`${turno}/${TOTAL_TIROS}`} />
        <div style={{ width: 1, height: 40, background: '#1e2a3a' }} />
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: TOTAL_TIROS }).map((_, i) => (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: 4, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < historial.length
                ? (historial[i].gol ? 'rgba(141,198,63,0.15)' : 'rgba(248,113,113,0.15)')
                : '#1e2535',
              border: `1.5px solid ${i < historial.length ? (historial[i].gol ? '#8dc63f' : '#f87171') : '#1e2a3a'}`,
            }}>
              {i < historial.length ? (historial[i].gol ? '⚽' : '🧤') : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Instrucción / flash resultado */}
      <div style={{
        fontFamily: resultado ? 'Oswald, sans-serif' : 'Roboto, sans-serif',
        fontSize: resultado ? 26 : 13,
        fontWeight: resultado ? 700 : 400,
        color: resultado === 'gol' ? '#8dc63f' : resultado === 'atajado' ? '#f87171' : '#6b7a8d',
        marginBottom: 14,
        letterSpacing: resultado ? '0.1em' : '0.02em',
        textShadow: resultado === 'gol' ? '0 0 20px #8dc63f80' : resultado === 'atajado' ? '0 0 20px #f8717180' : 'none',
        minHeight: 36,
        display: 'flex', alignItems: 'center',
      }}>
        {resultado === 'gol'     ? '⚽ ¡GOOOL!'
         : resultado === 'atajado' ? '🧤 ¡ATAJADO!'
         : animando ? '...'
         : 'Haz clic en la portería donde quieres disparar'}
      </div>

      {/* PORTERÍA + OVERLAY ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, userSelect: 'none' }}>

        {/* Césped degradado de fondo */}
        <div style={{
          background: 'linear-gradient(180deg,#1a3a1a 0%,#0f2010 100%)',
          borderRadius: '0 0 12px 12px',
          height: 60,
          marginTop: -4,
          position: 'relative',
          zIndex: 0,
        }} />

        {/* Contenedor principal (portería) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 240,
          zIndex: 1,
        }}>
          {/* Marco de la portería */}
          <div style={{
            position: 'absolute',
            left: '8%', top: '4%',
            width: '84%', height: '80%',
            border: '6px solid #d0d0d0',
            borderBottom: 'none',
            borderRadius: '4px 4px 0 0',
            zIndex: 2,
          }}>
            {/* Red — líneas verticales */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-around', padding: '0 2px' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ width: 1, height: '100%', background: 'rgba(255,255,255,0.12)' }} />
              ))}
            </div>
            {/* Red — líneas horizontales */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', padding: '2px 0' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.12)' }} />
              ))}
            </div>
          </div>

          {/* Línea de gol (suelo) */}
          <div style={{
            position: 'absolute',
            left: '8%', bottom: '16%',
            width: '84%', height: 4,
            background: 'rgba(255,255,255,0.25)',
            zIndex: 2,
          }} />

          {/* Portero */}
          <div style={{
            position: 'absolute',
            bottom: '22%',
            left: keeperLeft,
            transform: 'translateX(-50%)',
            transition: keeperCol !== null ? 'left 0.35s cubic-bezier(.36,.07,.19,.97)' : 'none',
            zIndex: 5,
            textAlign: 'center',
            lineHeight: 1,
          }}>
            {/* Guantes arriba si centro */}
            {keeperCol === 1 && <div style={{ fontSize: 18, marginBottom: -4 }}>🧤</div>}
            <div style={{
              fontSize: 40,
              transform: keeperCol === 0 ? 'scaleX(-1) rotate(-15deg)' : keeperCol === 2 ? 'rotate(15deg)' : 'none',
              display: 'inline-block',
              filter: resultado === 'atajado' ? 'drop-shadow(0 0 10px #f59e0b)' : 'none',
            }}>🧍</div>
            {keeperCol === 0 && <div style={{ fontSize: 18, position: 'absolute', left: -18, top: 8 }}>🧤</div>}
            {keeperCol === 2 && <div style={{ fontSize: 18, position: 'absolute', right: -18, top: 8 }}>🧤</div>}
          </div>

          {/* Balón */}
          <div style={{
            position: 'absolute',
            left: ballPos ? ballPos.left : '50%',
            top:  ballPos ? ballPos.top  : '90%',
            transform: 'translate(-50%, -50%)',
            fontSize: 28,
            zIndex: 6,
            transition: ballPos ? 'left 0.5s cubic-bezier(.2,.8,.3,1), top 0.5s cubic-bezier(.2,.8,.3,1)' : 'none',
            filter: resultado === 'gol' ? 'drop-shadow(0 0 10px #8dc63f)' : 'none',
          }}>
            ⚽
          </div>

          {/* Punto de penalti */}
          <div style={{
            position: 'absolute',
            left: '50%', bottom: '10%',
            transform: 'translateX(-50%)',
            width: 8, height: 8,
            borderRadius: '50%',
            background: 'rgba(141,198,63,0.5)',
            zIndex: 2,
          }} />

          {/* Grid de zonas clickeables (dentro de la portería) */}
          <div style={{
            position: 'absolute',
            left: '8%', top: '4%',
            width: '84%', height: '80%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: 3,
            padding: 4,
            zIndex: 10,
            pointerEvents: animando ? 'none' : 'auto',
          }}>
            {ZONAS.map(z => {
              const esSeleccionada = zonaActual === z.id;
              const enHover = hover === z.id && !animando;
              return (
                <div
                  key={z.id}
                  onClick={() => disparar(z.id)}
                  onMouseEnter={() => setHover(z.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    borderRadius: 4,
                    background: esSeleccionada
                      ? (resultado === 'gol'     ? 'rgba(141,198,63,0.4)'
                         : resultado === 'atajado' ? 'rgba(248,113,113,0.4)'
                         : 'rgba(255,255,255,0.1)')
                      : enHover
                      ? 'rgba(141,198,63,0.18)'
                      : 'rgba(255,255,255,0.03)',
                    border: esSeleccionada
                      ? `2px solid ${resultado === 'gol' ? '#8dc63f' : resultado === 'atajado' ? '#f87171' : 'transparent'}`
                      : enHover
                      ? '2px solid rgba(141,198,63,0.5)'
                      : '1px solid rgba(255,255,255,0.06)',
                    cursor: animando ? 'default' : 'crosshair',
                    transition: 'background 0.1s, border 0.1s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Espacio para el césped debajo */}
        <div style={{ height: 240 }} />
      </div>

      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568', marginTop: 4 }}>
        Turno {turno} de {TOTAL_TIROS} · Marca tu zona y dispara
      </div>
    </div>
  );
}

/* ── Helpers de UI ─────────────────────────────────────────────────────────── */
function Volver({ onClick }) {
  return (
    <button onClick={onClick} style={{
      alignSelf: 'flex-start', background: 'none', border: 'none',
      color: '#6b7a8d', cursor: 'pointer',
      fontFamily: 'Oswald, sans-serif', fontSize: 13, marginBottom: 28, letterSpacing: '0.05em',
    }}>
      ← VOLVER
    </button>
  );
}

function Stat({ label, value, color = '#fff' }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.12em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

const PAGE = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg,#0a0d14 0%,#0d1520 55%,#0a160a 100%)',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '28px 16px 56px', color: '#fff',
};

const BTN_PRIMARY = {
  background: '#8dc63f', color: '#0a0d14',
  fontFamily: 'Oswald, sans-serif', fontWeight: 700,
  borderRadius: 8, border: 'none', cursor: 'pointer', letterSpacing: '0.06em',
};

const BTN_GHOST = {
  background: '#1e2535', color: '#c0cad8',
  fontFamily: 'Oswald, sans-serif', fontWeight: 700,
  borderRadius: 8, border: '1px solid #1e2a3a', cursor: 'pointer',
};
