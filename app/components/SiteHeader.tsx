import type {CSSProperties} from 'react';
import {serviceMenuItems} from '@/app/lib/servicePages';
import {HeaderScrollOffset} from '@/app/components/HeaderScrollOffset';
import {MobileNavigation} from '@/app/components/MobileNavigation';

type SiteHeaderProps = {
  brandName?: string;
  subtitle?: string;
  logoUrl?: string;
  navAboutLabel?: string;
  navTreatmentsLabel?: string;
  navCasesLabel?: string;
  navContactLabel?: string;
  brandNameStyle?: CSSProperties;
  subtitleStyle?: CSSProperties;
  navStyle?: CSSProperties;
  categoryStyle?: CSSProperties;
  brandNameProps?: Record<string, any>;
  subtitleProps?: Record<string, any>;
  logoProps?: Record<string, any>;
  navAboutProps?: Record<string, any>;
  navTreatmentsProps?: Record<string, any>;
  navCasesProps?: Record<string, any>;
  navContactProps?: Record<string, any>;
};

export function SiteHeader({
  brandName = 'Dra. Heloisa Veiga',
  subtitle = 'Odontologia estética · São Paulo',
  logoUrl = '/brand-hv.svg',
  navAboutLabel = 'Sobre',
  navTreatmentsLabel = 'Tratamentos',
  navCasesLabel = 'Casos',
  navContactLabel = 'Contato',
  brandNameStyle,
  subtitleStyle,
  navStyle,
  categoryStyle,
  brandNameProps,
  subtitleProps,
  logoProps,
  navAboutProps,
  navTreatmentsProps,
  navCasesProps,
  navContactProps,
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <HeaderScrollOffset />
      <div className="container header-inner">
        <a className="brand" href="/" aria-label="Ir para a página inicial">
          <img className="brand-mark" src={logoUrl} alt="Marca" style={{objectFit: 'cover'}} {...logoProps} />
          <span className="brand-text">
            <strong style={brandNameStyle} {...brandNameProps}>{brandName}</strong>
            <small style={subtitleStyle} {...subtitleProps}>{subtitle}</small>
          </span>
        </a>
        <nav className="nav" aria-label="Menu principal">
          <a href="/#sobre" style={navStyle} {...navAboutProps}>{navAboutLabel}</a>
          <a href="/#tratamentos" style={navStyle} {...navTreatmentsProps}>{navTreatmentsLabel}</a>
          <a href="/#casos" style={navStyle} {...navCasesProps}>{navCasesLabel}</a>
          <a href="/#contato" style={navStyle} {...navContactProps}>{navContactLabel}</a>
        </nav>
        <MobileNavigation
          links={[
            {href: '/#sobre', label: navAboutLabel},
            {href: '/#tratamentos', label: navTreatmentsLabel},
            {href: '/#casos', label: navCasesLabel},
            {href: '/#contato', label: navContactLabel},
          ]}
          navStyle={navStyle}
          categoryStyle={categoryStyle}
        />
      </div>
      <div className="category-nav-shell">
        <nav className="container category-nav" aria-label="Categorias de atendimento">
          {serviceMenuItems.filter((item) => item.href !== '/').map((item) => (
            <a key={item.href} href={item.href} style={categoryStyle || navStyle} data-brand-style="navStyle">{item.label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}
