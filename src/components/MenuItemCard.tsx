
import React, { useState, useEffect } from "react";
import { MenuItem, Variation, SelectedVariationGroup } from "@/types/menu";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import ProductVariationDialog from "./ProductVariationDialog";
import { getAllVariations } from "@/services/menuService";

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { addToCart, addItem } = useCart();
  const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);
  const [availableVariations, setAvailableVariations] = useState<Variation[]>([]);

  useEffect(() => {
    // Load variations when the component mounts
    const loadVariations = async () => {
      try {
        const variations = await getAllVariations();
        setAvailableVariations(variations);
      } catch (error) {
        console.error("Error loading variations:", error);
        setAvailableVariations([]);
      }
    };

    loadVariations();
  }, []);

  const handleButtonClick = () => {
    if (item.hasVariations && item.variationGroups && item.variationGroups.length > 0) {
      setIsVariationDialogOpen(true);
    } else {
      addToCart(item);
    }
  };

  const getAvailableVariationsForItem = (item: MenuItem): Variation[] => {
    if (!item.variationGroups) {
      return [];
    }
    
    // Get all variation IDs used in any group
    const allVariationIds = item.variationGroups.flatMap(group => group.variations);
    
    // Filter variations available for this item
    return availableVariations.filter(
      variation => 
        variation.available && 
        variation.categoryIds.includes(item.category) &&
        allVariationIds.includes(variation.id)
    );
  };

  const handleAddItemWithVariations = (
    item: MenuItem, 
    selectedVariationGroups: SelectedVariationGroup[]
  ) => {
    addItem({
      ...item,
      selectedVariations: selectedVariationGroups
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
