'use client';

import {useEffect} from 'react';

type Resolver = {
  resolve: (response: Response) => void;
  reject: (reason?: unknown) => void;
};

type PendingPatch = {
  input: RequestInfo | URL;
  init?: RequestInit;
  timer: ReturnType<typeof setTimeout>;
  resolvers: Resolver[];
};

const PATCH_DEBOUNCE_MS = 1200;

function visualBuilderPatchKey(input: RequestInfo | URL, init?: RequestInit) {
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (method !== 'PATCH') return null;

  const rawUrl = input instanceof Request ? input.url : String(input);
  let pathname = rawUrl;
  try {
    pathname = new URL(rawUrl, window.location.href).pathname;
  } catch {
    // Keep the raw value; non-URL inputs simply fall through below.
  }
  if (pathname !== '/api/visual-builder') return null;

  const body = init?.body;
  if (typeof body !== 'string') return null;

  try {
    const payload = JSON.parse(body) as {documentId?: string; documentType?: string; field?: string};
    if (!payload.documentId || !payload.field) return null;
    return `${payload.documentType || 'document'}:${payload.documentId}:${payload.field}`;
  } catch {
    return null;
  }
}

export function PresentationEditingStabilizer() {
  useEffect(() => {
    if (window.self === window.top || window.location.pathname.startsWith('/studio')) return;

    const nativeFetch = window.fetch.bind(window);
    const pending = new Map<string, PendingPatch>();
    let disposed = false;

    const execute = async (key: string) => {
      const entry = pending.get(key);
      if (!entry) return;
      pending.delete(key);
      clearTimeout(entry.timer);

      try {
        const response = await nativeFetch(entry.input, entry.init);
        entry.resolvers.forEach(({resolve}) => resolve(response.clone()));
      } catch (error) {
        entry.resolvers.forEach(({reject}) => reject(error));
      }
    };

    const schedule = (key: string, input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        const previous = pending.get(key);
        if (previous) clearTimeout(previous.timer);

        const resolvers = previous?.resolvers || [];
        resolvers.push({resolve, reject});

        const timer = setTimeout(() => void execute(key), PATCH_DEBOUNCE_MS);
        pending.set(key, {input, init, timer, resolvers});
      });

    const stabilizedFetch: typeof window.fetch = (input, init) => {
      const key = visualBuilderPatchKey(input, init);
      if (!key || disposed) return nativeFetch(input, init);
      return schedule(key, input, init);
    };

    const flushPending = () => {
      for (const key of Array.from(pending.keys())) void execute(key);
    };

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.isContentEditable) flushPending();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flushPending();
    };

    window.fetch = stabilizedFetch;
    document.documentElement.dataset.presentationEditing = 'stable';
    document.addEventListener('focusout', handleFocusOut, true);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', flushPending);

    return () => {
      disposed = true;
      flushPending();
      window.fetch = nativeFetch;
      delete document.documentElement.dataset.presentationEditing;
      document.removeEventListener('focusout', handleFocusOut, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', flushPending);
    };
  }, []);

  return null;
}
