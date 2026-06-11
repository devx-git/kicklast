import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PredictModal from '../components/PredictModal';

// ─── Constantes de estilo ─────────────────────────────────────────────────────

const BG       = '#0a0d14';
const CARD     = '#161e2e';
const BORDER   = '#1e2a3a';
const GREEN    = '#8dc63f';
const MUTED    = '#6b7a8d';
const TEXT     = '#c0cad8';
const ESTADOS_LIVE = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE']);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtFecha(iso) {
  if (!iso) return '';
  const d    = new Date(iso);
  const now  = new Date();
  const hoy  = now.toDateString() === d.toDateString();
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  if (hoy) return `HOY ${hora}`;
  const man  = new Date(now); man.setDate(man.getDate() + 1);
  if (man.toDateString() === d.toDateString()) return `MAN ${hora}`;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase() + ` ${hora}`;
}

function esHoy(iso) {
  if (!iso) return false;
  return new Date().toDateString() === new Date(iso).toDateString();
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function HubJugador() {
  const [dashData,  setDashData]  = useState(null);
  const [eventos,   setEventos]   = useState([]);
  const [scores,    setScores]    = useState([]);
  const [tab,       setTab]       = useState('todos');
  const [modal,     setModal]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const refreshTimer = useRef(null);

  // ── Auth + role-based redirect ─────────────────────────────────────────────
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    const p = authService.getPayload();
    if (p?.rol === 'ADMIN' || p?.rol === 'SUPER_ADMIN') { window.location.replace('/admin'); return; }
    if (p?.rol === 'PROMOTOR')    { window.location.replace('/promotor');     return; }
    if (p?.rol === 'DISTRIBUIDOR') { window.location.replace('/distribuidor'); return; }
  }, []);

  // ── Carga de datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function cargar() {
      setLoading(true);
      const [dash, evts, sc] = await Promise.allSettled([
        api.get('/usuario/dashboard'),
        api.get('/eventos?limit=60'),
        api.get('/sports/destacados?tipo=live'),
      ]);
      if (dash.status === 'fulfilled')  setDashData(dash.value.data);
      if (evts.status === 'fulfilled') {
        const all = Array.isArray(evts.value.data) ? evts.value.data : [];
        setEventos(all.filter(e => ['ACTIVO', 'EN_VIVO', 'PROXIMO'].includes(e.estado)));
      }
      if (sc.status === 'fulfilled') {
        const d = sc.value.data;
        setScores(Array.isArray(d) ? d : d?.partidos || []);
      }
      setLoading(false);
    }
    cargar();
    refreshTimer.current = setInterval(() => {
      api.get('/sports/destacados?tipo=live').then(r => {
        const d = r.data; setScores(Array.isArray(d) ? d : d?.partidos || []);
      }).catch(() => {});
    }, 60_000);
    return () => clearInterval(refreshTimer.current);
  }, []);

  // ── Datos calculados ───────────────────────────────────────────────────────
  const perfil      = dashData?.perfil;
  const saldo       = Number(perfil?.saldo ?? perfil?.creditos ?? 0);
  const nombre      = perfil?.nombre_completo || perfil?.nombre || perfil?.email?.split('@')[0] || 'Jugador';
  const predActivas = dashData?.gurus_activos?.length ?? 0;
  const apuestPend  = dashData?.apuestas_pendientes?.length ?? 0;

  const live    = eventos.filter(e => e.estado === 'EN_VIVO');
  const hoy     = eventos.filter(e => e.estado === 'ACTIVO' && esHoy(e.fecha_evento));
  const proximos = eventos.filter(e => e.estado === 'ACTIVO' && !esHoy(e.fecha_evento));

  const tabEventos = {
    todos:   eventos,
    vivo:    live,
    hoy:     [...live, ...hoy],
    proximos,
  }[tab] ?? eventos;

  const scoresVivos    = scores.filter(s => ESTADOS_LIVE.has(s.statusCorto || s.estado));
  const scoresRecientes = scores.filter(s => (s.statusCorto || s.estado) === 'FT').slice(0, 4);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Barra personal ─────────────────────────────────────────────── */}
        <StatsBar
          nombre={nombre}
          saldo={saldo}
          predActivas={predActivas}
          apuestPend={apuestPend}
          loading={loading}
        />

        {/* ── Layout principal ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Centro: eventos ─────────────────────────────────────────── */}
          <div style={{ flex: '1 1 560px', minWidth: 0 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {[
                { key: 'todos',   label: 'Todos',        badge: eventos.length },
                { key: 'vivo',    label: '● En vivo',    badge: live.length,  red: true },
                { key: 'hoy',     label: 'Hoy',          badge: hoy.length },
                { key: 'proximos',label: 'Próximos',     badge: proximos.length },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  background:   tab === t.key ? GREEN : 'transparent',
                  color:        tab === t.key ? '#0a0d14' : t.red ? '#ef4444' : MUTED,
                  fontFamily:   'Oswald, sans-serif', fontWeight: 700, fontSize: 11,
                  border:       `1px solid ${tab === t.key ? GREEN : BORDER}`,
                  borderRadius: 5, padding: '5px 14px', cursor: 'pointer',
                  letterSpacing: '0.06em', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {t.label}
                  {t.badge > 0 && (
                    <span style={{
                      background: tab === t.key ? 'rgba(0,0,0,0.2)' : '#8dc63f20',
                      color: tab === t.key ? '#0a0d14' : GREEN,
                      fontSize: 9, borderRadius: 10, padding: '1px 5px', fontWeight: 800,
                    }}>{t.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Lista de eventos */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background: CARD, borderRadius: 10, height: 110, opacity: 0.4 }} />
                ))}
              </div>
            ) : tabEventos.length === 0 ? (
              <SinEventos tab={tab} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tabEventos.map(ev => (
                  <EventoRow
                    key={ev.id}
                    ev={ev}
                    onApostar={(sel, cuotas) => setModal({ ev, seleccion: sel, cuotasIniciales: cuotas })}
                    onPredecir={() => setModal({ ev, seleccion: null })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Derecha: scores + links ─────────────────────────────────── */}
          <div style={{ width: 264, flexShrink: 0 }}>
            <ScoresPanel
              vivos={scoresVivos}
              recientes={scoresRecientes}
              loading={loading}
            />
            <AccesosRapidos
              predActivas={predActivas}
              apuestPend={apuestPend}
            />
          </div>

        </div>
      </div>

      {modal && (
        <PredictModal
          ev={modal.ev}
          seleccion={modal.seleccion}
          cuotasIniciales={modal.cuotasIniciales || null}
          onClose={() => setModal(null)}
        />
      )}

      <Footer />
    </div>
  );
}

// ─── Barra de stats personales ────────────────────────────────────────────────

function StatsBar({ nombre, saldo, predActivas, apuestPend, loading }) {
  const skl = { background: BORDER, borderRadius: 4, display: 'inline-block' };
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
      padding: '16px 20px', marginBottom: 18,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 14,
    }}>
      {/* Saludo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(141,198,63,0.15)', border: `1px solid ${GREEN}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: GREEN,
        }}>
          {nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>
            Bienvenido, {nombre.split(' ')[0]}
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: MUTED }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Stat label="Saldo"                valor={loading ? null : `${saldo.toLocaleString('es-CO')} CR`} color={GREEN} />
        <Stat label="Pred. activas"        valor={loading ? null : predActivas} />
        <Stat label="Apuestas pendientes"  valor={loading ? null : apuestPend} />
      </div>

      {/* Acción */}
      <div style={{ display: 'flex', gap: 8 }}>
        <a href="/recargar" style={{
          background: GREEN, color: '#0a0d14',
          fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
          padding: '9px 18px', borderRadius: 6, textDecoration: 'none',
          letterSpacing: '0.05em',
        }}>+ RECARGAR</a>
        <a href="/dashboard" style={{
          background: 'transparent', color: MUTED,
          fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
          padding: '9px 14px', borderRadius: 6, textDecoration: 'none',
          border: `1px solid ${BORDER}`, letterSpacing: '0.05em',
        }}>MI PERFIL</a>
      </div>
    </div>
  );
}

