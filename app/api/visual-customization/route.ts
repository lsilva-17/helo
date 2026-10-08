import {NextResponse} from 'next/server';
import {draftMode} from 'next/headers';
import {createClient} from 'next-sanity';
import {randomUUID} from 'node:crypto';
import {ensureDraftDocument, mutationClient} from '@/sanity/lib/mutations';
import {servicePageDefaults} from '@/app/lib/servicePageCustomization';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2026-09-01';
const SITE_SETTINGS_ID = '143778fa-0f7b-4e2b-9f1b-d34bdce5907d';

type ButtonStyle = {_key?: string; key: string; label?: string; background?: string; text?: string};
type TextWidth = {_key?: string; key: string; label?: string; width?: number};

type SiteSettings = {
  _id: string;
  _type: 'siteSettings' | 'servicePage';
  buttonCustomStyles?: ButtonStyle[];
  textBoxWidths?: TextWidth[];
  [key: string]: unknown;
};

const publicClient = createClient({projectId, dataset, apiVersion, useCdn: false});

function readClient() {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
    perspective: 'raw',
  });
}

function cleanColor(value: unknown) {
  const color = String(value || '').trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(color)) throw new Error('Cor inválida. Use #RRGGBB.');
  return color;
}

function cleanKey(value: unknown) {
  const key = String(value || '').trim();
  if (!/^[a-zA-Z0-9_.-]+:.+/.test(key) || key.length > 180) throw new Error('Componente inválido.');
  return key;
}

async function getSettings(includeDraft: boolean, documentId = SITE_SETTINGS_ID): Promise<SiteSettings | null> {
  if (includeDraft && process.env.SANITY_API_READ_TOKEN) {
    const draft = await readClient().fetch<SiteSettings | null>(`*[_id == $id][0]`, {id: `drafts.${documentId}`});
    if (draft) return draft;
  }
  return publicClient.fetch<SiteSettings | null>(`*[_id == $id][0]`, {id: documentId});
}

export async function GET(request: Request) {
  const {isEnabled} = await draftMode();
  try {
    const documentId = new URL(request.url).searchParams.get('documentId')?.replace(/^drafts\./, '');
    const [settings, page] = await Promise.all([
      getSettings(isEnabled),
      documentId && documentId !== SITE_SETTINGS_ID ? getSettings(isEnabled, documentId) : null,
    ]);
    const pageStyles = page?._type === 'servicePage' ? page : null;
    return NextResponse.json({
      buttonStyles: [...(settings?.buttonCustomStyles || []), ...(pageStyles?.buttonCustomStyles || [])],
      textWidths: [...(settings?.textBoxWidths || []), ...(pageStyles?.textBoxWidths || [])],
    });
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : 'Falha ao carregar customizações.'}, {status: 500});
  }
}

export async function PATCH(request: Request) {
  const {isEnabled} = await draftMode();
  const origin = request.headers.get('origin');
  if (!isEnabled || (origin && origin !== new URL(request.url).origin)) return NextResponse.json({error: 'O construtor visual precisa estar em Draft Mode.'}, {status: 403});
  if (!process.env.SANITY_API_WRITE_TOKEN) return NextResponse.json({error: 'SANITY_API_WRITE_TOKEN não configurado.'}, {status: 503});

  try {
    const body = await request.json();
    const kind = String(body.kind || '');
    const key = cleanKey(body.key);
    const label = String(body.label || key).slice(0, 160);

    // Validate before creating a draft, including for the fallback LPs.
    if (kind !== 'button' && kind !== 'textWidth') throw new Error('Tipo de customização inválido.');
    const width = Math.round(Number(body.width));
    if (kind === 'textWidth' && (!Number.isFinite(width) || width < 25 || width > 100)) {
      throw new Error('A largura deve ficar entre 25% e 100%.');
    }
    const colors = kind === 'button' ? {background: cleanColor(body.background), text: cleanColor(body.text)} : {};
    const keyDocumentId = key.slice(0, key.indexOf(':')).replace(/^drafts\./, '');
    const selectedDocument = keyDocumentId ? await mutationClient.getDocument(`drafts.${keyDocumentId}`)
      || await mutationClient.getDocument(keyDocumentId) : null;
    const isPage = selectedDocument?._type === 'servicePage'
      || (!selectedDocument && Boolean(servicePageDefaults(keyDocumentId)));
    const draftId = await ensureDraftDocument(isPage ? keyDocumentId : SITE_SETTINGS_ID, isPage ? 'servicePage' : 'siteSettings');
    const draft = await mutationClient.getDocument<SiteSettings>(draftId);
    const client = mutationClient;

    if (kind === 'button') {
      const next: ButtonStyle = {_key: randomUUID(), key, label, ...colors};
      const items = [...(draft?.buttonCustomStyles || []).filter((item) => item?.key !== key), next];
      await client.patch(draftId).set({buttonCustomStyles: items}).commit();
      return NextResponse.json({ok: true, value: next});
    }

    if (kind === 'textWidth') {
      const next: TextWidth = {_key: randomUUID(), key, label, width};
      const items = [...(draft?.textBoxWidths || []).filter((item) => item?.key !== key), next];
      await client.patch(draftId).set({textBoxWidths: items}).commit();
      return NextResponse.json({ok: true, value: next});
    }

    throw new Error('Tipo de customização inválido.');
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : 'Falha ao salvar customização.'}, {status: 400});
  }
}
