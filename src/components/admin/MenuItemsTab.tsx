
import React, { useState, useMemo } from "react";
import { MenuItem, Category, VariationGroup } from "@/types/menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteMenuItem } from "@/services/menuItemService";
import { EditMenuItemModal } from "./EditMenuItemModal";

interface MenuItemsTabProps {
  menuItems: MenuItem[];
  categories: Category[];
  variations: any[];
  variationGroups: VariationGroup[];
  loading: boolean;
  onDataChange: () => void;
}

export const MenuItemsTab = ({
  menuItems,
  categories,
  variations,
  variationGroups,
  loading,
  onDataChange,
}: MenuItemsTabProps) => {
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  console.log("MenuItemsTab - menuItems:", menuItems);
  console.log("MenuItemsTab - categories:", categories);

  // Detectar duplicatas
  const duplicateIds = useMemo(() => {
    const idCount = new Map();
    menuItems.forEach(item => {
      idCount.set(item.id, (idCount.get(item.id) || 0) + 1);
    });
    
    const duplicates = [];
    idCount.forEach((count, id) => {
      if (count > 1) {
        duplicates.push(id);
        console.warn(`DUPLICATA DETECTADA na interface: ID ${id} aparece ${count} vezes`);
      }
    });
    
    return duplicates;
  }, [menuItems]);

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Group items by category
  const itemsByCategory = useMemo(() => {
    console.log("Grouping items by category...");
    console.log("Available categories:", categories.map(cat => ({ id: cat.id, name: cat.name })));
    console.log("Available menu items:", menuItems.map(item => ({ id: item.id, name: item.name, category: item.category })));

    // Sort categories by order
    const sortedCategories = [...categories].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 0;
      const orderB = b.order !== undefined ? b.order : 0;
      return orderA - orderB;
    });

    const grouped: Record<string, {category: Category, items: MenuItem[]}> = {};
    
    // Initialize all categories (even empty ones)
    sortedCategories.forEach(category => {
      grouped[category.id] = {
        category,
        items: []
      };
    });
    
    // Add items to their respective categories
    menuItems.forEach(item => {
      console.log(`Processing item "${item.name}" with category "${item.category}"`);
      if (grouped[item.category]) {
        grouped[item.category].items.push(item);
        console.log(`Added item "${item.name}" to category "${item.category}"`);
      } else {
        console.log(`Category "${item.category}" not found for item "${item.name}"`);
        // Handle items with unknown categories
        const unknownCategoryId = 'unknown';
        if (!grouped[unknownCategoryId]) {
          grouped[unknownCategoryId] = {
            category: { id: unknownCategoryId, name: 'Categoria Não Encontrada', order: 999 },
            items: []
          };
        }
        grouped[unknownCategoryId].items.push(item);
      }
    });
    
    console.log("Final grouped items:", grouped);
    
    // Convert to array and ensure it's sorted by category order
    return Object.values(grouped);
  }, [menuItems, categories]);

  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: `temp-${Date.now()}`, // Use temporary ID
      name: "",
      description: "",
      price: 0,
      image: "/placeholder.svg",
      category: categories.length > 0 ? categories[0].id : "",
      popular: false,
      hasVariations: false,
      variationGroups: [],
    };
    setEditItem(newItem);
  };

  const handleEditItem = (item: MenuItem) => {
    // Make sure variationGroups is initialized
    const itemToEdit = {
      ...item,
      hasVariations: !!item.variationGroups?.length,
      variationGroups: item.variationGroups || [],
    };
    setEditItem(itemToEdit);
  };

  const handleDeleteItem = async (item: MenuItem) => {
    console.log("=== INÍCIO handleDeleteItem ===");
    console.log("MenuItemsTab: Item recebido para exclusão:", item);
    console.log("MenuItemsTab: ID do item:", item.id);
    
    if (!item.id || typeof item.id !== "string" || item.id.trim() === "") {
      console.error("MenuItemsTab: Item não possui ID válido:", item);
      toast({
        title: "Erro",
        description: "Item não possui ID válido para exclusão",
        variant: "destructive",
      });
      return;
    }

    // Check if it's a temporary ID (shouldn't be deleted from Firebase)
    if (item.id.startsWith("temp-")) {
      console.log("MenuItemsTab: Item com ID temporário, removendo apenas da interface");
      onDataChange(); // Refresh the data
      return;
    }

    // Verificar se é uma duplicata
    const isDuplicate = duplicateIds.includes(item.id);
    const confirmMessage = isDuplicate 
      ? `ATENÇÃO: Este item tem duplicatas! Tem certeza que deseja excluir TODAS as versões do item "${item.name}"? Isso removerá todas as duplicatas com o ID ${item.id}.`
      : `Tem certeza que deseja excluir o item "${item.name}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        console.log("MenuItemsTab: Confirmação recebida, chamando deleteMenuItem com ID:", item.id);
        await deleteMenuItem(item.id);
        toast({
          title: "Sucesso",
          description: isDuplicate 
            ? "Todas as duplicatas do item foram excluídas com sucesso"
            : "Item excluído com sucesso",
        });
        console.log("MenuItemsTab: Item deletado com sucesso, chamando onDataChange");
        onDataChange();
      } catch (error) {
        console.error("MenuItemsTab: Erro ao excluir item:", error);
        toast({
          title: "Erro",
          description: `Não foi possível excluir o item: ${error.message}`,
          variant: "destructive",
        });
      }
    }
    console.log("=== FIM handleDeleteItem ===");
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Itens do Cardápio ({menuItems.length} itens)
          {duplicateIds.length > 0 && (
            <span className="ml-2 text-red-500 text-sm">
              ({duplicateIds.length} {duplicateIds.length === 1 ? 'duplicata detectada' : 'duplicatas detectadas'})
            </span>
          )}
        </h2>
        <Button onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Item
        </Button>
      </div>

      {duplicateIds.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">Duplicatas Detectadas</h3>
          </div>
          <p className="text-yellow-700 mt-1">
            Foram encontrados {duplicateIds.length} itens com IDs duplicados. 
            Ao excluir um item duplicado, todas as versões serão removidas.
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            IDs duplicados: {duplicateIds.join(', ')}
          </p>
        </div>
      )}

      {menuItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum item encontrado.</p>
          <p className="mt-2">Adicione itens ou importe os dados iniciais na aba "Categorias".</p>
        </div>
      ) : (
        <div className="space-y-8">
          {itemsByCategory.map(({category, items}) => (
            <div key={category.id} className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center bg-gray-100 p-4 cursor-pointer"
                onClick={() => toggleCategory(category.id)}
              >
                <h3 className="font-bold text-lg">
                  {category.name} 
                  <span className="ml-2 text-gray-500 text-sm">
                    ({items.length} {items.length === 1 ? "item" : "itens"})
                  </span>
                  {items.length === 0 && <span className="ml-2 text-gray-500 text-sm">(vazio)</span>}
                </h3>
                <Button variant="ghost" size="sm">
                  {collapsedCategories[category.id] ? 
                    <ChevronDown className="h-5 w-5" /> : 
                    <ChevronUp className="h-5 w-5" />
                  }
                </Button>
              </div>
              
              {!collapsedCategories[category.id] && items.length > 0 && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item, index) => {
                      const isDuplicate = duplicateIds.includes(item.id);
                      return (
                        <Card key={`${item.id}-${index}`} className={`overflow-hidden ${isDuplicate ? 'border-red-300 bg-red-50' : ''}`}>
                          {isDuplicate && (
                            <div className="bg-red-100 text-red-800 text-xs px-2 py-1 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Duplicata detectada
                            </div>
                          )}
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
                                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                <p className="mt-2 font-semibold text-brand">R$ {item.price.toFixed(2)}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Categoria: {categories.find(c => c.id === item.category)?.name || item.category}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 break-all">
                                  ID: {item.id}
                                </p>
                                <p className="text-xs text-red-500 mt-1">
                                  Tipo ID: {typeof item.id} | Temp: {item.id?.startsWith("temp-") ? "Sim" : "Não"}
                                </p>
                                {item.popular && (
                                  <span className="inline-block bg-food-green text-white text-xs px-2 py-1 rounded mt-2">
                                    Popular
                                  </span>
                                )}
                                {item.hasVariations && (
                                  <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mt-2 ml-2">
                                    Com variações
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEditItem(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteItem(item)}
                                  className={isDuplicate ? 'text-red-600 hover:text-red-700' : ''}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form for adding/editing menu items */}
      {editItem && (
        <EditMenuItemModal
          editItem={editItem}
          setEditItem={setEditItem}
          menuItems={menuItems}
          categories={categories}
          variations={variations}
          variationGroups={variationGroups}
          onSuccess={onDataChange}
        />
      )}
    </>
  );
};
