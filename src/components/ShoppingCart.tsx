import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const ShoppingCart: React.FC = () => {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    discountValue,
    applyCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");

  const handleCheckout = () => {
    // aqui você pode enviar para o Supabase / criar pedido
    console.log("Finalizar pedido com itens:", cartItems);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-2xl w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Seu Carrinho</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Seu carrinho está vazio</p>
      ) : (
        <div className="space-y-4">
          {/* Lista de itens */}
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <h3 className="font-medium">{item.nome}</h3>
                <p className="text-sm text-gray-500">
                  {formatCurrency(item.preco)} x {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </Button>
                <span>{item.quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
            </div>
          ))}

          {/* Campo de cupom */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Cupom de desconto
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) =>
                  setCouponCode(e.target.value.toUpperCase().trim())
                }
                placeholder="Digite seu cupom"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <Button onClick={() => applyCoupon(couponCode)}>Aplicar</Button>
            </div>
          </div>

          {/* Resumo final */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto ({appliedCoupon.nome})</span>
                <span>-{formatCurrency(discountValue)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total</span>
              <span>
                {formatCurrency(Math.max(cartTotal - discountValue, 0))}
              </span>
            </div>

            <Button
              className="w-full text-center py-3 bg-food-green hover:bg-opacity-90"
              onClick={handleCheckout}
            >
              Finalizar Pedido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
