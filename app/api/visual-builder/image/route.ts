import {draftMode} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {ensureDraftDocument, mutationClient} from '@/sanity/lib/mutations';

export const runtime = 'nodejs';

const allowedImages: Record<string, Set<string>> = {
  siteSettings: new Set(['brandLogo', 'heroImage']),
  treatment: new Set(['image']),
  caseStudy: new Set(['beforeImage', 'afterImage']),
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

function validateOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const {isEnabled} = await draftMode();
  if (!isEnabled || !validateOrigin(request)) {
    return NextResponse.json({error: 'Image editing is only available in authenticated preview mode.'}, {status: 403});
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    const documentId = String(form.get('documentId') || '');
    const documentType = String(form.get('documentType') || '');
    const field = String(form.get('field') || '');

    if (!(file instanceof File) || !file.type.startsWith('image/')) {
      return NextResponse.json({error: 'Select a valid image file.'}, {status: 400});
    }
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        {error: 'A imagem excede o limite seguro de upload. O editor tenta otimizar arquivos grandes automaticamente; tente novamente ou use um arquivo menor.'},
        {status: 413},
      );
    }
    if (!documentId || !allowedImages[documentType]?.has(field)) {
      return NextResponse.json({error: 'This image is not editable in Visual Builder.'}, {status: 400});
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await mutationClient.assets.upload('image', buffer, {
      filename: file.name || 'visual-builder-image',
      contentType: file.type,
    });

    await mutationClient.patch(draftId).set({
      [field]: {
        _type: 'image',
        asset: {_type: 'reference', _ref: asset._id},
      },
    }).commit();

    return NextResponse.json({ok: true, url: asset.url, assetId: asset._id});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload image';
    console.error('[visual-builder:image] upload failed', {
      message,
      name: error instanceof Error ? error.name : 'unknown',
    });
    return NextResponse.json({error: message}, {status: 500});
  }
}
