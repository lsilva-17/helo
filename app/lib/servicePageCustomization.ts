import {servicePageFallbacks} from './servicePages';

export const serviceTypographyKeys = [
  'navStyle', 'eyebrowStyle', 'heroTitle', 'heroDescription', 'buttonStyle',
  'treatmentsTitle', 'treatmentsDescription', 'treatmentCardTitleStyle',
  'treatmentCardBodyStyle', 'footerStyle',
] as const;
export const serviceSectionKeys = ['hero', 'content', 'faq', 'review', 'location'] as const;
export type ServiceSectionKey = typeof serviceSectionKeys[number];
export const serviceStyleFields = serviceTypographyKeys.flatMap(key => ['Font', 'Size', 'Align', 'Color'].map(suffix => `${key}${suffix}`));
export const serviceLayoutFields = [
  ...serviceSectionKeys.flatMap(key => ['Width', 'OffsetX', 'OffsetY', 'PaddingY', 'Height', 'Background'].map(suffix => `${key}${suffix}`)),
  'pageBackground', 'heroImageWidth', 'heroImageOffsetX', 'heroImageOffsetY',
  'heroImageHeight', 'heroImagePositionX', 'heroImagePositionY', 'sectionOrder',
];
export const serviceContentFields = ['eyebrow', 'title', 'intro', 'ctaLabel', 'address', 'faqEyebrow', 'faqTitle', 'locationEyebrow', 'locationTitle', 'locationCtaLabel', 'mapsCtaLabel'];

export function servicePageId(slug: string) { return `service-${slug}`; }

export function servicePageDefaults(documentId: string, document?: Record<string, unknown> | null) {
  const id = documentId.replace(/^drafts\./, '');
  const slugValue = document?.slug as {current?: string} | undefined;
  const slug = slugValue?.current || (id.startsWith('service-') ? id.slice('service-'.length) : '');
  const fallback = servicePageFallbacks[slug];
  if (!fallback) return null;
  const {kind, seoTitle, seoDescription, ...content} = fallback;
  return {
    ...content,
    _type: 'servicePage',
    slug: {_type: 'slug', current: slug},
    pageKind: kind,
    seoTitle, seoDescription,
    ctaLabel: fallback.ctaLabel || 'Falar no WhatsApp',
    faqEyebrow: 'Perguntas frequentes', faqTitle: `Dúvidas comuns sobre ${fallback.menuLabel.toLowerCase()}`,
    locationEyebrow: 'Consultório', locationTitle: 'Localização e horário de atendimento',
    locationCtaLabel: 'Consultar agenda no WhatsApp', mapsCtaLabel: 'Como chegar',
    sections: fallback.sections.map((section, index) => ({...section, _type: 'object', _key: `section-${index}`})),
    faqs: fallback.faqs.map((faq, index) => ({...faq, _type: 'object', _key: `faq-${index}`})),
  };
}

export function isServiceEditableField(field: string) {
  return [...serviceContentFields, ...serviceStyleFields, ...serviceLayoutFields].includes(field)
    || /^(sections\[\d+\]\.(heading|body|bullets\[\d+\])|faqs\[\d+\]\.(question|answer)|hours\[\d+\])$/.test(field);
}

export function serviceSectionOrder(order: unknown, isLocation = false): ServiceSectionKey[] {
  const defaults: ServiceSectionKey[] = isLocation ? ['location', 'hero', 'content', 'faq', 'review'] : [...serviceSectionKeys];
  const saved = Array.isArray(order) ? order.filter((key): key is ServiceSectionKey => defaults.includes(key)) : [];
  return [...new Set([...saved, ...defaults])];
}
