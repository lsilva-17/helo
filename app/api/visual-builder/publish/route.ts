import {draftMode} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {assertMutationToken, mutationClient} from '@/sanity/lib/mutations';

export const runtime = 'nodejs';

function validateOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return !origin || origin === request.nextUrl.origin;
}

function publishableContent(document: Record<string, unknown>) {
  const {
    _id: _ignoredId,
    _rev: _ignoredRev,
    _createdAt: _ignoredCreatedAt,
    _updatedAt: _ignoredUpdatedAt,
    ...content
  } = document;
  return content;
}

export async function POST(request: NextRequest) {
  const {isEnabled} = await draftMode();

  if (!isEnabled || !validateOrigin(request)) {
    return NextResponse.json(
      {error: 'A publicação só está disponível no Studio/Preview autenticado.'},
      {status: 403},
    );
  }

  try {
    assertMutationToken();

    const body = (await request.json()) as {documentId?: string};
    const publishedId = String(body.documentId || '').replace(/^drafts\./, '');
    if (!publishedId) {
      return NextResponse.json({error: 'Documento inválido.'}, {status: 400});
    }

    const draftId = `drafts.${publishedId}`;

    const draft = await mutationClient.fetch<Record<string, unknown> | null>(
      '*[_id == $draftId][0]',
      {draftId},
      {perspective: 'raw'},
    );

    if (!draft) {
      return NextResponse.json(
        {
          error: 'Nenhuma alteração pendente foi encontrada. Aguarde o indicador “Salvo” no construtor visual e tente novamente.',
          documentId: publishedId,
          draftId,
        },
        {status: 409},
      );
    }

    const publishedDocument = {
      ...publishableContent(draft),
      _id: publishedId,
      _type: String(draft._type || 'siteSettings'),
    };

    const result = await mutationClient
      .transaction()
      .createOrReplace(publishedDocument)
      .delete(draftId)
      .commit();

    return NextResponse.json({
      ok: true,
      publishedId,
      draftId,
      transactionId: result.transactionId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao publicar alterações.';
    console.error('[visual-builder:publish] failed', {message});
    return NextResponse.json({error: message}, {status: 500});
  }
}
