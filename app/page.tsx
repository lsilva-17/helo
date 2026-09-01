import {stegaClean} from 'next-sanity';
import {sanityFetch} from '@/sanity/lib/live';

export const revalidate = 60;

type Settings = {
  professionalName?: string; brandSubtitle?: string; cro?: string; whatsapp?: string; instagram?: string; clinicAddress?: string; mapsUrl?: string;
  navAboutLabel?: string; navTreatmentsLabel?: string; navCasesLabel?: string; navContactLabel?: string;
  heroEyebrow?: string; heroTitle?: string; heroDescription?: string; heroImageUrl?: string; primaryCtaLabel?: string; instagramCtaLabel?: string;
  aboutEyebrow?: string; aboutTitle?: string; aboutDescription?: string;
  trust1Title?: string; trust1Body?: string; trust2Title?: string; trust2Body?: string; trust3Title?: string; trust3Body?: string;
  treatmentsEyebrow?: string; treatmentsTitle?: string; treatmentsDescription?: string;
  casesEyebrow?: string; casesTitle?: string; casesDescription?: string; beforeLabel?: string; afterLabel?: string;
  contactEyebrow?: string; contactTitle?: string; contactDescription?: string; whatsappCtaLabel?: string; mapsCtaLabel?: string; footerLocation?: string;
  sectionOrder?: string[];
  heroImageHeight?: number; heroImagePositionX?: number; heroImagePositionY?: number;
  treatmentImageHeight?: number; treatmentImagePositionX?: number; treatmentImagePositionY?: number;
  caseImageHeight?: number; caseImagePositionX?: number; caseImagePositionY?: number;
  [key: string]: string | number | string[] | undefined;
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
  professionalName: 'Dra. Heloisa Veiga', brandSubtitle: 'Odontologia estética · São Paulo', whatsapp: '5511987312961', instagram: 'https://www.instagram.com/dra.heloisaveiga',
  navAboutLabel: 'Sobre', navTreatmentsLabel: 'Tratamentos', navCasesLabel: 'Casos', navContactLabel: 'Contato',
  heroEyebrow: 'Odontologia estética em São Paulo', heroTitle: 'Saúde, beleza e confiança em cada sorriso.',
  heroDescription: 'Formada pela USP, a Dra. Heloisa Veiga atua com foco em odontologia estética e planejamento individualizado, respeitando as características de cada paciente.',
  heroImageUrl: 'https://raw.githubusercontent.com/lsilva-17/helo/legacy-main/helo.png', primaryCtaLabel: 'Agendar avaliação', instagramCtaLabel: 'Ver Instagram',
  aboutEyebrow: 'Sobre', aboutTitle: 'Estética com naturalidade e cuidado individualizado.',
  aboutDescription: 'Cada tratamento parte de uma avaliação cuidadosa para combinar saúde, função e estética. O objetivo é construir resultados harmônicos, sem perder a identidade do sorriso de cada paciente.',
  trust1Title: 'USP', trust1Body: 'Formação acadêmica', trust2Title: 'Estética', trust2Body: 'Planejamento individualizado', trust3Title: 'Naturalidade', trust3Body: 'Respeito às características do paciente',
  treatmentsEyebrow: 'Tratamentos', treatmentsTitle: 'Tratamentos pensados para cada sorriso.', treatmentsDescription: 'Conheça algumas das possibilidades de tratamento e converse com a Dra. Heloisa para entender qual abordagem faz sentido para o seu caso.',
  casesEyebrow: 'Casos clínicos', casesTitle: 'Resultados e casos clínicos.', casesDescription: 'Casos publicados no CMS aparecem aqui automaticamente. As imagens devem ser usadas sempre com a autorização adequada do paciente.', beforeLabel: 'Antes', afterLabel: 'Depois',
  contactEyebrow: 'Contato', contactTitle: 'Vamos conversar sobre o seu sorriso?', contactDescription: 'Entre em contato pelo WhatsApp para tirar dúvidas e agendar uma avaliação.', whatsappCtaLabel: 'Falar no WhatsApp', mapsCtaLabel: 'Como chegar', footerLocation: 'São Paulo, SP',
  sectionOrder: defaultSectionOrder,
};

