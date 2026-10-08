import {notFound} from 'next/navigation';

// Temporary QA route; removed after validating real iframe viewports in preview.
export default async function ResponsivePreview({searchParams}: {searchParams: Promise<{width?: string; page?: string}>}) {
  if (process.env.VERCEL_ENV !== 'preview') notFound();
  const params = await searchParams;
  const widths = [320, 390, 414, 768, 821, 1363];
  const width = widths.includes(Number(params.width)) ? Number(params.width) : 390;
  const paths = ['/', '/facetas-em-resina', '/clareamento-dental', '/coroa-dentaria', '/botox', '/harmonizacao-facial', '/dente-quebrado', '/dentista-santana'];
  const page = paths.includes(params.page || '') ? params.page! : '/';
  return <iframe title="Validação responsiva" src={page} width={width} height={844} style={{display: 'block', border: 0, margin: '24px auto'}} />;
}
