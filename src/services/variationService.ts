import { supabase } from "@/integrations/supabase/client";
import { Variation } from "@/types/menu";

type Row = {
  id: string;
  name: string;
  description: string | null;
  additional_price: number;
  available: boolean;
  category_ids: string[];
};

const fromRow = (r: Row): Variation => ({
  id: r.id,
  name: r.name,
  description: r.description ?? "",
  additionalPrice: Number(r.additional_price ?? 0),
  available: r.available ?? true,
  categoryIds: r.category_ids ?? [],
});

const toRow = (v: Variation) => ({
  id: v.id,
  name: v.name,
  description: v.description ?? "",
  additional_price: typeof v.additionalPrice === "number" ? v.additionalPrice : 0,
  available: v.available ?? true,
  category_ids: v.categoryIds ?? [],
});

export const getAllVariations = async (): Promise<Variation[]> => {
  const { data, error } = await supabase.from("variations").select("*");
  if (error) throw error;
  return (data as Row[]).map(fromRow);
};

export const getVariation = async (id: string): Promise<Variation | null> => {
  const { data, error } = await supabase
    .from("variations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as Row) : null;
};

export const getVariationById = getVariation;

export const saveVariation = async (variation: Variation): Promise<string> => {
  if (!variation.name) throw new Error("Nome da variação é obrigatório");
  const id = variation.id && variation.id.trim() !== "" ? variation.id : crypto.randomUUID();
  const row = toRow({ ...variation, id });
  const { error } = await supabase.from("variations").upsert(row);
  if (error) throw new Error(`Falha ao salvar variação: ${error.message}`);
  return id;
};

export const deleteVariation = async (id: string): Promise<void> => {
  if (!id || id.trim() === "") throw new Error("ID da variação é obrigatório para exclusão");
  const { error } = await supabase.from("variations").delete().eq("id", id);
  if (error) throw new Error(`Falha ao deletar variação: ${error.message}`);
};
