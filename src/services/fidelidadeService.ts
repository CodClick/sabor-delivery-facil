import { supabase } from "@/integrations/supabase/client";

export interface FidelidadeRegra {
  id: string;
  nome: string;
  descricao: string | null;
  criterio: "quantidade_compras" | "valor_gasto";
  meta: number;
  premio_tipo: "cupom" | "produto";
  premio_id: string | null;
  ativo: boolean;
  criado_em: string | null;
}

export interface FidelidadeHistorico {
  id: string;
  user_id: string | null;
  regra_id: string | null;
  data: string | null;
  premio_concedido: boolean;
  observacao: string | null;
}

// Buscar todas as regras de fidelidade
export const getFidelidadeRegras = async (): Promise<FidelidadeRegra[]> => {
  const { data, error } = await supabase
    .from("fidelidade_regras")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar regras de fidelidade:", error);
    throw error;
  }

  return (data || []).map((regra) => ({
    ...regra,
    criterio: regra.criterio as "quantidade_compras" | "valor_gasto",
    premio_tipo: regra.premio_tipo as "cupom" | "produto",
    ativo: regra.ativo ?? true,
  }));
};

// Buscar regras ativas
export const getRegrasAtivas = async (): Promise<FidelidadeRegra[]> => {
  const { data, error } = await supabase
    .from("fidelidade_regras")
    .select("*")
    .eq("ativo", true);

  if (error) {
    console.error("Erro ao buscar regras ativas:", error);
    throw error;
  }

  return (data || []).map((regra) => ({
    ...regra,
    criterio: regra.criterio as "quantidade_compras" | "valor_gasto",
    premio_tipo: regra.premio_tipo as "cupom" | "produto",
    ativo: regra.ativo ?? true,
  }));
};

// Criar nova regra
export const createFidelidadeRegra = async (
  regra: Omit<FidelidadeRegra, "id" | "criado_em">
): Promise<FidelidadeRegra> => {
  const { data, error } = await supabase
    .from("fidelidade_regras")
    .insert({
      nome: regra.nome,
      descricao: regra.descricao,
      criterio: regra.criterio,
      meta: regra.meta,
      premio_tipo: regra.premio_tipo,
      premio_id: regra.premio_id,
      ativo: regra.ativo,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar regra de fidelidade:", error);
    throw error;
  }

  return {
    ...data,
    criterio: data.criterio as "quantidade_compras" | "valor_gasto",
    premio_tipo: data.premio_tipo as "cupom" | "produto",
    ativo: data.ativo ?? true,
  };
};

// Atualizar regra
export const updateFidelidadeRegra = async (
  id: string,
  regra: Partial<FidelidadeRegra>
): Promise<FidelidadeRegra> => {
  const { data, error } = await supabase
    .from("fidelidade_regras")
    .update({
      nome: regra.nome,
      descricao: regra.descricao,
      criterio: regra.criterio,
      meta: regra.meta,
      premio_tipo: regra.premio_tipo,
      premio_id: regra.premio_id,
      ativo: regra.ativo,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar regra de fidelidade:", error);
    throw error;
  }

  return {
    ...data,
    criterio: data.criterio as "quantidade_compras" | "valor_gasto",
    premio_tipo: data.premio_tipo as "cupom" | "produto",
    ativo: data.ativo ?? true,
  };
};

// Excluir regra
export const deleteFidelidadeRegra = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("fidelidade_regras")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir regra de fidelidade:", error);
    throw error;
  }
};

// Verificar se cliente atingiu meta e disparar webhook
export const verificarFidelidade = async (
  customerName: string,
  customerPhone: string,
  totalCompras: number,
  totalGasto: number
): Promise<void> => {
  try {
    const regrasAtivas = await getRegrasAtivas();

    for (const regra of regrasAtivas) {
      let atingiuMeta = false;

      if (regra.criterio === "quantidade_compras" && totalCompras >= regra.meta) {
        atingiuMeta = true;
      } else if (regra.criterio === "valor_gasto" && totalGasto >= regra.meta) {
        atingiuMeta = true;
      }

      if (atingiuMeta) {
        console.log(`🎉 Cliente ${customerName} atingiu meta da regra: ${regra.nome}`);

        // Disparar webhook
        const payload = {
          cliente: {
            nome: customerName,
            whatsapp: customerPhone,
          },
          regra: {
            id: regra.id,
            nome: regra.nome,
            criterio: regra.criterio,
            meta: regra.meta,
            premio_tipo: regra.premio_tipo,
          },
          dados: {
            total_compras: totalCompras,
            total_gasto: totalGasto,
          },
          timestamp: new Date().toISOString(),
        };

        try {
          const response = await fetch(
            "https://n8n-n8n-start.yh11mi.easypanel.host/webhook/fidelidade",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          if (response.ok) {
            console.log("✅ Webhook de fidelidade enviado com sucesso!");
          } else {
            console.error("❌ Falha ao enviar webhook:", await response.text());
          }
        } catch (webhookError) {
          console.error("❌ Erro ao enviar webhook de fidelidade:", webhookError);
        }
      }
    }
  } catch (error) {
    console.error("Erro ao verificar fidelidade:", error);
  }
};

// Buscar histórico de compras de um cliente pelo telefone
export const getClienteHistorico = async (
  phone: string
): Promise<{ totalCompras: number; totalGasto: number }> => {
  try {
    // Buscar pedidos do cliente no Supabase (tabela pedidos_sabor_delivery)
    const { data, error } = await supabase
      .from("pedidos_sabor_delivery")
      .select("valor_total, status_atual")
      .eq("telefone_cliente", phone)
      .in("status_atual", ["delivered", "entregue", "completed", "finalizado"]);

    if (error) {
      console.error("Erro ao buscar histórico do cliente:", error);
      return { totalCompras: 0, totalGasto: 0 };
    }

    const totalCompras = data?.length || 0;
    const totalGasto = data?.reduce((acc, pedido) => acc + (pedido.valor_total || 0), 0) || 0;

    return { totalCompras, totalGasto };
  } catch (error) {
    console.error("Erro ao buscar histórico do cliente:", error);
    return { totalCompras: 0, totalGasto: 0 };
  }
};
