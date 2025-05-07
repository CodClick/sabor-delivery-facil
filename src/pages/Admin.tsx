import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  getAllMenuItems, 
  saveMenuItem, 
  deleteMenuItem, 
  getAllCategories, 
  saveCategory,
  updateCategory,
  deleteCategory,
  getAllVariations,
  saveVariation,
  deleteVariation,
  getAllVariationGroups,
  saveVariationGroup,
  deleteVariationGroup,
  updateVariationGroup
} from "@/services/menuService";
import { MenuItem, Category, Variation, VariationGroup } from "@/types/menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit, Save, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from 'uuid';
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationGroups, setVariationGroups] = useState<VariationGroup[]>([]);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editVariation, setEditVariation] = useState<Variation | null>(null);
  const [editVariationGroup, setEditVariationGroup] = useState<VariationGroup | null>(null);
  const [newCategory, setNewCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("menu");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Temp state for managing variation groups in menu items
  const [tempVariationGroup, setTempVariationGroup] = useState<VariationGroup | null>(null);

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
      const [items, cats, vars, groups] = await Promise.all([
        getAllMenuItems(),
        getAllCategories(),
        getAllVariations(),
        getAllVariationGroups()
      ]);
      setMenuItems(items);
      setCategories(cats);
      setVariations(vars);
      setVariationGroups(groups);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Menu Item methods
  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: uuidv4(),
      name: "",
      description: "",
      price: 0,
      image: "/placeholder.svg",
      category: categories.length > 0 ? categories[0].id : "",
      popular: false,
      hasVariations: false,
      variationGroups: []
    };
    setEditItem(newItem);
  };

  const handleEditItem = (item: MenuItem) => {
    // Make sure variationGroups is initialized
    const itemToEdit = {
      ...item,
      hasVariations: !!item.variationGroups?.length,
      variationGroups: item.variationGroups || []
    };
    setEditItem(itemToEdit);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      try {
        await deleteMenuItem(itemId);
        setMenuItems(menuItems.filter(item => item.id !== itemId));
        toast({
          title: "Sucesso",
          description: "Item excluído com sucesso",
        });
      } catch (error) {
        console.error("Erro ao excluir item:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o item. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveItem = async () => {
    if (!editItem) return;
    
    if (!editItem.name || !editItem.description || editItem.price <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // If item has variations, ensure all variation groups have required fields
    if (editItem.hasVariations && editItem.variationGroups) {
      for (const group of editItem.variationGroups) {
        if (!group.name || group.variations.length === 0) {
          toast({
            title: "Grupos de variação incompletos",
            description: "Todos os grupos de variação devem ter nome e pelo menos uma variação selecionada",
            variant: "destructive",
          });
          return;
        }
      }
    }

    try {
      // Update hasVariations based on whether there are any variation groups
      const itemToSave = {
        ...editItem,
        hasVariations: !!(editItem.variationGroups && editItem.variationGroups.length > 0)
      };

      await saveMenuItem(itemToSave);
      
      setMenuItems(prev => {
        const exists = prev.find(item => item.id === editItem.id);
        if (exists) {
          return prev.map(item => item.id === editItem.id ? itemToSave : item);
        } else {
          return [...prev, itemToSave];
        }
      });
      
      setEditItem(null);
      toast({
        title: "Sucesso",
        description: "Item salvo com sucesso",
      });
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Category methods
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory(category.name);
  };

  const handleSaveCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategory = {
          ...editingCategory,
          name: newCategory,
        };
        await updateCategory(updatedCategory);
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
      } else {
        // Add new category
        const newCat: Category = {
          id: newCategory.toLowerCase().replace(/\s+/g, '-'),
          name: newCategory,
          order: categories.length
        };
        await saveCategory(newCat);
        setCategories([...categories, newCat]);
      }
      
      setNewCategory("");
      setEditingCategory(null);
      toast({
        title: "Sucesso",
        description: editingCategory 
          ? "Categoria atualizada com sucesso"
          : "Categoria adicionada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a categoria. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Variation methods
  const handleAddVariation = () => {
    const newVariation: Variation = {
      id: uuidv4(),
      name: "",
      description: "",
      additionalPrice: 0,
      available: true,
      categoryIds: []
    };
    setEditVariation(newVariation);
  };

  const handleEditVariation = (variation: Variation) => {
    setEditVariation({...variation});
  };

  const handleDeleteVariation = async (variationId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta variação?")) {
      try {
        await deleteVariation(variationId);
        setVariations(variations.filter(v => v.id !== variationId));
        toast({
          title: "Sucesso",
          description: "Variação excluída com sucesso",
        });
      } catch (error) {
        console.error("Erro ao excluir variação:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a variação. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveVariation = async () => {
    if (!editVariation) return;
    
    if (!editVariation.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da variação é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveVariation(editVariation);
      
      setVariations(prev => {
        const exists = prev.find(v => v.id === editVariation.id);
        if (exists) {
          return prev.map(v => v.id === editVariation.id ? editVariation : v);
        } else {
          return [...prev, editVariation];
        }
      });
      
      setEditVariation(null);
      toast({
        title: "Sucesso",
        description: "Variação salva com sucesso",
      });
    } catch (error) {
      console.error("Erro ao salvar variação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a variação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryCheckboxChange = (categoryId: string) => {
    if (!editVariation) return;
    
    const updatedCategoryIds = editVariation.categoryIds.includes(categoryId)
      ? editVariation.categoryIds.filter(id => id !== categoryId)
      : [...editVariation.categoryIds, categoryId];
    
    setEditVariation({
      ...editVariation,
      categoryIds: updatedCategoryIds
    });
  };

  // Variation Group methods
  const handleAddVariationGroup = () => {
    if (!editItem) return;
    
    setTempVariationGroup({
      id: uuidv4(),
      name: "",
      minRequired: 1,
      maxAllowed: 1,
      variations: [],
      customMessage: ""
    });
  };

  const handleSelectExistingGroup = (groupId: string) => {
    if (!editItem) return;
    
    const selectedGroup = variationGroups.find(group => group.id === groupId);
    
    if (selectedGroup) {
      // Check if this group is already added to the item
      const isAlreadyAdded = editItem.variationGroups?.some(g => g.id === selectedGroup.id);
      
      if (!isAlreadyAdded) {
        setEditItem({
          ...editItem,
          hasVariations: true,
          variationGroups: [...(editItem.variationGroups || []), selectedGroup]
        });
      }
    }
  };

  const handleRemoveAllVariationGroups = () => {
    if (!editItem) return;
    
    if (window.confirm("Tem certeza que deseja remover todos os grupos de variação deste item?")) {
      setEditItem({
        ...editItem,
        hasVariations: false,
        variationGroups: []
      });
    }
  };

  const handleEditExistingVariationGroup = (group: VariationGroup) => {
    setEditVariationGroup({...group});
  };

  const handleDeleteExistingVariationGroup = async (groupId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este grupo de variação? Isso pode afetar itens do menu que o utilizam.")) {
      try {
        await deleteVariationGroup(groupId);
        setVariationGroups(prev => prev.filter(g => g.id !== groupId));
        toast({
          title: "Sucesso",
          description: "Grupo de variação excluído com sucesso",
        });
      } catch (error) {
        console.error("Erro ao excluir grupo de variação:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o grupo de variação. Verifique se ele está sendo usado em algum item do menu.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveVariationGroup = async () => {
    if (!editVariationGroup) return;
    
    if (!editVariationGroup.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do grupo de variação é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editVariationGroup.variations.length === 0) {
      toast({
        title: "Variações obrigatórias",
        description: "Selecione pelo menos uma variação para o grupo",
        variant: "destructive",
      });
      return;
    }

    if (editVariationGroup.minRequired > editVariationGroup.maxAllowed) {
      toast({
        title: "Valores inválidos",
        description: "O mínimo obrigatório não pode ser maior que o máximo permitido",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if we're creating a new group or updating an existing one
      const isNew = !variationGroups.some(g => g.id === editVariationGroup.id);
      
      if (isNew) {
        await saveVariationGroup(editVariationGroup);
        setVariationGroups([...variationGroups, editVariationGroup]);
      } else {
        await updateVariationGroup(editVariationGroup);
        setVariationGroups(variationGroups.map(g => 
          g.id === editVariationGroup.id ? editVariationGroup : g
        ));
      }

      setEditVariationGroup(null);
      toast({
        title: "Sucesso",
        description: isNew
          ? "Grupo de variação criado com sucesso"
          : "Grupo de variação atualizado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao salvar grupo de variação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o grupo de variação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVariationCheckboxChange = (variationId: string) => {
    if (!tempVariationGroup) return;
    
    const updatedVariations = tempVariationGroup.variations.includes(variationId)
      ? tempVariationGroup.variations.filter(id => id !== variationId)
      : [...tempVariationGroup.variations, variationId];
    
    setTempVariationGroup({
      ...tempVariationGroup,
      variations: updatedVariations
    });
  };

  const handleVariationCheckboxChangeForGroup = (variationId: string) => {
    if (!editVariationGroup) return;
    
    const updatedVariations = editVariationGroup.variations.includes(variationId)
      ? editVariationGroup.variations.filter(id => id !== variationId)
      : [...editVariationGroup.variations, variationId];
    
    setEditVariationGroup({
      ...editVariationGroup,
      variations: updatedVariations
    });
  };

  // Seed data methods
  const handleSeedData = async () => {
    if (window.confirm("Isso irá importar os dados iniciais do menu. Continuar?")) {
      try {
        const { categories, menuItems } = await import("@/data/menuData");
        
        for (const category of categories) {
          await saveCategory({...category, order: categories.indexOf(category)});
        }
        
        for (const item of menuItems) {
          await saveMenuItem(item);
        }
        
        toast({
          title: "Sucesso",
          description: "Dados iniciais importados com sucesso",
        });
        
        loadData();
      } catch (error) {
        console.error("Erro ao importar dados iniciais:", error);
        toast({
          title: "Erro",
          description: "Não foi possível importar os dados iniciais. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const getVariationName = (variationId: string): string => {
    const variation = variations.find(v => v.id === variationId);
    return variation ? variation.name : "Variação não encontrada";
  };

  // Update the JSX for the variation groups section in edit item dialog
  // This replaces the part in editItem dialog that handles variation groups
  const editItemVariationGroupsSection = editItem ? (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Grupos de Variações</h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleRemoveAllVariationGroups} 
            size="sm" 
            variant="destructive"
            className="px-2 py-1"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remover Todos
          </Button>
          <Button 
            onClick={handleAddVariationGroup} 
            size="sm" 
            variant="outline"
            className="px-2 py-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Novo Grupo
          </Button>
        </div>
      </div>
      
      {/* Dropdown to select existing variation groups */}
      <div className="mt-4 space-y-2">
        <Label>Adicionar Grupo Existente</Label>
        <div className="flex gap-2">
          <Select onValueChange={handleSelectExistingGroup}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um grupo existente" />
            </SelectTrigger>
            <SelectContent>
              {variationGroups
                .filter(group => !editItem.variationGroups?.some(g => g.id === group.id))
                .map(group => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} ({group.minRequired}-{group.maxAllowed})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-4 space-y-4">
        {editItem.variationGroups && editItem.variationGroups.length > 0 ? (
          editItem.variationGroups.map(group => (
            <div key={group.id} className="p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{group.name}</h4>
                  <p className="text-sm text-gray-600">
                    {group.minRequired === group.maxAllowed
                      ? `Exatamente ${group.minRequired} seleção(ões) necessária(s)`
                      : `De ${group.minRequired} até ${group.maxAllowed} seleções`
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleEditExistingVariationGroup(group)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      // Remove this group from the item's variationGroups array
                      setEditItem({
                        ...editItem,
                        variationGroups: editItem.variationGroups?.filter(g => g.id !== group.id) || []
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-sm font-semibold">Variações:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {group.variations.map(varId => (
                    <span key={varId} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs">
                      {getVariationName(varId)}
                    </span>
                  ))}
                </div>
              </div>

              {group.customMessage && (
                <div className="mt-2">
                  <p className="text-sm font-semibold">Mensagem personalizada:</p>
                  <p className="text-xs text-gray-600">"{group.customMessage}"</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 border rounded-md">
            Nenhum grupo de variação configurado para este item.
            <br />
            <span className="text-sm">
              Adicione grupos de variações para permitir que os clientes personalizem este item.
            </span>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento do Cardápio</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Voltar para o Cardápio
        </Button>
      </div>

      <Tabs defaultValue="menu" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="menu" className="flex-1">Itens do Menu</TabsTrigger>
          <TabsTrigger value="categories" className="flex-1">Categorias</TabsTrigger>
          <TabsTrigger value="variations" className="flex-1">Variações</TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">Grupos de Variações</TabsTrigger>
        </TabsList>

        {/* Menu Items Tab Content */}
        <TabsContent value="menu">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Itens do Cardápio</h2>
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-1" />
              Novo Item
            </Button>
          </div>

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
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        <p className="mt-2 font-semibold text-brand">R$ {item.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Categoria: {categories.find(c => c.id === item.category)?.name || item.category}
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
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {menuItems.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhum item encontrado. Adicione itens ou importe os dados iniciais.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Categories Tab Content */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nome da categoria"
                    className="flex-1"
                  />
                  <Button onClick={handleSaveCategory}>
                    {editingCategory ? (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Atualizar
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </>
                    )}
                  </Button>
                  {editingCategory && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategory("");
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2 mt-4">
                  {categories.map((category) => (
                    <div key={category.id} className="p-3 bg-gray-100 rounded-md flex justify-between items-center">
                      <span>{category.name}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {categories.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      Nenhuma categoria encontrada
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Importar Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Você pode importar os dados iniciais do cardápio para começar. Isso irá adicionar categorias e itens pré-definidos.
                </p>
                <Button onClick={handleSeedData} className="w-full">
                  Importar Dados Iniciais
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variations Tab Content */}
        <TabsContent value="variations">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Variações / Complementos</h2>
            <Button onClick={handleAddVariation}>
              <Plus className="h-4 w-4 mr-1" />
              Nova Variação
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço Adicional</TableHead>
                  <TableHead>Categorias Aplicáveis</TableHead>
                  <TableHead>Disponível</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((variation) => (
                  <TableRow key={variation.id}>
                    <TableCell>{variation.name}</TableCell>
                    <TableCell>{variation.description || "-"}</TableCell>
                    <TableCell>
                      {variation.additionalPrice ? `R$ ${variation.additionalPrice.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      {variation.categoryIds.map(catId => {
                        const category = categories.find(c => c.id === catId);
                        return category ? (
                          <span key={catId} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs mr-1 mb-1">
                            {category.name}
                          </span>
                        ) : null;
                      })}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${variation.available ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {variation.available ? 'Sim' : 'Não'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditVariation(variation)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteVariation(variation.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {variations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Nenhuma variação encontrada. Adicione variações ou importe os dados iniciais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* New Variation Groups Tab Content */}
        <TabsContent value="groups">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Grupos de Variações</h2>
            <Button onClick={handleAddNewVariationGroup}>
              <Plus className="h-4 w-4 mr-1" />
              Novo Grupo
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {variationGroups.map((group) => (
                <Card key={group.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <h3 className="font-bold text-lg">{group.name}</h3>
                        {group.customMessage && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            "{group.customMessage}"
                          </p>
                        )}
                        <div className="mt-2">
                          <span className="text-sm bg-gray-100 rounded px-2 py-1 mr-2">
                            Min: {group.minRequired}
                          </span>
                          <span className="text-sm bg-gray-100 rounded px-2 py-1">
                            Max: {group.maxAllowed}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-semibold mb-1">Variações:</p>
                          <div className="flex flex-wrap gap-1">
                            {group.variations.map(varId => {
                              const variation = variations.find(v => v.id === varId);
                              return variation ? (
                                <span key={varId} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs mb-1">
                                  {variation.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditExistingVariationGroup(group)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteExistingVariationGroup(group.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {variationGroups.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Nenhum grupo de variação encontrado. Adicione grupos para organizar suas variações.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Item Dialog */}
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editItem.id ? "Editar Item" : "Novo Item"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input 
                    id="name"
                    value={editItem.name} 
                    onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description"
                    value={editItem.description} 
                    onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input 
                    id="price"
                    type="number" 
                    step="0.01"
                    value={editItem.price} 
                    onChange={(e) => setEditItem({...editItem, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image">URL da Imagem</Label>
                  <Input 
                    id="image"
                    value={editItem.image} 
                    onChange={(e) => setEditItem({...editItem, image: e.target.value})}
                    placeholder="/images/exemplo.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <select 
                    id="category"
                    className="w-full p-2 border rounded-md"
                    value={editItem.category}
                    onChange={(e) => setEditItem({...editItem, category: e.target.value})}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="popular"
                    checked={editItem.popular} 
                    onChange={(e) => setEditItem({...editItem, popular: e.target.checked})}
                  />
                  <Label htmlFor="popular">Marcar como popular</Label>
                </div>

                {/* Variation Groups Section */}
                {editItemVariationGroupsSection}
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditItem(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveItem}>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Variation Dialog */}
      {editVariation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editVariation.id ? "Editar Variação" : "Nova Variação"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="var-name">Nome da Variação</Label>
                  <Input 
                    id="var-name"
                    value={editVariation.name} 
                    onChange={(e) => setEditVariation({...editVariation, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="var-description">Descrição (opcional)</Label>
                  <Textarea 
                    id="var-description"
                    value={editVariation.description || ''} 
                    onChange={(e) => setEditVariation({...editVariation, description: e.target.value})}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="var-price">Preço Adicional (R$) (opcional)</Label>
                  <Input 
                    id="var-price"
                    type="number" 
                    step="0.01"
                    value={editVariation.additionalPrice || 0} 
                    onChange={(e) => setEditVariation({
                      ...editVariation, 
                      additionalPrice: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="var-available"
                    checked={editVariation.available} 
                    onChange={(e) => setEditVariation({...editVariation, available: e.target.checked})}
                  />
                  <Label htmlFor="var-available">Disponível</Label>
                </div>

                <div>
                  <Label>Categorias onde esta variação pode ser usada</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={editVariation.categoryIds.includes(category.id)}
                          onChange={() => handleCategoryCheckboxChange(category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditVariation(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveVariation}>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Variation Group Dialog */}
      {tempVariationGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {tempVariationGroup.id && editItem?.variationGroups?.some(g => g?.id === tempVariationGroup.id) 
                  ? "Editar Grupo de Variação" 
                  : "Novo Grupo de Variação"
                }
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTempVariationGroup(null)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Nome do Grupo</Label>
                  <Input 
                    id="group-name"
                    value={tempVariationGroup.name} 
                    onChange={(e) => setTempVariationGroup({...tempVariationGroup, name: e.target.value})}
                    placeholder="Ex: Recheios, Molhos, Acompanhamentos"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-required">Mínimo Obrigatório</Label>
                    <Input 
                      id="min-required"
                      type="number" 
                      min="0"
                      value={tempVariationGroup.minRequired} 
                      onChange={(e) => setTempVariationGroup({
                        ...tempVariationGroup, 
                        minRequired: parseInt(e.target.value, 10) || 0
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max-allowed">Máximo Permitido</Label>
                    <Input 
                      id="max-allowed"
                      type="number"
                      min="1"
                      value={tempVariationGroup.maxAllowed} 
                      onChange={(e) => setTempVariationGroup({
                        ...tempVariationGroup, 
                        maxAllowed: parseInt(e.target.value, 10) || 1
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-message">Mensagem Personalizada (opcional)</Label>
                  <Input 
                    id="custom-message"
                    value={tempVariationGroup.customMessage || ''} 
                    onChange={(e) => setTempVariationGroup({
                      ...tempVariationGroup, 
                      customMessage: e.target.value
                    })}
                    placeholder="Ex: Escolha {min} sabores de recheio ({count}/{min} selecionados)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{min}'} para o mínimo necessário, {'{max}'} para o máximo permitido, e {'{count}'} para mostrar quantos foram selecionados.
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="block mb-2">Variações Disponíveis</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Selecione as variações que estarão disponíveis neste grupo.
                  </p>
                  
                  {variations.filter(v => v.available && v.categoryIds.includes(editItem?.category || '')).length === 0 ? (
                    <div className="text-center py-4 text-amber-500 border border-amber-300 rounded-md bg-amber-50">
                      Não há variações disponíveis para a categoria deste item.
                      <br />
                      <span className="text-sm">
                        Adicione variações na aba "Variações" e associe-as a esta categoria.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {variations
                        .filter(v => v.available && v.categoryIds.includes(editItem?.category || ''))
                        .map(variation => (
                          <div key={variation.id} className="flex items-center gap-2 p-2 border rounded">
                            <input 
                              type="checkbox"
                              id={`variation-${variation.id}`}
                              checked={tempVariationGroup.variations.includes(variation.id)}
                              onChange={() => handleVariationCheckboxChange(variation.id)}
                            />
                            <Label htmlFor={`variation-${variation.id}`} className="flex-1">
                              <span className="font-medium">{variation.name}</span>
                              {variation.additionalPrice ? (
                                <span className="text-xs text-gray-500 block">
                                  +R$ {variation.additionalPrice.toFixed(2)}
                                </span>
                              ) : null}
                            </Label>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setTempVariationGroup(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveVariationGroup}
                    disabled={
                      !tempVariationGroup.name || 
                      tempVariationGroup.variations.length === 0 || 
                      tempVariationGroup.minRequired > tempVariationGroup.maxAllowed
                    }
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar Grupo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Variation Group Dialog */}
      {editVariationGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {variationGroups.find(g => g.id === editVariationGroup.id) 
                  ? "Editar Grupo de Variação" 
                  : "Novo Grupo de Variação"
                }
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setEditVariationGroup(null)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Nome do Grupo</Label>
                  <Input 
                    id="group-name"
                    value={editVariationGroup.name} 
                    onChange={(e) => setEditVariationGroup({...editVariationGroup, name: e.target.value})}
                    placeholder="Ex: Recheios, Molhos, Acompanhamentos"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-required">Mínimo Obrigatório</Label>
                    <Input 
                      id="min-required"
                      type="number" 
                      min="0"
                      value={editVariationGroup.minRequired} 
                      onChange={(e) => setEditVariationGroup({
                        ...editVariationGroup, 
                        minRequired: parseInt(e.target.value, 10) || 0
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max-allowed">Máximo Permitido</Label>
                    <Input 
                      id="max-allowed"
                      type="number"
                      min="1"
                      value={editVariationGroup.maxAllowed} 
                      onChange={(e) => setEditVariationGroup({
                        ...editVariationGroup, 
                        maxAllowed: parseInt(e.target.value, 10) || 1
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-message">Mensagem Personalizada (opcional)</Label>
                  <Input 
                    id="custom-message"
                    value={editVariationGroup.customMessage || ''} 
                    onChange={(e) => setEditVariationGroup({
                      ...editVariationGroup, 
                      customMessage: e.target.value
                    })}
                    placeholder="Ex: Escolha {min} sabores de recheio ({count}/{min} selecionados)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{min}'} para o mínimo necessário, {'{max}'} para o máximo permitido, e {'{count}'} para mostrar quantos foram selecionados.
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="block mb-2">Variações Disponíveis</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Selecione as variações que estarão disponíveis neste grupo.
                  </p>
                  
                  {variations.length === 0 ? (
                    <div className="text-center py-4 text-amber-500 border border-amber-300 rounded-md bg-amber-50">
                      Não há variações disponíveis.
                      <br />
                      <span className="text-sm">
                        Adicione variações na aba "Variações" primeiro.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {variations
                        .filter(v => v.available)
                        .map(variation => (
                          <div key={variation.id} className="flex items-center gap-2 p-2 border rounded">
                            <input 
                              type="checkbox"
                              id={`variation-${variation.id}`}
                              checked={editVariationGroup.variations.includes(variation.id)}
                              onChange={() => handleVariationCheckboxChangeForGroup(variation.id)}
                            />
                            <Label htmlFor={`variation-${variation.id}`} className="flex-1">
                              <span className="font-medium">{variation.name}</span>
                              {variation.additionalPrice ? (
                                <span className="text-xs text-gray-500 block">
                                  +R$ {variation.additionalPrice.toFixed(2)}
                                </span>
                              ) : null}
                            </Label>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditVariationGroup(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveVariationGroup}
                    disabled={
                      !editVariationGroup.name || 
                      editVariationGroup.variations.length === 0 || 
                      editVariationGroup.minRequired > editVariationGroup.maxAllowed
                    }
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar Grupo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;
