// Render saved button colors on the server, before the browser loads the
// customization bridge. Inline editor updates can still override these rules.
export function buttonCustomStylesCss(value: unknown): string {
  if (!Array.isArray(value)) return '';

  const rules: string[] = [];
  for (const item of value) {
    if (!item || typeof item.key !== 'string') continue;
    const key = /^([a-zA-Z0-9_.-]+):([a-zA-Z0-9_.-]+)$/.exec(item.key);
    if (!key) continue;

    const declarations: string[] = [];
    if (typeof item.background === 'string' && /^#[0-9a-f]{6}$/i.test(item.background)) {
      declarations.push(`background-color:${item.background}`);
    }
    if (typeof item.text === 'string' && /^#[0-9a-f]{6}$/i.test(item.text)) {
      declarations.push(`color:${item.text}`);
    }
    if (declarations.length) {
      rules.push(`body.brandbook-preview .btn[data-vb-doc-id="${key[1]}"][data-vb-field="${key[2]}"]{${declarations.join(';')}}`);
    }
  }
  return rules.join('\n');
}
