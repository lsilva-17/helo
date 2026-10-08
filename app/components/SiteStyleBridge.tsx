import {sanityFetch} from '@/sanity/lib/live';
import {brandTextColor} from '@/app/lib/brandTextColors';

const SITE_SETTINGS_ID = '143778fa-0f7b-4e2b-9f1b-d34bdce5907d';

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
    const response = await sanityFetch({query: '*[_type == "siteSettings" && _id == $id][0]{...}', params: {id: SITE_SETTINGS_ID}});
    settings = (response.data || {}) as Record<string, unknown>;
  } catch {
    return null;
  }

  const rules: string[] = [];
  const pageBackground = safeColor(settings.pageBackground);
  if (pageBackground) rules.push(`@media (min-width:821px){body.brandbook-preview .page-sections{background-color:${pageBackground}!important}}@media (max-width:820px){html:not([data-theme="dark"]) body.brandbook-preview .page-sections{background-color:${pageBackground}!important}}`);
  for (const key of typographyKeys) {
    const color = brandTextColor(key, settings[`${key}Color`]);
    if (color) rules.push(`@media (min-width:821px){body.brandbook-preview [data-vb-font-field="${key}Font"][data-vb-font-field="${key}Font"]:not([data-vb-style-doc-type="servicePage"]),body.brandbook-preview [data-brand-style="${key}"]:not([data-vb-style-doc-type="servicePage"]){color:${color}!important}}@media (max-width:820px){html:not([data-theme="dark"]) body.brandbook-preview [data-vb-font-field="${key}Font"][data-vb-font-field="${key}Font"]:not([data-vb-style-doc-type="servicePage"]),html:not([data-theme="dark"]) body.brandbook-preview [data-brand-style="${key}"]:not([data-vb-style-doc-type="servicePage"]){color:${color}!important}}`);
  }
  for (const key of sectionKeys) {
    const background = safeColor(settings[`${key}Background`]);
    if (background) rules.push(`@media (min-width:821px){body.brandbook-preview [data-vb-width-field="${key}Width"][data-vb-width-field="${key}Width"]:not([data-vb-style-doc-type="servicePage"]){background-color:${background}!important;background-image:none!important}}@media (max-width:820px){html:not([data-theme="dark"]) body.brandbook-preview [data-vb-width-field="${key}Width"][data-vb-width-field="${key}Width"]:not([data-vb-style-doc-type="servicePage"]){background-color:${background}!important;background-image:none!important}}`);
  }

  if (!rules.length) return null;
  return <style dangerouslySetInnerHTML={{__html: rules.join('\n')}} />;
}
