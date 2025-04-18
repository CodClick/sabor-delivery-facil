
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useForm } from "react-hook-form";
import { MapPin, CreditCard, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { createOrder } from "@/services/orderService";

interface CheckoutFormData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  phone: string;
  paymentMethod: "pix" | "card";
}

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormData>();
  const [showPixQRCode, setShowPixQRCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPaymentMethod = watch("paymentMethod");

  const handlePixPayment = () => {
    // Simulating PIX QR code generation
    setShowPixQRCode(true);
    toast({
      title: "QR Code PIX gerado",
      description: "Escaneie o QR Code para realizar o pagamento.",
    });
  };

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      if (data.paymentMethod === "pix" && !showPixQRCode) {
        handlePixPayment();
        return;
      }

      setIsSubmitting(true);
      const address = `${data.street}, ${data.number}${data.complement ? `, ${data.complement}` : ''} - ${data.neighborhood}, ${data.city}`;
      
      const orderData = {
        customerName: "Cliente",
        customerPhone: data.phone, // Use the phone from the form
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      };

      console.log("Submitting order data:", orderData);
      const order = await createOrder(orderData);
      console.log("Order created:", order);

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${order.id} foi confirmado.`,
      });

      clearCart();
      navigate("/orders");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      
      // More specific error message
      let errorMessage = "Ocorreu um erro ao processar seu pedido. Tente novamente.";
      
      if (error.code === "permission-denied") {
        errorMessage = "Erro de permissão ao criar o pedido. Verifique se todos os campos estão preenchidos corretamente.";
      }
      
      toast({
        title: "Erro ao criar pedido",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Seu carrinho está vazio</h2>
          <Button onClick={() => navigate("/")}>Voltar para o cardápio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>
      
      {/* Resumo do pedido */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{item.quantity}x </span>
                {item.name}
              </div>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center font-bold">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de checkout */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço de Entrega
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                {...register("street", { required: "Rua é obrigatória" })}
                placeholder="Digite o nome da rua"
              />
              {errors.street && (
                <p className="text-sm text-red-500">{errors.street.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                {...register("number", { required: "Número é obrigatório" })}
                placeholder="Número"
              />
              {errors.number && (
                <p className="text-sm text-red-500">{errors.number.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                {...register("complement")}
                placeholder="Apartamento, bloco, etc. (opcional)"
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                {...register("neighborhood", { required: "Bairro é obrigatório" })}
                placeholder="Digite o bairro"
              />
              {errors.neighborhood && (
                <p className="text-sm text-red-500">{errors.neighborhood.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                {...register("city", { required: "Cidade é obrigatória" })}
                placeholder="Digite a cidade"
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register("phone", { 
                  required: "Telefone é obrigatório",
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: "Telefone deve ter 10 ou 11 dígitos"
                  }
                })}
                placeholder="Digite seu telefone (apenas números)"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Forma de Pagamento</h2>
          <RadioGroup defaultValue="card">
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="pix" 
                id="pix"
                {...register("paymentMethod")}
              />
              <Label htmlFor="pix" className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                PIX
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="card" 
                id="card"
                {...register("paymentMethod")}
              />
              <Label htmlFor="card" className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cartão de Crédito/Débito na entrega
              </Label>
            </div>
          </RadioGroup>

          {showPixQRCode && selectedPaymentMethod === "pix" && (
            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">QR Code PIX</h3>
              <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
                {/* Simulação do QR Code */}
                <div className="w-48 h-48 border-2 border-dashed border-gray-400 rounded flex items-center justify-center">
                  <span className="text-sm text-gray-500">QR Code PIX</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Escaneie o QR Code acima para realizar o pagamento via PIX
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/")}
          >
            Voltar ao Cardápio
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? "Processando..." 
              : selectedPaymentMethod === "pix" && !showPixQRCode 
                ? "Gerar QR Code PIX" 
                : "Confirmar Pedido"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
