'use client';

import {useEffect, useState} from 'react';
import {useClient, type DocumentActionComponent} from 'sanity';

const apiVersion = '2026-09-01';

export const SyncedPublishAction: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion});
  const publishedId = props.id.replace(/^drafts\./, '');
  const draftId = `drafts.${publishedId}`;
  const [hasDraft, setHasDraft] = useState(Boolean(props.draft));
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const draft = await client.getDocument(draftId);
        if (active) setHasDraft(Boolean(draft));
      } catch {
        if (active) setHasDraft(Boolean(props.draft));
      }
    };

    setHasDraft(Boolean(props.draft));
    void refresh();

    const subscription = client
      .listen(`*[_id == $draftId]`, {draftId}, {includeResult: false, visibility: 'query'})
      .subscribe({
        next: () => void refresh(),
        error: () => {
          // Studio props continue to be the fallback source if realtime listening fails.
        },
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client, draftId, props.draft]);

  return {
    label: publishing ? 'Publicando…' : 'Publicar alterações',
    disabled: publishing || !hasDraft,
    tone: 'positive',
    group: ['default', 'paneActions'],
    onHandle: async () => {
      setPublishing(true);
      setError(null);
      try {
        await client.action({
          actionType: 'sanity.action.document.publish',
          publishedId,
          draftId,
        });
        setHasDraft(false);
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
