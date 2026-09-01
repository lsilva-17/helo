import type {Metadata} from 'next';
import {draftMode} from 'next/headers';
import {VisualEditing} from 'next-sanity/visual-editing';
import {VisualBuilder} from '@/app/components/VisualBuilder';
import {VisualBuilderToolbarDrag} from '@/app/components/VisualBuilderToolbarDrag';
import {ThemeToggle} from '@/app/components/ThemeToggle';
import {SanityLive} from '@/sanity/lib/live';
import './globals.css';
import './visual-builder.css';
import './visual-builder-toolbar-drag.css';

export const metadata: Metadata = {
  title: 'Dra. Heloisa Veiga | Odontologia Estética em São Paulo',
  description:
    'Odontologia estética com atendimento personalizado em São Paulo. Conheça o trabalho da Dra. Heloisa Veiga e agende uma avaliação.',
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const {isEnabled: isDraftMode} = await draftMode();

  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ThemeToggle />
        <SanityLive />
        {isDraftMode && <VisualBuilder />}
        {isDraftMode && <VisualBuilderToolbarDrag />}
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
