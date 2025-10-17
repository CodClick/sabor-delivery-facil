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
      console.log("=== ADMIN: CARREGANDO DADOS ===");
      
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

      // Ordenação alfabética
      const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));
      const sortedCategories = cats.sort((a, b) => a.name.localeCompare(b.name));

      // Validação de dados
      const validCategories = sortedCategories.filter(cat => {
        const isValid = cat && cat.id && typeof cat.id === 'string' && cat.id.trim() !== '';
        if (!isValid) console.warn("Filtering out invalid category:", cat);
        return isValid;
      });

      const validVariations = vars.filter(variation => {
        const isValid = variation && variation.id && typeof variation.id === 'string' && variation.id.trim() !== '';
        if (!isValid) console.warn("Filtering out invalid variation:", variation);
        return isValid;
      });

      const validVariationGroups = groups.filter(group => {
        const isValid = group && group.id && typeof group.id === 'string' && group.id.trim() !== '' && group.name && group.name.trim() !== '';
        if (!isValid) console.warn("Filtering out invalid variation group in Admin:", group);
        return isValid;
      });

      setMenuItems(sortedItems);
      setCategories(validCategories);
      setVariations(validVariations);
      setVariationGroups(validVariationGroups);

      console.log("=== DADOS CARREGADOS E ESTADO ATUALIZADO ===");
    } catch (error) {
      console.error("Admin: Error loading data, using local fallback:", error);
      const validLocalCategories = localCategories.filter(cat => 
        cat && cat.id && typeof cat.id === 'string' && cat.id.trim() !== ''
      );

      setMenuItems(localMenuItems.sort((a, b) => a.name.localeCompare(b.name)));
      setCategories(validLocalCategories.sort((a, b) => a.name.localeCompare(b.name)));
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

  const handleSeedData = async () => {
    if (window.confirm("Isso irá importar os dados iniciais do menu. Continuar?")) {
      try {
        setLoading(true);
        
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
    <div className="min-h-screen bg-background p-4 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 border border-gray-100">

        {/* 🔸 Cabeçalho com título e botão alinhados */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#fa6500] mb-3 sm:mb-0">
            Gerenciamento do Cardápio
          </h1>

          <Button 
            onClick={() => navigate("/admin-dashboard")} 
            variant="outline"
            className="w-full sm:w-auto text-sm border-[#fa6500] text-[#fa6500] hover:bg-[#fa6500] hover:text-white transition-all"
          >
            Painel de Administração 
          </Button>
        </div>

        {loading && <div className="text-center py-4 text-sm">Carregando dados...</div>}

        {!loading && (menuItems.length === 0 || categories.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-2 mb-2">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <h3 className="font-medium text-yellow-800 text-sm sm:text-base">
                Coleções do Firebase Vazias
              </h3>
            </div>
            <p className="text-yellow-700 mb-3 text-xs sm:text-sm leading-relaxed">
              Parece que as coleções do Firebase estão vazias ou foram excluídas. 
              Use o botão "Recriar Coleções Firebase" acima para restaurar todos os dados iniciais.
            </p>
            <p className="text-yellow-600 text-xs leading-relaxed">
              Isso irá criar: categorias, itens do menu, variações e grupos de variações.
            </p>
          </div>
        )}

        <Tabs defaultValue="menu" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 h-auto p-1">
            <TabsTrigger value="menu" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">Itens</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">Categorias</TabsTrigger>
            <TabsTrigger value="variations" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">Variações</TabsTrigger>
            <TabsTrigger value="groups" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">Grupos</TabsTrigger>
          </TabsList>

          <div className="w-full overflow-x-hidden">
            <TabsContent value="menu" className="mt-0">
              <MenuItemsTab 
                menuItems={menuItems}
                categories={categories}
                variations={variations}
                variationGroups={variationGroups}
                loading={loading}
                onDataChange={loadData}
              />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <CategoriesTab 
                categories={categories}
                loading={loading}
                onDataChange={loadData}
                onSeedData={handleSeedData}
              />
            </TabsContent>

            <TabsContent value="variations" className="mt-0">
              <VariationsTab 
                variations={variations}
                categories={categories}
                loading={loading}
                onDataChange={loadData}
              />
            </TabsContent>
            
            <TabsContent value="groups" className="mt-0">
              <VariationGroupsTab 
                variationGroups={variationGroups}
                variations={variations}
                loading={loading}
                onDataChange={loadData}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
