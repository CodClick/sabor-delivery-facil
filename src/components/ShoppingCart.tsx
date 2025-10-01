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
    finalTotal,
    appliedCoupon,
    applyCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode) return;

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .single();

      if (error || !data) {
        toast({
          title: "Cupom inválido",
          description: "Esse código não existe ou não está disponível",
          variant: "destructive",
        });
        return;
      }

      // verifica validade
      const now = new Date();
      if (data.expires_at && new Date(data.expires_at) < now) {
        toast({
          title: "Cupom expirado",
          description: "Esse cupom já não é mais válido",
          variant: "destructive",
        });
        return;
      }

      applyCoupon(data);
    } catch (err) {
      console.error("Erro ao aplicar cupom:", err);
    }
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Carrinho</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Seu carrinho está vazio</p>
      ) : (
        <>
          <ul className="divide-y">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.selectedVariations?.map((group, gi) => (
                    <div key={gi} className="text-sm text-gray-600">
                      {group.groupName}:{" "}
                      {group.variations.map((v) => v.name).join(", ")}
                    </div>
                  ))}
                  <p className="text-sm text-gray-500">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => increaseQuantity(item.id)}
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remover
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* CUPOM */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Cupom de desconto</label>
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Digite o código"
              />
              <Button onClick={handleApplyCoupon}>Aplicar</Button>
            </div>
            {appliedCoupon && (
              <p className="text-green-600 text-sm mt-2">
                Cupom <strong>{appliedCoupon.code}</strong> aplicado! 🎉
              </p>
            )}
          </div>

          {/* TOTAL */}
          <div className="mt-4 border-t pt-4">
            <p className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </p>

            {appliedCoupon && (
              <p className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span>
                  -{" "}
                  {appliedCoupon.discount_type === "percent"
                    ? `${appliedCoupon.discount_value}%`
                    : `R$ ${appliedCoupon.discount_value.toFixed(2)}`}
                </span>
              </p>
            )}

            <p className="flex justify-between font-bold text-lg mt-2">
              <span>Total:</span>
              <span>R$ {finalTotal.toFixed(2)}</span>
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="destructive" onClick={clearCart}>
              Limpar carrinho
            </Button>
            <Button className="flex-1">Finalizar pedido</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;
