import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id?: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  user_id?: string; // 🔑 chave oficial ligada ao Supabase Auth
}

/**
 * Garante que o usuário exista na tabela "users"
 */
export const saveUserToSupabase = async (user: any) => {
  try {
    // pega id do auth.users
    const { data: authData } = await supabase.auth.getUser();
    const supabaseUserId = authData?.user?.id;

    if (!supabaseUserId) {
      console.error("Não foi possível obter supabaseUserId");
      return null;
    }

    // upsert (insere se não existir, atualiza se já existir)
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          user_id: supabaseUserId,
          email: user.email || null,
          name: user.displayName || null,
          phone: user.phoneNumber || null,
          last_sign_in: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error("Erro ao salvar usuário no Supabase:", error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error("Erro em saveUserToSupabase:", err);
    return null;
  }
};

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

/**
 * Atualiza a data do último login
 */
export const updateUserLastSignIn = async () => {
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
    console.error("Erro em updateUserLastSignIn:", err);
  }
};
