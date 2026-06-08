import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, Lock } from 'lucide-react';
import { dataService } from '../services/dataService';

function TipoBadge({ tipo }) {
  if (tipo === 'VIP') return (
    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
      <Sparkles className="w-3 h-3" />VIP
    </span>
  );
  if (tipo === 'PRIVADO') return (
    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
      <Lock className="w-3 h-3" />Privado
    </span>
  );
  return <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full">Público</span>;
}

function formatCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(valor);
}

export default function Cards() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getEventosActivos()
      .then(setEventos)
      .catch(() => setEventos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="eventos" className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Eventos disponibles 🔥</h2>
        <p className="text-gray-400 text-center mb-12">Compra Gurús y comienza a ganar</p>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando...</div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No hay eventos disponibles</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="bg-black/60 border border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-all rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-bold text-lg">{evento.nombre}</h3>
                  <TipoBadge tipo={evento.tipo_evento || 'PUBLICO'} />
                </div>
                <p className="text-gray-400 text-sm">
                  {new Date(evento.fecha_inicio).toLocaleDateString('es-CO')}
                </p>
                <div className="flex justify-between items-center p-3 bg-blue-950/30 rounded-lg">
                  <span className="text-gray-300">Acumulado:</span>
                  <span className="text-xl font-bold text-green-400">
                    {formatCOP(evento.acumulado_actual || 0)}
                  </span>
                </div>
                <a
                  href={`/eventos/${evento.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 font-semibold transition"
                >
                  Ver detalles <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
