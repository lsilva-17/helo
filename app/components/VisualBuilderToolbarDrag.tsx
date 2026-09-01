'use client';

import {useEffect} from 'react';

const STORAGE_KEY = 'helo-visual-builder-toolbar-position';

type ToolbarPosition = {left: number; top: number};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function applyPosition(toolbar: HTMLElement, position: ToolbarPosition) {
  const maxLeft = Math.max(8, window.innerWidth - toolbar.offsetWidth - 8);
  const maxTop = Math.max(8, window.innerHeight - toolbar.offsetHeight - 8);
  const left = clamp(position.left, 8, maxLeft);
  const top = clamp(position.top, 8, maxTop);

  toolbar.style.left = `${left}px`;
  toolbar.style.top = `${top}px`;
  toolbar.style.right = 'auto';
  toolbar.style.bottom = 'auto';
  toolbar.dataset.vbToolbarMoved = 'true';
}

function readStoredPosition(): ToolbarPosition | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ToolbarPosition;
    if (!Number.isFinite(parsed.left) || !Number.isFinite(parsed.top)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function VisualBuilderToolbarDrag() {
  useEffect(() => {
    if (window.self === window.top || window.location.pathname.startsWith('/studio')) return;

    let cleanupCurrent: (() => void) | null = null;

    const install = () => {
      const toolbar = document.querySelector<HTMLElement>('.vb-toolbar');
      const handle = toolbar?.querySelector<HTMLElement>('.vb-toolbar-head');
      if (!toolbar || !handle || toolbar.dataset.vbToolbarDragReady === 'true') return;

      toolbar.dataset.vbToolbarDragReady = 'true';
      handle.style.cursor = 'move';
      handle.style.userSelect = 'none';
      handle.title = 'Arraste para mover a caixa de edição';

      const stored = readStoredPosition();
      if (stored) applyPosition(toolbar, stored);

      let dragging = false;
      let pointerId = -1;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;

      const pointerDown = (event: PointerEvent) => {
        const target = event.target instanceof HTMLElement ? event.target : null;
        if (target?.closest('button, input, select, textarea, a')) return;

        const rect = toolbar.getBoundingClientRect();
        dragging = true;
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        handle.setPointerCapture?.(pointerId);
        document.documentElement.classList.add('vb-toolbar-dragging');
        event.preventDefault();
      };

      const pointerMove = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        applyPosition(toolbar, {
          left: startLeft + event.clientX - startX,
          top: startTop + event.clientY - startY,
        });
      };

      const pointerUp = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        dragging = false;
        document.documentElement.classList.remove('vb-toolbar-dragging');
        const rect = toolbar.getBoundingClientRect();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({left: rect.left, top: rect.top}));
        handle.releasePointerCapture?.(pointerId);
      };

      const resize = () => {
        if (toolbar.dataset.vbToolbarMoved !== 'true') return;
        const rect = toolbar.getBoundingClientRect();
        applyPosition(toolbar, {left: rect.left, top: rect.top});
      };

      handle.addEventListener('pointerdown', pointerDown);
      handle.addEventListener('pointermove', pointerMove);
      handle.addEventListener('pointerup', pointerUp);
      handle.addEventListener('pointercancel', pointerUp);
      window.addEventListener('resize', resize);

      cleanupCurrent = () => {
        handle.removeEventListener('pointerdown', pointerDown);
        handle.removeEventListener('pointermove', pointerMove);
        handle.removeEventListener('pointerup', pointerUp);
        handle.removeEventListener('pointercancel', pointerUp);
        window.removeEventListener('resize', resize);
      };
    };

    install();
    const observer = new MutationObserver(install);
    observer.observe(document.body, {childList: true, subtree: true});

    return () => {
      observer.disconnect();
      cleanupCurrent?.();
      document.documentElement.classList.remove('vb-toolbar-dragging');
    };
  }, []);

  return null;
}
