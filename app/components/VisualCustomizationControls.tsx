'use client';

import {useEffect, useMemo, useState} from 'react';

type Selected = {
  element: HTMLElement;
  key: string;
  label: string;
  isButton: boolean;
  width: number;
  background: string;
  text: string;
};

function toHex(value: string, fallback: string) {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
  const match = value.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!match) return fallback;
  return `#${[match[1], match[2], match[3]].map((part) => Number(part).toString(16).padStart(2, '0')).join('')}`;
}

function selectionFromElement(element: HTMLElement): Selected | null {
  const field = element.dataset.vbField;
  if (!field) return null;
  const doc = element.dataset.vbDocId || element.dataset.vbStyleDocId || 'siteSettings';
  const computed = getComputedStyle(element);
  const parentWidth = element.parentElement?.getBoundingClientRect().width || element.getBoundingClientRect().width || 1;
  const ownWidth = element.getBoundingClientRect().width || parentWidth;
  const width = Math.max(25, Math.min(100, Math.round((ownWidth / parentWidth) * 100)));

  return {
    element,
    key: `${doc}:${field}`,
    label: element.dataset.vbLabel || field,
    isButton: element.classList.contains('btn'),
    width,
    background: toHex(computed.backgroundColor, '#0f766e'),
    text: toHex(computed.color, '#ffffff'),
  };
}

async function save(payload: Record<string, unknown>) {
  const response = await fetch('/api/visual-customization', {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || 'Falha ao salvar customização.');
}

export function VisualCustomizationControls() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (window.self === window.top || window.location.pathname.startsWith('/studio')) return;

    const sync = () => {
      const element = document.querySelector<HTMLElement>('.vb-selected[data-vb-field]');
      if (!element) return setSelected(null);
      setSelected(selectionFromElement(element));
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['class']});
    return () => observer.disconnect();
  }, []);

  const canResizeText = useMemo(() => Boolean(selected && !selected.isButton), [selected]);
  if (!selected) return null;

  const updateWidth = async (width: number) => {
    selected.element.style.width = `${width}%`;
    selected.element.style.maxWidth = '100%';
    setSelected({...selected, width});
    setStatus('Salvando…');
    try {
      await save({kind: 'textWidth', key: selected.key, label: selected.label, width});
      setStatus('Salvo no rascunho');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao salvar');
    }
  };

  const updateButton = async (background: string, text: string) => {
    selected.element.style.backgroundColor = background;
    selected.element.style.color = text;
    setSelected({...selected, background, text});
    setStatus('Salvando…');
    try {
      await save({kind: 'button', key: selected.key, label: selected.label, background, text});
      setStatus('Salvo no rascunho');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao salvar');
    }
  };

  return (
    <div className="vb-extra-controls" aria-label="Customização adicional">
      <strong>Mais opções</strong>
      <span className="vb-extra-label">{selected.label}</span>

      {selected.isButton && (
        <>
          <label>
            <span>Cor do botão</span>
            <input type="color" value={selected.background} onChange={(event) => void updateButton(event.target.value, selected.text)} />
          </label>
          <label>
            <span>Cor do texto do botão</span>
            <input type="color" value={selected.text} onChange={(event) => void updateButton(selected.background, event.target.value)} />
          </label>
        </>
      )}

      {canResizeText && (
        <label>
          <span>Largura da caixa de texto <b>{selected.width}%</b></span>
          <input type="range" min="25" max="100" step="1" value={selected.width} onChange={(event) => void updateWidth(Number(event.target.value))} />
        </label>
      )}

      {status && <small>{status}</small>}
    </div>
  );
}
