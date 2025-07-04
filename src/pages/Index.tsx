
import React, { useState, useEffect } from "react";
import { getAllMenuItems } from "@/services/menuItemService";
import { getAllCategories } from "@/services/categoryService";
import { MenuItem, Category } from "@/types/menu";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Index = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { itemCount, isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getAllMenuItems();
      setMenuItems(items);
    };

    const loadCategories = async () => {
      const categories = await getAllCategories();
      setCategories(categories);
    };

    loadMenuItems();
    loadCategories();
  }, []);

  return (
    <div>
      <RestaurantHeader />
      <CategoryNav 
        categories={categories} 
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      <MenuSection title="Nosso Menu" items={menuItems} />

      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsCartOpen(true)}
          className="bg-brand hover:bg-brand-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Index;
