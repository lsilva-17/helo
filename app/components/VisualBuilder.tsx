'use client';

import {useEffect, useRef, useState} from 'react';
import type {ChangeEvent} from 'react';
import {stegaClean} from 'next-sanity';

type Selection = {
  element: HTMLElement;
  documentId: string;
  documentType: string;
  field?: string;
  imageField?: string;
  label: string;
  styleDocumentId: string;
  styleDocumentType: string;
  fontField?: string;
  sizeField?: string;
  alignField?: string;
  colorField?: string;
  backgroundField?: string;
  widthField?: string;
  xField?: string;
  yField?: string;
  paddingField?: string;
  heightField?: string;
  positionXField?: string;
  positionYField?: string;
  fontValue?: string;
  sizeValue?: number;
  alignValue?: string;
  colorValue?: string;
  backgroundValue?: string;
  widthValue?: number;
  xValue?: number;
  yValue?: number;
  paddingValue?: number;
  heightValue?: number;
  positionXValue?: number;
  positionYValue?: number;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type StyleKind = 'font' | 'size' | 'align' | 'color' | 'background' | 'width' | 'x' | 'y' | 'padding' | 'height' | 'positionX' | 'positionY';

const fontStacks: Record<string, string> = {
  editorial: "'Cormorant Garamond', Georgia, serif",
  sans: "'Manrope', Arial, sans-serif",
  classic: "Georgia, 'Times New Roman', serif",
  arial: 'Arial, Helvetica, sans-serif',
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

async function patchField(documentId: string, documentType: string, field: string, value: unknown) {
  const response = await fetch('/api/visual-builder', {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({documentId, documentType, field, value}),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || 'Não foi possível salvar a alteração.');
  return body;
}

function numeric(value?: string) {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function cssColorToHex(value: string, fallback: string) {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
  const match = value.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,/\s]+([\d.]+))?\)/i);
  if (!match || (match[4] !== undefined && Number(match[4]) === 0)) return fallback;
  return `#${[match[1], match[2], match[3]].map((part) => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, '0')).join('')}`;
}

function selectionFromElement(element: HTMLElement): Selection | null {
  const documentId = element.dataset.vbDocId || element.dataset.vbStyleDocId;
  const documentType = element.dataset.vbDocType || element.dataset.vbStyleDocType;
  if (!documentId || !documentType) return null;

  const fontField = element.dataset.vbFontField;
  const widthField = element.dataset.vbWidthField;
  const computed = getComputedStyle(element);

  return {
    element,
    documentId,
    documentType,
    field: element.dataset.vbField,
    imageField: element.dataset.vbImageField,
    label: element.dataset.vbLabel || 'Componente',
    styleDocumentId: element.dataset.vbStyleDocId || documentId,
    styleDocumentType: element.dataset.vbStyleDocType || documentType,
    fontField,
    sizeField: element.dataset.vbSizeField,
    alignField: element.dataset.vbAlignField,
    colorField: fontField?.replace(/Font$/, 'Color'),
    backgroundField: element.dataset.vbLayout === 'true' && widthField ? widthField.replace(/Width$/, 'Background') : undefined,
    widthField,
    xField: element.dataset.vbXField,
    yField: element.dataset.vbYField,
    paddingField: element.dataset.vbPaddingField,
    heightField: element.dataset.vbHeightField,
    positionXField: element.dataset.vbPositionXField,
    positionYField: element.dataset.vbPositionYField,
    fontValue: element.dataset.vbFontValue,
    sizeValue: numeric(element.dataset.vbSizeValue),
    alignValue: element.dataset.vbAlignValue,
    colorValue: fontField ? cssColorToHex(computed.color, '#2b2621') : undefined,
    backgroundValue: element.dataset.vbLayout === 'true' ? cssColorToHex(computed.backgroundColor, '#ffffff') : undefined,
    widthValue: numeric(element.dataset.vbWidthValue),
    xValue: numeric(element.dataset.vbXValue),
    yValue: numeric(element.dataset.vbYValue),
    paddingValue: numeric(element.dataset.vbPaddingValue),
    heightValue: numeric(element.dataset.vbHeightValue),
    positionXValue: numeric(element.dataset.vbPositionXValue),
    positionYValue: numeric(element.dataset.vbPositionYValue),
  };
}

function applyTranslate(selection: Selection, nextX?: number, nextY?: number) {
  const x = nextX ?? selection.xValue ?? 0;
  const y = nextY ?? selection.yValue ?? 0;
  selection.element.style.transform = `translate(${x}px, ${y}px)`;
}

