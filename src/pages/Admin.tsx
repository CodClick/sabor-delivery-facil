
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAllMenuItems } from "@/services/menuItemService";
import { getAllCategories } from "@/services/categoryService";
import { getAllVariations } from "@/services/variationService";
import { getAllVariationGroups } from "@/services/variationGroupService";
import { MenuItem, Category, Variation, VariationGroup } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItemsTab } from "@/components/admin/MenuItemsTab";
import { CategoriesTab } from "@/components/admin/CategoriesTab";
import { VariationsTab } from "@/components/admin/VariationsTab";
import { VariationGroupsTab } from "@/components/admin/VariationGroupsTab";
import { Database } from "lucide-react";
import { SeedDataButton } from "@/components/admin/SeedDataButton";
import { categories as localCategories, menuItems as localMenuItems } from "@/data/menuData";

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
      
      // Load data with local fallbacks
      const [items, cats, vars, groups] = await Promise.all([
        getAllMenuItems().catch(() => {
          console.log("Using local menu items as fallback");
          return localMenuItems;
        }),
        getAllCategories().catch(() => {
          console.log("Using local categories as fallback");
          return localCategories;
        }),
        getAllVariations().catch(() => {
          console.log("No variations found, using empty array");
          return [];
        }),
        getAllVariationGroups().catch(() => {
          console.log("No variation groups found, using empty array");
          return [];
        })
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
      console.error("Admin: Error loading data, using local fallback:", error);
      // Complete fallback to local data
      setMenuItems(localMenuItems);
      setCategories(localCategories);
      setVariations([]);
      setVariationGroups([]);
      
      toast({
        title: "Aviso",
        description: "Carregando dados locais. Algumas funcionalidades podem estar limitadas.",
        variant: "default",
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
        
        console.log("Importing initial data...");
        console.log("Categories to import:", localCategories.length);
        console.log("Menu items to import:", localMenuItems.length);
        
        for (const category of localCategories) {
          await import("@/services/categoryService").then(module => 
            module.saveCategory({...category, order: localCategories.indexOf(category)})
          );
        }
        
        for (const item of localMenuItems) {
          await import("@/services/menuItemService").then(module => 
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento do Cardápio</h1>
        <div className="flex gap-2">
          <SeedDataButton />
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar para o Cardápio
          </Button>
        </div>
      </div>

      {loading && <div className="text-center py-4">Carregando dados...</div>}

      {/* Alerta para coleções vazias */}
      {!loading && (menuItems.length === 0 || categories.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Coleções do Firebase Vazias</h3>
          </div>
          <p className="text-yellow-700 mb-3">
            Parece que as coleções do Firebase estão vazias ou foram excluídas. 
            Use o botão "Recriar Coleções Firebase" acima para restaurar todos os dados iniciais.
          </p>
          <p className="text-yellow-600 text-sm">
            Isso irá criar: categorias, itens do menu, variações e grupos de variações.
          </p>
        </div>
      )}

      <Tabs defaultValue="menu" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="menu" className="flex-1">Itens do Menu</TabsTrigger>
          <TabsTrigger value="categories" className="flex-1">Categorias</TabsTrigger>
          <TabsTrigger value="variations" className="flex-1">Variações</TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">Grupos de Variações</TabsTrigger>
        </TabsList>

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

        <TabsContent value="categories">
          <CategoriesTab 
            categories={categories}
            loading={loading}
            onDataChange={loadData}
            onSeedData={handleSeedData}
          />
        </TabsContent>

        <TabsContent value="variations">
          <VariationsTab 
            variations={variations}
            categories={categories}
            loading={loading}
            onDataChange={loadData}
          />
        </TabsContent>
        
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
