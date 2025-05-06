
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MenuItem, Variation, SelectedVariation } from "@/types/menu";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface ProductVariationDialogProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedVariations: SelectedVariation[]) => void;
  availableVariations: Variation[];
}

const ProductVariationDialog: React.FC<ProductVariationDialogProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  availableVariations,
}) => {
  const [selectedVariations, setSelectedVariations] = useState<SelectedVariation[]>([]);
  const [totalSelectedCount, setTotalSelectedCount] = useState(0);
  const maxAllowed = item.maxVariationCount || 0;

  useEffect(() => {
    if (isOpen) {
      // Inicializar com quantidade 0 para cada variação disponível
      const initialVariations = availableVariations.map(variation => ({
        variationId: variation.id,
        quantity: 0,
      }));
      setSelectedVariations(initialVariations);
      setTotalSelectedCount(0);
    }
  }, [isOpen, availableVariations]);

  const increaseVariation = (variationId: string) => {
    if (totalSelectedCount >= maxAllowed) return;
    
    setSelectedVariations(prev => 
      prev.map(variation => 
        variation.variationId === variationId 
          ? { ...variation, quantity: variation.quantity + 1 } 
          : variation
      )
    );
    setTotalSelectedCount(prev => prev + 1);
  };

  const decreaseVariation = (variationId: string) => {
    setSelectedVariations(prev => 
      prev.map(variation => 
        variation.variationId === variationId && variation.quantity > 0
          ? { ...variation, quantity: variation.quantity - 1 } 
          : variation
      )
    );

    // Só diminuímos o total se realmente diminuirmos a quantidade
    const variation = selectedVariations.find(v => v.variationId === variationId);
    if (variation && variation.quantity > 0) {
      setTotalSelectedCount(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    // Filtramos apenas as variações com quantidade > 0
    const nonZeroVariations = selectedVariations.filter(v => v.quantity > 0);
    
    // Verificar se o total está de acordo com o esperado
    if (totalSelectedCount === maxAllowed) {
      onAddToCart(item, nonZeroVariations);
      onClose();
    } else {
      // Mostrar erro ou alerta aqui se quiser
      console.log(`Por favor, selecione exatamente ${maxAllowed} itens no total.`);
    }
  };

  const getVariationDetails = (variationId: string) => {
    return availableVariations.find(v => v.id === variationId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="h-48 w-full overflow-hidden rounded-md mb-4">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="space-y-4 mt-6">
            <p className="text-sm text-gray-500">
              Selecione {maxAllowed} opções de recheio ({totalSelectedCount}/{maxAllowed} selecionados)
            </p>
            
            {selectedVariations.map((variation) => {
              const variationDetails = getVariationDetails(variation.variationId);
              return variationDetails ? (
                <div key={variation.variationId} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{variationDetails.name}</p>
                    {variationDetails.additionalPrice ? (
                      <p className="text-sm text-gray-500">
                        +{formatCurrency(variationDetails.additionalPrice)}
                      </p>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => decreaseVariation(variation.variationId)}
                      disabled={variation.quantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="w-6 text-center">{variation.quantity}</span>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => increaseVariation(variation.variationId)}
                      disabled={totalSelectedCount >= maxAllowed}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddToCart} 
              disabled={totalSelectedCount !== maxAllowed}
              className="bg-food-green hover:bg-opacity-90"
            >
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductVariationDialog;
