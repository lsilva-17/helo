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

type ResizeBox = {left: number; top: number; width: number; height: number} | null;

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

function applyWidth(selected: Selected, width: number) {
  selected.element.style.width = `${width}%`;
  selected.element.style.maxWidth = '100%';
}

export function VisualCustomizationControls() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [status, setStatus] = useState('');
  const [resizeBox, setResizeBox] = useState<ResizeBox>(null);

  useEffect(() => {
    if (window.self === window.top || window.location.pathname.startsWith('/studio')) return;

    const sync = () => {
      const element = document.querySelector<HTMLElement>('.vb-selected[data-vb-field]');
      if (!element) {
        setSelected(null);
        setResizeBox(null);
        return;
      }
      setSelected(selectionFromElement(element));
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['class']});
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selected || selected.isButton) {
      setResizeBox(null);
      return;
    }

    const updateBox = () => {
      const rect = selected.element.getBoundingClientRect();
      setResizeBox({left: rect.left, top: rect.top, width: rect.width, height: rect.height});
    };

    updateBox();
    window.addEventListener('resize', updateBox);
    window.addEventListener('scroll', updateBox, true);
    return () => {
      window.removeEventListener('resize', updateBox);
      window.removeEventListener('scroll', updateBox, true);
    };
  }, [selected]);

  const canResizeText = useMemo(() => Boolean(selected && !selected.isButton), [selected]);
  if (!selected) return null;

  const persistWidth = async (width: number) => {
    setStatus('Salvando…');
    try {
      await save({kind: 'textWidth', key: selected.key, label: selected.label, width});
      setStatus('Salvo no rascunho');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao salvar');
    }
  };

  const updateWidth = async (width: number) => {
    applyWidth(selected, width);
    setSelected({...selected, width});
    requestAnimationFrame(() => {
      const rect = selected.element.getBoundingClientRect();
      setResizeBox({left: rect.left, top: rect.top, width: rect.width, height: rect.height});
    });
    await persistWidth(width);
  };

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!selected || selected.isButton) return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const parentWidth = selected.element.parentElement?.getBoundingClientRect().width || selected.element.getBoundingClientRect().width || 1;
    const startWidth = selected.element.getBoundingClientRect().width;
    let latestWidth = selected.width;

    const move = (pointerEvent: PointerEvent) => {
      const pixels = Math.max(parentWidth * 0.25, Math.min(parentWidth, startWidth + pointerEvent.clientX - startX));
      latestWidth = Math.max(25, Math.min(100, Math.round((pixels / parentWidth) * 100)));
      applyWidth(selected, latestWidth);
      setSelected((current) => current ? {...current, width: latestWidth} : current);
      const rect = selected.element.getBoundingClientRect();
      setResizeBox({left: rect.left, top: rect.top, width: rect.width, height: rect.height});
      setStatus(`Largura: ${latestWidth}%`);
    };

    const end = async () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      await persistWidth(latestWidth);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, {once: true});
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
    <>
      <div className="vb-extra-controls" data-testid="visual-customization-controls" aria-label="Customização adicional">
        <strong>Mais opções</strong>
        <span className="vb-extra-label">{selected.label}</span>

        {selected.isButton && (
          <>
            <label>
              <span>Cor do botão</span>
              <input data-testid="button-background-color" type="color" value={selected.background} onChange={(event) => void updateButton(event.target.value, selected.text)} />
            </label>
            <label>
              <span>Cor do texto do botão</span>
              <input data-testid="button-text-color" type="color" value={selected.text} onChange={(event) => void updateButton(selected.background, event.target.value)} />
            </label>
          </>
        )}

        {canResizeText && (
          <label>
            <span>Largura da caixa de texto <b>{selected.width}%</b></span>
            <input data-testid="text-box-width" type="range" min="25" max="100" step="1" value={selected.width} onChange={(event) => void updateWidth(Number(event.target.value))} />
          </label>
        )}

        {status && <small>{status}</small>}
      </div>

      {canResizeText && resizeBox && (
        <div
          className="vb-text-resize-outline"
          aria-hidden="true"
          style={{left: resizeBox.left, top: resizeBox.top, width: resizeBox.width, height: resizeBox.height}}
        >
          <button
            type="button"
            className="vb-text-resize-handle"
            data-testid="text-resize-handle"
            aria-label="Arrastar para redimensionar caixa de texto"
            onPointerDown={startResize}
          />
        </div>
      )}
    </>
  );
}