async function getContent() {
  try {
    const response = await sanityFetch({query: contentQuery});
    const data = response.data as Content;
    return {settings: {...fallbackSettings, ...(data.settings || {})}, treatments: data.treatments || [], cases: data.cases || []};
  } catch {
    return {settings: fallbackSettings, treatments: [], cases: []};
  }
}

function whatsappLink(number?: string) {
  const cleanNumber = stegaClean(number || String(fallbackSettings.whatsapp || ''));
  return `https://wa.me/${cleanNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Olá, vim pelo site e gostaria de agendar uma avaliação.')}`;
}
function cleanUrl(value?: string) { return value ? stegaClean(value) : undefined; }
function cleanConfig(value: string | undefined, fallback: string) { return value ? stegaClean(value) : fallback; }
function n(settings: Settings, field: string, fallback: number) { const value = settings[field]; return typeof value === 'number' ? value : fallback; }
function s(settings: Settings, field: string, fallback: string) { const value = settings[field]; return typeof value === 'string' ? stegaClean(value) : fallback; }

function typographyStyle(settings: Settings, key: string, fallbackFont: string, fallbackSize: number, fallbackAlign = 'left') {
  const font = s(settings, `${key}Font`, fallbackFont);
  return {fontFamily: fontStacks[font] || fontStacks[fallbackFont], fontSize: `${n(settings, `${key}Size`, fallbackSize)}px`, textAlign: s(settings, `${key}Align`, fallbackAlign) as 'left' | 'center' | 'right'};
}

function typographyMeta(settings: Settings, key: string) {
  return {
    'data-vb-style-doc-id': 'siteSettings', 'data-vb-style-doc-type': 'siteSettings',
    'data-vb-font-field': `${key}Font`, 'data-vb-size-field': `${key}Size`, 'data-vb-align-field': `${key}Align`,
    'data-vb-font-value': s(settings, `${key}Font`, 'sans'), 'data-vb-size-value': n(settings, `${key}Size`, 16), 'data-vb-align-value': s(settings, `${key}Align`, 'left'),
  };
}

function siteText(settings: Settings, field: string, label: string, styleKey?: string) {
  return {
    'data-vb-doc-id': 'siteSettings', 'data-vb-doc-type': 'siteSettings', 'data-vb-field': field, 'data-vb-label': label,
    ...(styleKey ? typographyMeta(settings, styleKey) : {}),
  };
}

function documentText(settings: Settings, documentId: string, documentType: string, field: string, label: string, styleKey?: string) {
  return {
    'data-vb-doc-id': documentId, 'data-vb-doc-type': documentType, 'data-vb-field': field, 'data-vb-label': label,
    ...(styleKey ? typographyMeta(settings, styleKey) : {}),
  };
}

function sectionPosition(order: string[] | undefined, section: string) {
  const list = (order?.length === 5 ? order : defaultSectionOrder).map((item) => stegaClean(item));
  const index = list.indexOf(section);
  return index === -1 ? 99 : index;
}

function sectionOuterStyle(settings: Settings, key: string) {
  return {order: sectionPosition(settings.sectionOrder, key), paddingTop: `${n(settings, `${key}PaddingY`, key === 'hero' ? 32 : 72)}px`, paddingBottom: `${n(settings, `${key}PaddingY`, key === 'hero' ? 32 : 72)}px`};
}

function sectionLayout(settings: Settings, key: string, label: string) {
  const width = n(settings, `${key}Width`, 100); const x = n(settings, `${key}OffsetX`, 0); const y = n(settings, `${key}OffsetY`, 0);
  return {
    props: {
      'data-vb-layout': 'true', 'data-vb-style-doc-id': 'siteSettings', 'data-vb-style-doc-type': 'siteSettings', 'data-vb-label': `${label} · layout`,
      'data-vb-width-field': `${key}Width`, 'data-vb-x-field': `${key}OffsetX`, 'data-vb-y-field': `${key}OffsetY`, 'data-vb-padding-field': `${key}PaddingY`,
      'data-vb-width-value': width, 'data-vb-x-value': x, 'data-vb-y-value': y, 'data-vb-padding-value': n(settings, `${key}PaddingY`, key === 'hero' ? 32 : 72),
    },
    style: {width: `${width}%`, transform: `translate(${x}px, ${y}px)`},
  };
}

