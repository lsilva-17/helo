import type {CSSProperties} from 'react';
import {serviceMenuItems} from '@/app/lib/servicePages';

const fontStacks: Record<string, string> = {
  editorial: "'Cormorant Garamond', Georgia, serif",
  sans: "'Inter', Arial, sans-serif",
  classic: "Georgia, 'Times New Roman', serif",
  arial: "Arial, Helvetica, sans-serif",
  roboto: "'Roboto', Arial, sans-serif",
  inter: "'Inter', Arial, sans-serif",
  opensans: "'Open Sans', Arial, sans-serif",
  montserrat: "'Montserrat', Arial, sans-serif",
  poppins: "'Poppins', Arial, sans-serif",
  dmsans: "'DM Sans', Arial, sans-serif",
  lato: "'Lato', Arial, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  lora: "'Lora', Georgia, serif",
  merriweather: "'Merriweather', Georgia, serif",
};

type HeaderTypography = {
  font?: string;
  size?: number;
  align?: 'left' | 'center' | 'right';
  color?: string;
};

type SiteHeaderProps = {
  brandName?: string;
  subtitle?: string;
  logoUrl?: string;
  navAboutLabel?: string;
  navTreatmentsLabel?: string;
  navCasesLabel?: string;
  navContactLabel?: string;
  brandNameTypography?: HeaderTypography;
  subtitleTypography?: HeaderTypography;
  navTypography?: HeaderTypography;
};

function typeStyle(value: HeaderTypography | undefined, fallbackFont: string, fallbackSize: number): CSSProperties {
  const font = value?.font || fallbackFont;
  return {
    fontFamily: fontStacks[font] || fontStacks[fallbackFont],
    fontSize: `${value?.size ?? fallbackSize}px`,
    textAlign: value?.align || 'left',
    ...(value?.color ? {color: value.color} : {}),
  };
}

export function SiteHeader({
  brandName = 'Dra. Heloisa Veiga',
  subtitle = 'Odontologia estética · São Paulo',
  logoUrl = '/brand-hv.svg',
  navAboutLabel = 'Sobre',
  navTreatmentsLabel = 'Tratamentos',
  navCasesLabel = 'Casos',
  navContactLabel = 'Contato',
  brandNameTypography,
  subtitleTypography,
  navTypography,
}: SiteHeaderProps) {
  const navStyle = typeStyle(navTypography, 'sans', 14);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="/#inicio" aria-label="Ir para a página inicial">
          <img className="brand-mark" src={logoUrl} alt="Marca" style={{objectFit: 'cover'}} />
          <span className="brand-text">
            <strong style={typeStyle(brandNameTypography, 'sans', 15)}>{brandName}</strong>
            <small style={typeStyle(subtitleTypography, 'sans', 12)}>{subtitle}</small>
          </span>
        </a>
        <nav className="nav" aria-label="Menu principal">
          <a href="/#sobre" style={navStyle}>{navAboutLabel}</a>
          <a href="/#tratamentos" style={navStyle}>{navTreatmentsLabel}</a>
          <a href="/#casos" style={navStyle}>{navCasesLabel}</a>
          <a href="/#contato" style={navStyle}>{navContactLabel}</a>
        </nav>
      </div>
      <div className="category-nav-shell">
        <nav className="container category-nav" aria-label="Categorias de atendimento">
          {serviceMenuItems.filter((item) => item.href !== '/').map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}
