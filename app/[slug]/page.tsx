import type {Metadata} from 'next';
import type {CSSProperties} from 'react';
import {servicePageId, serviceSectionOrder, type ServiceSectionKey} from '@/app/lib/servicePageCustomization';
import Image from 'next/image';
import {serviceIllustrations} from '@/app/lib/serviceIllustrations';
import {homeFontStack} from '@/app/lib/brandTypography';
import {brandTextColor} from '@/app/lib/brandTextColors';
import {notFound} from 'next/navigation';
import {stegaClean} from 'next-sanity';
import {sanityFetch, SanityLive} from '@/sanity/lib/live';
import {SiteHeader} from '@/app/components/SiteHeader';
import {servicePageFallbacks, serviceRelatedItems, type ServiceFaq, type ServiceSection} from '@/app/lib/servicePages';
import {SITE_URL, DENTIST_ID, DEFAULT_ADDRESS, absoluteUrl, phoneInternational} from '@/app/lib/site';

type PageDoc = Record<string, unknown> & {
  _id?: string;
  _updatedAt?: string;
  menuLabel?: string;
  slug?: string;
  pageKind?: 'service' | 'location';
  eyebrow?: string;
  title?: string;
  intro?: string;
  sections?: ServiceSection[];
  faqs?: ServiceFaq[];
  ctaTitle?: string;
  ctaBody?: string;
  ctaLabel?: string;
  heroImageUrl?: string;
  caseImages?: Array<{url?: string; alt?: string}>;
  address?: string;
  hours?: string[];
  mapEmbedUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
};

type SiteSettings = {
  _id?: string;
  professionalName?: string;
  brandSubtitle?: string;
  brandLogoUrl?: string;
  heroImageUrl?: string;
  cro?: string;
  navAboutLabel?: string;
  navTreatmentsLabel?: string;
  navCasesLabel?: string;
  navContactLabel?: string;
  brandNameFont?: string;
  brandNameSize?: number;
  brandNameAlign?: 'left' | 'center' | 'right';
  brandNameColor?: string;
  brandSubtitleStyleFont?: string;
  brandSubtitleStyleSize?: number;
  brandSubtitleStyleAlign?: 'left' | 'center' | 'right';
  brandSubtitleStyleColor?: string;
  navStyleFont?: string;
  navStyleSize?: number;
  navStyleAlign?: 'left' | 'center' | 'right';
  navStyleColor?: string;
  eyebrowStyleFont?: string; eyebrowStyleSize?: number; eyebrowStyleAlign?: 'left' | 'center' | 'right'; eyebrowStyleColor?: string;
  buttonStyleFont?: string; buttonStyleSize?: number; buttonStyleAlign?: 'left' | 'center' | 'right'; buttonStyleColor?: string;
  heroTitleFont?: string; heroTitleSize?: number; heroTitleAlign?: 'left' | 'center' | 'right'; heroTitleColor?: string;
  heroDescriptionFont?: string; heroDescriptionSize?: number; heroDescriptionAlign?: 'left' | 'center' | 'right'; heroDescriptionColor?: string;
  treatmentsTitleFont?: string; treatmentsTitleSize?: number; treatmentsTitleAlign?: 'left' | 'center' | 'right'; treatmentsTitleColor?: string;
  treatmentsDescriptionFont?: string; treatmentsDescriptionSize?: number; treatmentsDescriptionAlign?: 'left' | 'center' | 'right'; treatmentsDescriptionColor?: string;
  treatmentCardTitleStyleFont?: string; treatmentCardTitleStyleSize?: number; treatmentCardTitleStyleAlign?: 'left' | 'center' | 'right'; treatmentCardTitleStyleColor?: string;
  treatmentCardBodyStyleFont?: string; treatmentCardBodyStyleSize?: number; treatmentCardBodyStyleAlign?: 'left' | 'center' | 'right'; treatmentCardBodyStyleColor?: string;
  whatsapp?: string;
  instagram?: string;
  clinicAddress?: string;
  mapsUrl?: string;
};

type PagePayload = {page: PageDoc | null; settings: SiteSettings | null};

