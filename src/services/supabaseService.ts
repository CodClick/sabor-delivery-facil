import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id?: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  user_id?: string; // 🔑 chave oficial ligada ao Supabase Auth
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      console.error("Erro ao obter usuário autenticado:", authError);
      return null;
    }

    const supabaseUser = authData.user;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", supabaseUser.id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error("Erro em getUserProfile:", err);
    return null;
  }
};

export const updateLastLogin = async () => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    const supabaseUser = authData.user;

    const { error } = await supabase
      .from("users")
      .update({ last_sign_in: new Date().toISOString() })
      .eq("user_id", supabaseUser.id);

    if (error) {
      console.error("Erro ao atualizar último login:", error);
    }
  } catch (err) {
    console.error("Erro em updateLastLogin:", err);
  }
};
