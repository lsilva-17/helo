import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configurações do site',
  type: 'document',
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
    seoTitle: 'Dra. Heloisa Veiga | Odontologia Estética em São Paulo',
    seoDescription:
      'Odontologia estética com atendimento personalizado em São Paulo. Conheça o trabalho da Dra. Heloisa Veiga e agende uma avaliação.',
  },
  fields: [
    defineField({ name: 'professionalName', title: 'Nome profissional', type: 'string' }),
    defineField({ name: 'brandSubtitle', title: 'Subtítulo da marca', type: 'string' }),
    defineField({ name: 'cro', title: 'CRO', type: 'string' }),
    defineField({ name: 'whatsapp', title: 'WhatsApp', type: 'string', description: 'Somente números, com DDI e DDD. Ex.: 5511999999999' }),
    defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
    defineField({ name: 'clinicAddress', title: 'Endereço da clínica', type: 'string' }),
    defineField({ name: 'mapsUrl', title: 'Link do Google Maps', type: 'url' }),

    defineField({ name: 'heroEyebrow', title: 'Hero · chamada curta', type: 'string' }),
    defineField({ name: 'heroTitle', title: 'Hero · título', type: 'string' }),
    defineField({ name: 'heroDescription', title: 'Hero · descrição', type: 'text', rows: 4 }),
    defineField({ name: 'heroImage', title: 'Hero · foto principal', type: 'image', options: { hotspot: true } }),

    defineField({ name: 'aboutEyebrow', title: 'Sobre · chamada curta', type: 'string' }),
    defineField({ name: 'aboutTitle', title: 'Sobre · título', type: 'string' }),
    defineField({ name: 'aboutDescription', title: 'Sobre · descrição', type: 'text', rows: 5 }),

    defineField({ name: 'treatmentsTitle', title: 'Tratamentos · título da seção', type: 'string' }),
    defineField({ name: 'treatmentsDescription', title: 'Tratamentos · descrição da seção', type: 'text', rows: 3 }),
    defineField({ name: 'casesTitle', title: 'Casos · título da seção', type: 'string' }),
    defineField({ name: 'casesDescription', title: 'Casos · descrição da seção', type: 'text', rows: 3 }),

    defineField({ name: 'contactTitle', title: 'Contato · título', type: 'string' }),
    defineField({ name: 'contactDescription', title: 'Contato · descrição', type: 'text', rows: 3 }),

    defineField({ name: 'seoTitle', title: 'Título SEO', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'Descrição SEO', type: 'text', rows: 3 }),
  ],
});
