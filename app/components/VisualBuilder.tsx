'use client';

import {ChangeEvent, useEffect, useRef, useState} from 'react';
import {stegaClean} from 'next-sanity';

type Selection = {
  element: HTMLElement;
  documentId: string;
  documentType: string;
  field?: string;
  imageField?: string;
  label: string;
  fontField?: string;
  sizeField?: string;
  fontValue?: string;
  sizeValue?: number;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const fontStacks: Record<string, string> = {
  editorial: "'Cormorant Garamond', Georgia, serif",
  sans: "'Manrope', Arial, sans-serif",
  classic: "Georgia, 'Times New Roman', serif",
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

function selectionFromElement(element: HTMLElement): Selection | null {
  const documentId = element.dataset.vbDocId;
  const documentType = element.dataset.vbDocType;
  if (!documentId || !documentType) return null;

  return {
    element,
    documentId,
    documentType,
    field: element.dataset.vbField,
    imageField: element.dataset.vbImageField,
    label: element.dataset.vbLabel || 'Elemento',
    fontField: element.dataset.vbFontField,
    sizeField: element.dataset.vbSizeField,
    fontValue: element.dataset.vbFontValue,
    sizeValue: element.dataset.vbSizeValue ? Number(element.dataset.vbSizeValue) : undefined,
  };
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
    if (window.self === window.top) return;
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
      }, 550);
    };

    const clickHandler = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const editable = target?.closest<HTMLElement>('[data-vb-field], [data-vb-image-field]');
      if (!editable) return;

      const current = selectionFromElement(editable);
      if (!current) return;

      event.preventDefault();
      event.stopPropagation();
      if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();

      const previous = selectedRef.current?.element;
      if (previous && previous !== editable && previous.dataset.vbField) {
        previous.removeAttribute('contenteditable');
        previous.classList.remove('vb-selected');
      }

      editable.classList.add('vb-selected');
      setSelection(current);
      setMessage(current.imageField ? 'Selecione uma nova imagem no painel abaixo.' : 'Edite o texto diretamente na página.');

      if (current.field) {
        const cleanText = stegaClean(editable.innerText || editable.textContent || '');
        if ((editable.innerText || editable.textContent || '') !== cleanText) editable.innerText = cleanText;
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
        handle.textContent = '⋮⋮  Arrastar';
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
          const id = event.dataTransfer?.getData('text/plain');
          if (!id || id === section.dataset.vbSection) return;

          const container = section.parentElement;
          const dragged = container?.querySelector<HTMLElement>(`[data-vb-section="${id}"]`);
          if (!container || !dragged) return;

          const rect = section.getBoundingClientRect();
          const after = event.clientY > rect.top + rect.height / 2;
          container.insertBefore(dragged, after ? section.nextSibling : section);

          const order = Array.from(container.querySelectorAll<HTMLElement>(':scope > [data-vb-section]'))
            .map((item) => item.dataset.vbSection)
            .filter((item): item is string => Boolean(item));

          setSaveState('saving');
          try {
            await patchField('siteSettings', 'siteSettings', 'sectionOrder', order);
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

  const updateStyle = async (field: string | undefined, value: string | number, kind: 'font' | 'size') => {
    if (!selection || !field) return;
    if (kind === 'font') {
      selection.element.style.fontFamily = fontStacks[String(value)] || fontStacks.sans;
      selection.element.dataset.vbFontValue = String(value);
      setSelection({...selection, fontValue: String(value)});
    } else {
      selection.element.style.fontSize = `${value}px`;
      selection.element.dataset.vbSizeValue = String(value);
      setSelection({...selection, sizeValue: Number(value)});
    }

    setSaveState('saving');
    try {
      await patchField(selection.documentId, selection.documentType, field, value);
      setSaveState('saved');
      setMessage('Estilo salvo como rascunho.');
    } catch (error) {
      setSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar estilo');
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

  return (
    <>
      <div className="vb-mode-badge">Construtor visual ativo</div>
      {selection && (
        <div className="vb-toolbar" role="dialog" aria-label={`Editar ${selection.label}`}>
          <div className="vb-toolbar-head">
            <div>
              <strong>{selection.label}</strong>
              <span>{selection.imageField ? 'Imagem' : 'Texto'}</span>
            </div>
            <button type="button" onClick={closeSelection} aria-label="Fechar editor">×</button>
          </div>

          {selection.field && <p className="vb-help">Clique no texto e digite normalmente. As alterações ficam em rascunho.</p>}

          {selection.fontField && (
            <label className="vb-control">
              <span>Fonte</span>
              <select value={selection.fontValue || 'editorial'} onChange={(event) => updateStyle(selection.fontField, event.target.value, 'font')}>
                <option value="editorial">Editorial</option>
                <option value="sans">Moderna</option>
                <option value="classic">Clássica</option>
              </select>
            </label>
          )}

          {selection.sizeField && (
            <label className="vb-control">
              <span>Tamanho <b>{selection.sizeValue || 16}px</b></span>
              <input
                type="range"
                min="12"
                max="96"
                step="1"
                value={selection.sizeValue || 16}
                onChange={(event) => updateStyle(selection.sizeField, Number(event.target.value), 'size')}
              />
            </label>
          )}

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
