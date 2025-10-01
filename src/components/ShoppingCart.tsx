import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ShoppingCart() {
  const { cartItems, cartTotal, discount, finalTotal, appliedCoupon, applyCoupon } =
    useContext(CartContext);

  const [cupom, setCupom] = useState("");

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Carrinho</h2>

      {cartItems.map((item, idx) => (
        <div key={idx} className="flex justify-between">
          <span>{item.name} x{item.qty}</span>
          <span>R$ {(item.price * item.qty).toFixed(2)}</span>
        </div>
      ))}

      <div className="mt-4 border-t pt-4">
        <p>Total: R$ {cartTotal.toFixed(2)}</p>

        {appliedCoupon ? (
          <>
            <p>Cupom: {appliedCoupon.codigo}</p>
            <p>Desconto: -R$ {discount.toFixed(2)}</p>
            <p className="font-bold">Total Final: R$ {finalTotal.toFixed(2)}</p>
          </>
        ) : (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Digite seu cupom"
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
            />
            <Button onClick={() => applyCoupon(cupom)}>Aplicar</Button>
          </div>
        )}
      </div>
    </div>
  );
}
