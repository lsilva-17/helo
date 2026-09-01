'use client';

import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {defineDocuments, defineLocations, presentationTool} from 'sanity/presentation';
import {schemaTypes} from './sanity/schemaTypes';
import {PreviewDiagnostics} from './sanity/tools/PreviewDiagnostics';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://helo-sable-five.vercel.app';
const singletonTypes = new Set(['siteSettings']);

const mainDocuments = defineDocuments([
  {
    route: '/',
    type: 'siteSettings',
  },
]);

const locations = {
  siteSettings: defineLocations({
    select: {
      title: 'professionalName',
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || 'Página inicial',
          href: '/',
        },
      ],
    }),
  }),
  treatment: defineLocations({
    select: {
      title: 'title',
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || 'Tratamentos',
          href: '/#tratamentos',
        },
      ],
    }),
  }),
  caseStudy: defineLocations({
    select: {
      title: 'title',
    },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || 'Casos clínicos',
          href: '/#casos',
        },
      ],
    }),
  }),
};

export default defineConfig({
  name: 'heloisa-site',
  title: 'Dra. Heloisa Veiga',
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [
    structureTool({
      title: 'Conteúdo',
      structure: (S) =>
        S.list()
          .title('Conteúdo')
          .items([
            S.listItem()
              .title('Configurações do site')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Configurações do site'),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !singletonTypes.has(item.getId() || ''),
            ),
          ]),
    }),
    presentationTool({
      title: 'Editor visual',
      previewUrl: {
        initial: siteUrl,
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      resolve: {
        mainDocuments,
        locations,
      },
      allowOrigins: [siteUrl],
    }),
  ],
  tools: [
    {
      name: 'diagnostics',
      title: 'Diagnóstico',
      component: PreviewDiagnostics,
    },
  ],
  schema: {types: schemaTypes},
  document: {
    newDocumentOptions: (prev) =>
      prev.filter((item) => !singletonTypes.has(item.templateId)),
    actions: (prev, context) =>
      singletonTypes.has(context.schemaType)
        ? prev.filter(({action}) => action !== 'duplicate' && action !== 'delete')
        : prev,
  },
});
