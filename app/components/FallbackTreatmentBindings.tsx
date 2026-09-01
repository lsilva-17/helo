'use client';

import {useEffect} from 'react';

const fallbackIds = ['facetas', 'clareamento', 'avaliacao'] as const;

function bindText(element: HTMLElement | null, documentId: string, field: 'title' | 'summary', label: string, styleKey: string, defaultFont: string, defaultSize: number) {
  if (!element || element.dataset.vbField) return;
  element.dataset.vbDocId = documentId;
  element.dataset.vbDocType = 'treatment';
  element.dataset.vbField = field;
  element.dataset.vbLabel = label;
  element.dataset.vbStyleDocId = 'siteSettings';
  element.dataset.vbStyleDocType = 'siteSettings';
  element.dataset.vbFontField = `${styleKey}Font`;
  element.dataset.vbSizeField = `${styleKey}Size`;
  element.dataset.vbAlignField = `${styleKey}Align`;
  element.dataset.vbFontValue = defaultFont;
  element.dataset.vbSizeValue = String(defaultSize);
  element.dataset.vbAlignValue = 'left';
  element.dataset.vbFallbackCard = 'true';
}

function bindFallbackCards() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.gallery-card'));
  if (cards.length !== 3) return;

  cards.forEach((card, index) => {
    const documentId = fallbackIds[index];
    if (!documentId) return;
    const title = card.querySelector<HTMLElement>('.gallery-body h3');
    const summary = card.querySelector<HTMLElement>('.gallery-body p');
    if (title?.dataset.vbField || summary?.dataset.vbField) return;

    bindText(title, documentId, 'title', `Tratamento ${index + 1} · título`, 'treatmentCardTitleStyle', 'editorial', 26);
    bindText(summary, documentId, 'summary', `Tratamento ${index + 1} · descrição`, 'treatmentCardBodyStyle', 'sans', 16);
  });
}

export function FallbackTreatmentBindings() {
  useEffect(() => {
    if (window.self === window.top || window.location.pathname.startsWith('/studio')) return;
    bindFallbackCards();
    const observer = new MutationObserver(bindFallbackCards);
    observer.observe(document.body, {childList: true, subtree: true});
    return () => observer.disconnect();
  }, []);

  return null;
}
