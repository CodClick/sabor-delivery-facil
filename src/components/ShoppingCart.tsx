import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const ShoppingCart: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartTotal,
    discountValue,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // --- VALIDAR CUPOM NO SUPABASE ---
  const handleApplyCoupon = async () => {
    if (!couponCode) return;

    setLoadingCoupon(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Cupom inválido",
          description: "Este cupom não existe ou não está ativo.",
          variant: "destructive",
        });
      } else {
        // validação extra: data de validade
        const now = new Date();
        if (data.valid_until && new Date(data.valid_until) < now) {
          toast({
            title: "Cupom expirado",
            description: "Esse cupom já passou da validade.",
            variant: "destructive",
          });
        } else {
          applyCoupon(data);
          setCouponCode("");
        }
      }
    } catch (err) {
      console.error("Erro ao validar cupom:", err);
      toast({
        title: "Erro",
        description: "Não foi possível validar o cupom.",
        variant: "destructive",
      });
    } finally {
      setLoadingCoupon(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Carrinho</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-4">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => decreaseQuantity(item.id)}>
                    -
                  </Button>
                  <span>{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => increaseQuantity(item.id)}>
                    +
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                    Remover
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* --- CUPOM DE DESCONTO --- */}
          <div className="mb-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-lg p-2">
                <span className="text-green-700 font-medium">
                  Cupom "{appliedCoupon.code}" aplicado!
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeCoupon}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite seu cupom"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={loadingCoupon}
                />
                <Button onClick={handleApplyCoupon} disabled={loadingCoupon}>
                  {loadingCoupon ? "..." : "Aplicar"}
                </Button>
              </div>
            )}
          </div>

          {/* --- RESUMO --- */}
          <div className="border-t pt-4 space-y-2">
            <p className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </p>

            {discountValue > 0 && (
              <p className="flex justify-between text-green-700">
                <span>Desconto:</span>
                <span>- R$ {discountValue.toFixed(2)}</span>
              </p>
            )}

            <p className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>R$ {finalTotal.toFixed(2)}</span>
            </p>
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={clearCart}>
              Limpar carrinho
            </Button>
            <Button>Finalizar Pedido</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;
