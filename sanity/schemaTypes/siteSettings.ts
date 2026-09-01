import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configurações do site',
  type: 'document',
  fields: [
    defineField({ name: 'professionalName', title: 'Nome profissional', type: 'string' }),
    defineField({ name: 'cro', title: 'CRO', type: 'string' }),
    defineField({ name: 'whatsapp', title: 'WhatsApp', type: 'string' }),
    defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
    defineField({ name: 'clinicAddress', title: 'Endereço da clínica', type: 'string' }),
    defineField({ name: 'seoTitle', title: 'Título SEO', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'Descrição SEO', type: 'text', rows: 3 }),
  ],
});
