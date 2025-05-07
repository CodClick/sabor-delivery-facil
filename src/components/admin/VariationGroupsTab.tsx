
import React, { useState } from "react";
import { VariationGroup, Variation } from "@/types/menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2 } from "lucide-react";
import { deleteVariationGroup } from "@/services/menuService";
import { EditVariationGroupModal } from "./EditVariationGroupModal";

interface VariationGroupsTabProps {
  variationGroups: VariationGroup[];
  variations: Variation[];
  loading: boolean;
  onDataChange: () => void;
}

export const VariationGroupsTab = ({
  variationGroups,
  variations,
  loading,
  onDataChange,
}: VariationGroupsTabProps) => {
  const { toast } = useToast();
  const [editVariationGroup, setEditVariationGroup] = useState<VariationGroup | null>(null);

  const handleAddNewVariationGroup = () => {
    setEditVariationGroup({
      id: crypto.randomUUID(),
      name: "",
      minRequired: 1,
      maxAllowed: 1,
      variations: [],
      customMessage: ""
    });
  };

  const handleEditExistingVariationGroup = (group: VariationGroup) => {
    setEditVariationGroup({...group});
  };

  const handleDeleteExistingVariationGroup = async (groupId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este grupo de variação? Isso pode afetar itens do menu que o utilizam.")) {
      try {
        await deleteVariationGroup(groupId);
        toast({
          title: "Sucesso",
          description: "Grupo de variação excluído com sucesso",
        });
        onDataChange();
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

  const getVariationName = (variationId: string): string => {
    const variation = variations.find(v => v.id === variationId);
    return variation ? variation.name : "Variação não encontrada";
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Grupos de Variações</h2>
        <Button onClick={handleAddNewVariationGroup}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Grupo de Variações
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variationGroups.map(group => (
          <Card key={group.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{group.name}</h3>
                  <p className="text-sm text-gray-600">
                    {group.minRequired === group.maxAllowed
                      ? `Exatamente ${group.minRequired} seleção(ões) necessária(s)`
                      : `De ${group.minRequired} até ${group.maxAllowed} seleções`
                    }
                  </p>
                  
                  {group.customMessage && (
                    <p className="text-xs text-gray-500 mt-2">
                      Mensagem: {group.customMessage}
                    </p>
                  )}

                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-1">Variações:</p>
                    <div className="flex flex-wrap gap-1">
                      {group.variations.map(varId => (
                        <span key={varId} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs">
                          {getVariationName(varId)}
                        </span>
                      ))}
                    </div>
                  </div>
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
                    onClick={() => handleDeleteExistingVariationGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {variationGroups.length === 0 && !loading && (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhum grupo de variação encontrado. Adicione grupos para organizar as variações.
          </div>
        )}
      </div>

      {editVariationGroup && (
        <EditVariationGroupModal
          editVariationGroup={editVariationGroup}
          setEditVariationGroup={setEditVariationGroup}
          variations={variations}
          variationGroups={variationGroups}
          onSuccess={onDataChange}
        />
      )}
    </>
  );
};
