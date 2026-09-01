import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { VisualEditing } from 'next-sanity/visual-editing';
import { SanityLive } from '@/sanity/lib/live';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dra. Heloisa Veiga | Odontologia Estética em São Paulo',
  description:
    'Odontologia estética com atendimento personalizado em São Paulo. Conheça o trabalho da Dra. Heloisa Veiga e agende uma avaliação.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <html lang="pt-BR">
      <body>
        {children}
        <SanityLive />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
