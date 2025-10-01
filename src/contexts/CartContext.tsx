import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, MenuItem, SelectedVariationGroup } from "@/types/menu";
import { toast } from "@/components/ui/use-toast";
import { getAllVariations } from "@/services/variationService";
import { trackAddToCart } from "@/utils/trackingEvents";

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: MenuItem & { selectedVariations?: SelectedVariationGroup[] }) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;

  // --- NOVOS CAMPOS PARA CUPOM ---
  appliedCoupon: any | null;
  discountValue: number;
  finalTotal: number;
  applyCoupon: (coupon: any) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [variations, setVariations] = useState<any[]>([]);

  // --- ESTADO DO CUPOM ---
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discountValue, setDiscountValue] = useState(0);

  // carregar variações
  useEffect(() => {
    const loadVariations = async () => {
      try {
        const allVariations = await getAllVariations();
        setVariations(allVariations);
      } catch (error) {
        console.error("Erro ao carregar variações:", error);
      }
    };
    loadVariations();
  }, []);

  const getVariationPrice = (variationId: string): number => {
    const variation = variations.find(v => v.id === variationId);
    return variation?.additionalPrice || 0;
  };

  const getVariationName = (variationId: string): string => {
    const variation = variations.find(v => v.id === variationId);
    return variation?.name || "";
  };

  const calculateVariationsTotal = (item: CartItem): number => {
    let variationsTotal = 0;
    if (item.selectedVariations?.length) {
      item.selectedVariations.forEach(group => {
        group.variations?.forEach(variation => {
          const additionalPrice = variation.additionalPrice ?? getVariationPrice(variation.variationId);
          if (additionalPrice > 0) {
            variationsTotal += additionalPrice * (variation.quantity || 1);
          }
        });
      });
    }
    return variationsTotal;
  };

  // recalcular totais
  useEffect(() => {
    const { total, count } = cartItems.reduce(
      (acc, item) => {
        let itemTotal = 0;

        if (item.isHalfPizza) {
          itemTotal = (item.price || 0) * item.quantity;
        } else {
          const basePrice = item.priceFrom ? 0 : (item.price || 0);
          const variationsTotal = calculateVariationsTotal(item);
          itemTotal = (basePrice + variationsTotal) * item.quantity;
        }

        acc.total += itemTotal;
        acc.count += item.quantity;
        return acc;
      },
      { total: 0, count: 0 }
    );

    setCartTotal(total);
    setItemCount(count);

    // aplica desconto se existir cupom
    if (appliedCoupon) {
      let desconto = 0;
      if (appliedCoupon.discount_type === "percent") {
        desconto = (total * appliedCoupon.discount_value) / 100;
      } else if (appliedCoupon.discount_type === "fixed") {
        desconto = appliedCoupon.discount_value;
      }
      setDiscountValue(desconto);
    } else {
      setDiscountValue(0);
    }
  }, [cartItems, variations, appliedCoupon]);

  // total final após cupom
  const finalTotal = Math.max(cartTotal - discountValue, 0);

  const enrichSelectedVariations = (selectedVariations?: SelectedVariationGroup[]): SelectedVariationGroup[] => {
    if (!selectedVariations?.length) return [];
    return selectedVariations.map(group => ({
      ...group,
      variations: group.variations.map(variation => ({
        ...variation,
        name: variation.name || getVariationName(variation.variationId),
        additionalPrice:
          variation.additionalPrice !== undefined
            ? variation.additionalPrice
            : getVariationPrice(variation.variationId),
      })),
    }));
  };

  const addItem = (menuItem: MenuItem & { selectedVariations?: SelectedVariationGroup[] }) => {
    const { selectedVariations, ...item } = menuItem;

    const enrichedVariations = enrichSelectedVariations(selectedVariations);
    const itemId = item.id;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        i =>
          i.id === itemId &&
          JSON.stringify(i.selectedVariations) === JSON.stringify(enrichedVariations)
      );

      if (existingItem) {
        return prevItems.map(i =>
          i.id === itemId &&
          JSON.stringify(i.selectedVariations) === JSON.stringify(enrichedVariations)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        const newItem: CartItem = {
          ...item,
          quantity: 1,
          selectedVariations: enrichedVariations,
        };
        return [...prevItems, newItem];
      }
    });

    toast({
      title: "Item adicionado",
      description: `${item.name} foi adicionado ao carrinho`,
      duration: 2000,
    });

    // --- tracking ---
    try {
      const itemParaCalculo: CartItem = { ...menuItem, quantity: 1, selectedVariations: enrichedVariations };
      let finalPrice = 0;

      if (itemParaCalculo.isHalfPizza) {
        finalPrice = itemParaCalculo.price || 0;
      } else {
        const basePrice = itemParaCalculo.priceFrom ? 0 : (itemParaCalculo.price || 0);
        const variationsTotal = calculateVariationsTotal(itemParaCalculo);
        finalPrice = basePrice + variationsTotal;
      }

      const trackingData = {
        id: item.id,
        name: item.name,
        price: finalPrice,
        quantity: 1,
        category: item.categoryName,
        variations: enrichedVariations?.flatMap(group =>
          group.variations.map(v => ({ name: v.name, price: v.additionalPrice }))
        ),
      };

      trackAddToCart(trackingData);
    } catch (error) {
      console.error("Falha ao rastrear evento AddToCart:", error);
    }
  };

  const addToCart = (item: MenuItem) => addItem(item);

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const increaseQuantity = (id: string) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setCartItems(prevItems =>
      prevItems
        .map(item =>
          item.id === id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => !(item.id === id && item.quantity === 1))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setDiscountValue(0);
  };

  // --- CUPOM ---
  const applyCoupon = (coupon: any) => {
    setAppliedCoupon(coupon);
    toast({
      title: "Cupom aplicado",
      description: `O cupom ${coupon.code} foi aplicado!`,
    });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountValue(0);
    toast({
      title: "Cupom removido",
      description: "O desconto foi removido do carrinho",
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isCartOpen,
        setIsCartOpen,

        // novos valores de cupom
        appliedCoupon,
        discountValue,
        finalTotal,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
