// src/utils/trackingEvents.js

// Evento: Ver um produto ou categoria
export const trackViewContent = (data) => {
  console.log("TRACKING: ViewContent", data);
  window.fbq?.('track', 'ViewContent', {
    content_name: data.name, // Nome do produto/categoria
    content_ids: [data.id],   // ID do produto
    content_type: 'product',
  });
  window.gtag?.('event', 'view_item', {
    items: [{
        item_id: data.id,
        item_name: data.name,
        price: data.price,
    }]
  });
};

// Evento: Adicionar ao Carrinho
export const trackAddToCart = (data) => {
  console.log("TRACKING: AddToCart", data);
  window.fbq?.('track', 'AddToCart', {
    content_name: data.name,
    content_ids: [data.id],
    content_type: 'product',
    value: data.price,
    currency: 'BRL',
  });
  window.gtag?.('event', 'add_to_cart', {
    currency: 'BRL',
    value: data.price,
    items: [{
        item_id: data.id,
        item_name: data.name,
        price: data.price,
        quantity: data.quantity
    }]
  });
};

// Evento: Finalizar Compra (o mais importante!)
export const trackPurchase = (data) => {
  console.log("TRACKING: Purchase", data);
  window.fbq?.('track', 'Purchase', {
    value: data.total,
    currency: 'BRL',
    content_ids: data.product_ids, // Array com IDs dos produtos
    content_type: 'product',
  });
  window.gtag?.('event', 'purchase', {
    transaction_id: data.orderId, // ID único do pedido
    value: data.total,
    currency: 'BRL',
    items: data.items // Array com objetos de itens
  });
};