function selectionType(selection: Selection) {
  if (selection.imageField) return 'Imagem';
  if (selection.field) return 'Texto';
  return 'Layout';
}

export function VisualBuilder() {
  const [enabled, setEnabled] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [message, setMessage] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef<Selection | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    selectedRef.current = selection;
  }, [selection]);

  useEffect(() => {
    if (window.self === window.top || window.location.pathname.startsWith('/studio')) return;
    setEnabled(true);
    document.documentElement.classList.add('visual-builder-enabled');

    const saveText = (current: Selection, value: string) => {
      if (!current.field) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveState('saving');
      debounceRef.current = setTimeout(async () => {
        try {
          await patchField(current.documentId, current.documentType, current.field!, stegaClean(value));
          setSaveState('saved');
          setMessage('Alteração salva como rascunho.');
        } catch (error) {
          setSaveState('error');
          setMessage(error instanceof Error ? error.message : 'Erro ao salvar');
        }
      }, 450);
    };

    const clickHandler = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const editable = target?.closest<HTMLElement>('[data-vb-field], [data-vb-image-field], [data-vb-layout]');
      if (!editable) return;

      const current = selectionFromElement(editable);
      if (!current) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const previous = selectedRef.current?.element;
      if (previous && previous !== editable) {
        previous.removeAttribute('contenteditable');
        previous.classList.remove('vb-selected');
      }

      editable.classList.add('vb-selected');
      setSelection(current);
      setMessage(current.imageField ? 'Troque a imagem ou ajuste enquadramento e tamanho.' : current.field ? 'Edite o texto diretamente ou ajuste fonte, cor e posição.' : 'Ajuste tamanho, posição, espaçamento e cor de fundo.');

      if (current.field) {
        const original = editable.innerText || editable.textContent || '';
        const cleanText = stegaClean(original);
        if (original !== cleanText) editable.innerText = cleanText;
        editable.setAttribute('contenteditable', 'true');
        editable.setAttribute('spellcheck', 'true');
        editable.focus({preventScroll: true});
      }
    };

    const inputHandler = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const current = selectedRef.current;
      if (!target || !current || target !== current.element || !current.field) return;
      saveText(current, target.innerText || target.textContent || '');
    };

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const current = selectedRef.current;
      if (current?.element) {
        current.element.removeAttribute('contenteditable');
        current.element.classList.remove('vb-selected');
      }
      setSelection(null);
    };

    const installSectionHandles = () => {
      document.querySelectorAll<HTMLElement>('[data-vb-section]').forEach((section) => {
        section.classList.add('vb-section');
        if (section.querySelector(':scope > .vb-drag-handle')) return;

        const handle = document.createElement('button');
        handle.type = 'button';
        handle.className = 'vb-drag-handle';
        handle.textContent = '⋮⋮  Arrastar seção';
        handle.draggable = true;
        handle.setAttribute('aria-label', `Mover seção ${section.dataset.vbSection || ''}`);

        handle.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
        handle.addEventListener('dragstart', (event) => {
          event.dataTransfer?.setData('text/plain', section.dataset.vbSection || '');
          event.dataTransfer?.setDragImage(section, 20, 20);
          section.classList.add('vb-dragging');
        });
        handle.addEventListener('dragend', () => section.classList.remove('vb-dragging'));

        section.addEventListener('dragover', (event) => {
          event.preventDefault();
          section.classList.add('vb-drop-target');
        });
        section.addEventListener('dragleave', () => section.classList.remove('vb-drop-target'));
        section.addEventListener('drop', async (event) => {
          event.preventDefault();
          section.classList.remove('vb-drop-target');
          const draggedId = event.dataTransfer?.getData('text/plain');
          const targetId = section.dataset.vbSection;
          if (!draggedId || !targetId || draggedId === targetId) return;

          const container = section.parentElement;
          if (!container) return;

          const sectionElements = Array.from(container.querySelectorAll<HTMLElement>(':scope > [data-vb-section]'));
          const visualOrder = sectionElements
            .slice()
            .sort((a, b) => Number.parseInt(getComputedStyle(a).order || '0', 10) - Number.parseInt(getComputedStyle(b).order || '0', 10))
            .map((item) => item.dataset.vbSection)
            .filter((item): item is string => Boolean(item));

          const sourceIndex = visualOrder.indexOf(draggedId);
          if (sourceIndex === -1) return;
          visualOrder.splice(sourceIndex, 1);

          const targetIndex = visualOrder.indexOf(targetId);
          if (targetIndex === -1) return;
          const rect = section.getBoundingClientRect();
          const after = event.clientY > rect.top + rect.height / 2;
          visualOrder.splice(targetIndex + (after ? 1 : 0), 0, draggedId);

          sectionElements.forEach((item) => {
            const id = item.dataset.vbSection;
            if (id) item.style.order = String(visualOrder.indexOf(id));
          });

          setSaveState('saving');
          try {
            await patchField('siteSettings', 'siteSettings', 'sectionOrder', visualOrder);
            setSaveState('saved');
            setMessage('Nova ordem salva como rascunho.');
          } catch (error) {
            setSaveState('error');
            setMessage(error instanceof Error ? error.message : 'Erro ao reordenar');
          }
        });

        section.prepend(handle);
      });
    };

    installSectionHandles();
    const observer = new MutationObserver(() => installSectionHandles());
    observer.observe(document.body, {childList: true, subtree: true});

    window.addEventListener('click', clickHandler, true);
    document.addEventListener('input', inputHandler, true);
    window.addEventListener('keydown', keyHandler, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('click', clickHandler, true);
      document.removeEventListener('input', inputHandler, true);
      window.removeEventListener('keydown', keyHandler, true);
      document.documentElement.classList.remove('visual-builder-enabled');
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!enabled) return null;

  const closeSelection = () => {
    const current = selectedRef.current;
    current?.element.removeAttribute('contenteditable');
    current?.element.classList.remove('vb-selected');
    setSelection(null);
    setMessage('');
  };

  const updateStyle = async (field: string | undefined, value: string | number, kind: StyleKind) => {
    if (!selection || !field) return;

    const next = {...selection};
    if (kind === 'font') {
      selection.element.style.fontFamily = fontStacks[String(value)] || fontStacks.sans;
      selection.element.dataset.vbFontValue = String(value);
      next.fontValue = String(value);
    } else if (kind === 'size') {
      selection.element.style.fontSize = `${value}px`;
      selection.element.dataset.vbSizeValue = String(value);
      next.sizeValue = Number(value);
    } else if (kind === 'align') {
      selection.element.style.textAlign = String(value);
      selection.element.dataset.vbAlignValue = String(value);
      next.alignValue = String(value);
    } else if (kind === 'color') {
      selection.element.style.color = String(value);
      next.colorValue = String(value);
    } else if (kind === 'background') {
      selection.element.style.backgroundColor = String(value);
      next.backgroundValue = String(value);
    } else if (kind === 'width') {
      selection.element.style.width = `${value}%`;
      selection.element.dataset.vbWidthValue = String(value);
      next.widthValue = Number(value);
    } else if (kind === 'x') {
      selection.element.dataset.vbXValue = String(value);
      next.xValue = Number(value);
      applyTranslate(next, Number(value), next.yValue);
    } else if (kind === 'y') {
      selection.element.dataset.vbYValue = String(value);
      next.yValue = Number(value);
      applyTranslate(next, next.xValue, Number(value));
    } else if (kind === 'padding') {
      selection.element.style.paddingTop = `${value}px`;
      selection.element.style.paddingBottom = `${value}px`;
      selection.element.dataset.vbPaddingValue = String(value);
      next.paddingValue = Number(value);
    } else if (kind === 'height') {
      selection.element.style.height = `${value}px`;
      selection.element.dataset.vbHeightValue = String(value);
      next.heightValue = Number(value);
    } else if (kind === 'positionX' || kind === 'positionY') {
      const nextX = kind === 'positionX' ? Number(value) : next.positionXValue ?? 50;
      const nextY = kind === 'positionY' ? Number(value) : next.positionYValue ?? 50;
      next.positionXValue = nextX;
      next.positionYValue = nextY;
      selection.element.dataset.vbPositionXValue = String(nextX);
      selection.element.dataset.vbPositionYValue = String(nextY);
      selection.element.style.objectPosition = `${nextX}% ${nextY}%`;
    }

    setSelection(next);
    setSaveState('saving');
    try {
      await patchField(selection.styleDocumentId, selection.styleDocumentType, field, value);
      setSaveState('saved');
      setMessage('Ajuste salvo como rascunho.');
    } catch (error) {
      setSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar ajuste');
    }
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selection?.imageField) return;

    const form = new FormData();
    form.set('file', file);
    form.set('documentId', selection.documentId);
    form.set('documentType', selection.documentType);
    form.set('field', selection.imageField);

    setSaveState('saving');
    setMessage('Enviando imagem…');
    try {
      const response = await fetch('/api/visual-builder/image', {method: 'POST', credentials: 'same-origin', body: form});
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || 'Não foi possível trocar a imagem.');
      if (selection.element instanceof HTMLImageElement && body.url) selection.element.src = body.url;
      setSaveState('saved');
      setMessage('Imagem atualizada no rascunho.');
    } catch (error) {
      setSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Erro ao trocar imagem');
    } finally {
      event.target.value = '';
    }
  };

  const range = (label: string, field: string | undefined, value: number | undefined, min: number, max: number, kind: StyleKind, suffix: string) => field ? (
    <label className="vb-control">
      <span>{label} <b>{value ?? 0}{suffix}</b></span>
      <input type="range" min={min} max={max} step="1" value={value ?? 0} onChange={(event) => updateStyle(field, Number(event.target.value), kind)} />
    </label>
  ) : null;

  return (
    <>
      <div className="vb-mode-badge">Construtor visual ativo</div>
      {selection && (
        <div className="vb-toolbar" role="dialog" aria-label={`Editar ${selection.label}`}>
          <div className="vb-toolbar-head">
            <div>
              <strong>{selection.label}</strong>
              <span>{selectionType(selection)}</span>
            </div>
            <button type="button" onClick={closeSelection} aria-label="Fechar editor">×</button>
          </div>

          <p className="vb-help">{selection.field ? 'Digite diretamente no conteúdo. Use os controles abaixo para aparência, cor e posição.' : selection.imageField ? 'Troque a imagem e ajuste o enquadramento sem sair da página.' : 'Use os controles abaixo para redimensionar, reposicionar e alterar o fundo do bloco.'}</p>

          {selection.fontField && (
            <label className="vb-control">
              <span>Fonte</span>
              <select value={selection.fontValue || 'sans'} onChange={(event) => updateStyle(selection.fontField, event.target.value, 'font')}>
                <option value="editorial">Cormorant Garamond</option>
                <option value="sans">Manrope</option>
                <option value="classic">Georgia</option>
                <option value="arial">Arial</option>
                <option value="roboto">Roboto</option>
                <option value="inter">Inter</option>
                <option value="opensans">Open Sans</option>
                <option value="montserrat">Montserrat</option>
                <option value="poppins">Poppins</option>
                <option value="dmsans">DM Sans</option>
                <option value="lato">Lato</option>
                <option value="playfair">Playfair Display</option>
                <option value="lora">Lora</option>
                <option value="merriweather">Merriweather</option>
              </select>
            </label>
          )}

          {selection.colorField && (
            <label className="vb-control">
              <span>Cor do texto <b>{selection.colorValue}</b></span>
              <input type="color" value={selection.colorValue || '#2b2621'} onChange={(event) => updateStyle(selection.colorField, event.target.value, 'color')} />
            </label>
          )}

          {selection.backgroundField && (
            <label className="vb-control">
              <span>Cor de fundo <b>{selection.backgroundValue}</b></span>
              <input type="color" value={selection.backgroundValue || '#ffffff'} onChange={(event) => updateStyle(selection.backgroundField, event.target.value, 'background')} />
            </label>
          )}

          {selection.alignField && (
            <label className="vb-control">
              <span>Alinhamento</span>
              <select value={selection.alignValue || 'left'} onChange={(event) => updateStyle(selection.alignField, event.target.value, 'align')}>
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </label>
          )}

          {range('Tamanho', selection.sizeField, selection.sizeValue || 16, 10, 110, 'size', 'px')}
          {range('Largura', selection.widthField, selection.widthValue || 100, 60, 100, 'width', '%')}
          {range('Mover horizontal', selection.xField, selection.xValue || 0, -100, 100, 'x', 'px')}
          {range('Mover vertical', selection.yField, selection.yValue || 0, -80, 80, 'y', 'px')}
          {range('Espaçamento vertical', selection.paddingField, selection.paddingValue || 32, 16, 160, 'padding', 'px')}
          {range('Altura da imagem', selection.heightField, selection.heightValue || 320, 160, 720, 'height', 'px')}
          {range('Foco horizontal', selection.positionXField, selection.positionXValue ?? 50, 0, 100, 'positionX', '%')}
          {range('Foco vertical', selection.positionYField, selection.positionYValue ?? 50, 0, 100, 'positionY', '%')}

          {selection.imageField && (
            <>
              <button type="button" className="vb-primary-action" onClick={() => fileInputRef.current?.click()}>Trocar imagem</button>
              <input ref={fileInputRef} hidden type="file" accept="image/*" onChange={uploadImage} />
            </>
          )}

          <div className={`vb-status vb-status-${saveState}`}>
            {saveState === 'saving' ? 'Salvando…' : saveState === 'saved' ? 'Salvo' : saveState === 'error' ? 'Erro' : 'Rascunho'}
            {message && <span>{message}</span>}
          </div>
        </div>
      )}
    </>
  );
}
