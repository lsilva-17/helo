import {stegaClean} from 'next-sanity';
import {draftMode} from 'next/headers';
import {sanityFetch, SanityLive} from '@/sanity/lib/live';
import {SiteHeader} from '@/app/components/SiteHeader';

export const revalidate = 60;

const SITE_SETTINGS_ID = '143778fa-0f7b-4e2b-9f1b-d34bdce5907d';

type Settings = {
  _id?: string;
  professionalName?: string; brandSubtitle?: string; brandLogoUrl?: string; cro?: string; whatsapp?: string; instagram?: string; clinicAddress?: string; mapsUrl?: string;
  navAboutLabel?: string; navTreatmentsLabel?: string; navCasesLabel?: string; navContactLabel?: string;
  heroEyebrow?: string; heroTitle?: string; heroDescription?: string; heroImageUrl?: string; primaryCtaLabel?: string; instagramCtaLabel?: string;
  aboutEyebrow?: string; aboutTitle?: string; aboutDescription?: string;
  trust1Title?: string; trust1Body?: string; trust2Title?: string; trust2Body?: string; trust3Title?: string; trust3Body?: string;
  treatmentsEyebrow?: string; treatmentsTitle?: string; treatmentsDescription?: string;
  casesEyebrow?: string; casesTitle?: string; casesDescription?: string; beforeLabel?: string; afterLabel?: string;
  contactEyebrow?: string; contactTitle?: string; contactDescription?: string; whatsappCtaLabel?: string; mapsCtaLabel?: string; footerLocation?: string;
  sectionOrder?: string[];
  heroImageWidth?: number; heroImageOffsetX?: number; heroImageOffsetY?: number; heroImageHeight?: number; heroImagePositionX?: number; heroImagePositionY?: number;
  treatmentImageHeight?: number; treatmentImagePositionX?: number; treatmentImagePositionY?: number;
  caseImageHeight?: number; caseImagePositionX?: number; caseImagePositionY?: number;
  [key: string]: string | number | string[] | undefined;
};

type Treatment = {_id: string; title: string; summary?: string; imageUrl?: string};
type CaseStudy = {_id: string; title: string; description?: string; beforeUrl?: string; afterUrl?: string; treatmentTitle?: string};
type Content = {settings: Settings | null; treatments: Treatment[]; cases: CaseStudy[]};

const contentQuery = `{
  "settings": *[_type == "siteSettings" && _id == "143778fa-0f7b-4e2b-9f1b-d34bdce5907d"][0]{..., "brandLogoUrl": brandLogo.asset->url, "heroImageUrl": heroImage.asset->url},
  "treatments": *[_type == "treatment" && featured == true] | order(order asc){_id,title,summary,"imageUrl":image.asset->url},
  "cases": *[_type == "caseStudy" && featured == true] | order(order asc){_id,title,description,"beforeUrl":beforeImage.asset->url,"afterUrl":afterImage.asset->url,"treatmentTitle":treatment->title}
}`;

