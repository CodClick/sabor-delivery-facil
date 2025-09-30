// Assumindo que seu arquivo de configuração está em ../config/trackingConfig
// import { TRACKING_IDS } from '../config/trackingConfig';

// (Outras funções de rastreamento aqui, como trackViewContent, etc.)

/**
 * Rastreia o evento de Adicionar ao Carrinho de forma completa.
 * @param {object} data - Contém as informações do produto.
 * @param {string} data.id - ID (SKU) do produto.
 * @param {string} data.name - Nome do produto.
 * @param {number} data.price - Preço final do item (com variações).
 * @param {number} data.quantity - Quantidade sendo adicionada.
 * @param {string} [data.category] - Categoria do produto (opcional, mas recomendado).
 * @param {Array<object>} [data.variations] - Variações selecionadas (opcional).
 */
export const trackAddToCart = (data) => {
  if (!window.fbq && !window.gtag) {
    console.warn("Tracking scripts not loaded.");
    return;
  }

  console.log("TRACKING (Full Data): AddToCart", data);

  // --- Parâmetros para o Pixel da Meta (Facebook) ---
  const metaPayload = {
    content_ids: [data.id],
    content_name: data.name,
    content_type: 'product',
    currency: 'BRL',
    value: data.price.toFixed(2), // Garante duas casas decimais
  };

  window.fbq?.('track', 'AddToCart', metaPayload);

  // --- Parâmetros para o Google Analytics 4 (GA4) ---
  // O GA4 usa um array 'items' para detalhar o produto.
  const googlePayload = {
    currency: 'BRL',
    value: data.price, // O valor total do evento (preço * quantidade)
    items: [
      {
        item_id: data.id,
        item_name: data.name,
        price: data.price,
        quantity: data.quantity,
        // (Opcional, mas muito bom) Adiciona a categoria do item
        item_category: data.category, 
        // (Opcional) Usado para detalhar variações como "Tamanho: Grande"
        item_variant: data.variations?.map(v => v.name).join(', '),
      }
    ]
  };

  window.gtag?.('event', 'add_to_cart', googlePayload);
};
