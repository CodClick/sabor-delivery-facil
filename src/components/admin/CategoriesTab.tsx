
import React, { useState } from "react";
import { Category } from "@/types/menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { saveCategory, updateCategory, deleteCategory } from "@/services/menuService";

interface CategoriesTabProps {
  categories: Category[];
  loading: boolean;
  onDataChange: () => void;
  onSeedData: () => void;
}

export const CategoriesTab = ({
  categories,
  loading,
  onDataChange,
  onSeedData,
}: CategoriesTabProps) => {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    return orderA - orderB;
  });

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
      } else {
        // Add new category
        const newCat: Category = {
          id: newCategory.toLowerCase().replace(/\s+/g, '-'),
          name: newCategory,
          order: categories.length
        };
        await saveCategory(newCat);
      }
      
      setNewCategory("");
      setEditingCategory(null);
      toast({
        title: "Sucesso",
        description: editingCategory 
          ? "Categoria atualizada com sucesso"
          : "Categoria adicionada com sucesso",
      });
      onDataChange();
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
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });
      onDataChange();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle reordering categories
  const handleReorderCategory = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
    
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === sortedCategories.length - 1)) {
      return; // Can't move beyond boundaries
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetCategory = sortedCategories[newIndex];
    
    // Swap orders
    const updatedCategory = {
      ...category,
      order: targetCategory.order
    };
    
    const updatedTargetCategory = {
      ...targetCategory,
      order: category.order
    };
    
    try {
      // Update both categories with new orders
      await updateCategory(updatedCategory);
      await updateCategory(updatedTargetCategory);
      
      toast({
        title: "Sucesso",
        description: "Ordem das categorias atualizada",
      });
      
      onDataChange();
    } catch (error) {
      console.error("Erro ao reordenar categorias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar as categorias. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Categorias</h2>
        <Button onClick={onSeedData}>
          <Plus className="h-4 w-4 mr-1" />
          Importar Dados Iniciais
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{editingCategory ? "Editar Categoria" : "Adicionar Categoria"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Nome da Categoria</Label>
                <Input
                  id="category-name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ex: Entradas, Pratos Principais, etc"
                />
              </div>
              <div className="flex justify-end gap-2">
                {editingCategory && (
                  <Button variant="outline" onClick={() => {
                    setEditingCategory(null);
                    setNewCategory("");
                  }}>
                    Cancelar
                  </Button>
                )}
                <Button onClick={handleSaveCategory}>
                  <Save className="h-4 w-4 mr-1" />
                  {editingCategory ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Categorias Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <div>
                {sortedCategories.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Ordem</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.order}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleReorderCategory(category, 'up')}
                                disabled={sortedCategories.indexOf(category) === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleReorderCategory(category, 'down')}
                                disabled={sortedCategories.indexOf(category) === sortedCategories.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhuma categoria encontrada.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
