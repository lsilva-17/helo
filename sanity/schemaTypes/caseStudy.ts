import { defineField, defineType } from 'sanity';

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Casos clínicos',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título do caso', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'treatment', title: 'Tratamento', type: 'reference', to: [{ type: 'treatment' }] }),
    defineField({ name: 'beforeImage', title: 'Foto antes', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'afterImage', title: 'Foto depois', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'description', title: 'Descrição', type: 'text', rows: 4 }),
    defineField({ name: 'featured', title: 'Exibir na página inicial', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', title: 'Ordem de exibição', type: 'number' }),
  ],
});
