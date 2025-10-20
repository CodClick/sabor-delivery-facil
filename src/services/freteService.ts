import { supabase } from "@/integrations/supabase/client";

export interface CalculateFreteRequest {
  cepCliente: string;
  cepEmpresa: string;
}

export interface CalculateFreteResponse {
  distanciaKm: number;
  valorFrete: number;
}

/**
 * Calcula o frete baseado na distância entre dois CEPs
 */
export async function calculateFreteByCep(
  cepCliente: string,
  cepEmpresa: string,
  userId: string
): Promise<CalculateFreteResponse> {
  try {
    // Limpar CEPs (remover qualquer formatação)
    const cleanCepCliente = cepCliente.replace(/\D/g, '');
    const cleanCepEmpresa = cepEmpresa.replace(/\D/g, '');

    // Chamar webhook para obter distância
    const response = await fetch(
      "https://n8n-n8n-start.yh11mi.easypanel.host/webhook/consulta_cep",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cep_cliente: cleanCepCliente,
          cep_empresa: cleanCepEmpresa,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao consultar distância entre CEPs");
    }

    const data = await response.json();
    const distanciaMetros = data[0]?.distancia || 0;
    
    // Converter metros para quilômetros
    const distanciaKm = distanciaMetros / 1000;

    // Buscar faixas de frete do usuário
    const { data: faixas, error } = await supabase
      .from("faixas_frete")
      .select("*")
      .eq("user_id", userId)
      .order("km_inicial", { ascending: true });

    if (error) {
      throw error;
    }

    if (!faixas || faixas.length === 0) {
      throw new Error("Nenhuma faixa de frete configurada");
    }

    // Encontrar a faixa correspondente
    const faixaCorrespondente = faixas.find(
      (faixa: any) =>
        distanciaKm >= faixa.km_inicial && distanciaKm <= faixa.km_final
    );

    if (!faixaCorrespondente) {
      throw new Error(
        `Distância de ${distanciaKm.toFixed(2)}km fora das faixas de entrega configuradas`
      );
    }

    return {
      distanciaKm,
      valorFrete: faixaCorrespondente.valor,
    };
  } catch (error) {
    console.error("Erro ao calcular frete por CEP:", error);
    throw error;
  }
}

/**
 * Busca o modelo de frete configurado pela empresa
 */
export async function getModeloFrete(userId: string): Promise<"km_direto" | "cep_distancia"> {
  try {
    const { data, error } = await supabase
      .from("empresa_info")
      .select("modelo_frete")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar modelo de frete:", error);
      return "km_direto"; // Default
    }

    return (data?.modelo_frete as "km_direto" | "cep_distancia") || "km_direto";
  } catch (error) {
    console.error("Erro ao buscar modelo de frete:", error);
    return "km_direto"; // Default
  }
}
