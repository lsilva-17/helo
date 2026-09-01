import { stegaClean } from 'next-sanity';
import { sanityFetch } from '@/sanity/lib/live';

export const revalidate = 60;

type Settings = {
  professionalName?: string;
  brandSubtitle?: string;
  cro?: string;
  whatsapp?: string;
  instagram?: string;
  clinicAddress?: string;
  mapsUrl?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImageUrl?: string;
  aboutEyebrow?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  treatmentsTitle?: string;
  treatmentsDescription?: string;
  casesTitle?: string;
  casesDescription?: string;
  contactTitle?: string;
  contactDescription?: string;
};

type Treatment = { _id: string; title: string; summary?: string; imageUrl?: string };
type CaseStudy = { _id: string; title: string; description?: string; beforeUrl?: string; afterUrl?: string; treatmentTitle?: string };
type Content = { settings: Settings | null; treatments: Treatment[]; cases: CaseStudy[] };

const contentQuery = `{
  "settings": *[_type == "siteSettings"][0]{..., "heroImageUrl": heroImage.asset->url},
  "treatments": *[_type == "treatment" && featured == true] | order(order asc){_id,title,summary,"imageUrl":image.asset->url},
  "cases": *[_type == "caseStudy" && featured == true] | order(order asc){_id,title,description,"beforeUrl":beforeImage.asset->url,"afterUrl":afterImage.asset->url,"treatmentTitle":treatment->title}
}`;

const fallbackSettings: Settings = {
  professionalName: 'Dra. Heloisa Veiga',
  brandSubtitle: 'Odontologia estética · São Paulo',
  whatsapp: '5511987312961',
  instagram: 'https://www.instagram.com/dra.heloisaveiga',
  heroEyebrow: 'Odontologia estética em São Paulo',
  heroTitle: 'Saúde, beleza e confiança em cada sorriso.',
  heroDescription: 'Formada pela USP, a Dra. Heloisa Veiga atua com foco em odontologia estética e planejamento individualizado, respeitando as características de cada paciente.',
  heroImageUrl: 'https://raw.githubusercontent.com/lsilva-17/helo/legacy-main/helo.png',
  aboutEyebrow: 'Sobre',
  aboutTitle: 'Estética com naturalidade e cuidado individualizado.',
  aboutDescription: 'Cada tratamento parte de uma avaliação cuidadosa para combinar saúde, função e estética. O objetivo é construir resultados harmônicos, sem perder a identidade do sorriso de cada paciente.',
  treatmentsTitle: 'Tratamentos pensados para cada sorriso.',
  treatmentsDescription: 'Conheça algumas das possibilidades de tratamento e converse com a Dra. Heloisa para entender qual abordagem faz sentido para o seu caso.',
  casesTitle: 'Resultados e casos clínicos.',
  casesDescription: 'Casos publicados no CMS aparecem aqui automaticamente. As imagens devem ser usadas sempre com a autorização adequada do paciente.',
  contactTitle: 'Vamos conversar sobre o seu sorriso?',
  contactDescription: 'Entre em contato pelo WhatsApp para tirar dúvidas e agendar uma avaliação.',
};

async function getContent() {
  try {
    const response = await sanityFetch({ query: contentQuery });
    const data = response.data as Content;
    return {
      settings: { ...fallbackSettings, ...(data.settings || {}) },
      treatments: data.treatments || [],
      cases: data.cases || [],
    };
  } catch {
    return { settings: fallbackSettings, treatments: [], cases: [] };
  }
}

