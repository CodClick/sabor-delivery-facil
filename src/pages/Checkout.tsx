import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useForm } from "react-hook-form";
import { MapPin, CreditCard, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { createOrder } from "@/services/orderService";
import { fetchAddressByCep, isDeliveryAreaValid } from "@/services/cepService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CheckoutFormData {
  customerName: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  paymentMethod: "card" | "cash";
  observations?: string;
}

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, formState: { errors }, setError } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: "card"
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [deliveryAreaError, setDeliveryAreaError] = useState<string | null>(null);

  const handleCepChange = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    if (cep && cep.length >= 8) {
      setIsLoadingCep(true);
      setDeliveryAreaError(null);
      
      try {
        // First check if the CEP is within a valid delivery area
        const isValid = await isDeliveryAreaValid(cep);
        
        if (!isValid) {
          setDeliveryAreaError("Infelizmente ainda não entregamos nesse endereço.");
          // Clear the address fields
          setValue('street', '');
          setValue('neighborhood', '');
          setValue('city', '');
          setValue('state', '');
          setIsLoadingCep(false);
          return;
        }
        
        // If the CEP is valid for delivery, fetch the address details
        const data = await fetchAddressByCep(cep);
        
        setValue('street', data.street);
        setValue('neighborhood', data.neighborhood);
        setValue('city', data.city);
        setValue('state', data.state);
        
        toast({
          title: "Endereço encontrado",
          description: "Os campos de endereço foram preenchidos automaticamente.",
        });
      } catch (error) {
        toast({
          title: "Erro ao buscar endereço",
          description: "Não foi possível encontrar o endereço pelo CEP informado.",
          variant: "destructive",
        });
        
        // Limpa os campos de endereço em caso de erro
        setValue('street', '');
        setValue('neighborhood', '');
        setValue('city', '');
        setValue('state', '');
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      const address = `${data.street}, ${data.number}${data.complement ? `, ${data.complement}` : ''} - ${data.neighborhood}, ${data.city} - ${data.state}`;
      
      const orderData = {
        customerName: data.customerName,
        customerPhone: data.phone,
        address: address,
        paymentMethod: data.paymentMethod,
        observations: data.observations || "",
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="customerName">Nome Completo</Label>
              <Input
                id="customerName"
                {...register("customerName", { required: "Nome é obrigatório" })}
                placeholder="Digite seu nome completo"
              />
              {errors.customerName && (
                <p className="text-sm text-red-500">{errors.customerName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                {...register("phone", { 
                  required: "Telefone é obrigatório",
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: "WhatsApp deve ter 10 ou 11 dígitos"
                  }
                })}
                placeholder="Digite seu WhatsApp (apenas números)"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço de Entrega
          </h2>
          
          {deliveryAreaError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Área não atendida</AlertTitle>
              <AlertDescription>{deliveryAreaError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                {...register("cep", { 
                  required: "CEP é obrigatório",
                  pattern: {
                    value: /^[0-9]{8}$/,
                    message: "CEP deve ter 8 dígitos"
                  }
                })}
                placeholder="Digite o CEP (apenas números)"
                onBlur={handleCepChange}
                disabled={isLoadingCep}
              />
              {errors.cep && (
                <p className="text-sm text-red-500">{errors.cep.message}</p>
              )}
              {isLoadingCep && (
                <p className="text-sm text-blue-500">Buscando endereço...</p>
              )}
            </div>
            
            <div>
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
            
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
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
              <div className="col-span-8">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  {...register("complement")}
                  placeholder="Apt, bloco"
                />
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
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
              <div className="col-span-1">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  {...register("state", { required: "Estado é obrigatório" })}
                  placeholder="Digite o estado"
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Input
                id="observations"
                {...register("observations")}
                placeholder="sem pimenta, sem cebola, mal-passado, etc"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Forma de Pagamento
          </h2>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="card"
                value="card"
                {...register("paymentMethod")}
                defaultChecked
                className="h-4 w-4"
              />
              <label htmlFor="card" className="text-sm font-medium">
                Cartão de Crédito/Débito na entrega
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="cash"
                value="cash"
                {...register("paymentMethod")}
                className="h-4 w-4"
              />
              <label htmlFor="cash" className="text-sm font-medium">
                Dinheiro na entrega
              </label>
            </div>
          </div>
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
            disabled={isSubmitting || !!deliveryAreaError}
          >
            {isSubmitting ? "Processando..." : "Confirmar Pedido"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
