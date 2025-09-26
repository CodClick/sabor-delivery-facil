// src/services/supabaseService.ts
import { supabase } from "@/integrations/supabase/client";
import { User as FirebaseUser } from "firebase/auth";

interface SupabaseUser {
  id: string;       // UID do Firebase
  email: string;
  name?: string | null;
  phone?: string | null;
  last_sign_in_at?: timestamptz;
}

// 🔹 Salva ou atualiza usuário no Supabase
export const saveUserToSupabase = async (user: FirebaseUser | SupabaseUser) => {
  if (!user) return;

  const userData = {
    id: "uid" in user ? user.uid : user.id,
    email: user.email || "",
    name: "displayName" in user ? user.displayName : user.name || null,
    phone: "phoneNumber" in user ? user.phoneNumber : user.phone || null,
    last_sign_in_at: new Date().toISOString(),
  };

  console.log("[supabaseService] Salvando usuário no Supabase:", userData);

  const { error } = await supabase
    .from("users")
    .upsert(userData, { onConflict: "id" }); // usa o `user_id` como chave

  if (error) {
    console.error("[supabaseService] Erro ao salvar usuário:", error);
  }
};

// 🔹 Atualiza último login do usuário
export const updateUserLastSignIn = async (user: FirebaseUser | string) => {
  const userId = typeof user === "string" ? user : user.uid;

  console.log("[supabaseService] Atualizando último login para:", userId);

  const { error } = await supabase
    .from("users")
    .update({ last_sign_in_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[supabaseService] Erro ao atualizar último login:", error);
  }
};

// 🔹 Busca usuário por ID (uid do Firebase)
export const getUserById = async (userId: string): Promise<SupabaseUser | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[supabaseService] Erro ao buscar usuário:", error);
    return null;
  }

  return data;
};

// 🔹 Busca role de um usuário (admin, user, etc.)
export const getUserRole = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[supabaseService] Erro ao buscar role do usuário:", error);
    return null;
  }

  return data?.role || null;
};
