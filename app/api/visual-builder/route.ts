import {draftMode} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {stegaClean} from 'next-sanity';
import {ensureDraftDocument, mutationClient} from '@/sanity/lib/mutations';

const contentFields = [
  'professionalName', 'brandSubtitle', 'clinicAddress',
  'navAboutLabel', 'navTreatmentsLabel', 'navCasesLabel', 'navContactLabel',
  'heroEyebrow', 'heroTitle', 'heroDescription', 'primaryCtaLabel', 'instagramCtaLabel',
  'aboutEyebrow', 'aboutTitle', 'aboutDescription',
  'trust1Title', 'trust1Body', 'trust2Title', 'trust2Body', 'trust3Title', 'trust3Body',
  'treatmentsEyebrow', 'treatmentsTitle', 'treatmentsDescription',
  'casesEyebrow', 'casesTitle', 'casesDescription', 'beforeLabel', 'afterLabel',
  'contactEyebrow', 'contactTitle', 'contactDescription', 'whatsappCtaLabel', 'mapsCtaLabel',
  'footerLocation', 'sectionOrder',
] as const;

const typographyKeys = [
  'brandName', 'brandSubtitleStyle', 'navStyle', 'eyebrowStyle', 'buttonStyle',
  'heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription', 'trustTitleStyle', 'trustBodyStyle',
  'treatmentsTitle', 'treatmentsDescription', 'treatmentCardTitleStyle', 'treatmentCardBodyStyle',
  'casesTitle', 'casesDescription', 'caseLabelStyle', 'caseCardTitleStyle', 'caseCardBodyStyle',
  'contactTitle', 'contactDescription', 'footerStyle',
] as const;

const sectionKeys = ['hero', 'about', 'treatments', 'cases', 'contact'] as const;

const layoutFields = [
  ...sectionKeys.flatMap((key) => [`${key}Width`, `${key}OffsetX`, `${key}OffsetY`, `${key}PaddingY`, `${key}Background`]),
  'heroImageWidth', 'heroImageOffsetX', 'heroImageOffsetY',
  'heroImageHeight', 'heroImagePositionX', 'heroImagePositionY',
  'treatmentImageHeight', 'treatmentImagePositionX', 'treatmentImagePositionY',
  'caseImageHeight', 'caseImagePositionX', 'caseImagePositionY',
];

const styleFields = typographyKeys.flatMap((key) => [`${key}Font`, `${key}Size`, `${key}Align`, `${key}Color`]);

const allowedFields: Record<string, Set<string>> = {
  siteSettings: new Set([...contentFields, ...layoutFields, ...styleFields]),
  treatment: new Set(['title', 'summary']),
  caseStudy: new Set(['title', 'description']),
};

const fallbackTreatments: Record<string, {title: string; summary: string; order: number}> = {
  facetas: {
    title: 'Facetas em resina',
    summary: 'Planejamento estético para transformar forma, proporção e harmonia do sorriso.',
    order: 1,
  },
  clareamento: {
    title: 'Clareamento dental',
    summary: 'Estratégias de clareamento indicadas de acordo com a avaliação clínica.',
    order: 2,
  },
  avaliacao: {
    title: 'Avaliação estética',
    summary: 'Consulta para entender objetivos, possibilidades e construir um plano individualizado.',
    order: 3,
  },
};

const fontValues = new Set([
  'editorial', 'sans', 'classic', 'arial', 'roboto', 'inter', 'opensans', 'montserrat',
  'poppins', 'dmsans', 'lato', 'playfair', 'lora', 'merriweather',
]);
const alignValues = new Set(['left', 'center', 'right']);
const sectionValues = new Set(sectionKeys);

function validateOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return !origin || origin === request.nextUrl.origin;
}

function boundedNumber(value: unknown, min: number, max: number, label: string) {
  const clean = Number(value);
  if (!Number.isFinite(clean) || clean < min || clean > max) throw new Error(`Invalid ${label}`);
  return Math.round(clean);
}

function cleanColor(value: unknown) {
  const clean = String(value).trim();
  if (!/^#[0-9a-f]{6}$/i.test(clean)) throw new Error('Invalid color');
  return clean.toLowerCase();
}

function cleanValue(field: string, value: unknown) {
  if (field === 'sectionOrder') {
    if (!Array.isArray(value) || value.length !== 5) throw new Error('Invalid section order');
    const clean = value.map(String);
    if (new Set(clean).size !== 5 || clean.some((item) => !sectionValues.has(item as typeof sectionKeys[number]))) {
      throw new Error('Invalid section order');
    }
    return clean;
  }

  if (field.endsWith('Font')) {
    const clean = String(value);
    if (!fontValues.has(clean)) throw new Error('Invalid font');
    return clean;
  }

  if (field.endsWith('Align')) {
    const clean = String(value);
    if (!alignValues.has(clean)) throw new Error('Invalid alignment');
    return clean;
  }

  if (field.endsWith('Color') || field.endsWith('Background')) return cleanColor(value);
  if (field.endsWith('Size')) return boundedNumber(value, 10, 110, 'font size');
  if (field.endsWith('Width')) return boundedNumber(value, 60, 100, 'width');
  if (field.endsWith('OffsetX')) return boundedNumber(value, -100, 100, 'horizontal offset');
  if (field.endsWith('OffsetY')) return boundedNumber(value, -80, 80, 'vertical offset');
  if (field.endsWith('PaddingY')) return boundedNumber(value, 16, 160, 'spacing');
  if (field.endsWith('ImageHeight')) return boundedNumber(value, 160, 720, 'image height');
  if (field.endsWith('PositionX') || field.endsWith('PositionY')) return boundedNumber(value, 0, 100, 'image focal point');

  if (typeof value !== 'string') throw new Error('Invalid text value');
  return stegaClean(value).slice(0, 5000);
}

export async function PATCH(request: NextRequest) {
  const {isEnabled} = await draftMode();
  if (!isEnabled || !validateOrigin(request)) {
    return NextResponse.json({error: 'Visual Builder is only available in authenticated preview mode.'}, {status: 403});
  }

  try {
    const body = (await request.json()) as {
      documentId?: string;
      documentType?: string;
      field?: string;
      value?: unknown;
    };

    const documentId = body.documentId || '';
    const documentType = body.documentType || '';
    const field = body.field || '';

    if (!documentId || !allowedFields[documentType]?.has(field)) {
      return NextResponse.json({error: 'Field is not editable in Visual Builder.'}, {status: 400});
    }

    const draftId = await ensureDraftDocument(documentId, documentType);

    if (documentType === 'treatment' && fallbackTreatments[documentId]) {
      const defaults = fallbackTreatments[documentId];
      await mutationClient.patch(draftId).setIfMissing({
        featured: true,
        order: defaults.order,
        title: defaults.title,
        summary: defaults.summary,
      }).commit();
    }

    const value = cleanValue(field, body.value);
    const result = await mutationClient.patch(draftId).set({[field]: value}).commit();

    return NextResponse.json({ok: true, documentId: result._id, field, value});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save change';
    return NextResponse.json({error: message}, {status: 500});
  }
}
