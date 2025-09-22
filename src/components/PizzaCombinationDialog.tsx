import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuItem } from "@/types/menu";
import { getAllMenuItems } from "@/services/menuItemService";
import { getAllVariations } from "@/services/variationService";
import { formatCurrency } from "@/lib/utils";

interface PizzaCombinationDialogProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

interface PizzaOption {
  id: string;
  name: string;
  precoBroto?: number;
  precoGrande?: number;
}

const PizzaCombinationDialog: React.FC<PizzaCombinationDialogProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [sabor1, setSabor1] = useState<string | null>(null);
  const [sabor2, setSabor2] = useState<string | null>(null);
  const [pizzaOptions, setPizzaOptions] = useState<PizzaOption[]>([]);
  const [tamanho, setTamanho] = useState<"broto" | "grande">("grande");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPizzaOptions = async () => {
      try {
        setLoading(true);
        const [menuItems, variations] = await Promise.all([
          getAllMenuItems(),
          getAllVariations()
        ]);

        // Filtrar apenas pizzas que permitem combinação
        const pizzas = menuItems.filter(item => 
          item.tipo === "pizza" && item.permiteCombinacao
        );

        const pizzaOptionsWithPrices: PizzaOption[] = [];

        for (const pizza of pizzas) {
          const option: PizzaOption = {
            id: pizza.id,
            name: pizza.name,
          };

          // Buscar preços nas variações "Broto" e "Grande"
          if (pizza.hasVariations && pizza.variationGroups) {
            for (const group of pizza.variationGroups) {
              const groupVariations = variations.filter(v => 
                group.variations.includes(v.id)
              );

              const brotoVariation = groupVariations.find(v => 
                v.name.toLowerCase().includes('broto')
              );
              const grandeVariation = groupVariations.find(v => 
                v.name.toLowerCase().includes('grande')
              );

              if (brotoVariation?.additionalPrice !== undefined) {
                option.precoBroto = pizza.price + brotoVariation.additionalPrice;
              }
              if (grandeVariation?.additionalPrice !== undefined) {
                option.precoGrande = pizza.price + grandeVariation.additionalPrice;
              }
            }
          }

          // Se não tem variações, usar o preço base
          if (!option.precoBroto && !option.precoGrande) {
            option.precoBroto = pizza.price;
            option.precoGrande = pizza.price;
          }

          pizzaOptionsWithPrices.push(option);
        }

        setPizzaOptions(pizzaOptionsWithPrices);
      } catch (error) {
        console.error("Erro ao carregar opções de pizza:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadPizzaOptions();
    }
  }, [isOpen]);

  const calculatePrice = (): number => {
    if (!sabor1 || !sabor2) return item.price;

    const pizza1 = pizzaOptions.find(p => p.id === sabor1);
    const pizza2 = pizzaOptions.find(p => p.id === sabor2);

    if (!pizza1 || !pizza2) return item.price;

    const preco1 = tamanho === "broto" ? pizza1.precoBroto : pizza1.precoGrande;
    const preco2 = tamanho === "broto" ? pizza2.precoBroto : pizza2.precoGrande;

    // Retornar o maior preço entre os dois sabores
    return Math.max(preco1 || 0, preco2 || 0);
  };

  const handleConfirm = () => {
    if (!sabor1 || !sabor2) return;

    const pizza1 = pizzaOptions.find(p => p.id === sabor1);
    const pizza2 = pizzaOptions.find(p => p.id === sabor2);

    if (!pizza1 || !pizza2) return;

    const finalPrice = calculatePrice();

    const combinedItem = {
      ...item,
      name: `Pizza Meio a Meio ${tamanho === "broto" ? "(Broto)" : "(Grande)"} - 1/2 ${pizza1.name} + 1/2 ${pizza2.name}`,
      price: finalPrice,
      isHalfPizza: true,
      combination: {
        sabor1: { id: sabor1, name: pizza1.name },
        sabor2: { id: sabor2, name: pizza2.name },
        tamanho
      },
    };

    onAddToCart(combinedItem);
    onClose();
    
    // Reset form
    setSabor1(null);
    setSabor2(null);
    setTamanho("grande");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Monte sua Pizza Meio a Meio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seleção de tamanho */}
          <div>
            <label className="block font-medium mb-2">Tamanho:</label>
            <Select value={tamanho} onValueChange={(value: "broto" | "grande") => setTamanho(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="broto">Broto</SelectItem>
                <SelectItem value="grande">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seleção do primeiro sabor */}
          <div>
            <label className="block font-medium mb-2">Escolha o 1º sabor:</label>
            <Select value={sabor1 || ""} onValueChange={setSabor1} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Carregando..." : "Selecione o sabor"} />
              </SelectTrigger>
              <SelectContent>
                {pizzaOptions.map((pizza) => {
                  const preco = tamanho === "broto" ? pizza.precoBroto : pizza.precoGrande;
                  return (
                    <SelectItem key={pizza.id} value={pizza.id}>
                      {pizza.name} {preco && `- ${formatCurrency(preco)}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção do segundo sabor */}
          <div>
            <label className="block font-medium mb-2">Escolha o 2º sabor:</label>
            <Select value={sabor2 || ""} onValueChange={setSabor2} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Carregando..." : "Selecione o sabor"} />
              </SelectTrigger>
              <SelectContent>
                {pizzaOptions.map((pizza) => {
                  const preco = tamanho === "broto" ? pizza.precoBroto : pizza.precoGrande;
                  return (
                    <SelectItem key={pizza.id} value={pizza.id}>
                      {pizza.name} {preco && `- ${formatCurrency(preco)}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Preço final */}
          {sabor1 && sabor2 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Preço final:</div>
              <div className="text-lg font-bold text-brand">{formatCurrency(calculatePrice())}</div>
              <div className="text-xs text-gray-500 mt-1">
                * Preço baseado no sabor mais caro
              </div>
            </div>
          )}

          <Button 
            onClick={handleConfirm} 
            className="w-full" 
            disabled={!sabor1 || !sabor2 || loading}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PizzaCombinationDialog;
