import {defineArrayMember, defineField, defineType} from 'sanity';
import {serviceSectionKeys, serviceTypographyKeys} from '@/app/lib/servicePageCustomization';

const typographyLabels: Record<string, string> = {
  navStyle: 'Links e navegação', eyebrowStyle: 'Chamadas curtas', heroTitle: 'Título principal', heroDescription: 'Introdução',
  buttonStyle: 'Botões', treatmentsTitle: 'Títulos dos blocos', treatmentsDescription: 'Texto dos blocos',
  treatmentCardTitleStyle: 'Títulos das perguntas', treatmentCardBodyStyle: 'Respostas e listas', footerStyle: 'Rodapé',
};
const sectionLabels: Record<string, string> = {hero: 'Primeiro bloco', content: 'Conteúdo', faq: 'Perguntas frequentes', review: 'Informações profissionais', location: 'Localização'};
const fonts = [
  ['Editorial', 'editorial'], ['Sans', 'sans'], ['Georgia', 'classic'], ['Arial', 'arial'],
  ['Roboto', 'roboto'], ['Inter', 'inter'], ['Open Sans', 'opensans'], ['Montserrat', 'montserrat'],
  ['Poppins', 'poppins'], ['DM Sans', 'dmsans'], ['Lato', 'lato'], ['Playfair Display', 'playfair'], ['Lora', 'lora'], ['Merriweather', 'merriweather'],
].map(([title, value]) => ({title, value}));
function numberField(name: string, title: string, min: number, max: number, group = 'layout') {
  return defineField({name, title, type: 'number', group, validation: Rule => Rule.min(min).max(max)});
}
function colorField(name: string, title: string, group = 'layout') {
  return defineField({name, title, type: 'string', group, description: 'Cor hexadecimal, por exemplo #F6F1EB. Vazio mantém o estilo atual.', validation: Rule => Rule.regex(/^#[0-9a-f]{6}$/i)});
}


export const servicePage = defineType({
  name: 'servicePage',
  title: 'Página de serviço / localização',
  type: 'document',
  groups: [
    {name: 'content', title: 'Conteúdo', default: true},
    {name: 'media', title: 'Imagens'},
    {name: 'location', title: 'Localização'},
    {name: 'seo', title: 'SEO'},
    {name: 'typography', title: 'Fontes e cores'},
    {name: 'layout', title: 'Layout'},
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

    defineField({name: 'faqEyebrow', title: 'Perguntas frequentes · chamada curta', type: 'string', group: 'content'}),
    defineField({name: 'faqTitle', title: 'Perguntas frequentes · título', type: 'string', group: 'content'}),

    defineField({name: 'heroImage', title: 'Imagem principal', type: 'image', options: {hotspot: true}, group: 'media'}),
    defineField({
      name: 'caseImages',
      title: 'Cases / imagens do procedimento',
      description: 'Adicione apenas imagens com autorização apropriada do paciente.',
      type: 'array',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Texto alternativo', type: 'string'})]})],
      group: 'media',
    }),

    defineField({name: 'locationEyebrow', title: 'Localização · chamada curta', type: 'string', group: 'location'}),
    defineField({name: 'locationTitle', title: 'Localização · título', type: 'string', group: 'location'}),
    defineField({name: 'locationCtaLabel', title: 'Localização · botão de agendamento', type: 'string', group: 'location'}),
    defineField({name: 'mapsCtaLabel', title: 'Botão Como chegar', type: 'string', group: 'location'}),
    defineField({name: 'address', title: 'Endereço', type: 'string', group: 'location'}),
    defineField({name: 'hours', title: 'Horários', type: 'array', of: [{type: 'string'}], group: 'location'}),
    defineField({name: 'mapEmbedUrl', title: 'URL de incorporação do Google Maps', type: 'url', group: 'location'}),

    ...serviceTypographyKeys.flatMap(key => [
      defineField({name: `${key}Font`, title: `${typographyLabels[key]} · fonte`, type: 'string', group: 'typography', options: {list: fonts}, description: 'Vazio herda a fonte da home.'}),
      numberField(`${key}Size`, `${typographyLabels[key]} · tamanho (px)`, 10, 110, 'typography'),
      defineField({name: `${key}Align`, title: `${typographyLabels[key]} · alinhamento`, type: 'string', group: 'typography', options: {list: [{title: 'Esquerda', value: 'left'}, {title: 'Centro', value: 'center'}, {title: 'Direita', value: 'right'}]}}),
      colorField(`${key}Color`, `${typographyLabels[key]} · cor`, 'typography'),
    ]),
    colorField('pageBackground', 'Fundo da página'),
    ...serviceSectionKeys.flatMap(key => [
      numberField(`${key}Width`, `${sectionLabels[key]} · largura (%)`, 60, 100),
      numberField(`${key}OffsetX`, `${sectionLabels[key]} · deslocamento horizontal (px)`, -100, 100),
      numberField(`${key}OffsetY`, `${sectionLabels[key]} · deslocamento vertical (px)`, -80, 80),
      numberField(`${key}PaddingY`, `${sectionLabels[key]} · espaçamento vertical (px)`, 16, 160),
      numberField(`${key}Height`, `${sectionLabels[key]} · altura mínima (px)`, 180, 1000),
      colorField(`${key}Background`, `${sectionLabels[key]} · fundo`),
    ]),
    numberField('heroImageWidth', 'Imagem principal · largura (%)', 60, 100, 'media'),
    numberField('heroImageOffsetX', 'Imagem principal · deslocamento horizontal (px)', -100, 100, 'media'),
    numberField('heroImageOffsetY', 'Imagem principal · deslocamento vertical (px)', -80, 80, 'media'),
    numberField('heroImageHeight', 'Imagem principal · altura (px)', 160, 720, 'media'),
    numberField('heroImagePositionX', 'Imagem principal · foco horizontal (%)', 0, 100, 'media'),
    numberField('heroImagePositionY', 'Imagem principal · foco vertical (%)', 0, 100, 'media'),
    defineField({name: 'sectionOrder', title: 'Ordem das seções', type: 'array', group: 'layout', description: 'Arraste as seções para mudar a ordem. Seções sem conteúdo não aparecem na página.', of: [{type: 'string'}], options: {list: serviceSectionKeys.map(value => ({title: sectionLabels[value], value}))}, validation: Rule => Rule.unique().min(5).max(5)}),
    defineField({name: 'buttonCustomStyles', title: 'Cores dos botões', type: 'array', group: 'typography', of: [defineArrayMember({type: 'object', fields: [
      defineField({name: 'key', title: 'Identificador do componente', type: 'string', readOnly: true}),
      defineField({name: 'label', title: 'Componente', type: 'string', readOnly: true}),
      defineField({name: 'background', title: 'Fundo', type: 'string', validation: Rule => Rule.regex(/^#[0-9a-f]{6}$/i)}), defineField({name: 'text', title: 'Texto', type: 'string', validation: Rule => Rule.regex(/^#[0-9a-f]{6}$/i)}),
    ], preview: {select: {title: 'label', subtitle: 'key'}}})]}),
    defineField({name: 'textBoxWidths', title: 'Larguras dos textos', type: 'array', group: 'layout', of: [defineArrayMember({type: 'object', fields: [
      defineField({name: 'key', title: 'Identificador do componente', type: 'string', readOnly: true}),
      defineField({name: 'label', title: 'Componente', type: 'string', readOnly: true}),
      defineField({name: 'width', title: 'Largura (%)', type: 'number', validation: Rule => Rule.min(25).max(100)}),
    ], preview: {select: {title: 'label', subtitle: 'key'}}})]}),

    defineField({name: 'seoTitle', title: 'Título SEO', type: 'string', group: 'seo'}),
    defineField({name: 'seoDescription', title: 'Descrição SEO', type: 'text', rows: 3, group: 'seo'}),
  ],
  preview: {
    select: {title: 'menuLabel', subtitle: 'slug.current'},
    prepare: ({title, subtitle}) => ({title: title || 'Página sem título', subtitle: subtitle ? '/' + subtitle : 'Defina a URL'}),
  },
});
