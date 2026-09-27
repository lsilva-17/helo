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

function publishedIdFromDraft(draftId: string) {
  return draftId.replace(/^drafts\./, '');
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

    const [primaryDraft, visualDrafts] = await Promise.all([
      mutationClient.fetch<Record<string, unknown> | null>(
        '*[_id == $draftId][0]',
        {draftId},
        {perspective: 'raw'},
      ),
      mutationClient.fetch<Record<string, unknown>[]>(
        '*[_id match "drafts.*" && _type in ["treatment","caseStudy"]]{...}',
        {},
        {perspective: 'raw'},
      ),
    ]);

    const drafts = [
      ...(primaryDraft ? [primaryDraft] : []),
      ...visualDrafts.filter((draft) => draft._id !== draftId),
    ];

    if (!drafts.length) {
      return NextResponse.json(
        {
          error: 'Nenhuma alteração pendente foi encontrada. Aguarde o indicador “Salvo” no construtor visual e tente novamente.',
          documentId: publishedId,
          draftId,
        },
        {status: 409},
      );
    }

    let transaction = mutationClient.transaction();

    for (const draft of drafts) {
      const sourceDraftId = String(draft._id || '');
      if (!sourceDraftId.startsWith('drafts.')) continue;
      const targetId = publishedIdFromDraft(sourceDraftId);
      const publishedDocument = {
        ...publishableContent(draft),
        _id: targetId,
        _type: String(draft._type || 'siteSettings'),
      };

      transaction = transaction
        .createOrReplace(publishedDocument)
        .delete(sourceDraftId);
    }

    const result = await transaction.commit();

    return NextResponse.json({
      ok: true,
      publishedId,
      draftId,
      publishedDocuments: drafts.map((draft) => publishedIdFromDraft(String(draft._id || ''))),
      transactionId: result.transactionId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao publicar alterações.';
    console.error('[visual-builder:publish] failed', {message});
    return NextResponse.json({error: message}, {status: 500});
  }
}
