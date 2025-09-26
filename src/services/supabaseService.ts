// src/services/supabaseService.ts
import { supabase } from "@/integrations/supabase/client";

export interface SupabaseUser {
  id?: string;
  user_id: string; // agora sempre será o uid do Firebase
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  last_sign_in?: string | null;
}

/**
 * Salva ou atualiza o usuário no Supabase usando o UID do Firebase
 */
export const saveUserToSupabase = async (firebaseUser: any): Promise<SupabaseUser | null> => {
  try {
    if (!firebaseUser?.uid) {
      console.error("[saveUserToSupabase] Firebase user inválido:", firebaseUser);
      return null;
    }

    const userData: SupabaseUser = {
      user_id: firebaseUser.uid, // 🔥 UID do Firebase
      email: firebaseUser.email || null,
      name: firebaseUser.displayName || null,
      phone: firebaseUser.phoneNumber || null,
      last_sign_in: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("users")
      .upsert(userData, { onConflict: "user_id" })
      .select()
      .maybeSingle();

    if (error) {
      console.error("[saveUserToSupabase] Erro ao salvar usuário:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[saveUserToSupabase] Exceção inesperada:", err);
    return null;
  }
};

/**
 * Atualiza o campo last_sign_in no Supabase para o usuário do Firebase
 */
export const updateUserLastSignIn = async (firebaseUser: any): Promise<void> => {
  try {
    if (!firebaseUser?.uid) {
      console.error("[updateUserLastSignIn] Firebase user inválido:", firebaseUser);
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ last_sign_in: new Date().toISOString() })
      .eq("user_id", firebaseUser.uid);

    if (error) {
      console.error("[updateUserLastSignIn] Erro ao atualizar last_sign_in:", error);
    } else {
      console.log("[updateUserLastSignIn] Último login atualizado para:", firebaseUser.uid);
    }
  } catch (err) {
    console.error("[updateUserLastSignIn] Exceção inesperada:", err);
  }
};

/**
 * Busca usuário no Supabase pelo UID do Firebase
 */
export const getUserFromSupabase = async (firebaseUser: any): Promise<SupabaseUser | null> => {
  try {
    if (!firebaseUser?.uid) {
      console.error("[getUserFromSupabase] Firebase user inválido:", firebaseUser);
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", firebaseUser.uid)
      .maybeSingle();

    if (error) {
      console.error("[getUserFromSupabase] Erro ao buscar usuário:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[getUserFromSupabase] Exceção inesperada:", err);
    return null;
  }
};
