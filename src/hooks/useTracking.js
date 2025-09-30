// src/hooks/useTracking.js

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Se estiver usando react-router

// Supondo que você busca esses IDs de uma API ou contexto
const META_PIXEL_ID = '1056176321723068'; 
const GOOGLE_TAG_ID = 'G-1VCTGX0S17';

export const useTracking = () => {
  const location = useLocation();

  // 1. Inicializa os scripts uma única vez
  useEffect(() => {
    // Carrega o script do Pixel da Meta
    (function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    
    if (META_PIXEL_ID) {
      window.fbq('init', META_PIXEL_ID);
    }

    // Carrega o script da Google Tag (gtag.js)
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    if (GOOGLE_TAG_ID) {
      gtag('config', GOOGLE_TAG_ID);
    }

  }, []); // Array vazio garante que rode apenas uma vez

  // 2. Rastreia PageView a cada mudança de rota
  useEffect(() => {
    if (META_PIXEL_ID) {
      window.fbq('track', 'PageView');
    }
    if (GOOGLE_TAG_ID) {
        window.gtag('config', GOOGLE_TAG_ID, {
            page_path: location.pathname + location.search,
        });
    }
  }, [location]); // Dispara a cada vez que a URL muda
};