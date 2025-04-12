
import React, { useState, useEffect, useRef } from "react";
import { categories, getMenuItemsByCategory, getPopularItems } from "@/data/menuData";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import ShoppingCart from "@/components/ShoppingCart";
import { useCart } from "@/contexts/CartContext";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RestaurantHeader />
      
      <CategoryNav 
        categories={categories} 
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
      />
      
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Popular items section */}
        <MenuSection
          title="Mais Populares"
          items={getPopularItems()}
        />
        
        {/* Category sections */}
        {categories.map((category) => (
          <div key={category.id} id={category.id} ref={(el) => (sectionRefs.current[category.id] = el)}>
            <MenuSection
              title={category.name}
              items={getMenuItemsByCategory(category.id)}
            />
          </div>
        ))}
      </div>
      
      <ShoppingCart />
    </div>
  );
};

export default Index;
