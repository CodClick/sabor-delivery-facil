
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getAllMenuItems, 
  saveMenuItem, 
  deleteMenuItem, 
  getAllCategories, 
  saveCategory 
} from "@/services/menuService";
import { MenuItem, Category } from "@/types/menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit, Save } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [newCategory, setNewCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verificar se o usuário está logado
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Carregar dados iniciais
    loadData();
  }, [currentUser, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, cats] = await Promise.all([
        getAllMenuItems(),
        getAllCategories()
      ]);
      setMenuItems(items);
      setCategories(cats);
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
      
      // Atualizar a lista de itens
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

  const handleSeedData = async () => {
    if (window.confirm("Isso irá importar os dados iniciais do menu. Continuar?")) {
      try {
        const { categories, menuItems } = await import("@/data/menuData");
        
        // Salvar categorias
        for (const category of categories) {
          await saveCategory({...category, order: categories.indexOf(category)});
        }
        
        // Salvar itens do menu
        for (const item of menuItems) {
          await saveMenuItem(item);
        }
        
        toast({
          title: "Sucesso",
          description: "Dados iniciais importados com sucesso",
        });
        
        // Recarregar dados
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Painel de categorias */}
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

        {/* Painel de importação de dados */}
        <Card>
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
      </div>

      {/* Lista de itens do menu */}
      <div className="mt-8">
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
      </div>

      {/* Modal de edição de item */}
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
    </div>
  );
};

export default Admin;
