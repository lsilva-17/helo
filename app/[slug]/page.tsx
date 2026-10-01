import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {stegaClean} from 'next-sanity';
import {sanityFetch, SanityLive} from '@/sanity/lib/live';
import {SiteHeader} from '@/app/components/SiteHeader';
import {servicePageFallbacks, serviceMenuItems, type ServiceFaq, type ServiceSection} from '@/app/lib/servicePages';

type PageDoc = {
  _id?: string;
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
  professionalName?: string;
  brandSubtitle?: string;
  brandLogoUrl?: string;
  whatsapp?: string;
  instagram?: string;
  clinicAddress?: string;
  mapsUrl?: string;
};

type PagePayload = {page: PageDoc | null; settings: SiteSettings | null};

const pageQuery = `{
  "page": *[_type == "servicePage" && slug.current == $slug][0]{
    _id, menuLabel, "slug": slug.current, pageKind, eyebrow, title, intro, sections, faqs,
    ctaTitle, ctaBody, ctaLabel, "heroImageUrl": heroImage.asset->url,
    "caseImages": caseImages[]{"url": asset->url, alt},
    address, hours, mapEmbedUrl, seoTitle, seoDescription
  },
  "settings": *[_type == "siteSettings" && _id == "143778fa-0f7b-4e2b-9f1b-d34bdce5907d"][0]{
    professionalName, brandSubtitle, "brandLogoUrl": brandLogo.asset->url,
    whatsapp, instagram, clinicAddress, mapsUrl
  }
}`;

function clean(value?: string) {
  return value ? stegaClean(value) : undefined;
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
  const {page} = await getPage(slug);
  const title = clean(page?.seoTitle) || fallback.seoTitle;
  const description = clean(page?.seoDescription) || fallback.seoDescription;
  return {
    title,
    description,
    alternates: {canonical: `/${slug}`},
    openGraph: {title, description, url: `https://draheloisaveiga.vercel.app/${slug}`, type: 'website'},
  };
}

export default async function ServicePage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const fallback = servicePageFallbacks[slug];
  if (!fallback) notFound();

  const {page, settings} = await getPage(slug);
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
  const address = clean(content.address) || clean(settings?.clinicAddress) || 'Rua Dr. César, 530 - Conj 106 - Santana, São Paulo - SP, 02013-002';
  const defaultMap = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const mapEmbed = clean(content.mapEmbedUrl) || defaultMap;

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: brandName,
    url: 'https://draheloisaveiga.vercel.app/',
    telephone: '+55 11 98731-2961',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Dr. César, 530 - Conj 106',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      postalCode: '02013-002',
      addressCountry: 'BR',
    },
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
      <SiteHeader brandName={brandName} subtitle={subtitle} logoUrl={logoUrl} />
      <main className="service-page">
        <section className="service-hero">
          <div className="container service-hero-grid">
            <div className="service-hero-copy">
              <span className="eyebrow" {...editProps(page, 'eyebrow', 'Chamada curta')}>{content.eyebrow}</span>
              <h1 {...editProps(page, 'title', 'Título principal')}>{content.title}</h1>
              <p {...editProps(page, 'intro', 'Introdução')}>{content.intro}</p>
              <div className="service-actions">
                <a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer">{clean(content.ctaLabel) || 'Falar no WhatsApp'}</a>
                {settings?.mapsUrl && <a className="btn btn-secondary" href={clean(settings.mapsUrl)} target="_blank" rel="noreferrer">Como chegar</a>}
              </div>
            </div>
            <div className="service-hero-media">
              {page?.heroImageUrl ? (
                <img src={clean(page.heroImageUrl)} alt={clean(content.title)} data-vb-doc-id={page._id?.replace(/^drafts\./, '')} data-vb-doc-type="servicePage" data-vb-image-field="heroImage" data-vb-label="Imagem principal" />
              ) : (
                <div className="service-image-placeholder"><span>Imagem do procedimento</span><small>Adicione no Studio quando desejar</small></div>
              )}
            </div>
          </div>
        </section>

        {content.kind === 'location' && (
          <section className="service-section location-overview">
            <div className="container location-grid">
              <div>
                <span className="eyebrow">Consultório</span>
                <h2>Localização e horário de atendimento</h2>
                <p className="location-address">{address}</p>
                <div className="hours-list">{(content.hours || []).map((hour) => <p key={hour}>{hour}</p>)}</div>
                <a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer">Consultar agenda no WhatsApp</a>
              </div>
              <div className="map-shell">
                <iframe title="Mapa do consultório da Dra. Heloisa Veiga" src={mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </div>
            </div>
          </section>
        )}

        <section className="service-section">
          <div className="container service-content-grid">
            {content.sections.map((section, index) => (
              <article className="service-content-card" key={section.heading + index}>
                <span className="service-index">{String(index + 1).padStart(2, '0')}</span>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
                {!!section.bullets?.length && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
              </article>
            ))}
          </div>
        </section>

        {content.kind === 'service' && (
          <section className="service-section cases-placeholder-section">
            <div className="container">
              <span className="eyebrow">Casos e imagens</span>
              <div className="service-section-heading">
                <h2>Espaço para casos clínicos e detalhes do procedimento</h2>
                <p>As imagens podem ser adicionadas depois pelo Studio, mantendo o conteúdo atual intacto.</p>
              </div>
              <div className="service-case-grid">
                {page?.caseImages?.length ? page.caseImages.map((image, index) => (
                  <figure key={(image.url || '') + index}>
                    <img src={clean(image.url)} alt={clean(image.alt) || `Caso clínico relacionado a ${clean(content.menuLabel)}`} />
                    {image.alt && <figcaption>{image.alt}</figcaption>}
                  </figure>
                )) : [1, 2, 3].map((item) => (
                  <div className="service-case-placeholder" key={item}><span>Adicionar imagem / case</span></div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!!content.faqs.length && (
          <section className="service-section faq-section">
            <div className="container faq-wrap">
              <span className="eyebrow">Perguntas frequentes</span>
              <h2>Dúvidas comuns sobre {content.menuLabel.toLowerCase()}</h2>
              <div className="faq-list">
                {content.faqs.map((faq) => (
                  <details key={faq.question}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="service-section service-cta-section">
          <div className="container service-cta">
            <div>
              <span className="eyebrow">Contato</span>
              <h2 {...editProps(page, 'ctaTitle', 'CTA · título')}>{content.ctaTitle}</h2>
              <p {...editProps(page, 'ctaBody', 'CTA · texto')}>{content.ctaBody}</p>
            </div>
            <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer">{clean(content.ctaLabel) || 'Falar no WhatsApp'}</a>
          </div>
        </section>

        <nav className="container service-next-links" aria-label="Outros conteúdos">
          {serviceMenuItems.filter((item) => item.href !== '/' && item.href !== '/' + slug).map((item) => (
            <a href={item.href} key={item.href}>{item.label}</a>
          ))}
        </nav>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>{brandName}</p>
          <p>São Paulo, SP</p>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(localBusiness)}} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />}
      <SanityLive />
    </>
  );
}
