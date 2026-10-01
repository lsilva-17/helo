import {serviceMenuItems} from '@/app/lib/servicePages';

type SiteHeaderProps = {
  brandName?: string;
  subtitle?: string;
  logoUrl?: string;
};

export function SiteHeader({
  brandName = 'Dra. Heloisa Veiga',
  subtitle = 'Odontologia estética · São Paulo',
  logoUrl = '/brand-hv.svg',
}: SiteHeaderProps) {
  return (
    <header className="site-header service-site-header">
      <div className="container header-inner">
        <a className="brand" href="/" aria-label="Ir para a página inicial">
          <img className="brand-mark" src={logoUrl} alt="" />
          <span className="brand-text">
            <strong>{brandName}</strong>
            <small>{subtitle}</small>
          </span>
        </a>
        <details className="site-menu">
          <summary aria-label="Abrir menu de navegação">
            <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
            <span className="menu-label">Menu</span>
          </summary>
          <nav className="site-menu-panel" aria-label="Navegação entre páginas">
            {serviceMenuItems.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
