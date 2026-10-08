import palette from './brandTextColors.json';

// Default copy and navigation colors shared by the home and LPs.
// Explicit CMS colors continue to take precedence after the palette migration.
export function brandTextColor(key: string, value?: unknown): string | undefined {
  if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) return value;
  return (palette.colors as Record<string, string>)[key];
}