function whatsappLink(number?: string) {
  const cleanNumber = stegaClean(number || fallbackSettings.whatsapp || '');
  const clean = cleanNumber.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent('Olá, vim pelo site e gostaria de agendar uma avaliação.')}`;
}

function cleanUrl(value?: string) {
  return value ? stegaClean(value) : undefined;
}

export default async function HomePage() {
  const { settings, treatments, cases } = await getContent();
  const wa = whatsappLink(settings.whatsapp);
  const instagram = cleanUrl(settings.instagram);
  const mapsUrl = cleanUrl(settings.mapsUrl);
  const heroImageUrl = cleanUrl(settings.heroImageUrl || fallbackSettings.heroImageUrl);

  const fallbackTreatments: Treatment[] = [
    { _id: 'facetas', title: 'Facetas em resina', summary: 'Planejamento estético para transformar forma, proporção e harmonia do sorriso.' },
    { _id: 'clareamento', title: 'Clareamento dental', summary: 'Estratégias de clareamento indicadas de acordo com a avaliação clínica.' },
    { _id: 'avaliacao', title: 'Avaliação estética', summary: 'Consulta para entender objetivos, possibilidades e construir um plano individualizado.' },
  ];

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#inicio">
            <span className="brand-mark">HV</span>
            <span className="brand-text"><strong>{settings.professionalName}</strong><small>{settings.brandSubtitle}</small></span>
          </a>
          <nav className="nav" aria-label="Menu principal">
            <a href="#sobre">Sobre</a>
            <a href="#tratamentos">Tratamentos</a>
            <a href="#casos">Casos</a>
            <a href="#contato">Contato</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="container hero-visual">
            <div className="hero-inner">
              <div className="hero-card">
                <span className="eyebrow">{settings.heroEyebrow}</span>
                <h1>{settings.heroTitle}</h1>
                <p>{settings.heroDescription}</p>
                <div className="hero-actions">
                  <a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer">Agendar avaliação</a>
                  {instagram && <a className="btn btn-secondary" href={instagram} target="_blank" rel="noreferrer">Ver Instagram</a>}
                </div>
              </div>
              <div className="hero-photo">
                {heroImageUrl && <img src={heroImageUrl} alt={`Foto de ${stegaClean(settings.professionalName || '')}`} />}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="sobre">
          <div className="container highlight-box">
            <span className="eyebrow">{settings.aboutEyebrow}</span>
            <h2 className="section-title">{settings.aboutTitle}</h2>
            <p className="section-copy">{settings.aboutDescription}</p>
            <div className="trust-grid">
              <div><strong>USP</strong><span>Formação acadêmica</span></div>
              <div><strong>Estética</strong><span>Planejamento individualizado</span></div>
              <div><strong>Naturalidade</strong><span>Respeito às características do paciente</span></div>
            </div>
          </div>
        </section>

        <section className="section" id="tratamentos">
          <div className="container">
            <span className="eyebrow">Tratamentos</span>
            <h2 className="section-title">{settings.treatmentsTitle}</h2>
            <p className="section-copy">{settings.treatmentsDescription}</p>
            <div className="gallery-grid">
              {(treatments.length ? treatments : fallbackTreatments).map((item) => {
                const imageUrl = cleanUrl(item.imageUrl);
                return (
                  <article className="gallery-card" key={item._id}>
                    {imageUrl ? <img className="gallery-media" src={imageUrl} alt={stegaClean(item.title)} /> : <div className="gallery-placeholder">{item.title}</div>}
                    <div className="gallery-body"><h3>{item.title}</h3><p>{item.summary}</p></div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section cases-section" id="casos">
          <div className="container">
            <span className="eyebrow">Casos clínicos</span>
            <h2 className="section-title">{settings.casesTitle}</h2>
            <p className="section-copy">{settings.casesDescription}</p>
            {cases.length ? <div className="cases-grid">{cases.map((item) => {
              const beforeUrl = cleanUrl(item.beforeUrl);
              const afterUrl = cleanUrl(item.afterUrl);
              return (
                <article className="case-card" key={item._id}>
                  <div className="before-after">
                    {beforeUrl && <figure><img src={beforeUrl} alt={`Antes - ${stegaClean(item.title)}`} /><figcaption>Antes</figcaption></figure>}
                    {afterUrl && <figure><img src={afterUrl} alt={`Depois - ${stegaClean(item.title)}`} /><figcaption>Depois</figcaption></figure>}
                  </div>
                  <div className="case-body">{item.treatmentTitle && <span className="case-label">{item.treatmentTitle}</span>}<h3>{item.title}</h3><p>{item.description}</p></div>
                </article>
              );
            })}</div> : <div className="empty-state">Publique casos em <strong>Conteúdo → Casos clínicos</strong> e eles aparecerão aqui automaticamente.</div>}
          </div>
        </section>

        <section className="section" id="contato">
          <div className="container contact-card">
            <div><span className="eyebrow">Contato</span><h2 className="section-title">{settings.contactTitle}</h2><p className="section-copy">{settings.contactDescription}</p></div>
            <div className="contact-actions">
              <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
              {mapsUrl && <a className="btn btn-secondary" href={mapsUrl} target="_blank" rel="noreferrer">Como chegar</a>}
            </div>
            {settings.clinicAddress && <p className="address">{settings.clinicAddress}</p>}
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><p>{settings.professionalName}{settings.cro ? ` · ${settings.cro}` : ''}</p><p>São Paulo, SP</p></div></footer>
    </>
  );
}
