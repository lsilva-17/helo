'use client';

import {useEffect, useState} from 'react';
import {VisualEditing} from 'next-sanity/visual-editing';

export function EmbeddedVisualEditing() {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(window.self !== window.top);
  }, []);

  if (!embedded) return null;
  return <VisualEditing />;
}
