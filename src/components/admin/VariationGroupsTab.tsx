
import React, { useState } from "react";
import { VariationGroup, Variation } from "@/types/menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2, AlertTriangle } from "lucide-react";
import { deleteVariationGroup } from "@/services/variationGroupService";
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

  // Detectar duplicatas
  const duplicateIds = new Set<string>();
  const idCounts = new Map<string, number>();
  
  variationGroups.forEach(group => {
    const count = idCounts.get(group.id) || 0;
    idCounts.set(group.id, count + 1);
    if (count > 0) {
      duplicateIds.add(group.id);
    }
  });

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

  const handleDeleteExistingVariationGroup = async (group: VariationGroup) => {
    console.log("VariationGroupsTab: Tentando deletar grupo:", group);
    console.log("VariationGroupsTab: ID do grupo:", group.id);
    console.log("VariationGroupsTab: Tipo do ID:", typeof group.id);
    
    if (!group.id) {
      console.error("VariationGroupsTab: Grupo não possui ID válido:", group);
      toast({
        title: "Erro",
        description: "Grupo não possui ID válido para exclusão",
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = duplicateIds.has(group.id);
    const confirmMessage = isDuplicate 
      ? `ATENÇÃO: Este grupo "${group.name}" possui DUPLICATAS no banco de dados!\n\nTodas as duplicatas serão removidas. Tem certeza que deseja continuar?`
      : `Tem certeza que deseja excluir o grupo "${group.name}"? Isso pode afetar itens do menu que o utilizam.`;

    if (window.confirm(confirmMessage)) {
      try {
        console.log("VariationGroupsTab: Confirmação recebida, chamando deleteVariationGroup com ID:", group.id);
        await deleteVariationGroup(group.id);
        toast({
          title: "Sucesso",
          description: isDuplicate 
            ? "Grupo de variação e suas duplicatas excluídos com sucesso"
            : "Grupo de variação excluído com sucesso",
        });
        console.log("VariationGroupsTab: Grupo deletado com sucesso, chamando onDataChange");
        onDataChange();
      } catch (error) {
        console.error("VariationGroupsTab: Erro ao excluir grupo de variação:", error);
        toast({
          title: "Erro",
          description: `Não foi possível excluir o grupo: ${error.message}`,
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
      
      {duplicateIds.size > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Duplicatas Detectadas</h3>
          </div>
          <p className="text-sm text-yellow-700">
            {duplicateIds.size} grupo(s) possuem duplicatas no banco de dados. 
            Ao excluir um grupo duplicado, todas as suas cópias serão removidas.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variationGroups.map(group => {
          const isDuplicate = duplicateIds.has(group.id);
          
          return (
            <Card key={`${group.id}-${Math.random()}`} className={`overflow-hidden ${isDuplicate ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{group.name}</h3>
                      {isDuplicate && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
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
                    
                    <p className="text-xs text-gray-400 mt-2">
                      ID: {group.id}
                      {isDuplicate && (
                        <span className="text-yellow-600 font-medium"> (DUPLICADO)</span>
                      )}
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
                      onClick={() => handleDeleteExistingVariationGroup(group)}
                    >
                      <Trash2 className={`h-4 w-4 ${isDuplicate ? 'text-yellow-600' : 'text-red-500'}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
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
