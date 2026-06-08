export default function Sponsors() {
  return (
    <section className="sp-section" id="patrocinadores">
      <div className="sp-intro-wrap">
        <div className="sp-intro">
          <div>
            <div className="sp-intro-eyebrow">Patrocinadores oficiales</div>
            <h2 className="sp-intro-title">Marcas que <em>confían</em><br />en KICK LAST</h2>
          </div>
          <p className="sp-intro-right">Empresas líderes que eligen KICK LAST para conectar con millones de aficionados apasionados durante el evento deportivo más grande del planeta.</p>
        </div>
      </div>

      <div className="sp-featured">
        <div className="sp-featured-label">
          <span className="sp-featured-tag">Patrocinador principal</span>
          <div className="sp-featured-line" />
        </div>
        <div className="sp-featured-card">
          <div className="sp-feat-left">
            <div className="sp-feat-logo-stage">
              <img src="/img/logoims1.png" alt="Consorcio IMS" />
            </div>
            <div className="sp-feat-badge">
              <div className="sp-feat-badge-dot" />
              <span className="sp-feat-badge-txt">Verificado</span>
            </div>
            <div className="sp-feat-name">Consorcio IMS</div>
          </div>
          <div className="sp-feat-right">
            <div className="sp-feat-tagline">Líderes en <span>gestión deportiva</span><br />y desarrollo empresarial global</div>
            <p className="sp-feat-desc">Consorcio IMS conecta marcas globales con el evento deportivo más grande del planeta. Más de 30 países y dos décadas de experiencia construyendo puentes entre el deporte y el negocio de alto impacto.</p>
            <div className="sp-feat-metrics">
              {[['3.5B+', 'Espectadores'], ['104', 'Selecciones'], ['#1', 'Evento global'], ['30+', 'Países']].map(([v, l]) => (
                <div key={l} className="sp-feat-metric">
                  <div className="sp-feat-m-val">{v}</div>
                  <div className="sp-feat-m-lbl">{l}</div>
                </div>
              ))}
            </div>
            <div className="sp-feat-benefits">
              {[['👁️', 'Visibilidad masiva'], ['🎯', 'Audiencia segmentada'], ['📊', 'Métricas en tiempo real'], ['🤝', 'Asociación estratégica']].map(([ico, txt]) => (
                <div key={txt} className="sp-feat-benefit"><span className="sp-feat-benefit-ico">{ico}</span>{txt}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sp-secondary">
        <div className="sp-secondary-label">
          <span className="sp-featured-tag">También nos apoyan</span>
          <div className="sp-featured-line" />
        </div>
        <div className="sp-sec-scroll-wrap">
          <div className="sp-sec-grid">
            {[
              { img: '/img/surebets11.png', name: 'SureBets24/P', type: 'Patrocinador', desc: 'Plataforma líder en análisis de apuestas deportivas con presencia en más de 20 mercados internacionales.' },
              { img: '/img/gosports1.png', name: 'GO! Sports', type: 'Patrocinador', desc: 'Marketing deportivo de alto impacto conectando marcas con los eventos más importantes del mundo.' },
              { img: '/img/logodevx1.png', name: 'DeVx Studio', type: 'Desarrollador oficial', desc: 'Equipo técnico detrás de la arquitectura y desarrollo integral de la plataforma KICK LAST.' },
            ].map(s => (
              <div key={s.name} className="sp-sec-card">
                <div className="sp-sec-logo-zone"><img src={s.img} alt={s.name} /></div>
                <div className="sp-sec-info">
                  <div className="sp-sec-type">{s.type}</div>
                  <div className="sp-sec-name">{s.name}</div>
                  <p className="sp-sec-desc">{s.desc}</p>
                </div>
              </div>
            ))}
            <div className="sp-slot">
              <div className="sp-slot-icon">+</div>
              <div className="sp-slot-txt">Tu marca aquí</div>
              <div className="sp-slot-sub">Slot disponible · Mundial 2026</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sp-cta-wrap">
        <div className="sp-cta-inner">
          <div>
            <div className="sp-cta-title">¿Tu marca quiere estar en el <em>evento más visto</em> del mundo?</div>
            <p className="sp-cta-desc">Slots limitados para el Mundial 2026. Posiciona tu marca frente a millones de aficionados apasionados por el fútbol.</p>
          </div>
          <div className="sp-cta-btns">
            <a href="/patrocinador" className="sp-btn-p">Quiero ser patrocinador</a>
          </div>
        </div>
      </div>
    </section>
  );
}