function Stat({ label, valor, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700,
        color: color || '#fff', minWidth: 30,
      }}>
        {valor === null
          ? <span style={{ background: BORDER, borderRadius: 4, display: 'inline-block', width: 48, height: 20 }} />
          : valor}
      </div>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: MUTED, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Fila de evento ───────────────────────────────────────────────────────────

function EventoRow({ ev, onApostar, onPredecir }) {
  const isLive = ev.estado === 'EN_VIVO';
  const local     = ev.equipo_local     || ev.nombre?.split(' vs ')?.[0] || ev.nombre;
  const visitante = ev.equipo_visitante || ev.nombre?.split(' vs ')?.[1] || 'Visitante';
  const liga      = ev.campeonato?.nombre || '';
  const fecha     = fmtFecha(ev.fecha_evento);
  const pozo      = Number(ev.acumulado_actual ?? 0);
  const costo     = Number(ev.costo_creditos ?? 2);

  const odds = [
    ev.cuota_local     && { l: '1', v: Number(ev.cuota_local).toFixed(2),     sel: 'local' },
    ev.cuota_empate    && { l: 'X', v: Number(ev.cuota_empate).toFixed(2),    sel: 'empate' },
    ev.cuota_visitante && { l: '2', v: Number(ev.cuota_visitante).toFixed(2), sel: 'visitante' },
  ].filter(Boolean);

  const hasOdds = odds.length > 0;

  // Partido individual con tipo APUESTA/AMBOS y cuotas configuradas
  const apuestaPartido = !hasOdds
    ? (ev.partidos || []).find(p =>
        (p.tipo === 'APUESTA' || p.tipo === 'AMBOS') &&
        (p.cuota_local || p.cuota_visitante)
      )
    : null;
  const oddsPartido = apuestaPartido ? [
    apuestaPartido.cuota_local     && { l: '1', v: Number(apuestaPartido.cuota_local).toFixed(2),     sel: 'local' },
    apuestaPartido.cuota_empate    && { l: 'X', v: Number(apuestaPartido.cuota_empate).toFixed(2),    sel: 'empate' },
    apuestaPartido.cuota_visitante && { l: '2', v: Number(apuestaPartido.cuota_visitante).toFixed(2), sel: 'visitante' },
  ].filter(Boolean) : [];
  const apuestaCuotas = apuestaPartido
    ? { local: apuestaPartido.cuota_local, empate: apuestaPartido.cuota_empate, visitante: apuestaPartido.cuota_visitante }
    : null;

  // Botón genérico cuando hay partidos APUESTA pero sin cuotas definidas aún
  const hasApuestaPartidos = !hasOdds && !apuestaPartido && (ev.partidos || []).some(
    p => p.tipo === 'APUESTA' || p.tipo === 'AMBOS'
  );

  return (
    <div style={{
      background: CARD,
      border: `1px solid ${isLive ? '#ef444430' : BORDER}`,
      borderRadius: 10, padding: '12px 16px',
      display: 'flex', alignItems: 'center',
      gap: 14, flexWrap: 'wrap',
    }}>
      {/* Info partido */}
      <div style={{ flex: '1 1 180px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          {isLive
            ? <span style={{ background: '#ef4444', color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 3 }}>● LIVE</span>
            : fecha && <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: MUTED }}>{fecha}</span>
          }
          {liga && <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: MUTED }}>· {liga}</span>}
          {pozo > 0 && <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: GREEN, marginLeft: 'auto' }}>🏆 ${(pozo/1000000).toFixed(0)}M</span>}
        </div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>
          {local}
        </div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: MUTED, margin: '2px 0' }}>vs</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>
          {visitante}
        </div>
      </div>

      {/* Cuotas nivel evento */}
      {hasOdds && (
        <div style={{ display: 'flex', gap: 5 }}>
          {odds.map(o => (
            <button key={o.l} onClick={() => onApostar(o.sel)} style={{
              background: '#0f1420', border: `1px solid ${BORDER}`,
              borderRadius: 6, padding: '7px 12px', cursor: 'pointer',
              textAlign: 'center', minWidth: 44,
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${GREEN}60`}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
            >
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: MUTED, marginBottom: 1 }}>{o.l}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: GREEN }}>{o.v}</div>
            </button>
          ))}
        </div>
      )}

      {/* Cuotas desde el partido (no el evento) */}
      {oddsPartido.length > 0 && (
        <div style={{ display: 'flex', gap: 5 }}>
          {oddsPartido.map(o => (
            <button key={o.l} onClick={() => onApostar(o.sel, apuestaCuotas)} style={{
              background: '#0f1420', border: `1px solid ${BORDER}`,
              borderRadius: 6, padding: '7px 12px', cursor: 'pointer',
              textAlign: 'center', minWidth: 44, transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b60'}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
            >
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: MUTED, marginBottom: 1 }}>{o.l}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>{o.v}</div>
            </button>
          ))}
        </div>
      )}

      {/* Botón genérico cuando hay partidos APUESTA pero sin cuotas definidas aún */}
      {hasApuestaPartidos && (
        <button onClick={() => onApostar('cuota', null)} style={{
          background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
          fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700,
          padding: '9px 14px', borderRadius: 6,
          border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer',
          letterSpacing: '0.05em', whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
        >
          🎲 APOSTAR
        </button>
      )}

      {/* Botón predecir */}
      <button onClick={onPredecir} style={{
        background: 'rgba(141,198,63,0.1)', color: GREEN,
        fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700,
        padding: '9px 14px', borderRadius: 6,
        border: `1px solid ${GREEN}40`, cursor: 'pointer',
        letterSpacing: '0.05em', whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(141,198,63,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(141,198,63,0.1)'}
      >
        🧠 PREDECIR ({costo} CR)
      </button>
    </div>
  );
}

// ─── Panel de scores ──────────────────────────────────────────────────────────

function ScoresPanel({ vivos, recientes, loading }) {
  const todos = [...vivos, ...recientes].slice(0, 7);

  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 10, padding: '12px 14px', marginBottom: 12,
    }}>
      <div style={{
        fontFamily: 'Oswald, sans-serif', fontSize: 11, color: GREEN,
        letterSpacing: '0.12em', marginBottom: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>PARTIDOS EN VIVO</span>
        {vivos.length > 0 && (
          <span style={{ background: '#ef444420', color: '#ef4444', fontSize: 9, padding: '2px 7px', borderRadius: 3, fontWeight: 800 }}>
            ● {vivos.length} LIVE
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: BORDER, borderRadius: 4, height: 28, opacity: 0.4 }} />
          ))}
        </div>
      ) : todos.length === 0 ? (
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: MUTED, textAlign: 'center', padding: '12px 0' }}>
          Sin partidos en vivo ahora
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {todos.map((p, i) => <ScoreRow key={p.fixture_id || p.id || i} p={p} />)}
        </div>
      )}
    </div>
  );
}

function ScoreRow({ p }) {
  const status = p.statusCorto || p.estado || '';
  const isLive = ESTADOS_LIVE.has(status);
  const isFT   = status === 'FT' || status === 'AET';
  const minuto = p.minuto || p.elapsed;

  const label = isLive
    ? (status === 'HT' ? 'HT' : minuto ? `${minuto}'` : 'LIVE')
    : isFT ? 'FT'
    : status;

  const local     = p.equipoLocal     || p.local     || '';
  const visitante = p.equipoVisitante || p.visitante || '';
  const gL = p.golesLocal     ?? p.goles_local     ?? '-';
  const gV = p.golesVisitante ?? p.goles_visitante ?? '-';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 0', borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {local}
        </div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {visitante}
        </div>
      </div>
      <div style={{ textAlign: 'right', marginLeft: 8 }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff' }}>
          {gL} - {gV}
        </div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: isLive ? '#ef4444' : MUTED }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

function AccesosRapidos({ predActivas, apuestPend }) {
  const links = [
    { href: '/mis-predicciones', icon: '📋', label: 'Mis predicciones', badge: predActivas },
    { href: '/mis-apuestas',     icon: '🎲', label: 'Mis apuestas',      badge: apuestPend },
    { href: '/movimientos',      icon: '💳', label: 'Movimientos' },
    { href: '/leaderboard',      icon: '🏆', label: 'Leaderboard' },
    { href: '/retiros',          icon: '💸', label: 'Retirar' },
    { href: '/dashboard',        icon: '👤', label: 'Mi perfil' },
  ];

  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 10, padding: '12px 14px',
    }}>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: GREEN, letterSpacing: '0.12em', marginBottom: 10 }}>
        MI CUENTA
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(l => (
          <a key={l.href} href={l.href} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 8px', borderRadius: 6, textDecoration: 'none',
            color: TEXT, fontFamily: 'Roboto, sans-serif', fontSize: 13,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(141,198,63,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span>{l.icon} {l.label}</span>
            {l.badge > 0 && (
              <span style={{
                background: '#ef444420', color: '#ef4444',
                fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700,
                padding: '2px 7px', borderRadius: 10,
              }}>{l.badge}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────

function SinEventos({ tab }) {
  const msgs = {
    vivo:    { icon: '📺', text: 'No hay partidos en vivo ahora mismo.' },
    hoy:     { icon: '📅', text: 'No hay eventos programados para hoy.' },
    proximos:{ icon: '🔜', text: 'No hay próximos eventos cargados aún.' },
    todos:   { icon: '🏟️', text: 'No hay eventos disponibles en este momento.' },
  };
  const { icon, text } = msgs[tab] || msgs.todos;
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: MUTED }}>{text}</div>
    </div>
  );
}
