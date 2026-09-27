'use client';

import {useEffect} from 'react';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function placementFor(element: HTMLAnchorElement) {
  const section = element.closest<HTMLElement>('section[id], aside, header, footer');
  if (!section) return 'unknown';
  if (section.id) return section.id;
  if (section.matches('aside')) return 'floating_social';
  if (section.matches('header')) return 'header';
  if (section.matches('footer')) return 'footer';
  return 'unknown';
}

function pushEvent(event: string, anchor: HTMLAnchorElement) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    link_url: anchor.href,
    link_text: anchor.textContent?.trim() || anchor.getAttribute('aria-label') || '',
    placement: placementFor(anchor),
    page_path: window.location.pathname,
    page_location: window.location.href,
  });
}

export function ConversionTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;

      const href = anchor.href.toLowerCase();

      if (href.includes('wa.me/') || href.includes('whatsapp.com/')) {
        pushEvent('whatsapp_click', anchor);
        return;
      }

      if (href.startsWith('tel:')) {
        pushEvent('phone_click', anchor);
        return;
      }

      if (href.includes('instagram.com/')) {
        pushEvent('instagram_click', anchor);
      }
    };

    document.addEventListener('click', onClick, {capture: true});
    return () => document.removeEventListener('click', onClick, {capture: true});
  }, []);

  return null;
}