function imageMeta(settings: Settings, documentId: string, documentType: string, imageField: string, label: string, prefix: 'hero' | 'treatment' | 'case') {
  const heightField = `${prefix}ImageHeight`; const positionXField = `${prefix}ImagePositionX`; const positionYField = `${prefix}ImagePositionY`;
  return {
    'data-vb-doc-id': documentId, 'data-vb-doc-type': documentType, 'data-vb-image-field': imageField, 'data-vb-label': label,
    'data-vb-style-doc-id': 'siteSettings', 'data-vb-style-doc-type': 'siteSettings',
    'data-vb-height-field': heightField, 'data-vb-position-x-field': positionXField, 'data-vb-position-y-field': positionYField,
    'data-vb-height-value': n(settings, heightField, prefix === 'hero' ? 450 : prefix === 'treatment' ? 260 : 320),
    'data-vb-position-x-value': n(settings, positionXField, 50), 'data-vb-position-y-value': n(settings, positionYField, prefix === 'hero' ? 10 : 50),
  };
}

function imageStyle(settings: Settings, prefix: 'hero' | 'treatment' | 'case') {
  const fallbackHeight = prefix === 'hero' ? 450 : prefix === 'treatment' ? 260 : 320;
  return {height: `${n(settings, `${prefix}ImageHeight`, fallbackHeight)}px`, objectFit: 'cover' as const, objectPosition: `${n(settings, `${prefix}ImagePositionX`, 50)}% ${n(settings, `${prefix}ImagePositionY`, prefix === 'hero' ? 10 : 50)}%`};
}

