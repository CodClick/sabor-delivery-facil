
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CategoryNav from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import RestaurantHeader from "@/components/RestaurantHeader";

const Index = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center my-4">
        <h1 className="text-2xl font-bold">Menu</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/orders">Ver Pedidos</Link>
          </Button>
        </div>
      </div>
      <RestaurantHeader />
      <CategoryNav />
      <MenuSection />
    </div>
  );
};

export default Index;
