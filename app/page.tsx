import {stegaClean} from 'next-sanity';
import {sanityFetch} from '@/sanity/lib/live';

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
  sectionOrder?: string[];
  heroTitleFont?: string;
  heroTitleSize?: number;
  heroDescriptionFont?: string;
  heroDescriptionSize?: number;
  aboutTitleFont?: string;
  aboutTitleSize?: number;
  aboutDescriptionFont?: string;
  aboutDescriptionSize?: number;
  treatmentsTitleFont?: string;
  treatmentsTitleSize?: number;
  treatmentsDescriptionFont?: string;
  treatmentsDescriptionSize?: number;
  casesTitleFont?: string;
  casesTitleSize?: number;
  casesDescriptionFont?: string;
  casesDescriptionSize?: number;
  contactTitleFont?: string;
  contactTitleSize?: number;
  contactDescriptionFont?: string;
  contactDescriptionSize?: number;
};

type Treatment = {_id: string; title: string; summary?: string; imageUrl?: string};
type CaseStudy = {_id: string; title: string; description?: string; beforeUrl?: string; afterUrl?: string; treatmentTitle?: string};
type Content = {settings: Settings | null; treatments: Treatment[]; cases: CaseStudy[]};

const contentQuery = `{
  "settings": *[_type == "siteSettings"][0]{..., "heroImageUrl": heroImage.asset->url},
  "treatments": *[_type == "treatment" && featured == true] | order(order asc){_id,title,summary,"imageUrl":image.asset->url},
  "cases": *[_type == "caseStudy" && featured == true] | order(order asc){_id,title,description,"beforeUrl":beforeImage.asset->url,"afterUrl":afterImage.asset->url,"treatmentTitle":treatment->title}
}`;

const defaultSectionOrder = ['hero', 'about', 'treatments', 'cases', 'contact'];
const fallbackTreatmentIds = new Set(['facetas', 'clareamento', 'avaliacao']);
const fontStacks: Record<string, string> = {
  editorial: "'Cormorant Garamond', Georgia, serif",
  sans: "'Manrope', Arial, sans-serif",
  classic: "Georgia, 'Times New Roman', serif",
};

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
  sectionOrder: defaultSectionOrder,
};

