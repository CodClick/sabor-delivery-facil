import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MenuItem, Variation, SelectedVariation, SelectedVariationGroup, VariationGroup } from "@/types/menu";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductVariationDialogProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedVariationGroups: SelectedVariationGroup[]) => void;
  availableVariations: Variation[];
  groupVariations: {[groupId: string]: Variation[]};
}

const ProductVariationDialog: React.FC<ProductVariationDialogProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  availableVariations,
  groupVariations
}) => {
  const [selectedVariationGroups, setSelectedVariationGroups] = useState<SelectedVariationGroup[]>([]);
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && item.variationGroups) {
      // Initialize selected variations for each group
      const initialGroups = item.variationGroups.map(group => {
        if (!group) return null;
        
        // Get available variations for this group
        const groupVars = groupVariations[group.id] || [];
        const variations = groupVars.map(variation => ({
          variationId: variation.id,
          quantity: 0
        }));

        return {
          groupId: group.id,
          groupName: group.name,
          variations: variations
        };
      }).filter(Boolean) as SelectedVariationGroup[];

      setSelectedVariationGroups(initialGroups);
    }
  }, [isOpen, item.variationGroups, groupVariations]);

  // Validate selections whenever they change
  useEffect(() => {
    if (!item.variationGroups || selectedVariationGroups.length === 0) {
      setIsValid(false);
      return;
    }

    // Check if all required groups have the correct number of selections
    const allGroupsValid = item.variationGroups.every(group => {
      if (!group) return false;
      
      const selectedGroup = selectedVariationGroups.find(sg => sg.groupId === group.id);
      if (!selectedGroup) return false;

      const totalSelected = selectedGroup.variations.reduce((sum, v) => sum + v.quantity, 0);
      return totalSelected >= group.minRequired && totalSelected <= group.maxAllowed;
    });

    setIsValid(allGroupsValid);
  }, [selectedVariationGroups, item.variationGroups]);

  const increaseVariation = (groupId: string, variationId: string) => {
    setSelectedVariationGroups(prev => 
      prev.map(group => {
        if (group.groupId !== groupId) return group;

        // Find the variation group definition to get max allowed
        const groupDef = item.variationGroups?.find(g => g?.id === groupId);
        if (!groupDef) return group;

        // Count current selections for this group
        const currentTotal = group.variations.reduce((sum, v) => sum + v.quantity, 0);
        
        // Don't allow increasing if we're already at max
        if (currentTotal >= groupDef.maxAllowed) return group;
        
        // Update the specific variation
        return {
          ...group,
          variations: group.variations.map(variation => 
            variation.variationId === variationId 
              ? { ...variation, quantity: variation.quantity + 1 } 
              : variation
          )
        };
      })
    );
  };

  const decreaseVariation = (groupId: string, variationId: string) => {
    setSelectedVariationGroups(prev => 
      prev.map(group => {
        if (group.groupId !== groupId) return group;
        
        return {
          ...group,
          variations: group.variations.map(variation => 
            variation.variationId === variationId && variation.quantity > 0
              ? { ...variation, quantity: variation.quantity - 1 } 
              : variation
          )
        };
      })
    );
  };

  const handleAddToCart = () => {
    if (!isValid) return;
    
    // Filter out variations with quantity 0
    const nonZeroGroups = selectedVariationGroups.map(group => ({
      ...group,
      variations: group.variations.filter(v => v.quantity > 0)
    })).filter(group => group.variations.length > 0);
    
    onAddToCart(item, nonZeroGroups);
    onClose();
  };

  const getVariationDetails = (variationId: string) => {
    return availableVariations.find(v => v.id === variationId);
  };

  const getGroupSelectionStatus = (groupId: string) => {
    const groupDef = item.variationGroups?.find(g => g?.id === groupId);
    if (!groupDef) return { total: 0, min: 0, max: 0, isValid: false };

    const selectedGroup = selectedVariationGroups.find(sg => sg.groupId === groupId);
    if (!selectedGroup) return { total: 0, min: groupDef.minRequired, max: groupDef.maxAllowed, isValid: false };

    const totalSelected = selectedGroup.variations.reduce((sum, v) => sum + v.quantity, 0);
    const isValid = totalSelected >= groupDef.minRequired && totalSelected <= groupDef.maxAllowed;

    return {
      total: totalSelected,
      min: groupDef.minRequired,
      max: groupDef.maxAllowed,
      isValid
    };
  };

  // Generate message for a variation group
  const getVariationGroupMessage = (groupId: string) => {
    const groupDef = item.variationGroups?.find(g => g?.id === groupId);
    if (!groupDef) return "";

    const { total, min, max } = getGroupSelectionStatus(groupId);

    if (groupDef.customMessage) {
      let message = groupDef.customMessage;
      message = message.replace('{min}', min.toString());
      message = message.replace('{max}', max.toString());
      message = message.replace('{count}', total.toString());
      return message;
    }

    if (min === max) {
      return `Selecione exatamente ${min} ${groupDef.name.toLowerCase()} (${total}/${min} selecionados)`;
    } else if (min > 0) {
      return `Selecione de ${min} a ${max} ${groupDef.name.toLowerCase()} (${total} selecionados)`;
    } else {
      return `Selecione até ${max} ${groupDef.name.toLowerCase()} (opcional) (${total} selecionados)`;
    }
  };

  if (!item.variationGroups || item.variationGroups.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 flex-shrink-0">
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <div className="pb-4">
            <div className="h-48 w-full overflow-hidden rounded-md mb-4">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            
            {item.variationGroups.map((group, groupIndex) => {
              if (!group) return null;
              const groupStatus = getGroupSelectionStatus(group.id);
              
              return (
                <div key={group.id} className="mt-6">
                  {groupIndex > 0 && <Separator className="my-4" />}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <span className={`text-sm px-2 py-1 rounded ${
                      groupStatus.isValid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {groupStatus.total} / {groupStatus.min === groupStatus.max ? 
                        `${groupStatus.min} necessários` : 
                        `${groupStatus.min}-${groupStatus.max} permitidos`
                      }
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    {getVariationGroupMessage(group.id)}
                  </p>
                  
                  <div className="space-y-2">
                    {selectedVariationGroups
                      .find(sg => sg.groupId === group.id)?.variations
                      .map(variation => {
                        const variationDetails = getVariationDetails(variation.variationId);
                        if (!variationDetails) return null;
                        
                        return (
                          <div key={variation.variationId} className="flex items-center justify-between py-2 border-b">
                            <div>
                              <p className="font-medium">{variationDetails.name}</p>
                              {variationDetails.additionalPrice ? (
                                <p className="text-sm text-gray-500">
                                  +{formatCurrency(variationDetails.additionalPrice)}
                                </p>
                              ) : null}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={() => decreaseVariation(group.id, variation.variationId)}
                                disabled={variation.quantity <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              <span className="w-6 text-center">{variation.quantity}</span>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={() => increaseVariation(group.id, variation.variationId)}
                                disabled={groupStatus.total >= groupStatus.max}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="flex justify-between p-6 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddToCart} 
            disabled={!isValid}
            className="bg-food-green hover:bg-opacity-90"
          >
            Adicionar ao carrinho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductVariationDialog;
