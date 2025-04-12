
import React from "react";
import { MenuItem } from "@/types/menu";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div className="food-item bg-white rounded-lg overflow-hidden shadow-md p-4 flex flex-col">
      <div className="h-48 overflow-hidden rounded-md mb-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          onError={(e) => {
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
          onClick={() => addToCart(item)}
          className="add-to-cart-btn"
          size="sm"
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          Adicionar
        </Button>
      </div>
    </div>
  );
};

export default MenuItemCard;
