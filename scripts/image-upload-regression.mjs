import {readFile} from 'node:fs/promises';

const [builder, route] = await Promise.all([
  readFile(new URL('../app/components/VisualBuilder.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../app/api/visual-builder/image/route.ts', import.meta.url), 'utf8'),
]);

const checks = [
  [builder.includes('MAX_DIRECT_UPLOAD_BYTES = 3.5 * 1024 * 1024'), 'client upload safety threshold'],
  [builder.includes('prepareImageForUpload'), 'client image preparation'],
  [builder.includes("canvas.toBlob"), 'client-side image compression'],
  [builder.includes("response.status === 413"), 'explicit payload-too-large feedback'],
  [route.includes('file.size > 4 * 1024 * 1024'), 'server safe payload guard'],
  [route.includes("console.error('[visual-builder:image] upload failed'"), 'server upload diagnostics'],
];

const failures = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) {
  throw new Error(`Image upload regression checks failed: ${failures.join(', ')}`);
}

console.log('Image upload regression checks passed.');
