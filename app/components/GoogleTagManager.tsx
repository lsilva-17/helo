import Script from 'next/script';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim();

export function GoogleTagManager() {
  if (!GTM_ID) return null;

  const initScript = `
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    var f = document.getElementsByTagName('script')[0],
        j = document.createElement('script');
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    f.parentNode.insertBefore(j, f);
  `;

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {initScript}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{display: 'none', visibility: 'hidden'}}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
