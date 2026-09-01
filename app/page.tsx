const whatsappUrl =
  'https://wa.me/5511987312961?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o.';

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container heroGrid">
          <div>
            <span className="eyebrow">Odontologia estética em São Paulo</span>
            <h1>Naturalidade, saúde e confiança em cada sorriso.</h1>
            <p className="lead">
              A Dra. Heloisa Veiga é formada pela USP e atua com foco em odontologia estética,
              planejamento individualizado e resultados que respeitam as características de cada paciente.
            </p>
            <div className="actions">
              <a className="button primary" href={whatsappUrl} target="_blank" rel="noreferrer">
                Agendar avaliação
              </a>
              <a
                className="button secondary"
                href="https://www.instagram.com/dra.heloisaveiga"
                target="_blank"
                rel="noreferrer"
              >
                Ver Instagram
              </a>
            </div>
          </div>

          <aside className="heroPanel">
            <p className="panelLabel">Versão 2 em construção</p>
            <h2>Site preparado para conteúdo gerenciado via CMS.</h2>
            <p>
              Os próximos passos serão conectar o Sanity e transformar tratamentos, casos, imagens,
              textos, links e informações da clínica em conteúdo editável.
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Estrutura inicial</span>
          <h2>Conteúdo pensado para aquisição e conversão.</h2>
          <div className="cards">
            <article><strong>Tratamentos</strong><p>Facetas em resina, clareamento e demais procedimentos administráveis pelo CMS.</p></article>
            <article><strong>Casos clínicos</strong><p>Galeria de resultados com imagens e descrições controladas pelo painel.</p></article>
            <article><strong>Clínica e contato</strong><p>Localização, Instagram, WhatsApp e chamadas para agendamento centralizadas.</p></article>
          </div>
        </div>
      </section>
    </main>
  );
}
