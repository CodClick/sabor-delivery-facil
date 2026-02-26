/**
 * Tracking events utility — fires Meta Pixel + GTM dataLayer events
 * with rich parameters for all standard e-commerce events.
 */

import { CartItem } from '@/types/menu';

// ─── Helpers ──────────────────────────────────────────────

const fbq = (...args: any[]) => window.fbq?.(...args);

const pushDataLayer = (payload: Record<string, any>) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

const formatVariations = (item: CartItem) => {
  if (!item.selectedVariations?.length) return undefined;
  return item.selectedVariations.flatMap((group) =>
    group.variations
      .filter((v) => v.quantity > 0)
      .map((v) => ({
        group: group.groupName,
        name: v.name || v.variationId,
        qty: v.quantity,
        price: v.additionalPrice || 0,
        half: v.halfSelection || null,
      }))
  );
};

const buildItemPayload = (item: CartItem, index?: number) => {
  const variations = formatVariations(item);
  const border = item.selectedBorder
    ? { name: item.selectedBorder.name, price: item.selectedBorder.additionalPrice }
    : undefined;

  return {
    item_id: item.id,
    item_name: item.name,
    item_category: item.category,
    price: item.price,
    quantity: item.quantity,
    index,
    ...(item.isHalfPizza && item.combination
      ? {
          item_variant: `${item.combination.sabor1.name} / ${item.combination.sabor2.name}`,
          pizza_size: item.combination.tamanho,
          is_half_pizza: true,
        }
      : {}),
    ...(border ? { border_name: border.name, border_price: border.price } : {}),
    ...(variations?.length ? { variations } : {}),
  };
};

const calculateItemValue = (item: CartItem): number => {
  let base = item.priceFrom ? 0 : item.price || 0;
  if (item.selectedVariations?.length) {
    item.selectedVariations.forEach((g) =>
      g.variations.forEach((v) => {
        const p = v.additionalPrice || 0;
        const mult = item.isHalfPizza && v.halfSelection === 'whole' ? 2 : 1;
        base += p * (v.quantity || 1) * mult;
      })
    );
  }
  if (item.selectedBorder?.additionalPrice) base += item.selectedBorder.additionalPrice;
  return base * (item.quantity || 1);
};

// ─── Events ───────────────────────────────────────────────

/**
 * ViewContent — fired when user opens a product detail / variation dialog.
 */
export const trackViewContent = (item: {
  id: string;
  name: string;
  price: number;
  category?: string;
  tipo?: string;
  permiteCombinacao?: boolean;
}) => {
  try {
    fbq('track', 'ViewContent', {
      content_ids: [item.id],
      content_name: item.name,
      content_type: 'product',
      content_category: item.category,
      currency: 'BRL',
      value: item.price,
    });

    pushDataLayer({
      event: 'view_item',
      ecommerce: {
        currency: 'BRL',
        value: item.price,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            item_variant: item.tipo === 'pizza' ? 'pizza' : 'padrao',
          },
        ],
      },
    });
  } catch (e) {
    console.error('trackViewContent error:', e);
  }
};

/**
 * AddToCart — fired when an item is added to cart.
 */
export const trackAddToCart = (data: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  variations?: Array<{ name?: string; price?: number }>;
  border?: { name: string; price: number };
  isHalfPizza?: boolean;
  combination?: { sabor1: { name: string }; sabor2: { name: string }; tamanho: string };
}) => {
  try {
    const totalValue = data.price * data.quantity;

    fbq('track', 'AddToCart', {
      content_ids: [data.id],
      content_name: data.name,
      content_type: 'product',
      currency: 'BRL',
      value: totalValue.toFixed(2),
      num_items: data.quantity,
    });

    pushDataLayer({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'BRL',
        value: totalValue,
        items: [
          {
            item_id: data.id,
            item_name: data.name,
            item_category: data.category,
            price: data.price,
            quantity: data.quantity,
            ...(data.isHalfPizza && data.combination
              ? {
                  item_variant: `${data.combination.sabor1.name} / ${data.combination.sabor2.name}`,
                  pizza_size: data.combination.tamanho,
                }
              : {}),
            ...(data.border ? { border_name: data.border.name, border_price: data.border.price } : {}),
            ...(data.variations?.length ? { variations: data.variations } : {}),
          },
        ],
      },
    });
  } catch (e) {
    console.error('trackAddToCart error:', e);
  }
};

/**
 * InitiateCheckout — fired when user clicks "Finalizar Pedido".
 */
export const trackInitiateCheckout = (cartItems: CartItem[], totalValue: number) => {
  try {
    const contentIds = cartItems.map((i) => i.id);
    const numItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    fbq('track', 'InitiateCheckout', {
      content_ids: contentIds,
      content_type: 'product',
      currency: 'BRL',
      value: totalValue.toFixed(2),
      num_items: numItems,
    });

    pushDataLayer({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'BRL',
        value: totalValue,
        items: cartItems.map((item, i) => buildItemPayload(item, i)),
      },
    });
  } catch (e) {
    console.error('trackInitiateCheckout error:', e);
  }
};

/**
 * Purchase — fired when the order is successfully created.
 */
export const trackPurchase = (params: {
  orderId: string;
  cartItems: CartItem[];
  total: number;
  subtotal: number;
  frete: number;
  discount: number;
  couponCode?: string | null;
  paymentMethod: string;
}) => {
  try {
    const { orderId, cartItems, total, subtotal, frete, discount, couponCode, paymentMethod } = params;
    const contentIds = cartItems.map((i) => i.id);
    const numItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    fbq('track', 'Purchase', {
      content_ids: contentIds,
      content_type: 'product',
      currency: 'BRL',
      value: total.toFixed(2),
      num_items: numItems,
      order_id: orderId,
    });

    pushDataLayer({
      event: 'purchase',
      ecommerce: {
        transaction_id: orderId,
        currency: 'BRL',
        value: total,
        shipping: frete,
        discount: discount,
        coupon: couponCode || undefined,
        payment_type: paymentMethod,
        items: cartItems.map((item, i) => buildItemPayload(item, i)),
      },
    });
  } catch (e) {
    console.error('trackPurchase error:', e);
  }
};
