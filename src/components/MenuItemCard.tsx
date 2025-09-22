import React, { useState, useEffect } from "react";
import { MenuItem, Variation, SelectedVariationGroup } from "@/types/menu";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import ProductVariationDialog from "./ProductVariationDialog";
import PizzaCombinationDialog from "./PizzaCombinationDialog"; // novo
import { getAllVariations } from "@/services/variationService";

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { addToCart, addItem } = useCart();
  const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);
  const [isPizzaDialogOpen, setIsPizzaDialogOpen] = useState(false); // novo
  const [availableVariations, setAvailableVariations] = useState<Variation[]>([]);
  const [groups, setGroups] = useState<{ [groupId: string]: Variation[] }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadVariations = async () => {
      try {
        setLoading(true);
        const variations = await getAllVariations();
        setAvailableVariations(variations);

        if (item.hasVariations && item.variationGroups && item.variationGroups.length > 0) {
          const groupVariations: { [groupId: string]: Variation[] } = {};

          for (const group of item.variationGroups) {
            groupVariations[group.id] = variations.filter(
              (variation) =>
                variation.available &&
                group.variations.includes(variation.id) &&
                variation.categoryIds.includes(item.category)
            );
          }

          setGroups(groupVariations);
        }
      } catch (error) {
        console.error("Error loading variations:", error);
        setAvailableVariations([]);
      } finally {
        setLoading(false);
      }
    };

    loadVariations();
  }, [item]);

  const handleButtonClick = () => {
    if (item.tipo === "pizza" && item.permiteCombinacao) {
      // fluxo de pizza meio a meio
      setIsPizzaDialogOpen(true);
    } else if (item.hasVariations && item.variationGroups && item.variationGroups.length > 0) {
      // fluxo de produto com variações normais
      setIsVariationDialogOpen(true);
    } else {
      // produto simples
      addToCart(item);
    }
  };

  const handleAddItemWithVariations = (
    item: MenuItem,
    selectedVariationGroups: SelectedVariationGroup[]
  ) => {
    addItem({
      ...item,
      selectedVariations: selectedVariationGroups,
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
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex flex-col">
            {item.priceFrom && <span className="text-xs text-gray-500 mb-1">a partir de</span>}
            <span className="text-lg font-bold text-brand">{formatCurrency(item.price)}</span>
          </div>
          <Button
            onClick={handleButtonClick}
            className="add-to-cart-btn"
            size="sm"
            disabled={loading || (item.hasVariations && Object.keys(groups).length === 0)}
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Fluxo pizza meio a meio */}
      {item.tipo === "pizza" && item.permiteCombinacao && (
        <PizzaCombinationDialog
          item={item}
          isOpen={isPizzaDialogOpen}
          onClose={() => setIsPizzaDialogOpen(false)}
          onAddToCart={addItem}
        />
      )}

      {/* Fluxo variações normais */}
      <ProductVariationDialog
        item={item}
        isOpen={isVariationDialogOpen}
        onClose={() => setIsVariationDialogOpen(false)}
        onAddToCart={handleAddItemWithVariations}
        availableVariations={availableVariations}
        groupVariations={groups}
      />
    </>
  );
};

export default MenuItemCard;
