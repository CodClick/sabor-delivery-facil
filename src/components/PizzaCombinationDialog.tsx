import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types/menu";

interface PizzaCombinationDialogProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

const PizzaCombinationDialog: React.FC<PizzaCombinationDialogProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [sabor1, setSabor1] = useState<string | null>(null);
  const [sabor2, setSabor2] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!sabor1 || !sabor2) return;

    const combinedItem = {
      ...item,
      name: `${item.name} - 1/2 ${sabor1} + 1/2 ${sabor2}`,
      price: item.price, // aqui você pode aplicar a lógica do "preço maior"
      combination: [sabor1, sabor2],
    };

    onAddToCart(combinedItem);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Monte sua Pizza Meio a Meio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Escolha o 1º sabor:</label>
            <select
              value={sabor1 || ""}
              onChange={(e) => setSabor1(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Selecione</option>
              {/* depois substituímos por lista de sabores do cardápio */}
              <option value="Calabresa">Calabresa</option>
              <option value="Mussarela">Mussarela</option>
              <option value="Calabresa">Quatro Queijos</option>
              <option value="Mussarela">Frango com Catupiry</option>
              <option value="Calabresa">Baiacatu</option>
              <option value="Mussarela">Alho e Óleo</option>              
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Escolha o 2º sabor:</label>
            <select
              value={sabor2 || ""}
              onChange={(e) => setSabor2(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Selecione</option>
              <option value="Calabresa">Calabresa</option>
              <option value="Mussarela">Mussarela</option>
              <option value="Calabresa">Quatro Queijos</option>
              <option value="Mussarela">Frango com Catupiry</option>
              <option value="Calabresa">Baiacatu</option>
              <option value="Mussarela">Alho e Óleo</option>            
            </select>
          </div>

          <Button onClick={handleConfirm} className="w-full" disabled={!sabor1 || !sabor2}>
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PizzaCombinationDialog;
  
