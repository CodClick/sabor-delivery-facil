import React, { createContext, useContext, useState, ReactNode } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Coupon = {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
  discount: number;
  finalTotal: number;
  applyCoupon: (code: string) => void;
  coupon: Coupon | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartProviderProps = {
  children: ReactNode;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  // 🔹 Exemplo de cupons válidos (pode vir de API ou banco depois)
  const availableCoupons: Coupon[] = [
    { code: "DESC10", discountType: "percent", discountValue: 10 },
    { code: "VALE50", discountType: "fixed", discountValue: 50 },
  ];

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // 🔹 Aplica o cupom
  const applyCoupon = (code: string) => {
    const found = availableCoupons.find(
      (c) => c.code.toLowerCase() === code.toLowerCase()
    );

    if (!found) {
      console.error("Cupom inválido");
      setCoupon(null);
      return;
    }

    setCoupon(found);
    console.log(`Cupom aplicado: ${found.code}`);
  };

  // 🔹 Calcula o desconto baseado no cupom
  const discount = coupon
    ? coupon.discountType === "percent"
      ? (total * coupon.discountValue) / 100
      : coupon.discountValue
    : 0;

  const finalTotal = Math.max(total - discount, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        discount,
        finalTotal,
        applyCoupon,
        coupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook para usar no projeto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
