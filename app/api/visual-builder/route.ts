import {draftMode} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {stegaClean} from 'next-sanity';
import {ensureDraftDocument, mutationClient} from '@/sanity/lib/mutations';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://helo-sable-five.vercel.app';

const allowedFields: Record<string, Set<string>> = {
  siteSettings: new Set([
    'professionalName',
    'brandSubtitle',
    'clinicAddress',
    'heroEyebrow',
    'heroTitle',
    'heroDescription',
    'aboutEyebrow',
    'aboutTitle',
    'aboutDescription',
    'treatmentsTitle',
    'treatmentsDescription',
    'casesTitle',
    'casesDescription',
    'contactTitle',
    'contactDescription',
    'sectionOrder',
    'heroTitleFont',
    'heroTitleSize',
    'heroDescriptionFont',
    'heroDescriptionSize',
    'aboutTitleFont',
    'aboutTitleSize',
    'aboutDescriptionFont',
    'aboutDescriptionSize',
    'treatmentsTitleFont',
    'treatmentsTitleSize',
    'treatmentsDescriptionFont',
    'treatmentsDescriptionSize',
    'casesTitleFont',
    'casesTitleSize',
    'casesDescriptionFont',
    'casesDescriptionSize',
    'contactTitleFont',
    'contactTitleSize',
    'contactDescriptionFont',
    'contactDescriptionSize',
  ]),
  treatment: new Set(['title', 'summary']),
  caseStudy: new Set(['title', 'description']),
};

const fontValues = new Set(['editorial', 'sans', 'classic']);
const sectionValues = new Set(['hero', 'about', 'treatments', 'cases', 'contact']);

function validateOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(siteUrl).origin;
}

function cleanValue(field: string, value: unknown) {
  if (field === 'sectionOrder') {
    if (!Array.isArray(value) || value.length !== 5) throw new Error('Invalid section order');
    const clean = value.map(String);
    if (new Set(clean).size !== 5 || clean.some((item) => !sectionValues.has(item))) {
      throw new Error('Invalid section order');
    }
    return clean;
  }

  if (field.endsWith('Font')) {
    const clean = String(value);
    if (!fontValues.has(clean)) throw new Error('Invalid font');
    return clean;
  }

  if (field.endsWith('Size')) {
    const clean = Number(value);
    if (!Number.isFinite(clean) || clean < 12 || clean > 96) throw new Error('Invalid font size');
    return Math.round(clean);
  }

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
    const value = cleanValue(field, body.value);
    const result = await mutationClient.patch(draftId).set({[field]: value}).commit();

    return NextResponse.json({ok: true, documentId: result._id, field, value});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save change';
    return NextResponse.json({error: message}, {status: 500});
  }
}
