
import React, { useState } from "react";
import { MenuItem, Variation } from "@/types/menu";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import ProductVariationDialog from "./ProductVariationDialog";

// Dados mockados para variações até implementarmos a tela de administração
const mockVariations: Variation[] = [
  { id: "var1", name: "Taco de Carne", available: true, categoryIds: ["tacos", "combos"] },
  { id: "var2", name: "Taco de Queijo", available: true, categoryIds: ["tacos", "combos"] },
  { id: "var3", name: "Taco de Pernil", available: true, categoryIds: ["tacos", "combos"] },
  { id: "var4", name: "Taco de Frango", available: true, categoryIds: ["tacos", "combos"] },
  { id: "var5", name: "Burrito de Carne", available: true, categoryIds: ["burritos", "combos"] },
  { id: "var6", name: "Burrito de Queijo", available: true, categoryIds: ["burritos", "combos"] },
];

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { addToCart, addItem } = useCart();
  const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);

  const handleButtonClick = () => {
    if (item.hasVariations) {
      setIsVariationDialogOpen(true);
    } else {
      addToCart(item);
    }
  };

  const getAvailableVariationsForItem = (item: MenuItem): Variation[] => {
    if (!item.variations || item.variations.length === 0) {
      return [];
    }
    
    // Filtrar variações disponíveis para esta categoria
    return mockVariations.filter(
      variation => 
        variation.available && 
        variation.categoryIds.includes(item.category) &&
        item.variations?.includes(variation.id)
    );
  };

  const handleAddItemWithVariations = (
    item: MenuItem, 
    selectedVariations: Array<{variationId: string; quantity: number}>
  ) => {
    addItem({
      ...item,
      selectedVariations
    });
  };

  return (
    <>
      <div className="food-item bg-white rounded-lg overflow-hidden shadow-md p-4 flex flex-col">
        <div className="h-48 overflow-hidden rounded-md mb-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              console.log("Erro ao carregar imagem:", item.image);
              // Fallback to a placeholder image if the food image fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-lg font-bold text-brand">{formatCurrency(item.price)}</span>
          <Button
            onClick={handleButtonClick}
            className="add-to-cart-btn"
            size="sm"
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      <ProductVariationDialog
        item={item}
        isOpen={isVariationDialogOpen}
        onClose={() => setIsVariationDialogOpen(false)}
        onAddToCart={handleAddItemWithVariations}
        availableVariations={getAvailableVariationsForItem(item)}
      />
    </>
  );
};

export default MenuItemCard;
