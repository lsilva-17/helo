import type {Metadata} from 'next';
import {draftMode} from 'next/headers';
import {EmbeddedVisualEditing} from '@/app/components/EmbeddedVisualEditing';
import {VisualBuilder} from '@/app/components/VisualBuilder';
import {VisualBuilderToolbarDrag} from '@/app/components/VisualBuilderToolbarDrag';
import {VisualCustomizationBridge} from '@/app/components/VisualCustomizationBridge';
import {VisualCustomizationControls} from '@/app/components/VisualCustomizationControls';
import {FallbackTreatmentBindings} from '@/app/components/FallbackTreatmentBindings';
import {SiteStyleBridge} from '@/app/components/SiteStyleBridge';
import {ConversionTracking} from '@/app/components/ConversionTracking';
import './globals.css';
import './visual-builder.css';
import './visual-builder-toolbar-drag.css';
import './visual-customization.css';
import './service-pages.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://draheloisaveiga.vercel.app'),
  alternates: { canonical: '/' },
  title: 'Dra. Heloisa Veiga | Odontologia Estética em São Paulo',
  description:
    'Odontologia estética com atendimento personalizado em São Paulo. Conheça o trabalho da Dra. Heloisa Veiga e agende uma avaliação.',
  icons: {
    icon: [{url: '/favicon.png?v=8', type: 'image/png', sizes: '128x128'}],
    shortcut: '/favicon.png?v=8',
    apple: '/apple-touch-icon.png?v=8',
  },
};

const visualCapabilities = [
  'expanded-fonts',
  'text-color',
  'section-background-color',
  'button-background-color',
  'button-text-color',
  'text-box-width',
  'text-direct-resize',
  'editable-fallback-treatment-cards',
  'presentation-stable-editing',
  'matched-block-heights',
  'floating-social-links',
].join(' ');

export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const {isEnabled: isDraftMode} = await draftMode();

  return (
    <html lang="pt-BR" data-theme="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5GQGVBG9');`,
          }}
        />
      </head>
      <body className="brandbook-preview" data-visual-capabilities={visualCapabilities}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5GQGVBG9"
            height="0"
            width="0"
            style={{display: 'none', visibility: 'hidden'}}
            title="Google Tag Manager"
          />
        </noscript>
        <ConversionTracking />
        <SiteStyleBridge />
        <VisualCustomizationBridge />
        {children}
        {isDraftMode && <FallbackTreatmentBindings />}
        {isDraftMode && <VisualBuilder />}
        {isDraftMode && <VisualBuilderToolbarDrag />}
        {isDraftMode && <VisualCustomizationControls />}
        {isDraftMode && <EmbeddedVisualEditing />}
      </body>
    </html>
  );
}
