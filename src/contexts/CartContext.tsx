import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, MenuItem, SelectedVariationGroup } from "@/types/menu";
import { toast } from "@/components/ui/use-toast";
import { getAllVariations } from "@/services/variationService";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [variations, setVariations] = useState<any[]>([]);

  // Carregar variações para cálculos de preço
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

  // Função para obter o preço adicional da variação
  const getVariationPrice = (variationId: string): number => {
    const variation = variations.find(v => v.id === variationId);
    return variation?.additionalPrice || 0;
  };

  // Função para obter o nome da variação
  const getVariationName = (variationId: string): string => {
    const variation = variations.find(v => v.id === variationId);
    return variation?.name || '';
  };

  // Função para calcular o valor total das variações de um item
  const calculateVariationsTotal = (item: CartItem): number => {
    let variationsTotal = 0;
    
    if (item.selectedVariations && item.selectedVariations.length > 0) {
      item.selectedVariations.forEach(group => {
        if (group.variations && group.variations.length > 0) {
          group.variations.forEach(variation => {
            const additionalPrice = variation.additionalPrice || getVariationPrice(variation.variationId);
            if (additionalPrice > 0) {
              variationsTotal += additionalPrice * (variation.quantity || 1);
            }
          });
        }
      });
    }
    
    return variationsTotal;
  };

  useEffect(() => {
    // Calculate cart total and item count including variations
    const { total, count } = cartItems.reduce(
      (acc, item) => {
        const basePrice = item.price || 0;
        const variationsTotal = calculateVariationsTotal(item);
        const itemTotal = (basePrice + variationsTotal) * item.quantity;
        
        acc.total += itemTotal;
        acc.count += item.quantity;
        return acc;
      },
      { total: 0, count: 0 }
    );
    
    setCartTotal(total);
    setItemCount(count);
  }, [cartItems, variations]);

  // Função para gerar ID único para itens com variações
  const generateCartItemId = (item: MenuItem, selectedVariations?: SelectedVariationGroup[]): string => {
    if (!selectedVariations || selectedVariations.length === 0) {
      return item.id;
    }

    // Criar um ID composto do ID do item + IDs das variações selecionadas
    const variationsKey = selectedVariations
      .map(group => {
        const groupVariations = group.variations
          .filter(v => v.quantity > 0)
          .sort((a, b) => a.variationId.localeCompare(b.variationId))
          .map(v => `${v.variationId}-${v.quantity}`)
          .join('.');
        
        return `${group.groupId}:${groupVariations}`;
      })
      .sort()
      .join('_');
    
    return `${item.id}_${variationsKey}`;
  };

  // Função para enriquecer variações com dados completos
  const enrichSelectedVariations = (selectedVariations?: SelectedVariationGroup[]): SelectedVariationGroup[] => {
    if (!selectedVariations || selectedVariations.length === 0) {
      return [];
    }

    return selectedVariations.map(group => ({
      ...group,
      variations: group.variations.map(variation => ({
        ...variation,
        name: variation.name || getVariationName(variation.variationId),
        additionalPrice: variation.additionalPrice !== undefined ? variation.additionalPrice : getVariationPrice(variation.variationId)
      }))
    }));
  };

  const addItem = (menuItem: MenuItem & { selectedVariations?: SelectedVariationGroup[] }) => {
    const { selectedVariations, ...item } = menuItem;
    
    // Enriquecer as variações com dados completos
    const enrichedVariations = enrichSelectedVariations(selectedVariations);
    
    console.log("Adicionando item ao carrinho com variações:", enrichedVariations);
    
    const cartItemId = generateCartItemId(item, enrichedVariations);
    
    setCartItems(prevItems => {
      // Procura pelo item usando o ID composto (para variações específicas)
      const existingItemIndex = prevItems.findIndex(
        i => generateCartItemId(i, i.selectedVariations) === cartItemId
      );
      
      if (existingItemIndex >= 0) {
        // Se já existe no carrinho, incrementa a quantidade
        return prevItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Se não existe, adiciona novo item
        const newCartItem = { 
          ...item, 
          quantity: 1,
          selectedVariations: enrichedVariations 
        };
        
        console.log("Novo item no carrinho:", newCartItem);
        
        return [...prevItems, newCartItem];
      }
    });
    
    toast({
      title: "Item adicionado",
      description: `${item.name} foi adicionado ao carrinho`,
      duration: 2000
    });
  };

  // Alias para addItem para manter compatibilidade com código existente
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
      prevItems.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => !(item.id === id && item.quantity === 1))
    );
  };

  const clearCart = () => {
    setCartItems([]);
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
        setIsCartOpen
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
