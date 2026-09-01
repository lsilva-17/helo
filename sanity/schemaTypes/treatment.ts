import { defineField, defineType } from 'sanity';

export const treatment = defineType({
  name: 'treatment',
  title: 'Tratamentos',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Nome do tratamento', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'URL', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'summary', title: 'Descrição curta', type: 'text', rows: 3 }),
    defineField({ name: 'image', title: 'Imagem', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'featured', title: 'Destacar na página inicial', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', title: 'Ordem de exibição', type: 'number' }),
  ],
});
