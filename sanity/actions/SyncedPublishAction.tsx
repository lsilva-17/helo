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

    void refresh();

    const subscription = client
      .listen(`*[_id == $draftId]`, {draftId}, {includeResult: false, visibility: 'query'})
      .subscribe({
        next: () => void refresh(),
        error: () => {
          // The button stays available and performs a fresh draft lookup on click.
        },
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client, draftId, props.draft]);

  return {
    label: publishing
      ? 'Publicando…'
      : hasDraft
        ? 'Publicar alterações'
        : 'Verificar e publicar',
    disabled: publishing,
    tone: 'positive',
    group: ['default', 'paneActions'],
    onHandle: async () => {
      setPublishing(true);
      setError(null);

      try {
        // Always re-read the draft at click time. Visual Builder mutations are
        // written outside Sanity's form state and can arrive before Studio
        // refreshes props.draft / the built-in publish disabled state.
        const draft = await client.getDocument(draftId);

        if (!draft) {
          setHasDraft(false);
          setError('Nenhuma alteração pendente foi encontrada. Faça uma edição no construtor visual e tente novamente.');
          return;
        }

        await client.action({
          actionType: 'sanity.action.document.publish',
          publishedId,
          draftId,
        });

        setHasDraft(false);
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