async function getContent() {
  try {
    const response = await sanityFetch({query: contentQuery});
    const data = response.data as Content;
    return {
      settings: {...fallbackSettings, ...(data.settings || {})},
      treatments: data.treatments || [],
      cases: data.cases || [],
    };
  } catch {
    return {settings: fallbackSettings, treatments: [], cases: []};
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

function cleanConfig(value: string | undefined, fallback: string) {
  return value ? stegaClean(value) : fallback;
}

function typographyStyle(font: string | undefined, size: number | undefined, fallbackFont: string, fallbackSize: number) {
  const cleanFont = cleanConfig(font, fallbackFont);
  return {
    fontFamily: fontStacks[cleanFont] || fontStacks[fallbackFont],
    fontSize: `${size || fallbackSize}px`,
  };
}

function sectionPosition(order: string[] | undefined, section: string) {
  const list = (order?.length === 5 ? order : defaultSectionOrder).map((item) => stegaClean(item));
  const index = list.indexOf(section);
  return index === -1 ? 99 : index;
}

function siteText(field: string, label: string, fontField?: string, sizeField?: string, fontValue?: string, sizeValue?: number) {
  return {
    'data-vb-doc-id': 'siteSettings',
    'data-vb-doc-type': 'siteSettings',
    'data-vb-field': field,
    'data-vb-label': label,
    'data-vb-font-field': fontField,
    'data-vb-size-field': sizeField,
    'data-vb-font-value': fontValue ? stegaClean(fontValue) : undefined,
    'data-vb-size-value': sizeValue,
  };
}

function documentText(documentId: string, documentType: string, field: string, label: string) {
  return {
    'data-vb-doc-id': documentId,
    'data-vb-doc-type': documentType,
    'data-vb-field': field,
    'data-vb-label': label,
  };
}

export default async function HomePage() {
  const {settings, treatments, cases} = await getContent();
  const wa = whatsappLink(settings.whatsapp);
  const instagram = cleanUrl(settings.instagram);
  const mapsUrl = cleanUrl(settings.mapsUrl);
  const heroImageUrl = cleanUrl(settings.heroImageUrl || fallbackSettings.heroImageUrl);

  const fallbackTreatments: Treatment[] = [
    {_id: 'facetas', title: 'Facetas em resina', summary: 'Planejamento estético para transformar forma, proporção e harmonia do sorriso.'},
    {_id: 'clareamento', title: 'Clareamento dental', summary: 'Estratégias de clareamento indicadas de acordo com a avaliação clínica.'},
    {_id: 'avaliacao', title: 'Avaliação estética', summary: 'Consulta para entender objetivos, possibilidades e construir um plano individualizado.'},
  ];

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#inicio">
            <span className="brand-mark">HV</span>
            <span className="brand-text">
              <strong {...siteText('professionalName', 'Nome profissional')}>{settings.professionalName}</strong>
              <small {...siteText('brandSubtitle', 'Subtítulo da marca')}>{settings.brandSubtitle}</small>
            </span>
          </a>
          <nav className="nav" aria-label="Menu principal">
            <a href="#sobre">Sobre</a>
            <a href="#tratamentos">Tratamentos</a>
            <a href="#casos">Casos</a>
            <a href="#contato">Contato</a>
          </nav>
        </div>
      </header>

      <main className="page-sections">
        <section className="hero" id="inicio" data-vb-section="hero" style={{order: sectionPosition(settings.sectionOrder, 'hero')}}>
          <div className="container hero-visual">
            <div className="hero-inner">
              <div className="hero-card">
                <span className="eyebrow" {...siteText('heroEyebrow', 'Hero · chamada curta')}>{settings.heroEyebrow}</span>
                <h1
                  {...siteText('heroTitle', 'Hero · título', 'heroTitleFont', 'heroTitleSize', settings.heroTitleFont || 'editorial', settings.heroTitleSize || 67)}
                  style={typographyStyle(settings.heroTitleFont, settings.heroTitleSize, 'editorial', 67)}
                >{settings.heroTitle}</h1>
                <p
                  {...siteText('heroDescription', 'Hero · descrição', 'heroDescriptionFont', 'heroDescriptionSize', settings.heroDescriptionFont || 'sans', settings.heroDescriptionSize || 16)}
                  style={typographyStyle(settings.heroDescriptionFont, settings.heroDescriptionSize, 'sans', 16)}
                >{settings.heroDescription}</p>
                <div className="hero-actions">
                  <a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer">Agendar avaliação</a>
                  {instagram && <a className="btn btn-secondary" href={instagram} target="_blank" rel="noreferrer">Ver Instagram</a>}
                </div>
              </div>
              <div className="hero-photo">
                {heroImageUrl && (
                  <img
                    src={heroImageUrl}
                    alt={`Foto de ${stegaClean(settings.professionalName || '')}`}
                    data-vb-doc-id="siteSettings"
                    data-vb-doc-type="siteSettings"
                    data-vb-image-field="heroImage"
                    data-vb-label="Foto principal"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="sobre" data-vb-section="about" style={{order: sectionPosition(settings.sectionOrder, 'about')}}>
          <div className="container highlight-box">
            <span className="eyebrow" {...siteText('aboutEyebrow', 'Sobre · chamada curta')}>{settings.aboutEyebrow}</span>
            <h2
              className="section-title"
              {...siteText('aboutTitle', 'Sobre · título', 'aboutTitleFont', 'aboutTitleSize', settings.aboutTitleFont || 'editorial', settings.aboutTitleSize || 56)}
              style={typographyStyle(settings.aboutTitleFont, settings.aboutTitleSize, 'editorial', 56)}
            >{settings.aboutTitle}</h2>
            <p
              className="section-copy"
              {...siteText('aboutDescription', 'Sobre · descrição', 'aboutDescriptionFont', 'aboutDescriptionSize', settings.aboutDescriptionFont || 'sans', settings.aboutDescriptionSize || 16)}
              style={typographyStyle(settings.aboutDescriptionFont, settings.aboutDescriptionSize, 'sans', 16)}
            >{settings.aboutDescription}</p>
            <div className="trust-grid">
              <div><strong>USP</strong><span>Formação acadêmica</span></div>
              <div><strong>Estética</strong><span>Planejamento individualizado</span></div>
              <div><strong>Naturalidade</strong><span>Respeito às características do paciente</span></div>
            </div>
          </div>
        </section>

        <section className="section" id="tratamentos" data-vb-section="treatments" style={{order: sectionPosition(settings.sectionOrder, 'treatments')}}>
          <div className="container">
            <span className="eyebrow">Tratamentos</span>
            <h2
              className="section-title"
              {...siteText('treatmentsTitle', 'Tratamentos · título', 'treatmentsTitleFont', 'treatmentsTitleSize', settings.treatmentsTitleFont || 'editorial', settings.treatmentsTitleSize || 56)}
              style={typographyStyle(settings.treatmentsTitleFont, settings.treatmentsTitleSize, 'editorial', 56)}
            >{settings.treatmentsTitle}</h2>
            <p
              className="section-copy"
              {...siteText('treatmentsDescription', 'Tratamentos · descrição', 'treatmentsDescriptionFont', 'treatmentsDescriptionSize', settings.treatmentsDescriptionFont || 'sans', settings.treatmentsDescriptionSize || 16)}
              style={typographyStyle(settings.treatmentsDescriptionFont, settings.treatmentsDescriptionSize, 'sans', 16)}
            >{settings.treatmentsDescription}</p>
            <div className="gallery-grid">
              {(treatments.length ? treatments : fallbackTreatments).map((item) => {
                const imageUrl = cleanUrl(item.imageUrl);
                const editable = !fallbackTreatmentIds.has(stegaClean(item._id));
                return (
                  <article className="gallery-card" key={item._id}>
                    {imageUrl ? (
                      <img
                        className="gallery-media"
                        src={imageUrl}
                        alt={stegaClean(item.title)}
                        {...(editable ? {
                          'data-vb-doc-id': item._id,
                          'data-vb-doc-type': 'treatment',
                          'data-vb-image-field': 'image',
                          'data-vb-label': `Imagem · ${stegaClean(item.title)}`,
                        } : {})}
                      />
                    ) : <div className="gallery-placeholder">{item.title}</div>}
                    <div className="gallery-body">
                      <h3 {...(editable ? documentText(item._id, 'treatment', 'title', 'Tratamento · título') : {})}>{item.title}</h3>
                      <p {...(editable ? documentText(item._id, 'treatment', 'summary', 'Tratamento · descrição') : {})}>{item.summary}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section cases-section" id="casos" data-vb-section="cases" style={{order: sectionPosition(settings.sectionOrder, 'cases')}}>
          <div className="container">
            <span className="eyebrow">Casos clínicos</span>
            <h2
              className="section-title"
              {...siteText('casesTitle', 'Casos · título', 'casesTitleFont', 'casesTitleSize', settings.casesTitleFont || 'editorial', settings.casesTitleSize || 56)}
              style={typographyStyle(settings.casesTitleFont, settings.casesTitleSize, 'editorial', 56)}
            >{settings.casesTitle}</h2>
            <p
              className="section-copy"
              {...siteText('casesDescription', 'Casos · descrição', 'casesDescriptionFont', 'casesDescriptionSize', settings.casesDescriptionFont || 'sans', settings.casesDescriptionSize || 16)}
              style={typographyStyle(settings.casesDescriptionFont, settings.casesDescriptionSize, 'sans', 16)}
            >{settings.casesDescription}</p>
            {cases.length ? <div className="cases-grid">{cases.map((item) => {
              const beforeUrl = cleanUrl(item.beforeUrl);
              const afterUrl = cleanUrl(item.afterUrl);
              return (
                <article className="case-card" key={item._id}>
                  <div className="before-after">
                    {beforeUrl && <figure><img src={beforeUrl} alt={`Antes - ${stegaClean(item.title)}`} data-vb-doc-id={item._id} data-vb-doc-type="caseStudy" data-vb-image-field="beforeImage" data-vb-label="Foto antes" /><figcaption>Antes</figcaption></figure>}
                    {afterUrl && <figure><img src={afterUrl} alt={`Depois - ${stegaClean(item.title)}`} data-vb-doc-id={item._id} data-vb-doc-type="caseStudy" data-vb-image-field="afterImage" data-vb-label="Foto depois" /><figcaption>Depois</figcaption></figure>}
                  </div>
                  <div className="case-body">
                    {item.treatmentTitle && <span className="case-label">{item.treatmentTitle}</span>}
                    <h3 {...documentText(item._id, 'caseStudy', 'title', 'Caso clínico · título')}>{item.title}</h3>
                    <p {...documentText(item._id, 'caseStudy', 'description', 'Caso clínico · descrição')}>{item.description}</p>
                  </div>
                </article>
              );
            })}</div> : <div className="empty-state">Publique casos em <strong>Conteúdo → Casos clínicos</strong> e eles aparecerão aqui automaticamente.</div>}
          </div>
        </section>

        <section className="section" id="contato" data-vb-section="contact" style={{order: sectionPosition(settings.sectionOrder, 'contact')}}>
          <div className="container contact-card">
            <div>
              <span className="eyebrow">Contato</span>
              <h2
                className="section-title"
                {...siteText('contactTitle', 'Contato · título', 'contactTitleFont', 'contactTitleSize', settings.contactTitleFont || 'editorial', settings.contactTitleSize || 56)}
                style={typographyStyle(settings.contactTitleFont, settings.contactTitleSize, 'editorial', 56)}
              >{settings.contactTitle}</h2>
              <p
                className="section-copy"
                {...siteText('contactDescription', 'Contato · descrição', 'contactDescriptionFont', 'contactDescriptionSize', settings.contactDescriptionFont || 'sans', settings.contactDescriptionSize || 16)}
                style={typographyStyle(settings.contactDescriptionFont, settings.contactDescriptionSize, 'sans', 16)}
              >{settings.contactDescription}</p>
            </div>
            <div className="contact-actions">
              <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
              {mapsUrl && <a className="btn btn-secondary" href={mapsUrl} target="_blank" rel="noreferrer">Como chegar</a>}
            </div>
            {settings.clinicAddress && <p className="address" {...siteText('clinicAddress', 'Endereço da clínica')}>{settings.clinicAddress}</p>}
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><p>{settings.professionalName}{settings.cro ? ` · ${settings.cro}` : ''}</p><p>São Paulo, SP</p></div></footer>
    </>
  );
}
