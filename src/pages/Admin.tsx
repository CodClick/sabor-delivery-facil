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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

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

  // Define the handleAddNewVariationGroup function
  const handleAddNewVariationGroup = () => {
    setEditVariationGroup({
      id: uuidv4(),
      name: "",
      minRequired: 1,
      maxAllowed: 1,
      variations: [],
      customMessage: ""
    });
  };

  // Update the JSX for the variation groups section in edit item dialog
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
              
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Content for flex container */}
              </div>
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

          {/* Form for adding/editing menu items */}
          {editItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editItem.id && menuItems.some(item => item.id === editItem.id) ? "Editar Item" : "Novo Item"}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditItem(null)}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={editItem.name}
                      onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                      placeholder="Nome do item"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={editItem.description}
                      onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                      placeholder="Descrição do item"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Preço (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={editItem.price}
                        onChange={(e) => setEditItem({...editItem, price: parseFloat(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={editItem.category}
                        onValueChange={(value) => setEditItem({...editItem, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="image">URL da Imagem</Label>
                    <Input
                      id="image"
                      value={editItem.image}
                      onChange={(e) => setEditItem({...editItem, image: e.target.value})}
                      placeholder="URL da imagem"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="popular"
                      checked={editItem.popular || false}
                      onCheckedChange={(checked) => 
                        setEditItem({...editItem, popular: checked === true})
                      }
                    />
                    <Label htmlFor="popular">Item popular (destacado no cardápio)</Label>
                  </div>

                  {/* Variation groups section */}
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
              </div>
            </div>
          )}

          {/* Form for adding new variation group to a menu item */}
          {tempVariationGroup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Adicionar Grupo de Variações</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setTempVariationGroup(null)}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-name">Nome do Grupo</Label>
                    <Input
                      id="group-name"
                      value={tempVariationGroup.name}
                      onChange={(e) => setTempVariationGroup({...tempVariationGroup, name: e.target.value})}
                      placeholder="Ex: Sabores, Recheios, Complementos"
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
                          minRequired: parseInt(e.target.value)
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
                          maxAllowed: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="custom-message">Mensagem Personalizada (opcional)</Label>
                    <Input
                      id="custom-message"
                      value={tempVariationGroup.customMessage || ""}
                      onChange={(e) => setTempVariationGroup({
                        ...tempVariationGroup, 
                        customMessage: e.target.value
                      })}
                      placeholder="Ex: Escolha {min} opções"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use {min} para o número mínimo, {max} para o máximo e {count} para quantidade selecionada
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Variações Disponíveis</Label>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                      {variations.map((variation) => (
                        <div key={variation.id} className="flex items-center space-x-2 py-1">
                          <Checkbox 
                            id={`var-${variation.
