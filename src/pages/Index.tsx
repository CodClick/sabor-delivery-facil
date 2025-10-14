import React, { useState, useEffect } from "react";
import { getAllMenuItems } from "@/services/menuItemService";
import { getAllCategories } from "@/services/categoryService";
import { MenuItem, Category } from "@/types/menu";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogIn, LogOut } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { itemCount, isCartOpen, setIsCartOpen } = useCart();
  const { currentUser, logOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getAllMenuItems();
      // Filtrar apenas itens disponíveis
      const availableItems = items.filter(item => item.available !== false);
      setMenuItems(availableItems);
    };

    const loadCategories = async () => {
      const categories = await getAllCategories();
      setCategories([{ id: "all", name: "Todos", order: 0 }, ...categories]);
    };

    loadMenuItems();
    loadCategories();
  }, []);

  // Filtrar e ordenar itens por categoria
  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems
        .filter(item => item.category === activeCategory)
        .sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
        );

  // Agrupar e ordenar itens por categoria para exibição
  const groupedItems = categories.reduce((acc, category) => {
    if (category.id === "all") return acc;
    
    let categoryItems = filteredItems.filter(item => item.category === category.id);

    // Ordenar alfabeticamente
    categoryItems = categoryItems.sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
    );

    if (categoryItems.length > 0) {
      acc.push({
        category,
        items: categoryItems
      });
    }
    return acc;
  }, [] as Array<{ category: Category; items: MenuItem[] }>);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div>
      <RestaurantHeader />
      
      {/* Header com botão de login/logout */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          {currentUser ? (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={handleLogin}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
          )}
        </div>
      </div>

      <CategoryNav 
        categories={categories} 
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      
      <div className="container mx-auto px-4 py-8">
        {activeCategory === "all" ? (
          // Mostrar todas as categorias com seus itens
          groupedItems.map(({ category, items }) => (
            <MenuSection 
              key={category.id}
              title={category.name} 
              items={items} 
            />
          ))
        ) : (
          // Mostrar apenas a categoria selecionada
          <MenuSection 
            title={categories.find(cat => cat.id === activeCategory)?.name || "Menu"} 
            items={filteredItems} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