const pageQuery = `{
  "page": *[_type == "servicePage" && slug.current == $slug][0]{
    ..., _id, _updatedAt, menuLabel, "slug": slug.current, pageKind, eyebrow, title, intro, sections, faqs,
    ctaTitle, ctaBody, ctaLabel, "heroImageUrl": heroImage.asset->url,
    "caseImages": caseImages[]{"url": asset->url, alt},
    address, hours, mapEmbedUrl, seoTitle, seoDescription
  },
  "settings": *[_type == "siteSettings" && _id == "143778fa-0f7b-4e2b-9f1b-d34bdce5907d"][0]{..., "brandLogoUrl": brandLogo.asset->url, "heroImageUrl": heroImage.asset->url}
}`;

function clean(value?: string) {
  return value ? stegaClean(value) : undefined;
}

function headerTypographyStyle(font: string | undefined, size: number | undefined, align: 'left' | 'center' | 'right' | undefined, fallbackFont: string, fallbackSize: number) {
  const resolvedFont = clean(font) || fallbackFont;
  return {
    fontFamily: homeFontStack(resolvedFont, fallbackFont),
    fontSize: `${size ?? fallbackSize}px`,
    textAlign: align || 'left',
  } as const;
}

function settingTypography(settings: SiteSettings | null, key: string, fallbackFont: string, fallbackSize: number, fallbackAlign: 'left' | 'center' | 'right' = 'left', boundOverride?: boolean) {
  const value = settings as Record<string, unknown> | null;
  const font = clean(typeof value?.[`${key}Font`] === 'string' ? String(value?.[`${key}Font`]) : undefined) || fallbackFont;
  const size = typeof value?.[`${key}Size`] === 'number' ? Number(value?.[`${key}Size`]) : fallbackSize;
  const alignValue = typeof value?.[`${key}Align`] === 'string' ? String(value?.[`${key}Align`]) : fallbackAlign;
  const align = (alignValue === 'center' || alignValue === 'right') ? alignValue : 'left';
  const bound = boundOverride ?? !key.startsWith('treatmentCard');
  const color = brandTextColor(key, typeof value?.[`${key}Color`] === 'string' ? clean(String(value[`${key}Color`])) : undefined);
  return {fontFamily: homeFontStack(font, fallbackFont, bound), fontSize: `${size}px`, textAlign: align, ...(color && /^#[0-9a-f]{6}$/i.test(color) ? {color} : {})} as const;
}

function brandStyle(key: string) {
  return {'data-brand-style': key};
}

function whatsappLink(number?: string, pageTitle?: string) {
  const digits = (clean(number) || '5511987312961').replace(/\D/g, '');
  const message = `Olá, vi a página ${pageTitle || 'da Dra. Heloisa'} pelo site e gostaria de obter mais informações.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function editProps(page: PageDoc | null, field: string, label: string) {
  if (!page?._id) return {};
  return {
    'data-vb-doc-id': page._id.replace(/^drafts\./, ''),
    'data-vb-doc-type': 'servicePage',
    'data-vb-field': field,
    'data-vb-label': label,
  };
}

async function getPage(slug: string): Promise<PagePayload> {
  try {
    const response = await sanityFetch({query: pageQuery, params: {slug}});
    return response.data as PagePayload;
  } catch {
    return {page: null, settings: null};
  }
}

export function generateStaticParams() {
  return Object.keys(servicePageFallbacks).map((slug) => ({slug}));
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params;
  const fallback = servicePageFallbacks[slug];
  if (!fallback) return {};
  const {page, settings} = await getPage(slug);
  const title = clean(page?.seoTitle) || fallback.seoTitle;
  const description = clean(page?.seoDescription) || fallback.seoDescription;
  const image = clean(page?.heroImageUrl) || (serviceIllustrations[slug] ? absoluteUrl(serviceIllustrations[slug].src) : clean(settings?.heroImageUrl));
  const url = `${SITE_URL}/${slug}`;
  return {
    title,
    description,
    alternates: {canonical: url},
    openGraph: {title, description, url, type: 'website', locale: 'pt_BR', ...(image ? {images: [{url: image, alt: title}]} : {})},
    twitter: {card: 'summary_large_image', title, description, ...(image ? {images: [image]} : {})},
    robots: {index: true, follow: true},
  };
}

export default async function ServicePage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const fallback = servicePageFallbacks[slug];
  if (!fallback) notFound();

  const {page, settings} = await getPage(slug);
  const illustration = serviceIllustrations[slug];
  const editingPage: PageDoc = {...page, _id: clean(page?._id) || servicePageId(slug)};
  const pageStyles = {...settings, ...Object.fromEntries(Object.entries(page || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))} as SiteSettings;
  const documentId = editingPage._id!.replace(/^drafts\./, '');
  const documentMeta = {'data-vb-doc-id': documentId, 'data-vb-doc-type': 'servicePage'};
  const number = (field: string, fallback: number) => typeof page?.[field] === 'number' ? Number(page[field]) : fallback;
  const text = (field: string, fallback: string) => typeof page?.[field] === 'string' ? clean(String(page[field])) || fallback : fallback;
  const color = (field: string) => /^#[0-9a-f]{6}$/i.test(text(field, '')) ? text(field, '') : undefined;
  const typographyDefaults: Record<string, [string, number, string]> = {
    navStyle: ['sans', 14, 'Links e navegação'], eyebrowStyle: ['sans', 12, 'Chamada curta'], heroTitle: ['editorial', 67, 'Título principal'],
    heroDescription: ['sans', 16, 'Introdução'], buttonStyle: ['sans', 14, 'Botão'],
    treatmentsTitle: ['editorial', 56, 'Título da seção'], treatmentsDescription: ['sans', 16, 'Descrição da seção'],
    treatmentCardTitleStyle: ['editorial', 26, 'Título do bloco'], treatmentCardBodyStyle: ['sans', 16, 'Texto do bloco'],
    footerStyle: ['sans', 14, 'Rodapé'],
  };
  const pageStyle = (key: string) => {
    const [fallbackFont, fallbackSize, label] = typographyDefaults[key];
    const values = pageStyles as Record<string, unknown>;
    const rawFont = clean(typeof values[`${key}Font`] === 'string' ? String(values[`${key}Font`]) : undefined) || fallbackFont;
    const font = key.startsWith('treatmentCard') && rawFont === 'sans' ? 'inter' : rawFont;
    return {...brandStyle(key), ...documentMeta, 'data-vb-style-doc-id': documentId, 'data-vb-style-doc-type': 'servicePage',
      'data-vb-font-field': `${key}Font`, 'data-vb-size-field': `${key}Size`, 'data-vb-align-field': `${key}Align`,
      'data-vb-font-value': font, 'data-vb-size-value': values[`${key}Size`] ?? fallbackSize,
      'data-vb-align-value': values[`${key}Align`] || (key === 'buttonStyle' ? 'center' : 'left'), 'data-vb-label': label};
  };
  const order = serviceSectionOrder(page?.sectionOrder, fallback.kind === 'location');
  const sectionProps = (key: ServiceSectionKey) => ({...documentMeta, 'data-vb-section': key, style: {order: order.indexOf(key)}});
  const layoutProps = (key: ServiceSectionKey, label: string) => ({
    ...documentMeta, 'data-vb-style-doc-id': documentId, 'data-vb-style-doc-type': 'servicePage', 'data-vb-layout': 'true', 'data-vb-label': label,
    'data-vb-width-field': `${key}Width`, 'data-vb-x-field': `${key}OffsetX`, 'data-vb-y-field': `${key}OffsetY`,
    'data-vb-padding-field': `${key}PaddingY`, 'data-vb-block-height-field': `${key}Height`, 'data-vb-background-field': `${key}Background`,
    'data-vb-width-value': number(`${key}Width`, 100), 'data-vb-x-value': number(`${key}OffsetX`, 0), 'data-vb-y-value': number(`${key}OffsetY`, 0),
    'data-vb-padding-value': number(`${key}PaddingY`, key === 'hero' ? 24 : 32), 'data-vb-block-height-value': number(`${key}Height`, key === 'hero' ? 520 : 320),
    style: {
      ...(typeof page?.[`${key}Width`] === 'number' ? {width: `${number(`${key}Width`, 100)}%`} : {}),
      ...(typeof page?.[`${key}OffsetX`] === 'number' || typeof page?.[`${key}OffsetY`] === 'number' ? {transform: `translate(${number(`${key}OffsetX`, 0)}px, ${number(`${key}OffsetY`, 0)}px)`} : {}),
      ...(typeof page?.[`${key}PaddingY`] === 'number' ? {paddingTop: `${number(`${key}PaddingY`, 32)}px`, paddingBottom: `${number(`${key}PaddingY`, 32)}px`} : {}),
      ...(typeof page?.[`${key}Height`] === 'number' ? {minHeight: `${number(`${key}Height`, 320)}px`} : {}),
      ...(color(`${key}Background`) ? {backgroundColor: color(`${key}Background`)} : {}),
    } as CSSProperties,
  });
  const imageProps = {...documentMeta, 'data-vb-style-doc-id': documentId, 'data-vb-style-doc-type': 'servicePage',
    'data-vb-image-field': 'heroImage', 'data-vb-label': 'Imagem principal', 'data-vb-height-field': 'heroImageHeight',
    'data-vb-width-field': 'heroImageWidth', 'data-vb-x-field': 'heroImageOffsetX', 'data-vb-y-field': 'heroImageOffsetY',
    'data-vb-position-x-field': 'heroImagePositionX', 'data-vb-position-y-field': 'heroImagePositionY',
    'data-vb-height-value': number('heroImageHeight', 520), 'data-vb-width-value': number('heroImageWidth', 100),
    'data-vb-x-value': number('heroImageOffsetX', 0), 'data-vb-y-value': number('heroImageOffsetY', 0),
    'data-vb-position-x-value': number('heroImagePositionX', 50), 'data-vb-position-y-value': number('heroImagePositionY', 50),
    style: {width: `${number('heroImageWidth', 100)}%`, height: typeof page?.heroImageHeight === 'number' ? `${number('heroImageHeight', 520)}px` : '100%',
      objectFit: 'cover', objectPosition: `${number('heroImagePositionX', 50)}% ${number('heroImagePositionY', 50)}%`,
      transform: `translate(${number('heroImageOffsetX', 0)}px, ${number('heroImageOffsetY', 0)}px)`} as CSSProperties,
  };

  const content = {
    ...fallback,
    ...Object.fromEntries(Object.entries(page || {}).filter(([, value]) => value !== undefined && value !== null)),
    sections: page?.sections?.length ? page.sections : fallback.sections,
    faqs: page?.faqs?.length ? page.faqs : fallback.faqs,
    hours: page?.hours?.length ? page.hours : fallback.hours,
  };

  const brandName = clean(settings?.professionalName) || 'Dra. Heloisa Veiga';
  const subtitle = clean(settings?.brandSubtitle) || 'Odontologia estética · São Paulo';
  const logoUrl = clean(settings?.brandLogoUrl) || '/brand-hv.svg';
  const wa = whatsappLink(settings?.whatsapp, clean(content.title));
  const address = clean(content.address) || clean(settings?.clinicAddress) || DEFAULT_ADDRESS;
  const defaultMap = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const mapEmbed = clean(content.mapEmbedUrl) || defaultMap;

  const canonicalUrl = `${SITE_URL}/${slug}`;
  const instagram = clean(settings?.instagram);
  const mapReference = clean(settings?.mapsUrl) || `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
  const businessPhone = phoneInternational(settings?.whatsapp);
  const dentistSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': DENTIST_ID,
    name: brandName,
    url: SITE_URL + '/',
    telephone: businessPhone,
    address: {'@type': 'PostalAddress', streetAddress: address, addressLocality: 'São Paulo', addressRegion: 'SP', postalCode: '02013-002', addressCountry: 'BR'},
    areaServed: {'@type': 'City', name: 'São Paulo'},
    hasMap: mapReference,
    ...(clean(settings?.heroImageUrl) ? {image: clean(settings?.heroImageUrl)} : {}),
    ...(logoUrl ? {logo: absoluteUrl(logoUrl)} : {}),
    ...(instagram ? {sameAs: [instagram]} : {}),
    openingHoursSpecification: [{'@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '19:00'}],
  };
  const serviceSchema = content.kind === 'service' ? {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${canonicalUrl}#service`,
    name: clean(content.menuLabel) || clean(content.title),
    description: clean(content.intro),
    url: canonicalUrl,
    provider: {'@id': DENTIST_ID},
    areaServed: {'@type': 'City', name: 'São Paulo'},
  } : null;
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL + '/'},
      {'@type': 'ListItem', position: 2, name: clean(content.menuLabel) || clean(content.title), item: canonicalUrl},
    ],
  };

  const faqSchema = content.faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {'@type': 'Answer', text: item.answer},
    })),
  } : null;

  return (
    <>
      <SiteHeader
        brandName={brandName}
        subtitle={subtitle}
        logoUrl={logoUrl}
        navAboutLabel={clean(settings?.navAboutLabel) || 'Sobre'}
        navTreatmentsLabel={clean(settings?.navTreatmentsLabel) || 'Tratamentos'}
        navCasesLabel={clean(settings?.navCasesLabel) || 'Casos'}
        navContactLabel={clean(settings?.navContactLabel) || 'Contato'}
        brandNameStyle={headerTypographyStyle(settings?.brandNameFont, settings?.brandNameSize, settings?.brandNameAlign, 'sans', 15)}
        subtitleStyle={headerTypographyStyle(settings?.brandSubtitleStyleFont, settings?.brandSubtitleStyleSize, settings?.brandSubtitleStyleAlign, 'sans', 12)}
        navStyle={headerTypographyStyle(settings?.navStyleFont, settings?.navStyleSize, settings?.navStyleAlign, 'sans', 14)}
        categoryStyle={settingTypography(settings, 'navStyle', 'sans', 14, 'left', false)}
        brandNameProps={brandStyle('brandName')}
        subtitleProps={brandStyle('brandSubtitleStyle')}
        navAboutProps={brandStyle('navStyle')}
        navTreatmentsProps={brandStyle('navStyle')}
        navCasesProps={brandStyle('navStyle')}
        navContactProps={brandStyle('navStyle')}
      />
      <main className="service-page" data-vb-page-document-id={documentId} {...documentMeta} data-vb-layout="true" data-vb-background-field="pageBackground" data-vb-label="Fundo da página" style={{backgroundColor: color('pageBackground')}}>
        <nav className="container seo-breadcrumb" aria-label="Breadcrumb" {...pageStyle('navStyle')} style={settingTypography(pageStyles, 'navStyle', 'sans', 14)}>
          <a href="/">Início</a><span aria-hidden="true">/</span><span aria-current="page">{content.menuLabel}</span>
        </nav>
        <div className="service-page-sections">
        {content.kind === 'location' && (
          <section className="service-section location-overview location-overview-top" {...sectionProps('location')}>
            <div className="container location-grid" {...layoutProps('location', 'Localização · layout')}>
              <div>
                <span className="eyebrow" {...pageStyle('eyebrowStyle')} style={settingTypography(pageStyles, 'eyebrowStyle', 'sans', 12)} {...editProps(editingPage, 'locationEyebrow', 'Localização · chamada curta')}>{text('locationEyebrow', 'Consultório')}</span>
                <h2 className="section-title" {...pageStyle('treatmentsTitle')} style={settingTypography(pageStyles, 'treatmentsTitle', 'editorial', 56)} {...editProps(editingPage, 'locationTitle', 'Localização · título')}>{text('locationTitle', 'Localização e horário de atendimento')}</h2>
                <p className="location-address section-copy" {...pageStyle('treatmentsDescription')} style={settingTypography(pageStyles, 'treatmentsDescription', 'sans', 16)} {...editProps(editingPage, 'address', 'Endereço')}>{address}</p>
                <div className="hours-list">{(content.hours || []).map((hour, index) => <p key={index} {...editProps(editingPage, `hours[${index}]`, 'Horário de atendimento')} {...pageStyle('treatmentCardBodyStyle')} style={settingTypography(pageStyles, 'treatmentCardBodyStyle', 'sans', 16)}>{hour}</p>)}</div>
                <a className="btn btn-primary" {...pageStyle('buttonStyle')} style={settingTypography(pageStyles, 'buttonStyle', 'sans', 14, 'center')} href={wa} target="_blank" rel="noreferrer" {...editProps(editingPage, 'locationCtaLabel', 'Localização · botão')}>{text('locationCtaLabel', 'Consultar agenda no WhatsApp')}</a>
              </div>
              <div className="map-shell">
                <iframe title="Mapa do consultório da Dra. Heloisa Veiga" src={mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </div>
            </div>
          </section>
        )}

        <section className="service-hero" {...sectionProps('hero')}>
          <div className={`container service-hero-grid${content.kind === 'location' ? ' service-hero-location' : ''}`} {...layoutProps('hero', 'Primeiro bloco · layout')}>
            <div className="hero-card service-hero-copy">
              <span className="eyebrow" {...pageStyle('eyebrowStyle')} style={settingTypography(pageStyles, 'eyebrowStyle', 'sans', 12)} {...editProps(editingPage, 'eyebrow', 'Chamada curta')}>{content.eyebrow}</span>
              <h1 {...pageStyle('heroTitle')} style={settingTypography(pageStyles, 'heroTitle', 'editorial', 67)} {...editProps(editingPage, 'title', 'Título principal')}>{content.title}</h1>
              <p {...pageStyle('heroDescription')} style={settingTypography(pageStyles, 'heroDescription', 'sans', 16)} {...editProps(editingPage, 'intro', 'Introdução')}>{content.intro}</p>
              <div className="service-actions">
                <a className="btn btn-primary" {...pageStyle('buttonStyle')} style={settingTypography(pageStyles, 'buttonStyle', 'sans', 14, 'center')} href={wa} target="_blank" rel="noreferrer" {...editProps(editingPage, 'ctaLabel', 'Botão principal')}>{clean(content.ctaLabel) || 'Falar no WhatsApp'}</a>
                {settings?.mapsUrl && <a className="btn btn-secondary" {...pageStyle('buttonStyle')} style={settingTypography(pageStyles, 'buttonStyle', 'sans', 14, 'center')} href={clean(settings.mapsUrl)} target="_blank" rel="noreferrer" {...editProps(editingPage, 'mapsCtaLabel', 'Botão · como chegar')}>{text('mapsCtaLabel', 'Como chegar')}</a>}
              </div>
            </div>
            {content.kind !== 'location' && (
              <div className="service-hero-media" style={typeof page?.heroImageHeight === 'number' ? {height: number('heroImageHeight', 520), minHeight: number('heroImageHeight', 520), alignSelf: 'center'} : undefined}>
                {page?.heroImageUrl ? (
                  <img src={clean(page.heroImageUrl)} alt={clean(content.title)} className="service-page-hero-image" {...imageProps} />
                ) : illustration ? (
                  <figure className="service-illustration">
                    <Image src={illustration.src} alt={illustration.alt} width={1120} height={1400} className="service-page-hero-image" {...imageProps} sizes="(max-width: 820px) 100vw, (max-width: 1080px) 43vw, 480px" priority />
                  </figure>
                ) : (
                  <div className="service-image-placeholder"><span>Imagem do procedimento</span><small>Adicione no Studio quando desejar</small></div>
                )}
              </div>
            )}
          </div>
        </section>


        <section className="service-section" {...sectionProps('content')}>
          <div className="container service-content-grid" {...layoutProps('content', 'Blocos de conteúdo · layout')}>
            {content.sections.map((section, index) => (
              <article className="service-content-card" key={section.heading + index}>
                <span className="service-index">{String(index + 1).padStart(2, '0')}</span>
                <h2 {...pageStyle('treatmentCardTitleStyle')} style={settingTypography(pageStyles, 'treatmentCardTitleStyle', 'editorial', 26)} {...editProps(editingPage, `sections[${index}].heading`, 'Título do bloco')}>{section.heading}</h2>
                <p {...pageStyle('treatmentCardBodyStyle')} style={settingTypography(pageStyles, 'treatmentCardBodyStyle', 'sans', 16)} {...editProps(editingPage, `sections[${index}].body`, 'Texto do bloco')}>{section.body}</p>
                {!!section.bullets?.length && <ul>{section.bullets.map((bullet, bulletIndex) => <li key={bulletIndex} {...editProps(editingPage, `sections[${index}].bullets[${bulletIndex}]`, 'Ponto de apoio')} {...pageStyle('treatmentCardBodyStyle')} style={settingTypography(pageStyles, 'treatmentCardBodyStyle', 'sans', 16)}>{bullet}</li>)}</ul>}
              </article>
            ))}
          </div>
        </section>

        {!!content.faqs.length && (
          <section className="service-section faq-section" {...sectionProps('faq')}>
            <div className="container faq-wrap" {...layoutProps('faq', 'Perguntas frequentes · layout')}>
              <span className="eyebrow" {...pageStyle('eyebrowStyle')} style={settingTypography(pageStyles, 'eyebrowStyle', 'sans', 12)} {...editProps(editingPage, 'faqEyebrow', 'Perguntas frequentes · chamada curta')}>{text('faqEyebrow', 'Perguntas frequentes')}</span>
              <h2 className="section-title" {...pageStyle('treatmentsTitle')} style={settingTypography(pageStyles, 'treatmentsTitle', 'editorial', 56)} {...editProps(editingPage, 'faqTitle', 'Perguntas frequentes · título')}>{text('faqTitle', `Dúvidas comuns sobre ${content.menuLabel.toLowerCase()}`)}</h2>
              <div className="faq-list">
                {content.faqs.map((faq, index) => (
                  <details key={faq.question}>
                    <summary {...pageStyle('treatmentCardTitleStyle')} style={settingTypography(pageStyles, 'treatmentCardTitleStyle', 'editorial', 26)} {...editProps(editingPage, `faqs[${index}].question`, 'Pergunta')}>{faq.question}</summary>
                    <p {...pageStyle('treatmentCardBodyStyle')} style={settingTypography(pageStyles, 'treatmentCardBodyStyle', 'sans', 16)} {...editProps(editingPage, `faqs[${index}].answer`, 'Resposta')}>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {content.kind === 'service' && (
          <section className="service-review-section" {...sectionProps('review')}>
            <div className="container service-review-card" {...layoutProps('review', 'Revisão profissional · layout')}>
              <div>
                <span className="eyebrow" {...pageStyle('eyebrowStyle')} style={settingTypography(pageStyles, 'eyebrowStyle', 'sans', 12)}>Revisão profissional</span>
                <h2 {...pageStyle('treatmentCardTitleStyle')} style={settingTypography(pageStyles, 'treatmentCardTitleStyle', 'editorial', 26)}>Conteúdo revisado por {brandName}</h2>
                <p {...pageStyle('treatmentCardBodyStyle')} style={settingTypography(pageStyles, 'treatmentCardBodyStyle', 'sans', 16)}>
                  Cirurgiã-dentista{settings?.cro ? ` · ${clean(settings.cro)}` : ''}. O conteúdo tem caráter informativo e não substitui avaliação clínica individual.
                </p>
              </div>
              {page?._updatedAt && <p className="service-reviewed-date" {...pageStyle('footerStyle')} style={settingTypography(pageStyles, 'footerStyle', 'sans', 14)}>Atualizado em {new Intl.DateTimeFormat('pt-BR', {month: 'long', year: 'numeric'}).format(new Date(page._updatedAt))}</p>}
            </div>
          </section>
        )}

        </div>
        <nav className="container service-next-links" aria-label="Outros conteúdos">
          {serviceRelatedItems.filter((item) => item.href !== '/' + slug).map((item) => (
            <a href={item.href} key={item.href} {...pageStyle('navStyle')} style={settingTypography(pageStyles, 'navStyle', 'sans', 14)}>{item.label}</a>
          ))}
        </nav>
      </main>

      <footer className="site-footer service-footer">
        <div className="container footer-inner" {...pageStyle('footerStyle')} style={settingTypography(pageStyles, 'footerStyle', 'sans', 14)}>
          <p>{brandName}{settings?.cro ? ` · ${clean(settings.cro)}` : ''}</p>
          <p>{address} · {businessPhone}</p>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(dentistSchema)}} />
      {serviceSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />}
      <SanityLive />

      <aside className="social-float" aria-label="Canais de contato">
        <a className="social-float-link social-float-whatsapp" href={wa} target="_blank" rel="noreferrer" aria-label="Falar com a Dra. Heloisa no WhatsApp" title="WhatsApp">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .2 5.3.2 11.9c0 2.1.6 4.2 1.7 6L0 24l6.3-1.7a12 12 0 0 0 5.8 1.5h.1C18.7 23.8 24 18.5 24 12A11.9 11.9 0 0 0 20.5 3.5Zm-8.4 18.3h-.1a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12.1 21.8Zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.7-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z"/></svg>
        </a>
        {instagram && <a className="social-float-link social-float-instagram" href={instagram} target="_blank" rel="noreferrer" aria-label="Abrir Instagram da Dra. Heloisa" title="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.8 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>
        </a>}
      </aside>
    </>
  );
}