const defaultSectionOrder = ['hero', 'about', 'treatments', 'cases', 'contact'];
const fallbackTreatmentIds = new Set(['facetas', 'clareamento', 'estetica-facial']);
const fontStacks: Record<string, string> = {
  editorial: "'Cormorant Garamond', Georgia, serif",
  sans: "'Inter', Arial, sans-serif",
  classic: "Georgia, 'Times New Roman', serif",
  arial: "Arial, Helvetica, sans-serif",
  roboto: "'Roboto', Arial, sans-serif",
  inter: "'Inter', Arial, sans-serif",
  opensans: "'Open Sans', Arial, sans-serif",
  montserrat: "'Montserrat', Arial, sans-serif",
  poppins: "'Poppins', Arial, sans-serif",
  dmsans: "'DM Sans', Arial, sans-serif",
  lato: "'Lato', Arial, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  lora: "'Lora', Georgia, serif",
  merriweather: "'Merriweather', Georgia, serif",
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
  heroImageWidth: 100, heroImageOffsetX: 0, heroImageOffsetY: 0,
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
function settingsId(settings: Settings) { return stegaClean(String(settings._id || SITE_SETTINGS_ID)).replace(/^drafts\./, ''); }
function n(settings: Settings, field: string, fallback: number) { const value = settings[field]; return typeof value === 'number' ? value : fallback; }
function s(settings: Settings, field: string, fallback: string) { const value = settings[field]; return typeof value === 'string' ? stegaClean(value) : fallback; }

function typographyStyle(settings: Settings, key: string, fallbackFont: string, fallbackSize: number, fallbackAlign = 'left') {
  const font = s(settings, `${key}Font`, fallbackFont);
  return {fontFamily: fontStacks[font] || fontStacks[fallbackFont], fontSize: `${n(settings, `${key}Size`, fallbackSize)}px`, textAlign: s(settings, `${key}Align`, fallbackAlign) as 'left' | 'center' | 'right'};
}

function typographyMeta(settings: Settings, key: string) {
  return {
    'data-vb-style-doc-id': settingsId(settings), 'data-vb-style-doc-type': 'siteSettings',
    'data-vb-font-field': `${key}Font`, 'data-vb-size-field': `${key}Size`, 'data-vb-align-field': `${key}Align`,
    'data-vb-font-value': s(settings, `${key}Font`, 'sans'), 'data-vb-size-value': n(settings, `${key}Size`, 16), 'data-vb-align-value': s(settings, `${key}Align`, 'left'),
  };
}

function siteText(settings: Settings, field: string, label: string, styleKey?: string) {
  return {
    'data-vb-doc-id': settingsId(settings), 'data-vb-doc-type': 'siteSettings', 'data-vb-field': field, 'data-vb-label': label,
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
  return {order: sectionPosition(settings.sectionOrder, key)};
}

function sectionLayout(settings: Settings, key: string, label: string) {
  const width = n(settings, `${key}Width`, 100); const x = n(settings, `${key}OffsetX`, 0); const y = n(settings, `${key}OffsetY`, 0); const height = n(settings, `${key}Height`, key === 'hero' ? 560 : 320);
  return {
    props: {
      'data-vb-layout': 'true', 'data-vb-style-doc-id': settingsId(settings), 'data-vb-style-doc-type': 'siteSettings', 'data-vb-label': `${label} · layout`,
      'data-vb-width-field': `${key}Width`, 'data-vb-x-field': `${key}OffsetX`, 'data-vb-y-field': `${key}OffsetY`, 'data-vb-padding-field': `${key}PaddingY`, 'data-vb-block-height-field': `${key}Height`, 'data-vb-fixed-height': key === 'hero' ? 'true' : 'false',
      'data-vb-width-value': width, 'data-vb-x-value': x, 'data-vb-y-value': y, 'data-vb-padding-value': n(settings, `${key}PaddingY`, key === 'hero' ? 24 : 32), 'data-vb-block-height-value': height,
    },
    style: {width: `${width}%`, ...(key === 'hero' ? {height: `${height}px`, minHeight: 0, overflow: 'hidden'} : {minHeight: `${height}px`}), paddingTop: `${n(settings, `${key}PaddingY`, key === 'hero' ? 24 : 32)}px`, paddingBottom: `${n(settings, `${key}PaddingY`, key === 'hero' ? 24 : 32)}px`, transform: `translate(${x}px, ${y}px)`},
  };
}

function imageMeta(settings: Settings, documentId: string, documentType: string, imageField: string, label: string, prefix: 'hero' | 'treatment' | 'case') {
  const heightField = `${prefix}ImageHeight`; const positionXField = `${prefix}ImagePositionX`; const positionYField = `${prefix}ImagePositionY`;
  return {
    'data-vb-doc-id': documentId, 'data-vb-doc-type': documentType, 'data-vb-image-field': imageField, 'data-vb-label': label,
    'data-vb-style-doc-id': settingsId(settings), 'data-vb-style-doc-type': 'siteSettings',
    'data-vb-height-field': heightField, 'data-vb-position-x-field': positionXField, 'data-vb-position-y-field': positionYField,
    'data-vb-height-value': n(settings, heightField, prefix === 'hero' ? 450 : prefix === 'treatment' ? 260 : 320),
    'data-vb-position-x-value': n(settings, positionXField, 50), 'data-vb-position-y-value': n(settings, positionYField, prefix === 'hero' ? 10 : 50),
    ...(prefix === 'hero' ? {
      'data-vb-width-field': 'heroImageWidth', 'data-vb-x-field': 'heroImageOffsetX', 'data-vb-y-field': 'heroImageOffsetY',
      'data-vb-width-value': n(settings, 'heroImageWidth', 100), 'data-vb-x-value': n(settings, 'heroImageOffsetX', 0), 'data-vb-y-value': n(settings, 'heroImageOffsetY', 0),
    } : {}),
  };
}

function imageStyle(settings: Settings, prefix: 'hero' | 'treatment' | 'case') {
  const fallbackHeight = prefix === 'hero' ? 450 : prefix === 'treatment' ? 260 : 320;
  const base = {height: `${n(settings, `${prefix}ImageHeight`, fallbackHeight)}px`, objectFit: 'cover' as const, objectPosition: `${n(settings, `${prefix}ImagePositionX`, 50)}% ${n(settings, `${prefix}ImagePositionY`, prefix === 'hero' ? 10 : 50)}%`};
  if (prefix !== 'hero') return base;
  return {...base, height: '100%', minHeight: `${n(settings, 'heroImageHeight', fallbackHeight)}px`, width: `${n(settings, 'heroImageWidth', 100)}%`, transform: `translate(${n(settings, 'heroImageOffsetX', 0)}px, ${n(settings, 'heroImageOffsetY', 0)}px)`, marginInline: 'auto'};
}

export default async function HomePage() {
  const {isEnabled: isDraftMode} = await draftMode();
  const {settings, treatments, cases} = await getContent();
  const wa = whatsappLink(settings.whatsapp); const floatingWa = whatsappLink(String(fallbackSettings.whatsapp)); const instagram = cleanUrl(settings.instagram); const mapsUrl = cleanUrl(settings.mapsUrl); const heroImageUrl = cleanUrl(settings.heroImageUrl || String(fallbackSettings.heroImageUrl)); const brandLogoUrl = cleanUrl(settings.brandLogoUrl) || '/brand-hv.svg';
  const fallbackTreatments: Treatment[] = [
    {_id: 'facetas', title: 'Facetas em resina', summary: 'Planejamento estético para transformar forma, proporção e harmonia do sorriso.'},
    {_id: 'clareamento', title: 'Clareamento dental', summary: 'Estratégias de clareamento indicadas de acordo com a avaliação clínica.'},
    {_id: 'estetica-facial', title: 'Estética facial', summary: 'Procedimentos estéticos planejados para harmonizar o sorriso com os traços e proporções do rosto.'},
  ];

  const mobileTreatmentFallbackImages: Record<string, string> = {
    facetas: 'https://cdn.sanity.io/images/f9ampmu2/production/0c39b530fdf280dc77963e5d5f1026d2eed38bed-4494x2843.jpg',
    clareamento: 'https://cdn.sanity.io/images/f9ampmu2/production/91a988d6b2d139dc45f8e6ff0126b57ad50015e7-988x790.jpg',
    'estetica-facial': 'https://cdn.sanity.io/images/f9ampmu2/production/a718460cbcd66472107b7d0f53cabafe1638d734-1922x2560.webp',
  };
  const displayedTreatments: Treatment[] = treatments
    .slice(0, 3)
    .map((item): Treatment => {
      const fallback = fallbackTreatments.find((entry) => entry._id === stegaClean(item._id));
      return {
        ...item,
        title: item.title || fallback?.title || '',
        summary: item.summary || fallback?.summary || '',
      };
    });

  for (const fallback of fallbackTreatments) {
    if (displayedTreatments.length >= 3) break;
    const alreadyPresent = displayedTreatments.some((item) =>
      stegaClean(item._id) === fallback._id ||
      stegaClean(item.title || '').trim().toLowerCase() === fallback.title.toLowerCase()
    );
    if (!alreadyPresent) displayedTreatments.push(fallback);
  }

  const heroLayout = sectionLayout(settings, 'hero', 'Hero'); const aboutLayout = sectionLayout(settings, 'about', 'Sobre'); const treatmentsLayout = sectionLayout(settings, 'treatments', 'Tratamentos'); const casesLayout = sectionLayout(settings, 'cases', 'Casos'); const contactLayout = sectionLayout(settings, 'contact', 'Contato');

  return <>
    <SiteHeader
      brandName={String(settings.professionalName || '')}
      subtitle={String(settings.brandSubtitle || '')}
      logoUrl={brandLogoUrl}
      navAboutLabel={String(settings.navAboutLabel || 'Sobre')}
      navTreatmentsLabel={String(settings.navTreatmentsLabel || 'Tratamentos')}
      navCasesLabel={String(settings.navCasesLabel || 'Casos')}
      navContactLabel={String(settings.navContactLabel || 'Contato')}
      brandNameStyle={typographyStyle(settings, 'brandName', 'sans', 15)}
      subtitleStyle={typographyStyle(settings, 'brandSubtitleStyle', 'sans', 12)}
      navStyle={typographyStyle(settings, 'navStyle', 'sans', 14)}
      brandNameProps={siteText(settings, 'professionalName', 'Nome profissional', 'brandName')}
      subtitleProps={siteText(settings, 'brandSubtitle', 'Subtítulo da marca', 'brandSubtitleStyle')}
      logoProps={{
        'data-vb-doc-id': settingsId(settings),
        'data-vb-doc-type': 'siteSettings',
        'data-vb-image-field': 'brandLogo',
        'data-vb-label': 'Ícone da marca',
      } as any}
      navAboutProps={siteText(settings, 'navAboutLabel', 'Menu · Sobre', 'navStyle')}
      navTreatmentsProps={siteText(settings, 'navTreatmentsLabel', 'Menu · Tratamentos', 'navStyle')}
      navCasesProps={siteText(settings, 'navCasesLabel', 'Menu · Casos', 'navStyle')}
      navContactProps={siteText(settings, 'navContactLabel', 'Menu · Contato', 'navStyle')}
    />

    <main className="page-sections" data-vb-layout="true" data-vb-style-doc-id={settingsId(settings)} data-vb-site-settings-id={settingsId(settings)} data-vb-style-doc-type="siteSettings" data-vb-label="Fundo entre as seções" data-vb-background-field="pageBackground">
      <section className="hero" id="inicio" data-vb-section="hero" style={sectionOuterStyle(settings, 'hero')}><div className="container hero-visual" {...heroLayout.props} style={heroLayout.style}><div className="hero-inner">
        <div className="hero-card">
          <span className="eyebrow" {...siteText(settings, 'heroEyebrow', 'Hero · chamada curta', 'eyebrowStyle')} style={typographyStyle(settings, 'eyebrowStyle', 'sans', 12)}>{settings.heroEyebrow}</span>
          <h1 {...siteText(settings, 'heroTitle', 'Hero · título', 'heroTitle')} style={typographyStyle(settings, 'heroTitle', 'editorial', 67)}>{settings.heroTitle}</h1>
          <p {...siteText(settings, 'heroDescription', 'Hero · descrição', 'heroDescription')} style={typographyStyle(settings, 'heroDescription', 'sans', 16)}>{settings.heroDescription}</p>
          <div className="hero-actions"><a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer" {...siteText(settings, 'primaryCtaLabel', 'Botão · agendar avaliação', 'buttonStyle')} style={typographyStyle(settings, 'buttonStyle', 'sans', 14, 'center')}>{settings.primaryCtaLabel}</a>
          {instagram && <a className="btn btn-secondary" href={instagram} target="_blank" rel="noreferrer" {...siteText(settings, 'instagramCtaLabel', 'Botão · Instagram', 'buttonStyle')} style={typographyStyle(settings, 'buttonStyle', 'sans', 14, 'center')}>{settings.instagramCtaLabel}</a>}</div>
        </div>
        <div className="hero-photo">{heroImageUrl && <img src={heroImageUrl} alt={`Foto de ${stegaClean(String(settings.professionalName || ''))}`} {...imageMeta(settings, settingsId(settings), 'siteSettings', 'heroImage', 'Foto principal', 'hero')} style={imageStyle(settings, 'hero')} />}</div>
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
        <div className="gallery-grid">{displayedTreatments.map((item) => { const imageUrl = cleanUrl(item.imageUrl); const fallbackImageUrl = mobileTreatmentFallbackImages[stegaClean(item._id)]; const effectiveImageUrl = imageUrl || fallbackImageUrl; const editable = !fallbackTreatmentIds.has(stegaClean(item._id)); const imageProps = imageMeta(settings, item._id, 'treatment', 'image', `Imagem · ${stegaClean(item.title)}`, 'treatment'); const normalizedTitle = stegaClean(item.title || '').toLowerCase(); const serviceHref = normalizedTitle.includes('faceta') ? '/facetas-em-resina' : normalizedTitle.includes('clareamento') ? '/clareamento-dental' : normalizedTitle.includes('estética facial') ? '/harmonizacao-facial' : undefined; return <article className="gallery-card" key={item._id}>
          <div className="gallery-media-shell">
            <img className={`gallery-media${effectiveImageUrl ? '' : ' gallery-media-empty'}`} src={effectiveImageUrl || '/treatment-image-placeholder.svg'} alt={stegaClean(item.title)} {...imageProps} style={imageStyle(settings, 'treatment')} />
            {!effectiveImageUrl && <span className="gallery-image-hint" aria-hidden="true">Adicionar imagem</span>}
          </div>
          <div className="gallery-body"><h3 {...(editable ? documentText(settings, item._id, 'treatment', 'title', 'Tratamento · título', 'treatmentCardTitleStyle') : {})} style={typographyStyle(settings, 'treatmentCardTitleStyle', 'editorial', 26)}>{item.title}</h3><p {...(editable ? documentText(settings, item._id, 'treatment', 'summary', 'Tratamento · descrição', 'treatmentCardBodyStyle') : {})} style={typographyStyle(settings, 'treatmentCardBodyStyle', 'sans', 16)}>{item.summary}</p>{serviceHref && <a className="treatment-learn-more" href={serviceHref}>Saiba mais</a>}</div>
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

    {!isDraftMode && <SanityLive />}

    <aside className="social-float" aria-label="Canais de contato">
      <a className="social-float-link social-float-whatsapp" href={floatingWa} target="_blank" rel="noreferrer" aria-label="Falar com a Dra. Heloisa no WhatsApp" title="WhatsApp">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .2 5.3.2 11.9c0 2.1.6 4.2 1.7 6L0 24l6.3-1.7a12 12 0 0 0 5.8 1.5h.1C18.7 23.8 24 18.5 24 12A11.9 11.9 0 0 0 20.5 3.5Zm-8.4 18.3h-.1a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12.1 21.8Zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.7-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z"/></svg>
      </a>
      {instagram && <a className="social-float-link social-float-instagram" href={instagram} target="_blank" rel="noreferrer" aria-label="Abrir Instagram da Dra. Heloisa" title="Instagram">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.8 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>
      </a>}
    </aside>
  </>;
}
