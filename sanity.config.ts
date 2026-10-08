'use client';

import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {defineDocuments, defineLocations, presentationTool} from 'sanity/presentation';
import {schemaTypes} from './sanity/schemaTypes';
import {PreviewDiagnostics} from './sanity/tools/PreviewDiagnostics';
import {SyncedPublishAction} from './sanity/actions/SyncedPublishAction';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const singletonTypes = new Set(['siteSettings']);
const SITE_SETTINGS_ID = '143778fa-0f7b-4e2b-9f1b-d34bdce5907d';

const mainDocuments = defineDocuments([
  {route: '/', type: 'siteSettings'},
  {route: '/facetas-em-resina', filter: '_type == "servicePage" && slug.current == "facetas-em-resina"'},
  {route: '/clareamento-dental', filter: '_type == "servicePage" && slug.current == "clareamento-dental"'},
  {route: '/coroa-dentaria', filter: '_type == "servicePage" && slug.current == "coroa-dentaria"'},
  {route: '/dente-quebrado', filter: '_type == "servicePage" && slug.current == "dente-quebrado"'},
  {route: '/botox', filter: '_type == "servicePage" && slug.current == "botox"'},
  {route: '/harmonizacao-facial', filter: '_type == "servicePage" && slug.current == "harmonizacao-facial"'},
  {route: '/dentista-santana', filter: '_type == "servicePage" && slug.current == "dentista-santana"'},
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
  servicePage: defineLocations({
    select: {
      title: 'menuLabel',
      slug: 'slug.current',
    },
    resolve: (doc) => ({
      locations: doc?.slug ? [{title: doc?.title || 'Página de serviço', href: '/' + doc.slug}] : [],
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
                  .documentId(SITE_SETTINGS_ID)
                  .title('Configurações do site'),
              ),
            S.listItem()
              .title('Páginas de serviços e localização')
              .schemaType('servicePage')
              .child(S.documentTypeList('servicePage').title('Páginas de serviços e localização')),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !singletonTypes.has(item.getId() || '') && item.getId() !== 'servicePage',
            ),
          ]),
    }),
    presentationTool({
      title: 'Editor visual',
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      resolve: {
        mainDocuments,
        locations,
      },
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
    actions: (prev, context) => {
      if (!singletonTypes.has(context.schemaType)) return prev;

      return prev
        .filter(({action}) => action !== 'duplicate' && action !== 'delete')
        .map((originalAction) =>
          originalAction.action === 'publish' ? SyncedPublishAction : originalAction,
        );
    },
  },
});
