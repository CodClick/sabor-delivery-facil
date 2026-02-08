import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, MenuItem, SelectedVariationGroup, PizzaBorder } from "@/types/menu";
import { toast } from "@/components/ui/use-toast";
import { getAllVariations } from "@/services/variationService";
import { trackAddToCart } from "@/utils/trackingEvents"; // <--- 1. IMPORTAÇÃO ADICIONADA

interface AppliedCoupon {
  id: string;
  nome: string;
  tipo: "percentual" | "fixo";
  valor: number;
  usos?: number | null;
  limite_uso?: number | null;
  data_inicio?: string;
  data_fim?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: MenuItem & { selectedVariations?: SelectedVariationGroup[]; selectedBorder?: PizzaBorder; quantity?: number }) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  discountAmount: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [variations, setVariations] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

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
            // Se é pizza meio a meio e selecionou "whole" (pizza inteira), cobra 2x
            const multiplier = (item.isHalfPizza && variation.halfSelection === "whole") ? 2 : 1;
            variationsTotal += additionalPrice * (variation.quantity || 1) * multiplier;
          }
        });
      });
    }
    // Adicionar preço da borda selecionada
    if (item.selectedBorder?.additionalPrice) {
      variationsTotal += item.selectedBorder.additionalPrice;
    }
    return variationsTotal;
  };

  // recalcular totais
  useEffect(() => {
    const { total, count } = cartItems.reduce(
      (acc, item) => {
        let itemTotal = 0;

        if (item.isHalfPizza) {
          // Para pizza meio a meio, usamos o price final + variações (adicionais/borda)
          const basePrice = item.price || 0;
          const variationsTotal = calculateVariationsTotal(item);
          itemTotal = (basePrice + variationsTotal) * item.quantity;
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

    // Calcular desconto e total final
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.tipo === "percentual") {
        discount = total * (appliedCoupon.valor / 100);
      } else {
        discount = appliedCoupon.valor;
      }
    }
    setDiscountAmount(discount);
    setFinalTotal(Math.max(0, total - discount));
  }, [cartItems, variations, appliedCoupon]);


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

  const addItem = (menuItem: MenuItem & { selectedVariations?: SelectedVariationGroup[]; selectedBorder?: PizzaBorder; quantity?: number }) => {
    const { selectedVariations, selectedBorder, quantity: inputQuantity, ...item } = menuItem;
    const quantityToAdd = inputQuantity ?? 1;

    const enrichedVariations = enrichSelectedVariations(selectedVariations);
    const itemId = item.id;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        i =>
          i.id === itemId &&
          JSON.stringify(i.selectedVariations) === JSON.stringify(enrichedVariations) &&
          i.selectedBorder?.id === selectedBorder?.id
      );

      if (existingItem) {
        return prevItems.map(i =>
          i.id === itemId &&
          JSON.stringify(i.selectedVariations) === JSON.stringify(enrichedVariations) &&
          i.selectedBorder?.id === selectedBorder?.id
            ? { ...i, quantity: i.quantity + quantityToAdd }
            : i
        );
      } else {
        const newItem: CartItem = {
          ...item,
          quantity: quantityToAdd,
          selectedVariations: enrichedVariations,
          selectedBorder: selectedBorder,
        };
        return [...prevItems, newItem];
      }
    });

    toast({
      title: "Item adicionado",
      description: `${quantityToAdd}x ${item.name} foi adicionado ao carrinho`,
      duration: 2000,
    });
    
// --- INÍCIO DO CÓDIGO DE RASTREAMENTO (ATUALIZADO) ---
    try {
      const itemParaCalculo: CartItem = { ...menuItem, quantity: quantityToAdd, selectedVariations: enrichedVariations };
      let finalPrice = 0;

      if (itemParaCalculo.isHalfPizza) {
        finalPrice = itemParaCalculo.price || 0;
      } else {
        const basePrice = itemParaCalculo.priceFrom ? 0 : (itemParaCalculo.price || 0);
        const variationsTotal = calculateVariationsTotal(itemParaCalculo);
        finalPrice = basePrice + variationsTotal;
      }

      // Montando o objeto de dados completo para a nova função
      const trackingData = {
        id: item.id,
        name: item.name,
        price: finalPrice,
        quantity: quantityToAdd,
        category: item.category,
        // Mapeando as variações para um formato mais simples para o rastreamento
        variations: enrichedVariations?.flatMap(group => 
          group.variations.map(v => ({ name: v.name, price: v.additionalPrice }))
        ),
      };

      trackAddToCart(trackingData); // <--- Chamada atualizada!

    } catch (error) {
        console.error("Falha ao rastrear evento AddToCart:", error);
    }
    // --- FIM DO CÓDIGO DE RASTREAMENTO ---

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
        appliedCoupon,
        setAppliedCoupon,
        discountAmount,
        finalTotal,
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
