import {defineArrayMember, defineField, defineType} from 'sanity';

export const servicePage = defineType({
  name: 'servicePage',
  title: 'Página de serviço / localização',
  type: 'document',
  groups: [
    {name: 'content', title: 'Conteúdo', default: true},
    {name: 'media', title: 'Imagens'},
    {name: 'location', title: 'Localização'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'menuLabel', title: 'Nome no menu', type: 'string', group: 'content'}),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: {source: 'menuLabel', maxLength: 80},
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'pageKind',
      title: 'Tipo de página',
      type: 'string',
      options: {list: [{title: 'Procedimento', value: 'service'}, {title: 'Localização', value: 'location'}], layout: 'radio'},
      initialValue: 'service',
      group: 'content',
    }),
    defineField({name: 'eyebrow', title: 'Chamada curta', type: 'string', group: 'content'}),
    defineField({name: 'title', title: 'Título principal (H1)', type: 'string', validation: (Rule) => Rule.required(), group: 'content'}),
    defineField({name: 'intro', title: 'Introdução', type: 'text', rows: 5, group: 'content'}),
    defineField({
      name: 'sections',
      title: 'Blocos de conteúdo',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({name: 'heading', title: 'Título', type: 'string'}),
          defineField({name: 'body', title: 'Texto', type: 'text', rows: 5}),
          defineField({name: 'bullets', title: 'Pontos de apoio', type: 'array', of: [{type: 'string'}]}),
        ],
        preview: {select: {title: 'heading', subtitle: 'body'}},
      })],
    }),
    defineField({
      name: 'faqs',
      title: 'Perguntas frequentes',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({name: 'question', title: 'Pergunta', type: 'string'}),
          defineField({name: 'answer', title: 'Resposta', type: 'text', rows: 4}),
        ],
        preview: {select: {title: 'question', subtitle: 'answer'}},
      })],
    }),
    defineField({name: 'ctaTitle', title: 'CTA · título', type: 'string', group: 'content'}),
    defineField({name: 'ctaBody', title: 'CTA · texto', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'ctaLabel', title: 'CTA · botão', type: 'string', initialValue: 'Falar no WhatsApp', group: 'content'}),

    defineField({name: 'heroImage', title: 'Imagem principal', type: 'image', options: {hotspot: true}, group: 'media'}),
    defineField({
      name: 'caseImages',
      title: 'Cases / imagens do procedimento',
      description: 'Adicione apenas imagens com autorização apropriada do paciente.',
      type: 'array',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Texto alternativo', type: 'string'})]})],
      group: 'media',
    }),

    defineField({name: 'address', title: 'Endereço', type: 'string', group: 'location'}),
    defineField({name: 'hours', title: 'Horários', type: 'array', of: [{type: 'string'}], group: 'location'}),
    defineField({name: 'mapEmbedUrl', title: 'URL de incorporação do Google Maps', type: 'url', group: 'location'}),

    defineField({name: 'seoTitle', title: 'Título SEO', type: 'string', group: 'seo'}),
    defineField({name: 'seoDescription', title: 'Descrição SEO', type: 'text', rows: 3, group: 'seo'}),
  ],
  preview: {
    select: {title: 'menuLabel', subtitle: 'slug.current'},
    prepare: ({title, subtitle}) => ({title: title || 'Página sem título', subtitle: subtitle ? '/' + subtitle : 'Defina a URL'}),
  },
});
