/**
 * GuruManualQuiz — flujo paso a paso con timer por dificultad
 *
 * Props:
 *   predicciones  — array de EventoPrediccion con opciones
 *   costoGuru     — número de créditos
 *   onFinish(sels) — callback con { [pred.id]: opcion.id }
 *   onCancel()    — volver al selector de modo
 */
import { useState, useEffect, useRef } from 'react';

// ── Configuración de dificultad ──────────────────────────────────────────────
const DIFICULTAD = {
  FACIL:  { label: 'FÁCIL',  color: '#8dc63f', bg: 'rgba(141,198,63,0.12)', tiempo: 45 },
  MEDIA:  { label: 'MEDIA',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', tiempo: 25 },
  DIFICIL:{ label: 'DIFÍCIL',color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  tiempo: 15 },
};
const DEFAULT_DIFF = { label: 'NORMAL', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', tiempo: 30 };

// ── Categorías de plantilla ───────────────────────────────────────────────────
const CATEGORIA_MAP = {
  RESULTADO_FINAL: { label: '⚽ Resultado Final',    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  EVENTOS_PARTIDO: { label: '🎯 Evento del Partido', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  PENALTIS:        { label: '🥅 Penaltis',           color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  FASE_TORNEO:     { label: '🏆 Fase de Torneo',     color: '#eab308', bg: 'rgba(234,179,8,0.1)'  },
};

function getDiff(pred, index, total) {
  const raw = pred.dificultad || pred.nivel || pred.plantilla?.dificultad || '';
  const key = String(raw).toUpperCase();
  if (DIFICULTAD[key]) return { key, ...DIFICULTAD[key] };
  // Inferir por posición si no hay campo
  if (total >= 6) {
    if (index < Math.floor(total * 0.4)) return { key: 'FACIL',   ...DIFICULTAD.FACIL };
    if (index < Math.floor(total * 0.7)) return { key: 'MEDIA',   ...DIFICULTAD.MEDIA };
    return                               { key: 'DIFICIL', ...DIFICULTAD.DIFICIL };
  }
  return { key: 'NORMAL', ...DEFAULT_DIFF };
}

export default function GuruManualQuiz({ predicciones, costoGuru, onFinish, onCancel }) {
  const total = Math.min(predicciones.length, 10);
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({});  // { [pred.id]: opcion.id }
  const [timeLeft, setTimeLeft] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [chosen, setChosen] = useState(null);  // opcion.id elegida en este paso
  const timerRef = useRef(null);

  const pred    = predicciones[step];
  const diff    = pred ? getDiff(pred, step, total) : DEFAULT_DIFF;
  const ops     = pred ? (pred.opciones || pred.evento_prediccion_opciones || []) : [];
  const titulo  = pred?.descripcion || pred?.titulo || pred?.pregunta || `Predicción ${step + 1}`;
  const catKey  = pred?.plantilla?.categoria || pred?.categoria || null;
  const catInfo = catKey ? (CATEGORIA_MAP[catKey] || null) : null;

  // ── Iniciar timer al cambiar de paso ──────────────────────────────────────
  useEffect(() => {
    if (!pred) return;
    setChosen(selections[pred.id] || null);
    setTimedOut(false);
    setTimeLeft(diff.tiempo);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [step]);

  // Auto-avanzar 1.5s después de timeout o selección confirmada
  useEffect(() => {
    if (!timedOut && !chosen) return;
    const t = setTimeout(() => advance(), 1500);
    return () => clearTimeout(t);
  }, [timedOut, chosen]);

  function selectOption(opId) {
    if (chosen || timedOut) return;
    clearInterval(timerRef.current);
    setChosen(opId);
    setSelections(s => ({ ...s, [pred.id]: opId }));
  }

  function advance() {
    if (step + 1 >= total) {
      // Terminar quiz
      onFinish(selections);
    } else {
      setStep(s => s + 1);
    }
  }

  function skip() {
    clearInterval(timerRef.current);
    setChosen(null);
    advance();
  }

  // ── Resumen final (onFinish se encarga de submitting en el padre) ─────────
  if (!pred) return null;

  const pct = timeLeft !== null ? (timeLeft / diff.tiempo) * 100 : 100;
  const timerColor = pct > 50 ? diff.color : pct > 20 ? '#f59e0b' : '#ef4444';
  const answered = Object.keys(selections).length;

  return (
    <div>
      {/* ── Cabecera progreso ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em' }}>
            PREGUNTA {step + 1} DE {total}
          </span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em' }}>
            {answered} respondidas
          </span>
        </div>
        <div style={{ background: '#1e2535', borderRadius: 4, height: 5, overflow: 'hidden' }}>
          <div style={{ background: '#8dc63f', height: '100%', width: `${(step / total) * 100}%`, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* ── Tarjeta pregunta ──────────────────────────────────────────── */}
      <div style={{ background: '#161e2e', border: `1px solid ${diff.color}30`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>

        {/* Barra de tiempo */}
        <div style={{ background: '#0a0e1a', height: 6, position: 'relative' }}>
          <div style={{ background: timerColor, height: '100%', width: `${pct}%`, transition: 'width 1s linear, background 0.3s', borderRadius: '0 3px 3px 0' }} />
        </div>

        {/* Banner de categoría — ancho completo, sin padding extra */}
        {catInfo && (
          <div style={{ background: catInfo.bg, borderBottom: `1px solid ${catInfo.color}30`, padding: '6px 20px' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: catInfo.color, fontWeight: 700, letterSpacing: '0.1em' }}>
              {catInfo.label}
            </span>
          </div>
        )}

        <div style={{ padding: '18px 20px' }}>
          {/* Badge dificultad + timer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ background: diff.bg, color: diff.color, fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 3, letterSpacing: '0.08em' }}>
              {diff.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>⏱</span>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: timerColor, minWidth: 28, textAlign: 'center', lineHeight: 1 }}>
                {timedOut ? '0' : timeLeft}
              </span>
            </div>
          </div>

          {/* Pregunta */}
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 18, lineHeight: 1.3 }}>
            {titulo}
          </div>

          {/* Opciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ops.map((op, i) => {
              const isChosen = chosen === op.id;
              const locked = !!(chosen || timedOut);
              const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
              return (
                <button
                  key={op.id}
                  onClick={() => selectOption(op.id)}
                  disabled={locked}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: isChosen ? diff.bg : locked ? 'rgba(255,255,255,0.02)' : '#0f1420',
                    border: `1px solid ${isChosen ? diff.color : '#1e2a3a'}`,
                    borderRadius: 8, padding: '12px 16px', cursor: locked ? 'default' : 'pointer',
                    textAlign: 'left', transition: 'all 0.15s', opacity: locked && !isChosen ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (!locked) e.currentTarget.style.borderColor = diff.color; }}
                  onMouseLeave={e => { if (!locked && !isChosen) e.currentTarget.style.borderColor = '#1e2a3a'; }}
                >
                  <span style={{ background: isChosen ? diff.color : '#1e2535', color: isChosen ? '#0a0d14' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, width: 24, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {letters[i] || i + 1}
                  </span>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: isChosen ? diff.color : '#c0cad8', fontWeight: isChosen ? 600 : 400 }}>
                    {op.texto || op.nombre || op.valor || '?'}
                  </span>
                  {isChosen && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* Mensajes de estado */}
          {timedOut && !chosen && (
            <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '10px 14px', fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#f87171', textAlign: 'center' }}>
              ⏰ ¡Tiempo agotado! Pasando a la siguiente...
            </div>
          )}
          {chosen && (
            <div style={{ marginTop: 12, background: 'rgba(141,198,63,0.06)', border: '1px solid #8dc63f20', borderRadius: 6, padding: '10px 14px', fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8dc63f', textAlign: 'center' }}>
              ✅ Respuesta guardada — continuando...
            </div>
          )}
        </div>
      </div>

      {/* ── Acciones ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel}
          style={{ flex: 0, background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '12px 18px', borderRadius: 8, border: '1px solid #2a3545', cursor: 'pointer' }}>
          ← ATRÁS
        </button>
        <button onClick={skip} disabled={!!(chosen || timedOut)}
          style={{ flex: 1, background: '#1e2535', color: chosen || timedOut ? '#4a5568' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '12px 18px', borderRadius: 8, border: '1px solid #2a3545', cursor: chosen || timedOut ? 'not-allowed' : 'pointer' }}>
          SALTAR →
        </button>
        {(chosen || timedOut) && step + 1 < total && (
          <button onClick={advance}
            style={{ flex: 2, background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 18px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            SIGUIENTE → ({step + 2}/{total})
          </button>
        )}
        {(chosen || timedOut) && step + 1 >= total && (
          <button onClick={() => onFinish(selections)}
            style={{ flex: 2, background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 18px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            CONFIRMAR GURÚ ({costoGuru} CR) →
          </button>
        )}
      </div>

      {/* Mini resumen respondidas */}
      <div style={{ marginTop: 12, display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: total }, (_, i) => {
          const p = predicciones[i];
          const done = p && selections[p.id];
          return (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i === step ? '#8dc63f' : done ? '#8dc63f30' : '#1e2535',
              border: `1px solid ${i === step ? '#8dc63f' : done ? '#8dc63f50' : '#2a3545'}`,
              fontFamily: 'Oswald, sans-serif', fontSize: 10, color: i === step ? '#0a0d14' : done ? '#8dc63f' : '#4a5568',
              fontWeight: 700,
            }}>
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
