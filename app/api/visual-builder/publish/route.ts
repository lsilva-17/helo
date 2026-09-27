import {draftMode} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {assertMutationToken, mutationClient} from '@/sanity/lib/mutations';

export const runtime = 'nodejs';

function validateOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return !origin || origin === request.nextUrl.origin;
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
    const draft = await mutationClient.getDocument(draftId);

    if (!draft) {
      return NextResponse.json(
        {error: 'Nenhuma alteração pendente foi encontrada. Aguarde o salvamento do rascunho e tente novamente.'},
        {status: 409},
      );
    }

    await mutationClient.action({
      actionType: 'sanity.action.document.publish',
      publishedId,
      draftId,
    });

    return NextResponse.json({ok: true, publishedId});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao publicar alterações.';
    console.error('[visual-builder:publish] failed', {message});
    return NextResponse.json({error: message}, {status: 500});
  }
}
