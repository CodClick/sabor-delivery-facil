
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPopularItems, getMenuItemsByCategory } from "@/services/menuService";
import { categories } from "@/data/menuData";
import { MenuItem } from "@/types/menu";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addItem } = useCart();
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("popular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      let items: MenuItem[] = [];

      if (selectedCategory === "popular") {
        items = await getPopularItems();
        setPopularItems(items);
      } else {
        items = await getMenuItemsByCategory(selectedCategory);
      }

      setMenuItems(items);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Usando dados locais como alternativa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAccess = () => {
    navigate("/admin");
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cardápio Delivery Fácil</h1>
        {currentUser && (
          <Button onClick={handleAdminAccess} variant="outline">
            Gerenciar Cardápio
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        <Button
          variant={selectedCategory === "popular" ? "default" : "outline"}
          onClick={() => setSelectedCategory("popular")}
        >
          Populares
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="h-40 bg-gray-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                    <p className="mt-2 font-semibold text-brand">
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleAddToCart(item)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {menuItems.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Nenhum item encontrado nesta categoria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
