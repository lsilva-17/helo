'use client';

import {useEffect} from 'react';

type ButtonStyle = {key: string; background?: string; text?: string};
type TextWidth = {key: string; width?: number};

type Payload = {buttonStyles?: ButtonStyle[]; textWidths?: TextWidth[]};

function elementKey(element: HTMLElement) {
  const doc = element.dataset.vbDocId || element.dataset.vbStyleDocId || 'siteSettings';
  const field = element.dataset.vbField || element.dataset.vbLabel || '';
  return `${doc}:${field}`;
}

function apply(payload: Payload) {
  const buttons = new Map((payload.buttonStyles || []).map((item) => [item.key, item]));
  const widths = new Map((payload.textWidths || []).map((item) => [item.key, item]));

  document.querySelectorAll<HTMLElement>('[data-vb-field]').forEach((element) => {
    const key = elementKey(element);
    const button = buttons.get(key);
    if (button && element.classList.contains('btn')) {
      if (button.background) element.style.backgroundColor = button.background;
      if (button.text) element.style.color = button.text;
    }

    const textWidth = widths.get(key);
    if (textWidth?.width) {
      element.style.width = `${textWidth.width}%`;
      element.style.maxWidth = '100%';
    }
  });
}

export function VisualCustomizationBridge() {
  useEffect(() => {
    let cancelled = false;
    let payload: Payload = {};

    const load = async () => {
      try {
        const response = await fetch('/api/visual-customization', {credentials: 'same-origin', cache: 'no-store'});
        if (!response.ok) return;
        payload = await response.json();
        if (!cancelled) apply(payload);
      } catch {
        // O site segue com os estilos padrão caso a camada opcional falhe.
      }
    };

    void load();
    const observer = new MutationObserver(() => apply(payload));
    observer.observe(document.body, {childList: true, subtree: true});

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
