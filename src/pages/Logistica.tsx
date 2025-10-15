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
  km: string;
  valor: string;
}

const Logistica = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [freteItems, setFreteItems] = useState<FreteItem[]>([
    { km: "", valor: "" },
    { km: "", valor: "" },
    { km: "", valor: "" },
    { km: "", valor: "" },
    { km: "", valor: "" },
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
        .from("consulta_frete")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar dados de frete:", error);
        return;
      }

      if (data) {
        const items: FreteItem[] = [];
        Object.keys(data).forEach((key) => {
          if (key.endsWith("Km") && key !== "1Km") {
            const km = key.replace("Km", "");
            items.push({ km, valor: data[key] || "" });
          }
        });
        if (items.length > 0) {
          setFreteItems(items);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar frete:", error);
    }
  };

  const handleAddItem = () => {
    setFreteItems([...freteItems, { km: "", valor: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (freteItems.length > 1) {
      const newItems = freteItems.filter((_, i) => i !== index);
      setFreteItems(newItems);
    }
  };

  const handleItemChange = (index: number, field: "km" | "valor", value: string) => {
    const newItems = [...freteItems];
    newItems[index][field] = value;
    setFreteItems(newItems);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    // Validar que pelo menos um item tem dados
    const validItems = freteItems.filter((item) => item.km && item.valor);
    if (validItems.length === 0) {
      toast.error("Adicione pelo menos uma faixa de kilometragem");
      return;
    }

    setLoading(true);
    try {
      // Primeiro, verificar se já existe registro
      const { data: existingData } = await supabase
        .from("consulta_frete")
        .select("id")
        .limit(1)
        .single();

      // Construir objeto com colunas dinâmicas
      const freteData: any = {};
      validItems.forEach((item) => {
        const columnName = `${item.km}Km`;
        freteData[columnName] = parseFloat(item.valor);
      });

      if (existingData) {
        // Atualizar registro existente
        const { error } = await supabase
          .from("consulta_frete")
          .update(freteData)
          .eq("id", existingData.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from("consulta_frete")
          .insert([freteData]);

        if (error) throw error;
      }

      toast.success("Configurações de frete salvas com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar frete:", error);
      
      if (error.message?.includes("column") && error.message?.includes("does not exist")) {
        toast.error("Erro: A coluna não existe. Você precisa criar as colunas manualmente no Supabase primeiro.");
      } else {
        toast.error("Erro ao salvar configurações de frete");
      }
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
              Configure os valores de frete por quilometragem. As colunas serão criadas
              dinamicamente na tabela do banco de dados.
            </div>

            {freteItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor={`km-${index}`}>Km</Label>
                  <Input
                    id={`km-${index}`}
                    type="number"
                    value={item.km}
                    onChange={(e) => handleItemChange(index, "km", e.target.value)}
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
                    placeholder="Ex: 30.00"
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
