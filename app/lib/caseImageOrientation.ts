// Correct the two sideways source photos in this specific clinical case.
// Scope by document and asset so a replacement photo keeps its own orientation.
const caseId = 'b41921a4-2097-473e-a8e8-4b3ee80ffaee';
const sidewaysAssets = new Set([
  'a53c487c856f9b46b62d33b81d0b6cb4f548cd1c-3456x5184.jpg',
  '158f39e4f8bd331407ed52e253e962d6ad19cd9d-3456x5184.jpg',
]);

export function caseImageUrl(documentId: string, source?: string) {
  if (!source || documentId.replace(/^drafts\./, '') !== caseId) return source;
  const url = new URL(source);
  const asset = url.pathname.split('/').at(-1) || '';
  if (url.hostname !== 'cdn.sanity.io' || !sidewaysAssets.has(asset)) return source;
  // A resize is required: Sanity serves the unchanged original when `or`
  // is the only transform. Resize without cropping, then rotate the pixels.
  url.searchParams.set('w', '1600');
  url.searchParams.set('fit', 'max');
  url.searchParams.set('auto', 'format');
  url.searchParams.set('or', '90');
  return url.toString();
}
