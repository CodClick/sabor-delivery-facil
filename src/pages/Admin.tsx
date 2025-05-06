import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  getAllMenuItems, 
  saveMenuItem, 
  deleteMenuItem, 
  getAllCategories, 
  saveCategory,
  getAllVariations,
  saveVariation,
  deleteVariation
} from "@/services/menuService";
import { MenuItem, Category, Variation } from "@/types/menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from 'uuid';

const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editVariation, setEditVariation] = useState<Variation | null>(null);
  const [newCategory, setNewCategory] = useState<string>("");
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
      const [items, cats, vars] = await Promise.all([
        getAllMenuItems(),
        getAllCategories(),
        getAllVariations()
      ]);
      setMenuItems(items);
      setCategories(cats);
      setVariations(vars);
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
      popular: false
    };
    setEditItem(newItem);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditItem({...item});
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

    try {
      await saveMenuItem(editItem);
      
      setMenuItems(prev => {
        const exists = prev.find(item => item.id === editItem.id);
        if (exists) {
          return prev.map(item => item.id === editItem.id ? editItem : item);
        } else {
          return [...prev, editItem];
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
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCat: Category = {
        id: newCategory.toLowerCase().replace(/\s+/g, '-'),
        name: newCategory,
        order: categories.length
      };
      
      await saveCategory(newCat);
      setCategories([...categories, newCat]);
      setNewCategory("");
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a categoria. Tente novamente.",
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
        </TabsList>

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
                    placeholder="Nome da nova categoria"
                    className="flex-1"
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                
                <div className="space-y-2 mt-4">
                  {categories.map((category) => (
                    <div key={category.id} className="p-3 bg-gray-100 rounded-md flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">({category.id})</span>
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
      </Tabs>

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

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="hasVariations"
                    checked={editItem.hasVariations} 
                    onChange={(e) => setEditItem({...editItem, hasVariations: e.target.checked})}
                  />
                  <Label htmlFor="hasVariations">Possui variações</Label>
                </div>

                {editItem.hasVariations && (
                  <div>
                    <Label htmlFor="maxVariations">Quantidade máxima de variações</Label>
                    <Input 
                      id="maxVariations"
                      type="number" 
                      min="1"
                      value={editItem.maxVariationCount || 1} 
                      onChange={(e) => setEditItem({
                        ...editItem, 
                        maxVariationCount: parseInt(e.target.value) || 1
                      })}
                    />
                  </div>
                )}

                {editItem.hasVariations && (
                  <div>
                    <Label>Selecione as variações disponíveis</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {variations
                        .filter(v => v.available && v.categoryIds.includes(editItem.category))
                        .map(variation => (
                          <div key={variation.id} className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              id={`variation-${variation.id}`}
                              checked={editItem.variations?.includes(variation.id) || false}
                              onChange={(e) => {
                                const currentVariations = editItem.variations || [];
                                const newVariations = e.target.checked
                                  ? [...currentVariations, variation.id]
                                  : currentVariations.filter(id => id !== variation.id);
                                
                                setEditItem({...editItem, variations: newVariations});
                              }}
                            />
                            <Label htmlFor={`variation-${variation.id}`}>{variation.name}</Label>
                          </div>
                        ))}
                    </div>
                    {variations.filter(v => v.available && v.categoryIds.includes(editItem.category)).length === 0 && (
                      <p className="text-sm text-red-500 mt-1">
                        Não há variações disponíveis para esta categoria. Adicione variações na aba "Variações".
                      </p>
                    )}
                  </div>
                )}
                
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
    </div>
  );
};

export default Admin;
