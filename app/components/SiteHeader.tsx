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

        <nav className="nav" aria-label="Menu principal">
          <a href="/#sobre">Sobre</a>
          <a href="/#tratamentos">Tratamentos</a>
          <a href="/#casos">Casos</a>
          <a href="/#contato">Contato</a>
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
