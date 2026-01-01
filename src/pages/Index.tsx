import React, { useState, useEffect } from "react";
import { getAllMenuItems } from "@/services/menuItemService";
import { getAllCategories } from "@/services/categoryService";
import { MenuItem, Category } from "@/types/menu";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, LogIn, LogOut, ClipboardList, Search, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
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

  // Filtrar itens por busca e categoria
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));

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
      
      {/* Header com botão de login/logout e meus pedidos */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-end gap-2">
          {currentUser && (
            <Button 
              variant="outline" 
              onClick={() => navigate("/meus-pedidos")}
              className="flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Meus Pedidos
            </Button>
          )}
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

      {/* Campo de busca */}
      <div className="container mx-auto px-4 pt-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
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
