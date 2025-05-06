
import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, MenuItem, SelectedVariation } from "@/types/menu";
import { toast } from "@/components/ui/use-toast";

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: MenuItem & { selectedVariations?: SelectedVariation[] }) => void;
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

  useEffect(() => {
    // Calculate cart total and item count
    const { total, count } = cartItems.reduce(
      (acc, item) => {
        acc.total += item.price * item.quantity;
        acc.count += item.quantity;
        return acc;
      },
      { total: 0, count: 0 }
    );
    
    setCartTotal(total);
    setItemCount(count);
  }, [cartItems]);

  // Função para gerar ID único para itens com variações
  const generateCartItemId = (item: MenuItem, selectedVariations?: SelectedVariation[]): string => {
    if (!selectedVariations || selectedVariations.length === 0) {
      return item.id;
    }

    // Criar um ID composto do ID do item + IDs das variações selecionadas
    const variationsKey = selectedVariations
      .filter(v => v.quantity > 0)
      .sort((a, b) => a.variationId.localeCompare(b.variationId))
      .map(v => `${v.variationId}-${v.quantity}`)
      .join('_');
    
    return `${item.id}_${variationsKey}`;
  };

  const addItem = (menuItem: MenuItem & { selectedVariations?: SelectedVariation[] }) => {
    const { selectedVariations, ...item } = menuItem;
    const cartItemId = generateCartItemId(item, selectedVariations);
    
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
        return [...prevItems, { 
          ...item, 
          quantity: 1,
          selectedVariations 
        }];
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
