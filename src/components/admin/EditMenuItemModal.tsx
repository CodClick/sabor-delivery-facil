
import React from "react";
import { MenuItem, Category, Variation, VariationGroup } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Save, XCircle } from "lucide-react";
import { saveMenuItem } from "@/services/menuItemService";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VariationGroupsSection } from "./VariationGroupsSection";

interface EditMenuItemModalProps {
  editItem: MenuItem;
  setEditItem: (item: MenuItem | null) => void;
  menuItems: MenuItem[];
  categories: Category[];
  variations: Variation[];
  variationGroups: VariationGroup[];
  onSuccess: () => void;
}

export const EditMenuItemModal = ({
  editItem,
  setEditItem,
  menuItems,
  categories,
  variations,
  variationGroups,
  onSuccess,
}: EditMenuItemModalProps) => {
  const { toast } = useToast();

  const handleSaveItem = async () => {
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
      
      setEditItem(null);
      toast({
        title: "Sucesso",
        description: "Item salvo com sucesso",
      });
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <VariationGroupsSection
            editItem={editItem}
            setEditItem={setEditItem}
            variations={variations}
            variationGroups={variationGroups}
          />
          
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
      </DialogContent>
    </Dialog>
  );
};