export default async function HomePage() {
  const {settings, treatments, cases} = await getContent();
  const wa = whatsappLink(settings.whatsapp); const instagram = cleanUrl(settings.instagram); const mapsUrl = cleanUrl(settings.mapsUrl); const heroImageUrl = cleanUrl(settings.heroImageUrl || String(fallbackSettings.heroImageUrl));
  const fallbackTreatments: Treatment[] = [
    {_id: 'facetas', title: 'Facetas em resina', summary: 'Planejamento estético para transformar forma, proporção e harmonia do sorriso.'},
    {_id: 'clareamento', title: 'Clareamento dental', summary: 'Estratégias de clareamento indicadas de acordo com a avaliação clínica.'},
    {_id: 'avaliacao', title: 'Avaliação estética', summary: 'Consulta para entender objetivos, possibilidades e construir um plano individualizado.'},
  ];

  const heroLayout = sectionLayout(settings, 'hero', 'Hero'); const aboutLayout = sectionLayout(settings, 'about', 'Sobre'); const treatmentsLayout = sectionLayout(settings, 'treatments', 'Tratamentos'); const casesLayout = sectionLayout(settings, 'cases', 'Casos'); const contactLayout = sectionLayout(settings, 'contact', 'Contato');

  return <>
    <header className="site-header"><div className="container header-inner">
      <a className="brand" href="#inicio"><span className="brand-mark">HV</span><span className="brand-text">
        <strong {...siteText(settings, 'professionalName', 'Nome profissional', 'brandName')} style={typographyStyle(settings, 'brandName', 'sans', 15)}>{settings.professionalName}</strong>
        <small {...siteText(settings, 'brandSubtitle', 'Subtítulo da marca', 'brandSubtitleStyle')} style={typographyStyle(settings, 'brandSubtitleStyle', 'sans', 12)}>{settings.brandSubtitle}</small>
      </span></a>
      <nav className="nav" aria-label="Menu principal">
        <a href="#sobre" {...siteText(settings, 'navAboutLabel', 'Menu · Sobre', 'navStyle')} style={typographyStyle(settings, 'navStyle', 'sans', 14)}>{settings.navAboutLabel}</a>
        <a href="#tratamentos" {...siteText(settings, 'navTreatmentsLabel', 'Menu · Tratamentos', 'navStyle')} style={typographyStyle(settings, 'navStyle', 'sans', 14)}>{settings.navTreatmentsLabel}</a>
        <a href="#casos" {...siteText(settings, 'navCasesLabel', 'Menu · Casos', 'navStyle')} style={typographyStyle(settings, 'navStyle', 'sans', 14)}>{settings.navCasesLabel}</a>
        <a href="#contato" {...siteText(settings, 'navContactLabel', 'Menu · Contato', 'navStyle')} style={typographyStyle(settings, 'navStyle', 'sans', 14)}>{settings.navContactLabel}</a>
      </nav>
    </div></header>

    <main className="page-sections">
      <section className="hero" id="inicio" data-vb-section="hero" style={sectionOuterStyle(settings, 'hero')}><div className="container hero-visual" {...heroLayout.props} style={heroLayout.style}><div className="hero-inner">
        <div className="hero-card">
          <span className="eyebrow" {...siteText(settings, 'heroEyebrow', 'Hero · chamada curta', 'eyebrowStyle')} style={typographyStyle(settings, 'eyebrowStyle', 'sans', 12)}>{settings.heroEyebrow}</span>
          <h1 {...siteText(settings, 'heroTitle', 'Hero · título', 'heroTitle')} style={typographyStyle(settings, 'heroTitle', 'editorial', 67)}>{settings.heroTitle}</h1>
          <p {...siteText(settings, 'heroDescription', 'Hero · descrição', 'heroDescription')} style={typographyStyle(settings, 'heroDescription', 'sans', 16)}>{settings.heroDescription}</p>
          <div className="hero-actions"><a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer" {...siteText(settings, 'primaryCtaLabel', 'Botão · agendar avaliação', 'buttonStyle')} style={typographyStyle(settings, 'buttonStyle', 'sans', 14, 'center')}>{settings.primaryCtaLabel}</a>
          {instagram && <a className="btn btn-secondary" href={instagram} target="_blank" rel="noreferrer" {...siteText(settings, 'instagramCtaLabel', 'Botão · Instagram', 'buttonStyle')} style={typographyStyle(settings, 'buttonStyle', 'sans', 14, 'center')}>{settings.instagramCtaLabel}</a>}</div>
        </div>
        <div className="hero-photo">{heroImageUrl && <img src={heroImageUrl} alt={`Foto de ${stegaClean(String(settings.professionalName || ''))}`} {...imageMeta(settings, 'siteSettings', 'siteSettings', 'heroImage', 'Foto principal', 'hero')} style={imageStyle(settings, 'hero')} />}</div>
      </div></div></section>

      <section className="section" id="sobre" data-vb-section="about" style={sectionOuterStyle(settings, 'about')}><div className="container highlight-box" {...aboutLayout.props} style={aboutLayout.style}>
        <span className="eyebrow" {...siteText(settings, 'aboutEyebrow', 'Sobre · chamada curta', 'eyebrowStyle')} style={typographyStyle(settings, 'eyebrowStyle', 'sans', 12)}>{settings.aboutEyebrow}</span>
        <h2 className="section-title" {...siteText(settings, 'aboutTitle', 'Sobre · título', 'aboutTitle')} style={typographyStyle(settings, 'aboutTitle', 'editorial', 56)}>{settings.aboutTitle}</h2>
        <p className="section-copy" {...siteText(settings, 'aboutDescription', 'Sobre · descrição', 'aboutDescription')} style={typographyStyle(settings, 'aboutDescription', 'sans', 16)}>{settings.aboutDescription}</p>
        <div className="trust-grid">
          <div><strong {...siteText(settings, 'trust1Title', 'Destaque 1 · título', 'trustTitleStyle')} style={typographyStyle(settings, 'trustTitleStyle', 'editorial', 27)}>{settings.trust1Title}</strong><span {...siteText(settings, 'trust1Body', 'Destaque 1 · descrição', 'trustBodyStyle')} style={typographyStyle(settings, 'trustBodyStyle', 'sans', 14)}>{settings.trust1Body}</span></div>
          <div><strong {...siteText(settings, 'trust2Title', 'Destaque 2 · título', 'trustTitleStyle')} style={typographyStyle(settings, 'trustTitleStyle', 'editorial', 27)}>{settings.trust2Title}</strong><span {...siteText(settings, 'trust2Body', 'Destaque 2 · descrição', 'trustBodyStyle')} style={typographyStyle(settings, 'trustBodyStyle', 'sans', 14)}>{settings.trust2Body}</span></div>
          <div><strong {...siteText(settings, 'trust3Title', 'Destaque 3 · título', 'trustTitleStyle')} style={typographyStyle(settings, 'trustTitleStyle', 'editorial', 27)}>{settings.trust3Title}</strong><span {...siteText(settings, 'trust3Body', 'Destaque 3 · descrição', 'trustBodyStyle')} style={typographyStyle(settings, 'trustBodyStyle', 'sans', 14)}>{settings.trust3Body}</span></div>
        </div>
      </div></section>

      <section className="section" id="tratamentos" data-vb-section="treatments" style={sectionOuterStyle(settings, 'treatments')}><div className="container" {...treatmentsLayout.props} style={treatmentsLayout.style}>
        <span className="eyebrow" {...siteText(settings, 'treatmentsEyebrow', 'Tratamentos · chamada curta', 'eyebrowStyle')} style={typographyStyle(settings, 'eyebrowStyle', 'sans', 12)}>{settings.treatmentsEyebrow}</span>
        <h2 className="section-title" {...siteText(settings, 'treatmentsTitle', 'Tratamentos · título', 'treatmentsTitle')} style={typographyStyle(settings, 'treatmentsTitle', 'editorial', 56)}>{settings.treatmentsTitle}</h2>
        <p className="section-copy" {...siteText(settings, 'treatmentsDescription', 'Tratamentos · descrição', 'treatmentsDescription')} style={typographyStyle(settings, 'treatmentsDescription', 'sans', 16)}>{settings.treatmentsDescription}</p>
        <div className="gallery-grid">{(treatments.length ? treatments : fallbackTreatments).map((item) => { const imageUrl = cleanUrl(item.imageUrl); const editable = !fallbackTreatmentIds.has(stegaClean(item._id)); return <article className="gallery-card" key={item._id}>
          {imageUrl ? <img className="gallery-media" src={imageUrl} alt={stegaClean(item.title)} {...(editable ? imageMeta(settings, item._id, 'treatment', 'image', `Imagem · ${stegaClean(item.title)}`, 'treatment') : {})} style={imageStyle(settings, 'treatment')} /> : <div className="gallery-placeholder">{item.title}</div>}
          <div className="gallery-body"><h3 {...(editable ? documentText(settings, item._id, 'treatment', 'title', 'Tratamento · título', 'treatmentCardTitleStyle') : {})} style={typographyStyle(settings, 'treatmentCardTitleStyle', 'editorial', 26)}>{item.title}</h3><p {...(editable ? documentText(settings, item._id, 'treatment', 'summary', 'Tratamento · descrição', 'treatmentCardBodyStyle') : {})} style={typographyStyle(settings, 'treatmentCardBodyStyle', 'sans', 16)}>{item.summary}</p></div>
        </article>; })}</div>
      </div></section>

      <section className="section cases-section" id="casos" data-vb-section="cases" style={sectionOuterStyle(settings, 'cases')}><div className="container" {...casesLayout.props} style={casesLayout.style}>
        <span className="eyebrow" {...siteText(settings, 'casesEyebrow', 'Casos · chamada curta', 'eyebrowStyle')} style={typographyStyle(settings, 'eyebrowStyle', 'sans', 12)}>{settings.casesEyebrow}</span>
        <h2 className="section-title" {...siteText(settings, 'casesTitle', 'Casos · título', 'casesTitle')} style={typographyStyle(settings, 'casesTitle', 'editorial', 56)}>{settings.casesTitle}</h2>
        <p className="section-copy" {...siteText(settings, 'casesDescription', 'Casos · descrição', 'casesDescription')} style={typographyStyle(settings, 'casesDescription', 'sans', 16)}>{settings.casesDescription}</p>
        {cases.length ? <div className="cases-grid">{cases.map((item) => { const beforeUrl = cleanUrl(item.beforeUrl); const afterUrl = cleanUrl(item.afterUrl); return <article className="case-card" key={item._id}>
          <div className="before-after">
            {beforeUrl && <figure><img src={beforeUrl} alt={`Antes - ${stegaClean(item.title)}`} {...imageMeta(settings, item._id, 'caseStudy', 'beforeImage', 'Foto antes', 'case')} style={imageStyle(settings, 'case')} /><figcaption {...siteText(settings, 'beforeLabel', 'Etiqueta · Antes', 'caseLabelStyle')} style={typographyStyle(settings, 'caseLabelStyle', 'sans', 12)}>{settings.beforeLabel}</figcaption></figure>}
            {afterUrl && <figure><img src={afterUrl} alt={`Depois - ${stegaClean(item.title)}`} {...imageMeta(settings, item._id, 'caseStudy', 'afterImage', 'Foto depois', 'case')} style={imageStyle(settings, 'case')} /><figcaption {...siteText(settings, 'afterLabel', 'Etiqueta · Depois', 'caseLabelStyle')} style={typographyStyle(settings, 'caseLabelStyle', 'sans', 12)}>{settings.afterLabel}</figcaption></figure>}
          </div>
          <div className="case-body">{item.treatmentTitle && <span className="case-label" {...typographyMeta(settings, 'caseLabelStyle')} data-vb-label="Caso · tratamento" style={typographyStyle(settings, 'caseLabelStyle', 'sans', 12)}>{item.treatmentTitle}</span>}<h3 {...documentText(settings, item._id, 'caseStudy', 'title', 'Caso clínico · título', 'caseCardTitleStyle')} style={typographyStyle(settings, 'caseCardTitleStyle', 'editorial', 26)}>{item.title}</h3><p {...documentText(settings, item._id, 'caseStudy', 'description', 'Caso clínico · descrição', 'caseCardBodyStyle')} style={typographyStyle(settings, 'caseCardBodyStyle', 'sans', 16)}>{item.description}</p></div>
        </article>; })}</div> : <div className="empty-state">Publique casos em <strong>Conteúdo → Casos clínicos</strong> e eles aparecerão aqui automaticamente.</div>}
      </div></section>

      <section className="section" id="contato" data-vb-section="contact" style={sectionOuterStyle(settings, 'contact')}><div className="container contact-card" {...contactLayout.props} style={contactLayout.style}>
        <div><span className="eyebrow" {...siteText(settings, 'contactEyebrow', 'Contato · chamada curta', 'eyebrowStyle')} style={typographyStyle(settings, 'eyebrowStyle', 'sans', 12)}>{settings.contactEyebrow}</span><h2 className="section-title" {...siteText(settings, 'contactTitle', 'Contato · título', 'contactTitle')} style={typographyStyle(settings, 'contactTitle', 'editorial', 56)}>{settings.contactTitle}</h2><p className="section-copy" {...siteText(settings, 'contactDescription', 'Contato · descrição', 'contactDescription')} style={typographyStyle(settings, 'contactDescription', 'sans', 16)}>{settings.contactDescription}</p></div>
        <div className="contact-actions"><a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer" {...siteText(settings, 'whatsappCtaLabel', 'Botão · WhatsApp', 'buttonStyle')} style={typographyStyle(settings, 'buttonStyle', 'sans', 14, 'center')}>{settings.whatsappCtaLabel}</a>{mapsUrl && <a className="btn btn-secondary" href={mapsUrl} target="_blank" rel="noreferrer" {...siteText(settings, 'mapsCtaLabel', 'Botão · Como chegar', 'buttonStyle')} style={typographyStyle(settings, 'buttonStyle', 'sans', 14, 'center')}>{settings.mapsCtaLabel}</a>}</div>
        {settings.clinicAddress && <p className="address" {...siteText(settings, 'clinicAddress', 'Endereço da clínica', 'footerStyle')} style={typographyStyle(settings, 'footerStyle', 'sans', 14)}>{settings.clinicAddress}</p>}
      </div></section>
    </main>

    <footer className="site-footer"><div className="container footer-inner" style={typographyStyle(settings, 'footerStyle', 'sans', 14)}><p><span {...siteText(settings, 'professionalName', 'Rodapé · nome', 'footerStyle')}>{settings.professionalName}</span>{settings.cro ? ` · ${settings.cro}` : ''}</p><p {...siteText(settings, 'footerLocation', 'Rodapé · localização', 'footerStyle')}>{settings.footerLocation}</p></div></footer>
  </>;
}
