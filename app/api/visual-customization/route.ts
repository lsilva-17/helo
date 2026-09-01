import {NextResponse} from 'next/server';
import {draftMode} from 'next/headers';
import {createClient} from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2026-09-01';

type ButtonStyle = {key: string; label?: string; background?: string; text?: string};
type TextWidth = {key: string; label?: string; width?: number};

type SiteSettings = {
  _id: string;
  _type: 'siteSettings';
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

function writeClient() {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
  });
}

function cleanColor(value: unknown) {
  const color = String(value || '').trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(color)) throw new Error('Cor inválida. Use #RRGGBB.');
  return color;
}

function cleanKey(value: unknown) {
  const key = String(value || '').trim();
  if (!key || key.length > 180) throw new Error('Componente inválido.');
  return key;
}

async function getSettings(includeDraft: boolean): Promise<SiteSettings | null> {
  if (includeDraft && process.env.SANITY_API_READ_TOKEN) {
    const client = readClient();
    const draft = await client.fetch<SiteSettings | null>(`*[_id == "drafts.siteSettings"][0]`);
    if (draft) return draft;
  }
  return publicClient.fetch<SiteSettings | null>(`*[_id == "siteSettings"][0]`);
}

export async function GET() {
  const {isEnabled} = await draftMode();
  try {
    const settings = await getSettings(isEnabled);
    return NextResponse.json({
      buttonStyles: settings?.buttonCustomStyles || [],
      textWidths: settings?.textBoxWidths || [],
    });
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : 'Falha ao carregar customizações.'}, {status: 500});
  }
}

export async function PATCH(request: Request) {
  const {isEnabled} = await draftMode();
  if (!isEnabled) return NextResponse.json({error: 'O construtor visual precisa estar em Draft Mode.'}, {status: 403});
  if (!process.env.SANITY_API_WRITE_TOKEN) return NextResponse.json({error: 'SANITY_API_WRITE_TOKEN não configurado.'}, {status: 503});

  try {
    const body = await request.json();
    const kind = String(body.kind || '');
    const key = cleanKey(body.key);
    const label = String(body.label || key).slice(0, 160);

    const client = writeClient();
    const published = await client.fetch<SiteSettings | null>(`*[_id == "siteSettings"][0]`);
    let draft = await client.fetch<SiteSettings | null>(`*[_id == "drafts.siteSettings"][0]`);

    if (!draft) {
      const base = published || ({_id: 'siteSettings', _type: 'siteSettings'} as SiteSettings);
      const {_rev, _createdAt, _updatedAt, ...copy} = base as SiteSettings & {_rev?: string; _createdAt?: string; _updatedAt?: string};
      await client.createIfNotExists({...copy, _id: 'drafts.siteSettings', _type: 'siteSettings'});
      draft = await client.fetch<SiteSettings | null>(`*[_id == "drafts.siteSettings"][0]`);
    }

    if (kind === 'button') {
      const next: ButtonStyle = {key, label, background: cleanColor(body.background), text: cleanColor(body.text)};
      const items = [...(draft?.buttonCustomStyles || []).filter((item) => item?.key !== key), next];
      await client.patch('drafts.siteSettings').set({buttonCustomStyles: items}).commit();
      return NextResponse.json({ok: true, value: next});
    }

    if (kind === 'textWidth') {
      const width = Math.round(Number(body.width));
      if (!Number.isFinite(width) || width < 25 || width > 100) throw new Error('A largura deve ficar entre 25% e 100%.');
      const next: TextWidth = {key, label, width};
      const items = [...(draft?.textBoxWidths || []).filter((item) => item?.key !== key), next];
      await client.patch('drafts.siteSettings').set({textBoxWidths: items}).commit();
      return NextResponse.json({ok: true, value: next});
    }

    throw new Error('Tipo de customização inválido.');
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : 'Falha ao salvar customização.'}, {status: 400});
  }
}
