import {draftMode} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {ensureDraftDocument, mutationClient} from '@/sanity/lib/mutations';

export const runtime = 'nodejs';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://helo-sable-five.vercel.app';
const allowedImages: Record<string, Set<string>> = {
  siteSettings: new Set(['heroImage']),
  treatment: new Set(['image']),
  caseStudy: new Set(['beforeImage', 'afterImage']),
};

function validateOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(siteUrl).origin;
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
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({error: 'Image must be smaller than 12 MB.'}, {status: 400});
    }
    if (!documentId || !allowedImages[documentType]?.has(field)) {
      return NextResponse.json({error: 'This image is not editable in Visual Builder.'}, {status: 400});
    }

    const draftId = await ensureDraftDocument(documentId, documentType);
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
    return NextResponse.json({error: message}, {status: 500});
  }
}
