// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Coupon {
  id: string;
  codigo: string;
  tipo: "percentual" | "fixo";
  valor: number;
  ativo: boolean;
  validade: string | null;
  uso_maximo: number | null;
  valor_minimo: number | null;
}

interface CartContextType {
  cart: CartItem[];
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  discount: number;
  finalTotal: number;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const finalTotal = Math.max(cartTotal - discount, 0);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const applyCoupon = async (code: string) => {
    if (!code) {
      toast.error("Digite um código de cupom válido");
      return;
    }

    const { data, error } = await supabase
      .from("cupons")
      .select("*")
      .eq("codigo", code.toUpperCase())
      .single();

    if (error || !data) {
      toast.error("Cupom inválido ou não encontrado");
      return;
    }

    const now = new Date();
    if (data.validade && new Date(data.validade) < now) {
      toast.error("Cupom expirado");
      return;
    }

    if (!data.ativo) {
      toast.error("Este cupom está inativo");
      return;
    }

    if (data.valor_minimo && cartTotal < data.valor_minimo) {
      toast.error(`Valor mínimo para este cupom é R$ ${data.valor_minimo}`);
      return;
    }

    let newDiscount = 0;
    if (data.tipo === "percentual") {
      newDiscount = (cartTotal * data.valor) / 100;
    } else if (data.tipo === "fixo") {
      newDiscount = data.valor;
    }

    setAppliedCoupon(data);
    setDiscount(newDiscount);
    toast.success("Cupom aplicado com sucesso!");
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    toast.info("Cupom removido");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartTotal,
        addToCart,
        removeFromCart,
        clearCart,
        appliedCoupon,
        discount,
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
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
