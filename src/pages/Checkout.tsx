import React, { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createOrder } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchAddressByCep } from "@/services/cepService";
import { saveCustomerData, getCustomerByPhone } from "@/services/customerService";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [observations, setObservations] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Preencher dados automaticamente se o usuário estiver logado
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.displayName || "");
      // Se o usuário tem telefone no perfil, usar esse telefone
      if (currentUser.phoneNumber) {
        setCustomerPhone(currentUser.phoneNumber);
        // Tentar buscar dados salvos com esse telefone
        handlePhoneChange(currentUser.phoneNumber);
      }
      // Se não tiver telefone mas tem email, tentar buscar por telefone salvo anteriormente
      // Aqui você pode implementar uma busca por email se necessário
    }
  }, [currentUser]);

  const handlePhoneChange = async (value: string) => {
    setCustomerPhone(value);
    
    // Buscar dados do cliente quando o telefone tiver 10 ou 11 dígitos
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length >= 11) {
      setPhoneLoading(true);
      try {
        const customerData = await getCustomerByPhone(value);
        if (customerData) {
          // Preencher os campos com os dados salvos
          setCustomerName(customerData.name || "");
          setCep(customerData.cep || "");
          setStreet(customerData.street || "");
          setNumber(customerData.number || "");
          setComplement(customerData.complement || "");
          setNeighborhood(customerData.neighborhood || "");
          setCity(customerData.city || "");
          setState(customerData.state || "");
          
          toast({
            title: "Dados carregados!",
            description: "Seus dados foram preenchidos automaticamente.",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados do cliente:", error);
      } finally {
        setPhoneLoading(false);
      }
    }
  };

  const handleCepChange = async (value: string) => {
    setCep(value);
    
    if (value.replace(/\D/g, '').length === 8) {
      setCepLoading(true);
      try {
        const cepInfo = await fetchAddressByCep(value);
        if (cepInfo) {
          setStreet(cepInfo.street || "");
          setNeighborhood(cepInfo.neighborhood || "");
          setCity(cepInfo.city || "");
          setState(cepInfo.state || "");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast({
          title: "Erro",
          description: "Não foi possível buscar as informações do CEP",
          variant: "destructive",
        });
      } finally {
        setCepLoading(false);
      }
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const fullAddress = `${street}, ${number}${complement ? `, ${complement}` : ""} - ${neighborhood}, ${city} - ${state}`;

    // Função auxiliar para calcular subtotal de cada item
    const calculateItemSubtotal = (item: any) => {
      if (item.isHalfPizza) {
        return (item.price || 0) * (item.quantity || 1);
      }

      const basePrice = (item.priceFrom ? 0 : (item.price || 0));
      let variationsTotal = 0;

      if (item.selectedVariations && Array.isArray(item.selectedVariations)) {
        item.selectedVariations.forEach((group: any) => {
          if (group.variations && Array.isArray(group.variations)) {
            group.variations.forEach((variation: any) => {
              const additionalPrice = variation.additionalPrice || 0;
              const quantity = variation.quantity || 1;
              variationsTotal += additionalPrice * quantity;
            });
          }
        });
      }

      return (basePrice + variationsTotal) * item.quantity;
    };

    // Montar itens já com subtotal
    const itemsWithSubtotal = cartItems.map(item => ({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedVariations: item.selectedVariations || [],
      priceFrom: item.priceFrom || false,
      isHalfPizza: item.isHalfPizza || false,
      combination: item.combination || null,
      subtotal: calculateItemSubtotal(item), // 🔥 agora salva
    }));

    // Calcular total do pedido
    const total = itemsWithSubtotal.reduce((acc, item) => acc + item.subtotal, 0);

    const orderData = {
      customerName,
      customerPhone,
      address: fullAddress,
      paymentMethod,
      observations,
      items: itemsWithSubtotal,
      total, // 🔥 agora salva o total também
    };

    console.log("[CHECKOUT] Dados do pedido sendo enviados:", JSON.stringify(orderData, null, 2));

    const order = await createOrder(orderData);

    // Salvar dados do cliente após criar o pedido
    await saveCustomerData({
      name: customerName,
      phone: customerPhone,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
    });

    clearCart();

    toast({
      title: "Pedido realizado com sucesso!",
      description: `Seu pedido #${order.id.substring(0, 6)} foi enviado para o restaurante.`,
    });

    navigate("/");
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    toast({
      title: "Erro",
      description: "Não foi possível processar seu pedido. Tente novamente.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-4">Seu carrinho está vazio</h2>
            <Button onClick={() => navigate("/")} variant="outline">
              Voltar ao cardápio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
        <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>
      </div>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Nome completo</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone">Telefone/WhatsApp</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  disabled={phoneLoading}
                  required
                />
                {phoneLoading && <p className="text-sm text-gray-500 mt-1">Buscando dados...</p>}
              </div>

              <Separator />

              <h3 className="text-lg font-semibold">Endereço de Entrega</h3>
              
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  disabled={cepLoading}
                  required
                />
                {cepLoading && <p className="text-sm text-gray-500 mt-1">Buscando CEP...</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apto, bloco, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Forma de Pagamento</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: "card" | "cash") => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Cartão</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Dinheiro</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observações sobre o pedido..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processando..." : `Finalizar Pedido - R$ ${cartTotal.toFixed(2)}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-0 border-b pb-4 mb-2 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{item.name}</p>
                      {item.isHalfPizza && item.combination ? (
                        <div className="text-sm text-gray-600">
                          <p>{item.quantity}x Pizza {item.combination.tamanho} - Meio a meio</p>
                          <p className="text-xs">1/2 {item.combination.sabor1.name} + 1/2 {item.combination.sabor2.name}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {item.quantity}x {item.priceFrom ? (
                            <span>
                              <span className="text-xs text-gray-500">a partir de</span> R$ 0,00
                            </span>
                          ) : (
                            `R$ ${item.price.toFixed(2)}`
                          )}
                        </p>
                      )}
                    </div>
                    <div className="text-right font-semibold text-lg">
                      R$ {(
                        item.isHalfPizza 
                          ? item.price * item.quantity
                          : // Se o item tem "a partir de", o preço base é 0
                            ((item.priceFrom ? 0 : item.price) +
                              (item.selectedVariations
                                ? item.selectedVariations.reduce((acc, group) => {
                                    return (
                                      acc +
                                      group.variations.reduce(
                                        (gacc, v) =>
                                          gacc +
                                          ((v.additionalPrice || 0) *
                                            (v.quantity || 1)),
                                        0
                                      )
                                    );
                                  }, 0)
                                : 0)) * item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>

                  {/* Exibir grupos de variações e suas quantidades/subtotais (apenas para itens que não são pizza meio a meio) */}
                  {!item.isHalfPizza && item.selectedVariations && item.selectedVariations.length > 0 && (
                    <div className="mt-2 ml-1 text-sm">
                      {item.selectedVariations.map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-2">
                          <div className="font-semibold text-gray-700">{group.groupName}:</div>
                          <div className="ml-2 text-gray-700 flex flex-col gap-0.5">
                            {group.variations.map((variation, varIndex) => {
                              // Subtotal de cada variação multiplicado pela quantidade selecionada
                              const variationTotal =
                                (variation.additionalPrice || 0) *
                                (variation.quantity || 1) *
                                item.quantity;

                              // Mostrar quantidade sempre, mesmo se for 1
                              if (variation.quantity > 0) {
                                return (
                                  <div key={varIndex} className="flex items-center justify-between">
                                    <span>
                                      <span className="inline-block w-7">{variation.quantity}x</span>
                                      {variation.name || "Variação"}
                                      {variation.additionalPrice && variation.additionalPrice > 0 ? (
                                        <>
                                          {" "}
                                          <span className="text-gray-500">
                                            (+R$ {variation.additionalPrice.toFixed(2)})
                                          </span>
                                        </>
                                      ) : null}
                                    </span>
                                    {/* Mostrar subtotal apenas se houver preço */}
                                    {variation.additionalPrice && variation.additionalPrice > 0 && (
                                      <span className="text-green-600 font-semibold tabular-nums">
                                        +R$ {(variationTotal).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
