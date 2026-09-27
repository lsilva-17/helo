import type {Metadata} from 'next';
import {draftMode} from 'next/headers';
import {VisualEditing} from 'next-sanity/visual-editing';
import {VisualBuilder} from '@/app/components/VisualBuilder';
import {VisualBuilderToolbarDrag} from '@/app/components/VisualBuilderToolbarDrag';
import {VisualCustomizationBridge} from '@/app/components/VisualCustomizationBridge';
import {VisualCustomizationControls} from '@/app/components/VisualCustomizationControls';
import {FallbackTreatmentBindings} from '@/app/components/FallbackTreatmentBindings';
import {ThemeToggle} from '@/app/components/ThemeToggle';
import {SiteStyleBridge} from '@/app/components/SiteStyleBridge';
import './globals.css';
import './visual-builder.css';
import './visual-builder-toolbar-drag.css';
import './visual-customization.css';

export const metadata: Metadata = {
  title: 'Dra. Heloisa Veiga | Odontologia Estética em São Paulo',
  description:
    'Odontologia estética com atendimento personalizado em São Paulo. Conheça o trabalho da Dra. Heloisa Veiga e agende uma avaliação.',
  icons: {
    icon: [
      {url: '/icon.svg?v=6', type: 'image/svg+xml'},
      {url: '/favicon.png?v=6', type: 'image/png', sizes: '128x128'},
    ],
    shortcut: '/icon.svg?v=6',
    apple: '/apple-touch-icon.png?v=6',
  },
};

const visualCapabilities = [
  'theme-toggle',
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
    <html lang="pt-BR">
      <body className="brandbook-preview" data-visual-capabilities={visualCapabilities}>
        <SiteStyleBridge />
        <VisualCustomizationBridge />
        {children}
        <ThemeToggle />
        {isDraftMode && <FallbackTreatmentBindings />}
        {isDraftMode && <VisualBuilder />}
        {isDraftMode && <VisualBuilderToolbarDrag />}
        {isDraftMode && <VisualCustomizationControls />}
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
