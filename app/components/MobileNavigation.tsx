'use client';

import {useRef, type CSSProperties, type KeyboardEvent} from 'react';
import {serviceRelatedItems} from '@/app/lib/servicePages';

type MobileNavigationProps = {
  links: Array<{href: string; label: string}>;
  navStyle?: CSSProperties;
  categoryStyle?: CSSProperties;
};

export function MobileNavigation({links, navStyle, categoryStyle}: MobileNavigationProps) {
  const menu = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (menu.current) menu.current.open = false;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== 'Escape' || !menu.current?.open) return;
    event.preventDefault();
    closeMenu();
    menu.current?.querySelector('summary')?.focus();
  }

  return (
    <details className="mobile-navigation" ref={menu} onKeyDown={handleKeyDown}>
      <summary className="mobile-menu-toggle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Menu</span>
      </summary>
      <div className="mobile-menu-panel">
        <nav aria-label="Navegação móvel">
          <a href="/" style={navStyle} data-brand-style="navStyle" onClick={closeMenu}>Início</a>
          {links.map((link) => <a key={link.href} href={link.href} style={navStyle} data-brand-style="navStyle" onClick={closeMenu}>{link.label}</a>)}
        </nav>
        <nav aria-label="Tratamentos e localização">
          <p className="mobile-menu-label">Tratamentos e localização</p>
          {serviceRelatedItems.map((link) => <a key={link.href} href={link.href} style={categoryStyle || navStyle} data-brand-style="navStyle" onClick={closeMenu}>{link.label}</a>)}
        </nav>
      </div>
    </details>
  );
}
