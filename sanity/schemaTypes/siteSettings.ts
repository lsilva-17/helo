import { defineField, defineType } from 'sanity';

const fontOptions = {
  list: [
    { title: 'Editorial — Cormorant Garamond', value: 'editorial' },
    { title: 'Moderna — Manrope', value: 'sans' },
    { title: 'Clássica — Georgia', value: 'classic' },
  ],
  layout: 'radio' as const,
};

const typographyFields = [
  ['heroTitle', 'Hero · título', 'editorial', 67],
  ['heroDescription', 'Hero · descrição', 'sans', 16],
  ['aboutTitle', 'Sobre · título', 'editorial', 56],
  ['aboutDescription', 'Sobre · descrição', 'sans', 16],
  ['treatmentsTitle', 'Tratamentos · título', 'editorial', 56],
  ['treatmentsDescription', 'Tratamentos · descrição', 'sans', 16],
  ['casesTitle', 'Casos · título', 'editorial', 56],
  ['casesDescription', 'Casos · descrição', 'sans', 16],
  ['contactTitle', 'Contato · título', 'editorial', 56],
  ['contactDescription', 'Contato · descrição', 'sans', 16],
] as const;

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configurações do site',
  type: 'document',
  groups: [
    { name: 'content', title: 'Conteúdo', default: true },
    { name: 'layout', title: 'Layout' },
    { name: 'style', title: 'Estilo' },
    { name: 'seo', title: 'SEO' },
  ],
  initialValue: {
    professionalName: 'Dra. Heloisa Veiga',
    brandSubtitle: 'Odontologia estética · São Paulo',
    whatsapp: '5511987312961',
    instagram: 'https://www.instagram.com/dra.heloisaveiga',
    heroEyebrow: 'Odontologia estética em São Paulo',
    heroTitle: 'Saúde, beleza e confiança em cada sorriso.',
    heroDescription:
      'Formada pela USP, a Dra. Heloisa Veiga atua com foco em odontologia estética e planejamento individualizado, respeitando as características de cada paciente.',
    aboutEyebrow: 'Sobre',
    aboutTitle: 'Estética com naturalidade e cuidado individualizado.',
    aboutDescription:
      'Cada tratamento parte de uma avaliação cuidadosa para combinar saúde, função e estética. O objetivo é construir resultados harmônicos, sem perder a identidade do sorriso de cada paciente.',
    treatmentsTitle: 'Tratamentos pensados para cada sorriso.',
    treatmentsDescription:
      'Conheça algumas das possibilidades de tratamento e converse com a Dra. Heloisa para entender qual abordagem faz sentido para o seu caso.',
    casesTitle: 'Resultados e casos clínicos.',
    casesDescription:
      'Casos publicados no CMS aparecem aqui automaticamente. As imagens devem ser usadas sempre com a autorização adequada do paciente.',
    contactTitle: 'Vamos conversar sobre o seu sorriso?',
    contactDescription:
      'Entre em contato pelo WhatsApp para tirar dúvidas e agendar uma avaliação.',
    sectionOrder: ['hero', 'about', 'treatments', 'cases', 'contact'],
    heroTitleFont: 'editorial',
    heroTitleSize: 67,
    heroDescriptionFont: 'sans',
    heroDescriptionSize: 16,
    aboutTitleFont: 'editorial',
    aboutTitleSize: 56,
    aboutDescriptionFont: 'sans',
    aboutDescriptionSize: 16,
    treatmentsTitleFont: 'editorial',
    treatmentsTitleSize: 56,
    treatmentsDescriptionFont: 'sans',
    treatmentsDescriptionSize: 16,
    casesTitleFont: 'editorial',
    casesTitleSize: 56,
    casesDescriptionFont: 'sans',
    casesDescriptionSize: 16,
    contactTitleFont: 'editorial',
    contactTitleSize: 56,
    contactDescriptionFont: 'sans',
    contactDescriptionSize: 16,
    seoTitle: 'Dra. Heloisa Veiga | Odontologia Estética em São Paulo',
    seoDescription:
      'Odontologia estética com atendimento personalizado em São Paulo. Conheça o trabalho da Dra. Heloisa Veiga e agende uma avaliação.',
  },
  fields: [
    defineField({ name: 'professionalName', title: 'Nome profissional', type: 'string', group: 'content' }),
    defineField({ name: 'brandSubtitle', title: 'Subtítulo da marca', type: 'string', group: 'content' }),
    defineField({ name: 'cro', title: 'CRO', type: 'string', group: 'content' }),
    defineField({ name: 'whatsapp', title: 'WhatsApp', type: 'string', group: 'content', description: 'Somente números, com DDI e DDD. Ex.: 5511999999999' }),
    defineField({ name: 'instagram', title: 'Instagram', type: 'url', group: 'content' }),
    defineField({ name: 'clinicAddress', title: 'Endereço da clínica', type: 'string', group: 'content' }),
    defineField({ name: 'mapsUrl', title: 'Link do Google Maps', type: 'url', group: 'content' }),

    defineField({ name: 'heroEyebrow', title: 'Hero · chamada curta', type: 'string', group: 'content' }),
    defineField({ name: 'heroTitle', title: 'Hero · título', type: 'string', group: 'content' }),
    defineField({ name: 'heroDescription', title: 'Hero · descrição', type: 'text', rows: 4, group: 'content' }),
    defineField({ name: 'heroImage', title: 'Hero · foto principal', type: 'image', options: { hotspot: true }, group: 'content' }),

    defineField({ name: 'aboutEyebrow', title: 'Sobre · chamada curta', type: 'string', group: 'content' }),
    defineField({ name: 'aboutTitle', title: 'Sobre · título', type: 'string', group: 'content' }),
    defineField({ name: 'aboutDescription', title: 'Sobre · descrição', type: 'text', rows: 5, group: 'content' }),

    defineField({ name: 'treatmentsTitle', title: 'Tratamentos · título da seção', type: 'string', group: 'content' }),
    defineField({ name: 'treatmentsDescription', title: 'Tratamentos · descrição da seção', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'casesTitle', title: 'Casos · título da seção', type: 'string', group: 'content' }),
    defineField({ name: 'casesDescription', title: 'Casos · descrição da seção', type: 'text', rows: 3, group: 'content' }),

    defineField({ name: 'contactTitle', title: 'Contato · título', type: 'string', group: 'content' }),
    defineField({ name: 'contactDescription', title: 'Contato · descrição', type: 'text', rows: 3, group: 'content' }),

    defineField({
      name: 'sectionOrder',
      title: 'Ordem das seções',
      description: 'Também pode ser alterada arrastando as seções no Construtor visual.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Hero', value: 'hero' },
          { title: 'Sobre', value: 'about' },
          { title: 'Tratamentos', value: 'treatments' },
          { title: 'Casos clínicos', value: 'cases' },
          { title: 'Contato', value: 'contact' },
        ],
      },
      validation: (Rule) => Rule.unique().min(5).max(5),
      group: 'layout',
    }),

    ...typographyFields.flatMap(([key, label, defaultFont, defaultSize]) => [
      defineField({
        name: `${key}Font`,
        title: `${label} · fonte`,
        type: 'string',
        options: fontOptions,
        initialValue: defaultFont,
        group: 'style',
      }),
      defineField({
        name: `${key}Size`,
        title: `${label} · tamanho`,
        type: 'number',
        initialValue: defaultSize,
        validation: (Rule) => Rule.min(12).max(96),
        group: 'style',
      }),
    ]),

    defineField({ name: 'seoTitle', title: 'Título SEO', type: 'string', group: 'seo' }),
    defineField({ name: 'seoDescription', title: 'Descrição SEO', type: 'text', rows: 3, group: 'seo' }),
  ],
});
