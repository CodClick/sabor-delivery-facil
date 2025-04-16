
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CategoryNav from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import RestaurantHeader from "@/components/RestaurantHeader";
import { categories, getMenuItemsByCategory, getPopularItems } from "@/data/menuData";
import { Category } from "@/types/menu";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, LogOut } from "lucide-react";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string>("entradas");
  const [menuCategories, setMenuCategories] = useState<Category[]>(categories);
  const [menuItems, setMenuItems] = useState(getMenuItemsByCategory("entradas"));
  const [popularItems, setPopularItems] = useState(getPopularItems());
  const { currentUser, logOut } = useAuth();

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setMenuItems(getMenuItemsByCategory(categoryId));
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center my-4">
        <h1 className="text-2xl font-bold">Menu</h1>
        <div className="flex space-x-2">
          {currentUser ? (
            <>
              <Button asChild variant="outline">
                <Link to="/orders">Ver Pedidos</Link>
              </Button>
              <Button onClick={logOut} variant="outline" className="flex items-center gap-2">
                <LogOut size={16} />
                Sair
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link to="/login">
                <LogIn size={16} />
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </div>
      <RestaurantHeader />
      <CategoryNav 
        categories={menuCategories} 
        activeCategory={activeCategory} 
        onSelectCategory={handleSelectCategory} 
      />
      <MenuSection 
        title={menuCategories.find(cat => cat.id === activeCategory)?.name || ""}
        items={menuItems} 
      />
      {popularItems.length > 0 && (
        <MenuSection title="Mais Populares" items={popularItems} />
      )}
    </div>
  );
};

export default Index;
