import { supabase } from "@/integrations/supabase/client";

export interface CalculateFreteRequest {
  cepCliente: string;
  cepEmpresa: string;
}

export interface CalculateFreteResponse {
  distanciaKm: number;
  valorFrete: number;
  origem: 'cep_especial' | 'webhook_valor' | 'webhook_distancia';
}

interface WebhookResponse {
  valor?: number;
  distancia?: number;
}

/**
 * Verifica se o CEP é especial e retorna o valor do frete
 */
export async function checkCepEspecial(cep: string): Promise<number | null> {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    
    const { data, error } = await supabase
      .from("ceps_especiais")
      .select("valor")
      .eq("cep", cleanCep)
      .maybeSingle();

    if (error) {
      console.error("Erro ao verificar CEP especial:", error);
      return null;
    }

    return data?.valor ?? null;
  } catch (error) {
    console.error("Erro ao verificar CEP especial:", error);
    return null;
  }
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

    // 1. Verificar se é CEP especial
    const valorEspecial = await checkCepEspecial(cleanCepCliente);
    if (valorEspecial !== null) {
      return {
        distanciaKm: 0,
        valorFrete: valorEspecial,
        origem: 'cep_especial'
      };
    }

    // 2. Chamar webhook para obter distância ou valor
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

    const rawData = await response.json();

    console.log("Resposta bruta do webhook consulta_cep:", JSON.stringify(rawData));

    const first = Array.isArray(rawData) ? rawData[0] : rawData;
    // n8n pode responder no formato: [{ json: { ... } }]
    const data =
      first && typeof first === "object" && (first as any).json
        ? (first as any).json
        : first;

    console.log("Data normalizada do webhook consulta_cep:", JSON.stringify(data));

    // Extrair distância do formato Google Maps Distance Matrix API
    let distanciaMetros = 0;
    let valorDireto: number | null = null;

    // Verificar se é formato Google Maps Distance Matrix
    const dmDistanceValue = data?.rows?.[0]?.elements?.[0]?.distance?.value;
    if (dmDistanceValue !== undefined && dmDistanceValue !== null) {
      distanciaMetros = Number(dmDistanceValue);
      console.log("Distância extraída do Google Maps:", distanciaMetros, "metros");
    }
    // Formato simples com valor direto
    else if (data?.valor !== undefined && data.valor !== null) {
      valorDireto = Number(data.valor);
    }
    // Formato simples com distância
    else if (data?.distancia !== undefined && data.distancia !== null) {
      distanciaMetros = Number(data.distancia);
    }

    const hasDistanceOrValue =
      (dmDistanceValue !== undefined && dmDistanceValue !== null) ||
      (data?.distancia !== undefined && data.distancia !== null) ||
      (data?.valor !== undefined && data.valor !== null);

    if (!hasDistanceOrValue) {
      throw new Error("Não foi possível encontrar esse cep em nosso banco de dados. \n Por favor, tente novamente");
    }
    // Se veio valor direto, usar
    if (valorDireto !== null) {
      console.log("Usando valor direto do webhook:", valorDireto);
      return {
        distanciaKm: 0,
        valorFrete: valorDireto,
        origem: 'webhook_valor'
      };
    }

    // Calcular usando faixas_frete
    const distanciaKm = distanciaMetros / 1000;
    
    console.log("Distância em metros:", distanciaMetros, "| Em km:", distanciaKm);

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
        `Desculpe. A sua localidade não é atendida por nosso delivery`
      );
    }

    return {
      distanciaKm,
      valorFrete: faixaCorrespondente.valor,
      origem: 'webhook_distancia'
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
