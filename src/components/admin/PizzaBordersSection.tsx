import React from "react";
import { MenuItem, PizzaBorder } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface PizzaBordersSectionProps {
  editItem: MenuItem;
  setEditItem: (item: MenuItem) => void;
  pizzaBorders: PizzaBorder[];
}

export const PizzaBordersSection = ({
  editItem,
  setEditItem,
  pizzaBorders,
}: PizzaBordersSectionProps) => {

  const handleSelectBorder = (borderId: string) => {
    const selectedBorder = pizzaBorders.find(border => border.id === borderId);
    
    if (selectedBorder) {
      // Check if this border is already added to the item
      const isAlreadyAdded = editItem.pizzaBorders?.some(b => b.id === selectedBorder.id);
      
      if (!isAlreadyAdded) {
        setEditItem({
          ...editItem,
          pizzaBorders: [...(editItem.pizzaBorders || []), selectedBorder]
        });
      }
    }
  };

  const handleRemoveBorder = (borderId: string) => {
    setEditItem({
      ...editItem,
      pizzaBorders: editItem.pizzaBorders?.filter(b => b.id !== borderId) || []
    });
  };

  const handleRemoveAllBorders = () => {
    if (window.confirm("Tem certeza que deseja remover todas as bordas desta pizza?")) {
      setEditItem({
        ...editItem,
        pizzaBorders: []
      });
    }
  };

  // Filtrar apenas bordas disponíveis
  const availableBorders = pizzaBorders.filter(border => border.available);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Bordas Disponíveis</h3>
        {editItem.pizzaBorders && editItem.pizzaBorders.length > 0 && (
          <Button 
            onClick={handleRemoveAllBorders} 
            size="sm" 
            variant="destructive"
            className="px-2 py-1"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remover Todas
          </Button>
        )}
      </div>
      
      {/* Dropdown to select borders */}
      <div className="mt-4 space-y-2">
        <Label>Adicionar Borda</Label>
        <div className="flex gap-2">
          <Select onValueChange={handleSelectBorder}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma borda" />
            </SelectTrigger>
            <SelectContent>
              {availableBorders
                .filter(border => !editItem.pizzaBorders?.some(b => b.id === border.id))
                .map(border => (
                  <SelectItem key={border.id} value={border.id}>
                    {border.name} {border.additionalPrice > 0 ? `(+${formatCurrency(border.additionalPrice)})` : "(Grátis)"}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {editItem.pizzaBorders && editItem.pizzaBorders.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {editItem.pizzaBorders.map(border => (
              <div key={border.id} className="flex items-center justify-between bg-amber-50 rounded px-3 py-2 border border-amber-200">
                <div>
                  <span className="text-sm font-medium">{border.name}</span>
                  {border.description && (
                    <p className="text-xs text-muted-foreground">{border.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-600">
                    {border.additionalPrice > 0 ? `+${formatCurrency(border.additionalPrice)}` : 'Grátis'}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleRemoveBorder(border.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground border rounded-md">
            Nenhuma borda configurada para esta pizza.
            <br />
            <span className="text-sm">
              Adicione bordas para permitir que os clientes personalizem a pizza.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
