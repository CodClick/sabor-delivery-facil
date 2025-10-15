import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface FreteItem {
  id?: string;
  km_inicial: string;
  km_final: string;
  valor: string;
}

const Logistica = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [freteItems, setFreteItems] = useState<FreteItem[]>([
    { km_inicial: "", km_final: "", valor: "" },
  ]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    loadFreteData();
  }, [currentUser]);

  const loadFreteData = async () => {
    try {
      const { data, error } = await supabase
        .from("faixas_frete")
        .select("*")
        .eq("user_id", currentUser?.uid)
        .order("km_inicial", { ascending: true });

      if (error) {
        console.error("Erro ao carregar dados de frete:", error);
        return;
      }

      if (data && data.length > 0) {
        const items: FreteItem[] = data.map((item) => ({
          id: item.id,
          km_inicial: item.km_inicial?.toString() || "",
          km_final: item.km_final?.toString() || "",
          valor: item.valor?.toString() || "",
        }));
        setFreteItems(items);
      }
    } catch (error) {
      console.error("Erro ao carregar frete:", error);
    }
  };

  const handleAddItem = () => {
    setFreteItems([...freteItems, { km_inicial: "", km_final: "", valor: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (freteItems.length > 1) {
      const newItems = freteItems.filter((_, i) => i !== index);
      setFreteItems(newItems);
    }
  };

  const handleItemChange = (
    index: number,
    field: "km_inicial" | "km_final" | "valor",
    value: string
  ) => {
    const newItems = [...freteItems];
    newItems[index][field] = value;
    setFreteItems(newItems);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    // Validar que pelo menos um item tem dados
    const validItems = freteItems.filter(
      (item) => item.km_inicial && item.km_final && item.valor
    );
    
    if (validItems.length === 0) {
      toast.error("Adicione pelo menos uma faixa de kilometragem");
      return;
    }

    // Validar que km_inicial < km_final
    const invalidItems = validItems.filter(
      (item) => parseFloat(item.km_inicial) >= parseFloat(item.km_final)
    );
    
    if (invalidItems.length > 0) {
      toast.error("O Km inicial deve ser menor que o Km final em todas as faixas");
      return;
    }

    setLoading(true);
    try {
      // Deletar faixas antigas
      const { error: deleteError } = await supabase
        .from("faixas_frete")
        .delete()
        .eq("user_id", currentUser.uid);

      if (deleteError) throw deleteError;

      // Inserir novas faixas
      const insertData = validItems.map((item) => ({
        user_id: currentUser.uid,
        km_inicial: parseFloat(item.km_inicial),
        km_final: parseFloat(item.km_final),
        valor: parseFloat(item.valor),
      }));

      const { error: insertError } = await supabase
        .from("faixas_frete")
        .insert(insertData);

      if (insertError) throw insertError;

      toast.success("Configurações de frete salvas com sucesso!");
      loadFreteData();
    } catch (error: any) {
      console.error("Erro ao salvar frete:", error);
      toast.error("Erro ao salvar configurações de frete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Configuração de Frete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Configure as faixas de frete por quilometragem. Por exemplo: de 1km a 3km por
              R$ 5,00.
            </div>

            {freteItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor={`km-inicial-${index}`}>Km Inicial</Label>
                  <Input
                    id={`km-inicial-${index}`}
                    type="number"
                    value={item.km_inicial}
                    onChange={(e) => handleItemChange(index, "km_inicial", e.target.value)}
                    placeholder="Ex: 1"
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor={`km-final-${index}`}>Km Final</Label>
                  <Input
                    id={`km-final-${index}`}
                    type="number"
                    value={item.km_final}
                    onChange={(e) => handleItemChange(index, "km_final", e.target.value)}
                    placeholder="Ex: 3"
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor={`valor-${index}`}>Valor (R$)</Label>
                  <Input
                    id={`valor-${index}`}
                    type="number"
                    step="0.01"
                    value={item.valor}
                    onChange={(e) => handleItemChange(index, "valor", e.target.value)}
                    placeholder="Ex: 5.00"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  disabled={freteItems.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={handleAddItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Nova Faixa
            </Button>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Logistica;
