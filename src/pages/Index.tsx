
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CategoryNav from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import RestaurantHeader from "@/components/RestaurantHeader";
import { categories, getMenuItemsByCategory, getPopularItems } from "@/data/menuData";
import { getAllCategories, getMenuItemsByCategory as getFirebaseMenuItemsByCategory, getPopularItems as getFirebasePopularItems } from "@/services/menuService";
import { Category } from "@/types/menu";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut } from "lucide-react";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string>("entradas");
  const [menuCategories, setMenuCategories] = useState<Category[]>(categories);
  const [menuItems, setMenuItems] = useState(getMenuItemsByCategory("entradas"));
  const [popularItems, setPopularItems] = useState(getPopularItems());
  const { currentUser, logOut } = useAuth();

  // Load data on component mount
  useEffect(() => {
    loadData();
    
    // Ordenação de categorias por ordem (se definida)
    const sortedCategories = [...menuCategories].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
    
    setMenuCategories(sortedCategories);
  }, []); // Removed menuCategories from dependency array to prevent infinite loop

  const loadData = async () => {
    try {
      // Try to get data from Firebase, fallback to local data
      const firebaseCategories = await getAllCategories();
      if (firebaseCategories.length > 0) {
        const sortedCategories = [...firebaseCategories].sort((a, b) => {
          const orderA = a.order || 0;
          const orderB = b.order || 0;
          return orderA - orderB;
        });
        setMenuCategories(sortedCategories);
      }

      // Load initial category items
      loadCategoryItems(activeCategory);

      // Load popular items
      const firebasePopularItems = await getFirebasePopularItems();
      if (firebasePopularItems.length > 0) {
        setPopularItems(firebasePopularItems);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      // Already using local data as fallback
    }
  };

  const loadCategoryItems = async (categoryId: string) => {
    try {
      const firebaseCategoryItems = await getFirebaseMenuItemsByCategory(categoryId);
      if (firebaseCategoryItems.length > 0) {
        setMenuItems(firebaseCategoryItems);
      } else {
        // Fallback to local data
        setMenuItems(getMenuItemsByCategory(categoryId));
      }
    } catch (error) {
      console.error("Erro ao carregar itens da categoria:", error);
      // Fallback to local data
      setMenuItems(getMenuItemsByCategory(categoryId));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    loadCategoryItems(categoryId);
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
              <Button asChild variant="outline">
                <Link to="/admin">Administração</Link>
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
