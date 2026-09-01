import {sanityFetch} from '@/sanity/lib/live';

const typographyKeys = [
  'brandName', 'brandSubtitleStyle', 'navStyle', 'eyebrowStyle', 'buttonStyle',
  'heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription', 'trustTitleStyle', 'trustBodyStyle',
  'treatmentsTitle', 'treatmentsDescription', 'treatmentCardTitleStyle', 'treatmentCardBodyStyle',
  'casesTitle', 'casesDescription', 'caseLabelStyle', 'caseCardTitleStyle', 'caseCardBodyStyle',
  'contactTitle', 'contactDescription', 'footerStyle',
] as const;

const sectionKeys = ['hero', 'about', 'treatments', 'cases', 'contact'] as const;

function safeColor(value: unknown) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : null;
}

export async function SiteStyleBridge() {
  let settings: Record<string, unknown> = {};
  try {
    const response = await sanityFetch({query: '*[_type == "siteSettings"][0]{...}'});
    settings = (response.data || {}) as Record<string, unknown>;
  } catch {
    return null;
  }

  const rules: string[] = [];
  for (const key of typographyKeys) {
    const color = safeColor(settings[`${key}Color`]);
    if (color) rules.push(`[data-vb-font-field="${key}Font"]{color:${color}!important}`);
  }
  for (const key of sectionKeys) {
    const background = safeColor(settings[`${key}Background`]);
    if (background) rules.push(`[data-vb-width-field="${key}Width"]{background-color:${background}!important}`);
  }

  if (!rules.length) return null;
  return <style dangerouslySetInnerHTML={{__html: rules.join('\n')}} />;
}
