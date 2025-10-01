import { createContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    setCartTotal(total);

    if (appliedCoupon) {
      calcularDesconto(total, appliedCoupon);
    } else {
      setFinalTotal(total);
      setDiscount(0);
    }
  }, [cartItems, appliedCoupon]);

  const calcularDesconto = (total: number, coupon: any) => {
    let desconto = 0;

    if (coupon.tipo === "percentual") {
      desconto = (total * coupon.valor) / 100;
    } else if (coupon.tipo === "fixo") {
      desconto = coupon.valor;
    }

    // não deixa desconto maior que total
    if (desconto > total) desconto = total;

    setDiscount(desconto);
    setFinalTotal(total - desconto);
  };

  const applyCoupon = async (codigo: string) => {
    const { data: cupons, error } = await supabase
      .from("cupons")
      .select("*")
      .eq("codigo", codigo.toUpperCase())
      .single();

    if (error || !cupons) {
      toast.error("Cupom inválido!");
      return;
    }

    // validações
    const agora = new Date();
    const validade = new Date(cupons.validade);

    if (!cupons.ativo) {
      toast.error("Cupom inativo!");
      return;
    }

    if (validade < agora) {
      toast.error("Cupom expirado!");
      return;
    }

    if (cartTotal < cupons.valor_minimo) {
      toast.error(`Valor mínimo de R$ ${cupons.valor_minimo} para usar este cupom.`);
      return;
    }

    if (cupons.limite_uso && cupons.usos >= cupons.limite_uso) {
      toast.error("Este cupom já atingiu o limite de usos.");
      return;
    }

    // aplica
    setAppliedCoupon(cupons);
    calcularDesconto(cartTotal, cupons);
    toast.success("Cupom aplicado com sucesso!");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        cartTotal,
        appliedCoupon,
        discount,
        finalTotal,
        applyCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
