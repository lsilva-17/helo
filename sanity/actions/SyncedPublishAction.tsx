'use client';

import {useState} from 'react';
import {type DocumentActionComponent} from 'sanity';

export const SyncedPublishAction: DocumentActionComponent = (props) => {
  const publishedId = props.id.replace(/^drafts\./, '');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    label: publishing ? 'Publicando…' : 'Verificar e publicar',
    disabled: publishing,
    tone: 'positive',
    group: ['default', 'paneActions'],
    onHandle: async () => {
      setPublishing(true);
      setError(null);

      try {
        const response = await fetch('/api/visual-builder/publish', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({documentId: publishedId}),
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body?.error || 'Não foi possível publicar as alterações.');
        }

        props.onComplete();
      } catch (publishError) {
        setError(
          publishError instanceof Error
            ? publishError.message
            : 'Não foi possível publicar as alterações.',
        );
      } finally {
        setPublishing(false);
      }
    },
    ...(error
      ? {
          dialog: {
            type: 'confirm' as const,
            tone: 'critical' as const,
            title: 'Falha ao publicar',
            message: error,
            confirmButtonText: 'Fechar',
            onConfirm: () => setError(null),
            onCancel: () => setError(null),
          },
        }
      : {}),
  };
};
