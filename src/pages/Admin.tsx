
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  getAllMenuItems, 
  getAllCategories, 
  getAllVariations,
  getAllVariationGroups,
  fixCategoryOrders,
} from "@/services/menuService";
import { MenuItem, Category, Variation, VariationGroup } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItemsTab } from "@/components/admin/MenuItemsTab";
import { CategoriesTab } from "@/components/admin/CategoriesTab";
import { VariationsTab } from "@/components/admin/VariationsTab";
import { VariationGroupsTab } from "@/components/admin/VariationGroupsTab";

const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationGroups, setVariationGroups] = useState<VariationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("menu");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    loadData();
  }, [currentUser, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Admin: Loading menu data...");
      
      const [items, cats, vars, groups] = await Promise.all([
        getAllMenuItems(),
        getAllCategories(),
        getAllVariations(),
        getAllVariationGroups()
      ]);
      
      console.log("Admin: Loaded items:", items.length, items);
      console.log("Admin: Loaded categories:", cats.length, cats);
      console.log("Admin: Loaded variations:", vars.length, vars);
      console.log("Admin: Loaded variation groups:", groups.length, groups);
      
      setMenuItems(items);
      setCategories(cats);
      setVariations(vars);
      setVariationGroups(groups);
    } catch (error) {
      console.error("Admin: Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Seed data methods
  const handleSeedData = async () => {
    if (window.confirm("Isso irá importar os dados iniciais do menu. Continuar?")) {
      try {
        setLoading(true);
        const { categories, menuItems } = await import("@/data/menuData");
        
        console.log("Importing initial data...");
        console.log("Categories to import:", categories.length);
        console.log("Menu items to import:", menuItems.length);
        
        for (const category of categories) {
          await import("@/services/menuService").then(module => 
            module.saveCategory({...category, order: categories.indexOf(category)})
          );
        }
        
        for (const item of menuItems) {
          await import("@/services/menuService").then(module => 
            module.saveMenuItem(item)
          );
        }
        
        toast({
          title: "Sucesso",
          description: "Dados iniciais importados com sucesso",
        });
        
        await loadData();
      } catch (error) {
        console.error("Erro ao importar dados iniciais:", error);
        toast({
          title: "Erro",
          description: "Não foi possível importar os dados iniciais. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to fix category orders
  const handleFixCategoryOrders = async () => {
    try {
      setLoading(true);
      const result = await fixCategoryOrders();
      console.log("Fix category orders result:", result);
      
      toast({
        title: "Sucesso",
        description: `Ordem das categorias corrigida com sucesso. ${result.updatedCount} categorias atualizadas.`,
      });
      
      await loadData();
    } catch (error) {
      console.error("Erro ao corrigir ordem das categorias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível corrigir a ordem das categorias. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento do Cardápio</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Voltar para o Cardápio
        </Button>
      </div>

      {loading && <div className="text-center py-4">Carregando dados...</div>}

      <Tabs defaultValue="menu" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="menu" className="flex-1">Itens do Menu</TabsTrigger>
          <TabsTrigger value="categories" className="flex-1">Categorias</TabsTrigger>
          <TabsTrigger value="variations" className="flex-1">Variações</TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">Grupos de Variações</TabsTrigger>
        </TabsList>

        {/* Menu Items Tab Content */}
        <TabsContent value="menu">
          <MenuItemsTab 
            menuItems={menuItems}
            categories={categories}
            variations={variations}
            variationGroups={variationGroups}
            loading={loading}
            onDataChange={loadData}
          />
        </TabsContent>

        {/* Categories Tab Content */}
        <TabsContent value="categories">
          <CategoriesTab 
            categories={categories}
            loading={loading}
            onDataChange={loadData}
            onSeedData={handleSeedData}
          />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleFixCategoryOrders} disabled={loading}>
              Corrigir Ordem das Categorias
            </Button>
          </div>
        </TabsContent>

        {/* Variations Tab Content */}
        <TabsContent value="variations">
          <VariationsTab 
            variations={variations}
            categories={categories}
            loading={loading}
            onDataChange={loadData}
          />
        </TabsContent>
        
        {/* Variation Groups Tab Content */}
        <TabsContent value="groups">
          <VariationGroupsTab 
            variationGroups={variationGroups}
            variations={variations}
            loading={loading}
            onDataChange={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
