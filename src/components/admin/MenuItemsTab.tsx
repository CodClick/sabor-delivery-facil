import React, { useState, useMemo } from "react";
import { MenuItem, Category, VariationGroup } from "@/types/menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteMenuItem, cleanupPopularItems } from "@/services/menuItemService";
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
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [isCleaningUp, setIsCleaningUp] = useState(false);

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

  // Group items by category - filter out categories with invalid IDs
  const itemsByCategory = useMemo(() => {
    const validCategories = categories.filter(category => category.id && category.id.trim() !== '');
    const sortedCategories = [...validCategories].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 0;
      const orderB = b.order !== undefined ? b.order : 0;
      return orderA - orderB;
    });

    const grouped: Record<string, {category: Category, items: MenuItem[]}> = {};
    
    sortedCategories.forEach(category => {
      grouped[category.id] = {
        category,
        items: []
      };
    });
    
    menuItems.forEach(item => {
      if (grouped[item.category]) {
        grouped[item.category].items.push(item);
      } else {
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
    
    return Object.values(grouped);
  }, [menuItems, categories]);

  const handleAddItem = () => {
    // Filter valid categories for new item
    const validCategories = categories.filter(category => category.id && category.id.trim() !== '');
    const newItem: MenuItem & { isHalfPizza?: boolean } = {
      id: `temp-${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      image: "/placeholder.svg",
      category: validCategories.length > 0 ? validCategories[0].id : "",
      popular: false,
      hasVariations: false,
      variationGroups: [],
      isHalfPizza: false, // nova flag
    };
    setEditItem(newItem);
  };

  const handleEditItem = (item: MenuItem & { isHalfPizza?: boolean }) => {
    const itemToEdit = {
      ...item,
      hasVariations: !!item.variationGroups?.length,
      variationGroups: item.variationGroups || [],
      isHalfPizza: item.isHalfPizza ?? false,
    };
    setEditItem(itemToEdit);
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!item.id || typeof item.id !== "string" || item.id.trim() === "") {
      toast({
        title: "Erro",
        description: "Item não possui ID válido para exclusão",
        variant: "destructive",
      });
      return;
    }

    if (deletingItems.has(item.id)) return;

    const confirmMessage = `Tem certeza que deseja excluir o item "${item.name}"?\n\nID: ${item.id}${item.popular ? '\n\nEste item é marcado como popular e será removido da lista "Mais Populares".' : ''}`;

    if (window.confirm(confirmMessage)) {
      try {
        setDeletingItems(prev => new Set(prev).add(item.id));
        await deleteMenuItem(item.id);
        toast({
          title: "Sucesso",
          description: `Item "${item.name}" excluído com sucesso`,
        });
        await onDataChange();

        if (item.popular) {
          localStorage.setItem('menuDataChanged', Date.now().toString());
          window.dispatchEvent(new CustomEvent('menuDataChanged'));
        }
      } catch (error: any) {
        toast({
          title: "Erro",
          description: `Não foi possível excluir o item: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setDeletingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      }
    }
  };

  const handleCleanupPopularItems = async () => {
    if (isCleaningUp) return;
    
    if (window.confirm("Deseja executar a limpeza de itens populares? Isso irá verificar e remover referências órfãs.")) {
      try {
        setIsCleaningUp(true);
        const result = await cleanupPopularItems();
        toast({
          title: "Limpeza Concluída",
          description: `${result.cleaned} itens órfãos foram identificados de ${result.total} itens populares totais.`,
        });
        await onDataChange();
        localStorage.setItem('menuDataChanged', Date.now().toString());
        window.dispatchEvent(new CustomEvent('menuDataChanged'));
      } catch (error: any) {
        toast({
          title: "Erro na Limpeza",
          description: `Erro ao executar limpeza: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsCleaningUp(false);
      }
    }
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
        <div className="flex gap-2">
          <Button 
            onClick={handleCleanupPopularItems}
            variant="outline"
            disabled={isCleaningUp}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isCleaningUp ? 'animate-spin' : ''}`} />
            {isCleaningUp ? 'Limpando...' : 'Limpar Populares'}
          </Button>
          <Button onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Item
          </Button>
        </div>
      </div>

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
                      const isDeleting = deletingItems.has(item.id);
                      return (
                        <Card key={`${item.id}-${index}`} className={`overflow-hidden ${isDuplicate ? 'border-red-300 bg-red-50' : ''} ${isDeleting ? 'opacity-50' : ''}`}>
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
                                <div className="mt-2">
                                  {item.priceFrom && (
                                    <p className="text-xs text-gray-500">a partir de</p>
                                  )}
                                  <p className="font-semibold text-brand">R$ {item.price.toFixed(2)}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Categoria: {categories.find(c => c.id === item.category)?.name || item.category}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 break-all">
                                  ID: {item.id}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.popular && (
                                    <span className="inline-block bg-food-green text-white text-xs px-2 py-1 rounded">
                                      Popular
                                    </span>
                                  )}
                                  {item.hasVariations && (
                                    <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                      Com variações
                                    </span>
                                  )}
                                  {item.isHalfPizza && (
                                    <span className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded">
                                      Meia a Meia
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleEditItem(item)}
                                  disabled={isDeleting}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteItem(item)}
                                  className={isDuplicate ? 'text-red-600 hover:text-red-700' : ''}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className={`h-4 w-4 ${isDeleting ? 'text-gray-400' : 'text-red-500'}`} />
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
          
