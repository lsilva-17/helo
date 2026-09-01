import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configurações do site',
  type: 'document',
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
