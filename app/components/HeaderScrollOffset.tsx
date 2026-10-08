'use client';

import {useLayoutEffect, useRef} from 'react';

/** Keep anchor navigation clear of both rows of the sticky header. */
export function HeaderScrollOffset() {
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const header = marker.current?.closest('header');
    if (!header) return;

    const update = () => {
      document.documentElement.style.setProperty('--site-header-height', `${header.getBoundingClientRect().height}px`);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--site-header-height');
    };
  }, []);

  return <span ref={marker} hidden aria-hidden="true" />;
}
