import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem } from "@/types/menu";

interface CartItem extends MenuItem {
  quantity: number;
  selectedVariations?: any[];
  isHalfPizza?: boolean;
  combination?: {
    sabor1: { id: string; name: string };
    sabor2: { id: string; name: string };
    tamanho: "broto" | "grande";
  };
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem) => void;
  addItem: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: MenuItem) => {
    // 🔥 Caso especial: Pizza Meio a Meio
    if ((item as any).isHalfPizza) {
      const halfPizzaItem: CartItem = {
        ...item,
        quantity: 1, // sempre começa com 1
      };
      setCartItems((prev) => [...prev, halfPizzaItem]);
      return;
    }

    // Comportamento normal para os outros itens
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const addItem = (item: CartItem) => {
    // 🔥 Caso especial: Pizza Meio a Meio
    if (item.isHalfPizza) {
      const halfPizzaItem: CartItem = {
        ...item,
        quantity: item.quantity || 1,
      };
      setCartItems((prev) => [...prev, halfPizzaItem]);
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find(
        (i) =>
          i.id === item.id &&
          JSON.stringify(i.selectedVariations) === JSON.stringify(item.selectedVariations)
      );

      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id &&
          JSON.stringify(i.selectedVariations) === JSON.stringify(item.selectedVariations)
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, addItem, removeFromCart, clearCart, updateQuantity, getTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
